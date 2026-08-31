"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ProfessionalSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos").optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  specialty: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  colorHex: z.string().default("#10b981"),
  commissionPercent: z.number().min(0).max(100).default(50.0),
  productCommission: z.number().min(0).max(100).default(10.0),
  pixKey: z.string().optional().or(z.literal("")),
  pixKeyType: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  showInCalendar: z.boolean().default(true),
})

export type ProfessionalInput = z.infer<typeof ProfessionalSchema>

/**
 * Retorna todos os profissionais do negócio do usuário autenticado
 * Suporta incluir ou não arquivados
 */
export async function getBusinessProfessionals(includeArchived: boolean = true) {
  const session = await auth()
  if (!session?.user?.id) return []

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) return []

  const professionals = await prisma.professional.findMany({
    where: { businessId: user.businessId },
    orderBy: [
      { isActive: "desc" },
      { createdAt: "desc" }
    ],
    include: {
      _count: {
        select: {
          appointments: true,
          orderItems: true,
        },
      },
    },
  })

  if (!includeArchived) {
    return professionals.filter((p) => !p.deletedAt)
  }

  return professionals
}

/**
 * Cria um novo integrante da equipe
 */
export async function createProfessional(data: ProfessionalInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Você precisa ter um estabelecimento cadastrado." }
  }

  // 1. Validação de Limite de Profissionais pelo Plano Ativo
  const { checkBusinessProfessionalLimit } = await import("./subscription-actions")
  const limitCheck = await checkBusinessProfessionalLimit(user.businessId)
  if (!limitCheck.canAdd) {
    return { success: false, error: limitCheck.error }
  }

  const parsed = ProfessionalSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const cleanPhone = data.phone ? data.phone.replace(/\D/g, "") : null

    // 2. Validação contra duplicidade dentro da mesma equipe
    if (data.email) {
      const existingEmail = await prisma.professional.findFirst({
        where: {
          businessId: user.businessId,
          email: data.email.trim().toLowerCase(),
          deletedAt: null,
        },
      })
      if (existingEmail) {
        return { success: false, error: "Já existe um integrante na sua equipe cadastrado com este e-mail." }
      }
    }

    if (cleanPhone) {
      const existingPhone = await prisma.professional.findFirst({
        where: {
          businessId: user.businessId,
          OR: [
            { phone: cleanPhone },
            { phone: cleanPhone.replace(/^55/, "") },
            { phone: `55${cleanPhone}` },
          ],
          deletedAt: null,
        },
      })
      if (existingPhone) {
        return { success: false, error: "Já existe um integrante na sua equipe cadastrado com este número de WhatsApp." }
      }
    }

    const professional = await prisma.professional.create({
      data: {
        businessId: user.businessId,
        name: data.name.trim(),
        email: data.email ? data.email.trim().toLowerCase() : null,
        phone: cleanPhone,
        avatarUrl: data.avatarUrl?.trim() || null,
        specialty: data.specialty?.trim() || "Especialista",
        bio: data.bio?.trim() || null,
        colorHex: data.colorHex || "#10b981",
        commissionPercent: Number(data.commissionPercent) || 50.0,
        productCommission: Number(data.productCommission) || 10.0,
        pixKey: data.pixKey?.trim() || null,
        pixKeyType: data.pixKeyType || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        showInCalendar: data.showInCalendar !== undefined ? data.showInCalendar : true,
      },
    })

    revalidatePath("/app/equipe")
    revalidatePath("/app/website")
    revalidatePath("/app/agenda")

    return {
      success: true,
      professional,
      message: "Profissional cadastrado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao criar profissional:", error)
    return { success: false, error: "Falha ao cadastrar profissional." }
  }
}

/**
 * Atualiza os dados de um profissional
 */
export async function updateProfessional(id: string, data: Partial<ProfessionalInput>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const updatePayload: any = {}

    if (data.name !== undefined) updatePayload.name = data.name.trim()
    if (data.email !== undefined) updatePayload.email = data.email ? data.email.trim().toLowerCase() : null
    if (data.phone !== undefined) updatePayload.phone = data.phone ? data.phone.replace(/\D/g, "") : null
    if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl?.trim() || null
    if (data.specialty !== undefined) updatePayload.specialty = data.specialty?.trim() || null
    if (data.bio !== undefined) updatePayload.bio = data.bio?.trim() || null
    if (data.colorHex !== undefined) updatePayload.colorHex = data.colorHex
    if (data.commissionPercent !== undefined) updatePayload.commissionPercent = Number(data.commissionPercent)
    if (data.productCommission !== undefined) updatePayload.productCommission = Number(data.productCommission)
    if (data.pixKey !== undefined) updatePayload.pixKey = data.pixKey?.trim() || null
    if (data.pixKeyType !== undefined) updatePayload.pixKeyType = data.pixKeyType || null
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive
    if (data.showInCalendar !== undefined) updatePayload.showInCalendar = data.showInCalendar

    const updated = await prisma.professional.update({
      where: { id },
      data: updatePayload,
    })

    revalidatePath("/app/equipe")
    revalidatePath("/app/website")
    revalidatePath("/app/agenda")

    return {
      success: true,
      professional: updated,
      message: "Dados atualizados com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar profissional:", error)
    return { success: false, error: "Falha ao salvar alterações." }
  }
}

/**
 * Exclui ou Arquiva um profissional com Proteção de Integridade Financeira (Soft Delete)
 */
export async function deleteProfessional(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    // 1. Busca o profissional e conta seus vínculos históricos
    const prof = await prisma.professional.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: true,
            orderItems: true,
          },
        },
      },
    })

    if (!prof) {
      return { success: false, error: "Profissional não encontrado." }
    }

    const hasHistory = (prof._count?.appointments || 0) > 0 || (prof._count?.orderItems || 0) > 0

    // Se o profissional já possui histórico (comandas, agendamentos, comissões),
    // aplicamos SOFT DELETE (Arquivamento) para manter 100% da integridade financeira e relatórios.
    if (hasHistory) {
      await prisma.professional.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      })

      revalidatePath("/app/equipe")
      revalidatePath("/app/website")

      return {
        success: true,
        isArchived: true,
        message: "O profissional possui histórico financeiro e foi desligado/arquivado com sucesso! Todas as comandas e relatórios passados foram preservados com integridade.",
      }
    }

    // Se NÃO possui nenhum histórico, pode ser excluído fisicamente com segurança
    await prisma.professional.delete({
      where: { id },
    })

    revalidatePath("/app/equipe")
    revalidatePath("/app/website")

    return {
      success: true,
      isArchived: false,
      message: "Profissional removido com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao deletar profissional:", error)
    return { success: false, error: "Falha ao remover profissional." }
  }
}

/**
 * Reativa um profissional previamente desligado / arquivado
 */
export async function reactivateProfessional(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const prof = await prisma.professional.findUnique({
      where: { id },
      select: { businessId: true },
    })

    if (prof?.businessId) {
      const { checkBusinessProfessionalLimit } = await import("./subscription-actions")
      const limitCheck = await checkBusinessProfessionalLimit(prof.businessId)
      if (!limitCheck.canAdd) {
        return { success: false, error: limitCheck.error }
      }
    }

    const updated = await prisma.professional.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
    })

    revalidatePath("/app/equipe")
    revalidatePath("/app/website")

    return {
      success: true,
      professional: updated,
      message: "Profissional reativado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao reativar profissional:", error)
    return { success: false, error: "Falha ao reativar profissional." }
  }
}

/**
 * Ativa ou pausa um profissional
 */
export async function toggleProfessionalStatus(id: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const updated = await prisma.professional.update({
      where: { id },
      data: { isActive },
    })

    revalidatePath("/app/equipe")
    revalidatePath("/app/website")

    return {
      success: true,
      professional: updated,
      message: isActive ? "Profissional ativado na grade!" : "Profissional pausado.",
    }
  } catch (error: any) {
    console.error("Erro ao alterar status do profissional:", error)
    return { success: false, error: "Falha ao alterar status." }
  }
}
