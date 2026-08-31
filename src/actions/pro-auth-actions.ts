"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const PRO_COOKIE_NAME = "pro_session_token"

/**
 * Utilitário para limpar telefone
 */
function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  return digits
}

/**
 * 1. Login do Profissional (/pro/login)
 */
export async function loginProfessionalAction(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim() || ""
  const password = (formData.get("password") as string) || ""

  if (!identifier || !password) {
    return { success: false, error: "Informe seu WhatsApp/E-mail e sua senha de acesso." }
  }

  try {
    const isEmail = identifier.includes("@")
    const rawDigits = identifier.replace(/\D/g, "")
    const cleanPhone = cleanPhoneNumber(identifier)

    // Busca o profissional por email ou telefone (não arquivado)
    let professional = null

    if (isEmail) {
      professional = await prisma.professional.findFirst({
        where: {
          email: identifier.toLowerCase().trim(),
        },
        include: {
          business: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
        },
      })
    } else {
      professional = await prisma.professional.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { phone: rawDigits },
            { phone: rawDigits.replace(/^55/, "") },
            { phone: identifier.trim() },
          ],
        },
        include: {
          business: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
        },
      })
    }

    // Se não encontrou profissional ou está arquivado
    if (professional && professional.deletedAt) {
      professional = null
    }

    // Se não encontrou profissional, verifica se é um Dono/Usuário SaaS
    if (!professional) {
      const user = isEmail
        ? await prisma.user.findFirst({ 
            where: { 
              OR: [
                { email: identifier.toLowerCase().trim() },
                { email: identifier.trim() },
              ] 
            } 
          })
        : await prisma.user.findFirst({
            where: {
              OR: [
                { phone: cleanPhone },
                { phone: rawDigits },
                { phone: rawDigits.replace(/^55/, "") },
                { phone: identifier.trim() },
              ],
            },
          })

      if (user && user.passwordHash) {
        const isUserPassValid = await bcrypt.compare(password, user.passwordHash)
        if (isUserPassValid) {
          // Se o dono também tem um estabelecimento, verifica se ele quer alternar para o app
          return {
            success: true,
            redirectUrl: "/app",
            message: "Identificado como gestor do estabelecimento. Redirecionando para o painel administrativo...",
          }
        }
      }

      return { success: false, error: "Cadastro não encontrado com os dados informados." }
    }

    if (!professional.isActive) {
      return { success: false, error: "Seu cadastro está pausado pelo responsável do estabelecimento." }
    }

    // Se o profissional não tem senha salva mas o Dono tem senha no sistema, sincroniza automaticamente
    if (!professional.passwordHash) {
      const user = isEmail
        ? await prisma.user.findFirst({ where: { email: identifier.toLowerCase().trim() } })
        : await prisma.user.findFirst({
            where: {
              OR: [
                { phone: cleanPhone },
                { phone: rawDigits },
                { phone: rawDigits.replace(/^55/, "") },
                { phone: identifier.trim() },
              ],
            },
          })

      if (user && user.passwordHash) {
        const isUserPassValid = await bcrypt.compare(password, user.passwordHash)
        if (isUserPassValid) {
          await prisma.professional.update({
            where: { id: professional.id },
            data: { passwordHash: user.passwordHash },
          })
          professional.passwordHash = user.passwordHash
        } else {
          return { success: false, error: "Senha incorreta. Verifique e tente novamente." }
        }
      } else {
        return { success: false, error: "Você ainda não configurou sua senha. Acesse pelo link de convite recebido no WhatsApp." }
      }
    }

    // Valida a senha
    const isValidPassword = await bcrypt.compare(password, professional.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: "Senha incorreta. Verifique e tente novamente." }
    }

    // Grava o cookie de sessão do profissional
    const sessionData = {
      proId: professional.id,
      businessId: professional.businessId,
      name: professional.name,
      createdAt: Date.now(),
    }

    const token = Buffer.from(JSON.stringify(sessionData)).toString("base64")
    const cookieStore = await cookies()
    cookieStore.set(PRO_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    })

    return {
      success: true,
      redirectUrl: "/pro",
      professional: {
        id: professional.id,
        name: professional.name,
        specialty: professional.specialty,
        businessName: professional.business.name,
      },
    }
  } catch (error: any) {
    console.error("Erro no login do profissional:", error)
    return { success: false, error: "Falha ao autenticar. Tente novamente." }
  }
}

/**
 * 2. Alterna instantaneamente do Painel do Dono (/app) para o App de Atendimento (/pro)
 */
export async function switchToProAction() {
  const { auth } = await import("@/auth")
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado como dono." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { business: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Você precisa ter um estabelecimento cadastrado." }
  }

  const cleanPhone = user.phone ? user.phone.replace(/\D/g, "") : ""
  let pro = await prisma.professional.findFirst({
    where: {
      businessId: user.businessId,
      OR: [
        ...(user.email ? [{ email: user.email.toLowerCase().trim() }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }, { phone: cleanPhone.replace(/^55/, "") }] : []),
      ],
      deletedAt: null,
    },
  })

  // Se o dono ainda não tiver um perfil de profissional na equipe, cria automaticamente para ele
  if (!pro) {
    pro = await prisma.professional.create({
      data: {
        businessId: user.businessId,
        name: user.name || "Gestor do Espaço",
        email: user.email?.toLowerCase().trim() || null,
        phone: cleanPhone || null,
        avatarUrl: user.image || null,
        specialty: "Gestor & Especialista",
        colorHex: "#10b981",
        passwordHash: user.passwordHash || null,
        commissionPercent: 100,
        productCommission: 100,
        isActive: true,
      },
    })
  } else {
    // Sincroniza foto entre User e Professional se houver discrepância
    if (user.image && !pro.avatarUrl) {
      pro = await prisma.professional.update({
        where: { id: pro.id },
        data: { avatarUrl: user.image },
      })
    } else if (pro.avatarUrl && !user.image) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: pro.avatarUrl },
      }).catch(() => {})
    }
  }

  await setProSessionDirectly(pro.id, pro.businessId, pro.name)

  return {
    success: true,
    redirectUrl: "/pro",
    professional: {
      id: pro.id,
      name: pro.name,
    },
  }
}

/**
 * 3. Define a sessão do profissional diretamente (após auto-onboarding)
 */
export async function setProSessionDirectly(professionalId: string, businessId: string, name: string) {
  const sessionData = {
    proId: professionalId,
    businessId: businessId,
    name: name,
    createdAt: Date.now(),
  }

  const token = Buffer.from(JSON.stringify(sessionData)).toString("base64")
  const cookieStore = await cookies()
  cookieStore.set(PRO_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  })
}

/**
 * 3. Obter a sessão e todos os dados do Profissional (/pro)
 */
export async function getProCurrentSessionAction() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PRO_COOKIE_NAME)?.value

    if (!token) return null

    let parsed: { proId: string; businessId: string } | null = null
    try {
      parsed = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
    } catch {
      return null
    }

    if (!parsed?.proId) return null

    // 1. Busca profissional e dados do estabelecimento
    const professional = await prisma.professional.findUnique({
      where: { id: parsed.proId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            bannerUrl: true,
            type: true,
            city: true,
            state: true,
            phone: true,
            themeColor: true,
            services: {
              where: { isActive: true },
              orderBy: { price: "asc" },
            },
          },
        },
      },
    })

    if (!professional || professional.deletedAt) {
      return null
    }

    // 2. Data de Hoje (início e fim do dia)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    // 3. Agendamentos de Hoje
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        service: {
          select: { id: true, name: true, price: true, durationMinutes: true },
        },
      },
      orderBy: { date: "asc" },
    })

    // 4. Agendamentos do Mês Atual para Cálculo de Faturamento e Comissões
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const monthAppointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        service: { select: { price: true } },
      },
    })

    // Itens de comandas atribuídos ao profissional no mês
    const monthOrderItems = await prisma.orderItem.findMany({
      where: {
        professionalId: professional.id,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        service: { select: { price: true } },
        product: { select: { price: true } },
      },
    })

    // Cálculos Financeiros
    let totalBilledServices = 0
    let totalBilledProducts = 0

    // Soma agendamentos concluídos ou confirmados
    for (const app of monthAppointments) {
      if (app.status === "COMPLETED" || app.status === "CONFIRMED" || app.status === "IN_PROGRESS") {
        totalBilledServices += app.price || app.service?.price || 0
      }
    }

    // Soma itens de comanda
    for (const item of monthOrderItems) {
      if (item.service) {
        totalBilledServices += item.unitPrice * item.quantity
      } else if (item.product) {
        totalBilledProducts += item.unitPrice * item.quantity
      }
    }

    const serviceCommission = totalBilledServices * ((professional.commissionPercent || 50) / 100)
    const productCommission = totalBilledProducts * ((professional.productCommission || 10) / 100)
    const totalCommission = serviceCommission + productCommission
    const totalMonthBilled = totalBilledServices + totalBilledProducts

    // 6. Verifica se o profissional é também o Dono do estabelecimento
    const cleanProPhone = professional.phone ? professional.phone.replace(/\D/g, "") : ""
    const ownerUser = await prisma.user.findFirst({
      where: {
        businessId: professional.businessId,
        OR: [
          ...(professional.email ? [{ email: professional.email.toLowerCase().trim() }] : []),
          ...(cleanProPhone ? [
            { phone: cleanProPhone }, 
            { phone: `55${cleanProPhone}` }, 
            { phone: cleanProPhone.replace(/^55/, "") }
          ] : []),
        ],
      },
      select: { id: true, role: true },
    })

    const isOwner = !!ownerUser

    return {
      isOwner,
      professional: {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        phone: professional.phone,
        avatarUrl: professional.avatarUrl,
        specialty: professional.specialty,
        bio: professional.bio,
        colorHex: professional.colorHex,
        commissionPercent: professional.commissionPercent,
        productCommission: professional.productCommission,
        pixKey: professional.pixKey,
        pixKeyType: professional.pixKeyType,
        themeColor: (professional as any).themeColor || null,
        isActive: professional.isActive,
      },
      business: professional.business,
      todayAppointments,
      services: professional.business.services || [],
      metrics: {
        todayCount: todayAppointments.length,
        todayCompletedCount: todayAppointments.filter((a) => a.status === "COMPLETED").length,
        totalMonthBilled,
        totalCommission,
        totalBilledServices,
        totalBilledProducts,
      },
    }
  } catch (error) {
    console.error("Erro ao obter sessão do profissional:", error)
    return null
  }
}

/**
 * 4. Atualizar Status de um Agendamento
 */
export async function updateProAppointmentStatusAction(appointmentId: string, status: any) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PRO_COOKIE_NAME)?.value
    if (!token) return { success: false, error: "Não autenticado." }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    })

    revalidatePath("/pro")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao atualizar status do agendamento:", error)
    return { success: false, error: "Falha ao atualizar status." }
  }
}

/**
 * 5. Atualizar Perfil do Profissional
 */
export async function updateProProfileAction(data: {
  name?: string
  email?: string
  phone?: string
  bio?: string
  pixKey?: string
  pixKeyType?: string
  avatarUrl?: string
  newPassword?: string
  themeColor?: string
}) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PRO_COOKIE_NAME)?.value
    if (!token) return { success: false, error: "Não autenticado." }

    const parsed = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
    if (!parsed?.proId) return { success: false, error: "Sessão inválida." }

    const updateData: any = {}
    if (data.name) updateData.name = data.name.trim()
    if (data.email) updateData.email = data.email.trim().toLowerCase()
    if (data.phone) updateData.phone = data.phone.replace(/\D/g, "")
    if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null
    if (data.pixKey !== undefined) updateData.pixKey = data.pixKey?.trim() || null
    if (data.pixKeyType !== undefined) updateData.pixKeyType = data.pixKeyType
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl?.trim() || null
    if (data.themeColor !== undefined) updateData.themeColor = data.themeColor || null

    if (data.newPassword && data.newPassword.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10)
    }

    const updatedPro = await prisma.professional.update({
      where: { id: parsed.proId },
      data: updateData,
    })

    // Sincroniza dados com o usuário Gestor (/app) se for o mesmo perfil
    const { auth } = await import("@/auth")
    const session = await auth()
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.phone ? { phone: data.phone.replace(/\D/g, "") } : {}),
          ...(data.avatarUrl !== undefined ? { image: data.avatarUrl?.trim() || null } : {}),
        },
      }).catch(() => {})
    } else if (updatedPro.businessId) {
      const cleanPhone = updatedPro.phone ? updatedPro.phone.replace(/\D/g, "") : ""
      const orConditions: any[] = []
      if (updatedPro.email) orConditions.push({ email: updatedPro.email.toLowerCase().trim() })
      if (cleanPhone) {
        orConditions.push({ phone: cleanPhone })
        orConditions.push({ phone: cleanPhone.replace(/^55/, "") })
      }
      if (orConditions.length > 0) {
        await prisma.user.updateMany({
          where: {
            businessId: updatedPro.businessId,
            OR: orConditions,
          },
          data: {
            ...(data.name ? { name: data.name.trim() } : {}),
            ...(data.phone ? { phone: cleanPhone } : {}),
            ...(data.avatarUrl !== undefined ? { image: data.avatarUrl?.trim() || null } : {}),
          },
        }).catch(() => {})
      }
    }

    revalidatePath("/pro")
    revalidatePath("/app")
    revalidatePath("/app/configuracoes")
    revalidatePath("/app/equipe")
    revalidatePath("/app/website")
    return { success: true, message: "Perfil atualizado com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error)
    return { success: false, error: "Falha ao salvar dados do perfil." }
  }
}

/**
 * 6. Sair do Painel do Profissional
 */
export async function logoutProfessionalAction() {
  const cookieStore = await cookies()
  cookieStore.delete(PRO_COOKIE_NAME)
  redirect("/pro/login")
}
