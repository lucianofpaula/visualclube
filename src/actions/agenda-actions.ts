"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type AgendaViewMode = "day" | "week" | "list"

export interface AgendaFilter {
  viewMode?: AgendaViewMode
  selectedDate?: string // ISO "YYYY-MM-DD"
  professionalId?: string
  status?: string
}

export interface BusinessHours {
  dayOfWeek: number // 0 = Domingo, 1 = Segunda, ... 6 = Sábado
  isOpen: boolean
  openTime: string // "08:00"
  closeTime: string // "20:00"
  slotIntervalMinutes?: number // 30
}

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "14:00", slotIntervalMinutes: 30 },
  { dayOfWeek: 1, isOpen: true, openTime: "08:00", closeTime: "20:00", slotIntervalMinutes: 30 },
  { dayOfWeek: 2, isOpen: true, openTime: "08:00", closeTime: "20:00", slotIntervalMinutes: 30 },
  { dayOfWeek: 3, isOpen: true, openTime: "08:00", closeTime: "20:00", slotIntervalMinutes: 30 },
  { dayOfWeek: 4, isOpen: true, openTime: "08:00", closeTime: "20:00", slotIntervalMinutes: 30 },
  { dayOfWeek: 5, isOpen: true, openTime: "08:00", closeTime: "20:00", slotIntervalMinutes: 30 },
  { dayOfWeek: 6, isOpen: true, openTime: "08:00", closeTime: "20:00", slotIntervalMinutes: 30 },
]

function parseBusinessHours(rawJson?: any): BusinessHours[] {
  if (!rawJson) return DEFAULT_BUSINESS_HOURS
  if (Array.isArray(rawJson)) return rawJson
  try {
    const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson
    if (Array.isArray(parsed)) return parsed
  } catch (e) {
    // fallback
  }
  return DEFAULT_BUSINESS_HOURS
}

/**
 * 1. Busca os dados consolidados da Agenda (com formato inspirado no cluberize_v2)
 */
export async function getAgendaDataAction(filter: AgendaFilter = {}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const businessId = user.businessId
  const viewMode = filter.viewMode || "day"
  const dateStr = filter.selectedDate || new Date().toISOString().split("T")[0]
  const [year, month, day] = dateStr.split("-").map(Number)

  let rangeStart: Date
  let rangeEnd: Date

  if (viewMode === "week") {
    const baseDate = new Date(year, month - 1, day)
    const dayOfWeek = baseDate.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    rangeStart = new Date(baseDate)
    rangeStart.setDate(baseDate.getDate() + diffToMonday)
    rangeStart.setHours(0, 0, 0, 0)

    rangeEnd = new Date(rangeStart)
    rangeEnd.setDate(rangeStart.getDate() + 6)
    rangeEnd.setHours(23, 59, 59, 999)
  } else {
    rangeStart = new Date(year, month - 1, day, 0, 0, 0, 0)
    rangeEnd = new Date(year, month - 1, day, 23, 59, 59, 999)
  }

  try {
    const [business, professionals, services, customers, appointments, timeBlocks, specialSchedules] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: { id: true, name: true, openingHours: true },
      }),

      prisma.professional.findMany({
        where: { businessId },
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
      }),

      prisma.service.findMany({
        where: { businessId, isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),

      prisma.user.findMany({
        where: { businessId },
        select: { id: true, name: true, phone: true, email: true, image: true },
        take: 200,
      }),

      prisma.appointment.findMany({
        where: {
          businessId,
          date: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        include: {
          professional: true,
          service: true,
          client: true,
          order: true,
        },
        orderBy: { date: "asc" },
      }),

      prisma.timeBlock.findMany({
        where: {
          businessId,
          date: {
            gte: rangeStart.toISOString().split("T")[0],
            lte: rangeEnd.toISOString().split("T")[0],
          },
        },
        include: {
          professional: true,
        },
        orderBy: { startTime: "asc" },
      }),

      (prisma.specialSchedule as any).findMany({
        where: {
          businessId,
          date: {
            gte: rangeStart.toISOString().split("T")[0],
            lte: rangeEnd.toISOString().split("T")[0],
          },
        },
      }),
    ])

    const formattedProfessionals = professionals
      .filter((p) => !p.deletedAt && p.showInCalendar !== false)
      .map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatarUrl || null,
        avatarUrl: p.avatarUrl || null,
        specialty: p.specialty || "Profissional",
        colorHex: p.colorHex || "#10b981",
        themeColor: p.themeColor || "emerald",
        phone: p.phone || null,
        isAvailable: p.isActive,
      }))

    const formattedServices = services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      durationMinutes: s.durationMinutes || 30,
      category: s.category || "Geral",
    }))

    const formattedCustomers = customers.map((c) => ({
      id: c.id,
      name: c.name || "Cliente",
      phone: c.phone || "",
      email: c.email || null,
      avatar: c.image || null,
      image: c.image || null,
      isClubMember: false,
    }))

    const formattedAppointments = appointments.map((apt) => {
      const startDate = new Date(apt.date)
      const endDate = new Date(apt.endDate)
      const dateOnly = startDate.toISOString().split("T")[0]
      const startHours = String(startDate.getHours()).padStart(2, "0")
      const startMinutes = String(startDate.getMinutes()).padStart(2, "0")
      const endHours = String(endDate.getHours()).padStart(2, "0")
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0")

      return {
        id: apt.id,
        customer: {
          id: apt.clientId || "guest",
          name: apt.clientName || apt.client?.name || "Cliente",
          phone: apt.clientPhone || apt.client?.phone || "",
          email: apt.clientEmail || apt.client?.email || null,
          isClubMember: false,
          clubPlanName: null,
        },
        barberId: apt.professionalId,
        professionalId: apt.professionalId,
        professionalName: apt.professional.name,
        professionalAvatar: apt.professional.avatarUrl || null,
        professionalColor: apt.professional.colorHex || "#10b981",
        services: [
          {
            id: apt.serviceId,
            name: apt.service.name,
            price: apt.price,
            durationMinutes: apt.service.durationMinutes || 30,
          },
        ],
        date: dateOnly,
        startTime: `${startHours}:${startMinutes}`,
        endTime: `${endHours}:${endMinutes}`,
        status: apt.status,
        totalPrice: apt.price,
        notes: apt.notes || null,
        comandaId: apt.orderId || null,
        orderId: apt.orderId || null,
        createdVia: apt.whatsappReminderSent ? "WHATSAPP" : "DASHBOARD",
      }
    })

    const formattedTimeBlocks = timeBlocks.map((tb) => ({
      id: tb.id,
      barberId: tb.professionalId || null,
      professionalId: tb.professionalId || null,
      professionalName: tb.professional?.name || "Toda a Equipe",
      date: tb.date,
      startTime: tb.startTime,
      endTime: tb.endTime,
      reason: tb.reason,
    }))

    // Cálculo de Métricas do Dia Selecionado
    const dayApts = formattedAppointments.filter((a) => a.date === dateStr)
    const totalCount = dayApts.length
    const activeCount = dayApts.filter((a) => a.status !== "CANCELED").length
    const completedCount = dayApts.filter((a) => a.status === "COMPLETED").length
    const confirmedCount = dayApts.filter((a) => ["CONFIRMED", "COMPLETED"].includes(a.status)).length
    const inProgressCount = dayApts.filter((a) => a.status === "IN_PROGRESS").length
    const totalEstimated = dayApts
      .filter((a) => a.status !== "CANCELED")
      .reduce((acc, curr) => acc + curr.totalPrice, 0)

    const activeProfCount = Math.max(1, formattedProfessionals.filter((p) => p.isAvailable).length)
    const occupancyRate = Math.min(100, Math.round((activeCount / (activeProfCount * 16)) * 100))

    const baseHours = parseBusinessHours(business?.openingHours)
    const activeSpecial = specialSchedules?.find((s: any) => s.date === dateStr)
    const [yNum, mNum, dNum] = dateStr.split("-").map(Number)
    const currentDayOfWeek = new Date(yNum, mNum - 1, dNum).getDay()

    const effectiveHours = baseHours.map((h) => {
      if (activeSpecial && h.dayOfWeek === currentDayOfWeek) {
        return {
          ...h,
          isOpen: activeSpecial.isOpen,
          openTime: activeSpecial.openTime || h.openTime,
          closeTime: activeSpecial.closeTime || h.closeTime,
          slotIntervalMinutes: activeSpecial.slotIntervalMinutes || h.slotIntervalMinutes,
        }
      }
      return h
    })

    return {
      success: true,
      selectedDate: dateStr,
      specialSchedule: activeSpecial || null,
      barbershop: {
        id: business?.id || businessId,
        name: business?.name || "Meu Espaço",
        openingHours: effectiveHours,
      },
      barbers: formattedProfessionals,
      services: formattedServices,
      customers: formattedCustomers,
      appointments: formattedAppointments,
      timeBlocks: formattedTimeBlocks,
      businessHours: effectiveHours,
      metrics: {
        total: totalCount,
        active: activeCount,
        confirmed: confirmedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        revenue: totalEstimated,
        occupancyRate,
      },
    }
  } catch (error: any) {
    console.error("Erro ao carregar dados da agenda:", error)
    return { success: false, error: error?.message || "Falha ao carregar agenda." }
  }
}

/**
 * 2. Cria um novo agendamento
 */
export async function createAppointmentAction(data: {
  clientName: string
  clientPhone: string
  clientEmail?: string | null
  professionalId: string
  serviceIds: string[]
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:mm"
  notes?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const { clientName, clientPhone, clientEmail, professionalId, serviceIds, date, startTime, notes } = data

  if (!clientName?.trim() || !clientPhone?.trim()) {
    return { success: false, error: "Nome e WhatsApp do cliente são obrigatórios." }
  }

  if (!professionalId) {
    return { success: false, error: "Selecione o profissional." }
  }

  if (!serviceIds || serviceIds.length === 0) {
    return { success: false, error: "Selecione pelo menos um serviço." }
  }

  try {
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    })

    if (services.length === 0) {
      return { success: false, error: "Nenhum serviço válido encontrado." }
    }

    const totalDuration = services.reduce((acc, s) => acc + (s.durationMinutes || 30), 0)
    const totalPrice = services.reduce((acc, s) => acc + s.price, 0)
    const primaryService = services[0]

    const [year, month, day] = date.split("-").map(Number)
    const [hours, minutes] = startTime.split(":").map(Number)

    const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + totalDuration * 60 * 1000)

    const prof = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { name: true, commissionPercent: true },
    })

    const commissionRate = prof?.commissionPercent || 50.0
    const totalCommission = (totalPrice * commissionRate) / 100
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const code = `CMD-${randomSuffix}`

    const orderItemsData = services.map((s) => ({
      itemType: "SERVICE",
      serviceId: s.id,
      professionalId,
      addedByUserId: user.id,
      addedByName: "Agendamento",
      name: s.name,
      quantity: 1,
      unitPrice: s.price,
      costPrice: 0,
      totalPrice: s.price,
      commissionRate,
      commissionValue: (s.price * commissionRate) / 100,
    }))

    const order = await (prisma.order as any).create({
      data: {
        businessId: user.businessId,
        code,
        type: "ORDER",
        status: "OPEN",
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        professionalId,
        chairOrTable: "Cadeira de Atendimento",
        openedByUserId: user.id,
        openedByName: "Agendamento",
        subtotal: totalPrice,
        total: totalPrice,
        costTotal: 0,
        totalCommission,
        netProfit: totalPrice - totalCommission,
        notes: notes?.trim() || null,
        items: {
          create: orderItemsData,
        },
      },
    })

    const appointment = await prisma.appointment.create({
      data: {
        businessId: user.businessId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail?.trim() || null,
        professionalId,
        serviceId: primaryService.id,
        orderId: order.id,
        date: startDate,
        endDate: endDate,
        status: "SCHEDULED",
        price: totalPrice,
        notes: notes?.trim() || null,
      },
    })

    revalidatePath("/app/agenda")
    revalidatePath("/app/comandas")
    return { success: true, appointment, orderId: order.id }
  } catch (error: any) {
    console.error("Erro ao criar agendamento:", error)
    return { success: false, error: error?.message || "Falha ao criar agendamento." }
  }
}

/**
 * 3. Atualiza o status do agendamento
 */
export async function updateAppointmentStatusAction(data: {
  appointmentId: string
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW"
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const { appointmentId, status } = data

  try {
    const apt = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    })

    revalidatePath("/app/agenda")
    return { success: true, appointment: apt }
  } catch (error: any) {
    console.error("Erro ao atualizar status do agendamento:", error)
    return { success: false, error: error?.message || "Falha ao atualizar status." }
  }
}

/**
 * 4. Remarcação de agendamento (alteração de data/horário/profissional)
 */
export async function rescheduleAppointmentAction(data: {
  appointmentId: string
  newDate: string // "YYYY-MM-DD"
  newTime: string // "HH:mm"
  professionalId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const { appointmentId, newDate, newTime, professionalId } = data

  try {
    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    })

    if (!existing) {
      return { success: false, error: "Agendamento não encontrado." }
    }

    const duration = existing.service?.durationMinutes || 30
    const [year, month, day] = newDate.split("-").map(Number)
    const [hours, minutes] = newTime.split(":").map(Number)

    const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

    const updateData: any = {
      date: startDate,
      endDate: endDate,
    }

    if (professionalId) {
      updateData.professionalId = professionalId
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    })

    revalidatePath("/app/agenda")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao remarcar agendamento:", error)
    return { success: false, error: error?.message || "Falha ao remarcar agendamento." }
  }
}

/**
 * 5. Criação de Bloqueio de Horário / Pausa (TimeBlock)
 */
export async function createTimeBlockAction(data: {
  professionalId?: string | null
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  reason: string // "Almoço", "Folga", "Intervalo", etc.
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const { professionalId, date, startTime, endTime, reason } = data

  if (!startTime || !endTime) {
    return { success: false, error: "Horário inicial e final são obrigatórios." }
  }

  if (startTime >= endTime) {
    return { success: false, error: "O horário final deve ser posterior ao horário inicial." }
  }

  try {
    const timeBlock = await prisma.timeBlock.create({
      data: {
        businessId: user.businessId,
        professionalId: professionalId || null,
        date,
        startTime,
        endTime,
        reason: reason?.trim() || "Pausa / Bloqueio",
      },
    })

    revalidatePath("/app/agenda")
    return { success: true, timeBlock }
  } catch (error: any) {
    console.error("Erro ao criar bloqueio de horário:", error)
    return { success: false, error: error?.message || "Falha ao criar bloqueio." }
  }
}

/**
 * 6. Exclusão de Bloqueio de Horário (TimeBlock)
 */
export async function deleteTimeBlockAction(data: { timeBlockId: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    await prisma.timeBlock.delete({
      where: { id: data.timeBlockId },
    })

    revalidatePath("/app/agenda")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao remover bloqueio de horário:", error)
    return { success: false, error: error?.message || "Falha ao remover bloqueio." }
  }
}

/**
 * 7. Exclusão de Agendamento
 */
export async function deleteAppointmentAction(data: { appointmentId: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    await prisma.appointment.delete({
      where: { id: data.appointmentId },
    })

    revalidatePath("/app/agenda")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao excluir agendamento:", error)
    return { success: false, error: error?.message || "Falha ao excluir agendamento." }
  }
}

/**
 * 8. Busca configurações da Agenda e Dias Especiais / Feriados
 */
export async function getAgendaSettingsAction() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const [business, specialSchedules] = await Promise.all([
      prisma.business.findUnique({
        where: { id: user.businessId },
        select: { id: true, name: true, openingHours: true },
      }),
      (prisma.specialSchedule as any).findMany({
        where: { businessId: user.businessId },
        orderBy: { date: "asc" },
      }),
    ])

    const businessHours = parseBusinessHours(business?.openingHours)

    return {
      success: true,
      businessHours,
      specialSchedules: specialSchedules || [],
    }
  } catch (error: any) {
    console.error("Erro ao carregar configurações da agenda:", error)
    return { success: false, error: error?.message || "Falha ao carregar configurações." }
  }
}

/**
 * 9. Salva os horários padrão da semana
 */
export async function updateAgendaSettingsAction(data: { businessHours: BusinessHours[] }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    await prisma.business.update({
      where: { id: user.businessId },
      data: {
        openingHours: JSON.stringify(data.businessHours),
      },
    })

    revalidatePath("/app/agenda")
    revalidatePath("/app/agenda/configuracoes")
    revalidatePath("/app/website")
    return { success: true, message: "Horários atualizados com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao salvar horários da agenda:", error)
    return { success: false, error: error?.message || "Falha ao salvar horários." }
  }
}

/**
 * 10. Cria um Dia Especial / Feriado / Horário Diferenciado
 */
export async function createSpecialScheduleAction(data: {
  date: string // "YYYY-MM-DD"
  isOpen: boolean
  openTime?: string
  closeTime?: string
  slotIntervalMinutes?: number
  reason: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const { date, isOpen, openTime = "08:00", closeTime = "20:00", slotIntervalMinutes = 30, reason } = data

  if (!date?.trim()) {
    return { success: false, error: "A data é obrigatória." }
  }

  if (!reason?.trim()) {
    return { success: false, error: "Informe o motivo ou descrição do dia especial (ex: Feriado 7 de Setembro)." }
  }

  if (isOpen && openTime >= closeTime) {
    return { success: false, error: "O horário de abertura deve ser anterior ao de fechamento." }
  }

  try {
    // Upsert na data para o estabelecimento
    const existing = await (prisma.specialSchedule as any).findFirst({
      where: {
        businessId: user.businessId,
        date,
      },
    })

    let specialSchedule
    if (existing) {
      specialSchedule = await (prisma.specialSchedule as any).update({
        where: { id: existing.id },
        data: {
          isOpen,
          openTime: isOpen ? openTime : null,
          closeTime: isOpen ? closeTime : null,
          slotIntervalMinutes: Number(slotIntervalMinutes) || 30,
          reason: reason.trim(),
        },
      })
    } else {
      specialSchedule = await (prisma.specialSchedule as any).create({
        data: {
          businessId: user.businessId,
          date,
          isOpen,
          openTime: isOpen ? openTime : null,
          closeTime: isOpen ? closeTime : null,
          slotIntervalMinutes: Number(slotIntervalMinutes) || 30,
          reason: reason.trim(),
        },
      })
    }

    revalidatePath("/app/agenda")
    revalidatePath("/app/agenda/configuracoes")
    return { success: true, specialSchedule, message: "Dia especial cadastrado com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao salvar dia especial:", error)
    return { success: false, error: error?.message || "Falha ao salvar dia especial." }
  }
}

/**
 * 11. Exclui um Dia Especial
 */
export async function deleteSpecialScheduleAction(data: { id: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    await (prisma.specialSchedule as any).delete({
      where: { id: data.id },
    })

    revalidatePath("/app/agenda")
    revalidatePath("/app/agenda/configuracoes")
    return { success: true, message: "Dia especial removido com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao excluir dia especial:", error)
    return { success: false, error: error?.message || "Falha ao excluir dia especial." }
  }
}
