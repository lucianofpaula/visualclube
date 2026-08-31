"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export interface ReferralRateItem {
  level: number
  percentage: number
  label?: string
}

export interface ServiceRuleItem {
  serviceId: string
  serviceName?: string
  limitType: "UNLIMITED" | "FIXED"
  monthlyLimit?: number
}

const ReferralRateSchema = z.object({
  level: z.number().min(1),
  percentage: z.number().min(0).max(100),
  label: z.string().optional(),
})

const ServiceRuleSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string().optional(),
  limitType: z.enum(["UNLIMITED", "FIXED"]).default("UNLIMITED"),
  monthlyLimit: z.number().min(1).optional().nullable(),
})

const SubscriptionPlanSchema = z.object({
  name: z.string().min(2, "O nome do plano deve ter pelo menos 2 caracteres"),
  description: z.string().optional().nullable().or(z.literal("")),
  priceMonthly: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  badge: z.string().optional().nullable().or(z.literal("")),
  includedServiceIds: z.array(z.string()).default([]),
  servicesRules: z.array(ServiceRuleSchema).default([]),
  productDiscountPercent: z.number().min(0).max(100).default(0),
  referralEnabled: z.boolean().default(false),
  referralRates: z.array(ReferralRateSchema).default([]),
  isActive: z.boolean().default(true),
})

export type SubscriptionPlanInput = z.infer<typeof SubscriptionPlanSchema>

/**
 * Retorna as configurações do Clube de Assinaturas do estabelecimento
 */
export async function getClubSettings() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
          clubEnabled: true,
          clubReferralEnabled: true,
          clubDirectReferral: true,
          clubIndirectReferral: true,
          clubReferralTerms: true,
        },
      },
    },
  })

  return user?.business || null
}

/**
 * Atualiza as configurações de ativação do clube e do programa de indicação
 */
export async function updateClubSettings(data: {
  clubEnabled?: boolean
  clubReferralEnabled?: boolean
  clubDirectReferral?: boolean
  clubIndirectReferral?: boolean
  clubReferralTerms?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const updated = await prisma.business.update({
      where: { id: user.businessId },
      data: {
        clubEnabled: data.clubEnabled !== undefined ? data.clubEnabled : undefined,
        clubReferralEnabled: data.clubReferralEnabled !== undefined ? data.clubReferralEnabled : undefined,
        clubDirectReferral: data.clubDirectReferral !== undefined ? data.clubDirectReferral : undefined,
        clubIndirectReferral: data.clubIndirectReferral !== undefined ? data.clubIndirectReferral : undefined,
        clubReferralTerms: data.clubReferralTerms !== undefined ? data.clubReferralTerms : undefined,
      },
      select: {
        id: true,
        clubEnabled: true,
        clubReferralEnabled: true,
        clubDirectReferral: true,
        clubIndirectReferral: true,
        clubReferralTerms: true,
      },
    })

    revalidatePath("/app/clube")
    revalidatePath("/app/clube/configuracoes")

    return {
      success: true,
      settings: updated,
      message: "Configurações do clube atualizadas com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações do clube:", error)
    return { success: false, error: "Falha ao salvar configurações do clube." }
  }
}

/**
 * Retorna todos os planos de assinatura do estabelecimento com os serviços cadastrados
 */
export async function getBusinessClubPlans() {
  const session = await auth()
  if (!session?.user?.id) return { plans: [], services: [], settings: null }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
          clubEnabled: true,
          clubReferralEnabled: true,
          clubDirectReferral: true,
          clubIndirectReferral: true,
          clubReferralTerms: true,
        },
      },
    },
  })

  if (!user?.businessId) return { plans: [], services: [], settings: null }

  try {
    const [plans, services] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        where: {
          businessId: user.businessId,
          OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
        },
        orderBy: [{ isActive: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.service.findMany({
        where: { businessId: user.businessId, isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          category: true,
          durationMinutes: true,
        },
        orderBy: { name: "asc" },
      }),
    ])

    return {
      plans: JSON.parse(JSON.stringify(plans)),
      services: JSON.parse(JSON.stringify(services)),
      settings: user.business ? JSON.parse(JSON.stringify(user.business)) : null,
    }
  } catch (error) {
    console.error("Erro ao buscar planos do clube:", error)
    return { plans: [], services: [], settings: null }
  }
}

/**
 * Cria um novo plano de assinatura do clube
 */
export async function createClubPlan(data: SubscriptionPlanInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const parsed = SubscriptionPlanSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos." }
  }

  try {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        businessId: user.businessId,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        priceMonthly: Number(parsed.data.priceMonthly),
        billingCycle: parsed.data.billingCycle,
        badge: parsed.data.badge?.trim() || null,
        includedServiceIds: parsed.data.includedServiceIds || [],
        servicesRules: parsed.data.servicesRules || [],
        productDiscountPercent: Number(parsed.data.productDiscountPercent) || 0,
        referralEnabled: parsed.data.referralEnabled,
        referralRates: parsed.data.referralEnabled ? parsed.data.referralRates : [],
        isActive: parsed.data.isActive,
      },
    })

    revalidatePath("/app/clube")

    return {
      success: true,
      plan: JSON.parse(JSON.stringify(plan)),
      message: "Plano de assinatura criado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao criar plano de assinatura:", error)
    return { success: false, error: error?.message || "Falha ao criar plano de assinatura." }
  }
}

/**
 * Atualiza um plano de assinatura existente
 */
export async function updateClubPlan(planId: string, data: Partial<SubscriptionPlanInput>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  // Verifica se o plano pertence ao negócio
  const existing = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    select: { businessId: true },
  })

  if (!existing || existing.businessId !== user.businessId) {
    return { success: false, error: "Plano não encontrado ou sem permissão." }
  }

  try {
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.description !== undefined) updateData.description = data.description?.trim() || null
    if (data.priceMonthly !== undefined) updateData.priceMonthly = Number(data.priceMonthly)
    if (data.billingCycle !== undefined) updateData.billingCycle = data.billingCycle
    if (data.badge !== undefined) updateData.badge = data.badge?.trim() || null
    if (data.includedServiceIds !== undefined) updateData.includedServiceIds = data.includedServiceIds
    if (data.servicesRules !== undefined) updateData.servicesRules = data.servicesRules
    if (data.productDiscountPercent !== undefined) updateData.productDiscountPercent = Number(data.productDiscountPercent)
    if (data.referralEnabled !== undefined) {
      updateData.referralEnabled = data.referralEnabled
      if (!data.referralEnabled) {
        updateData.referralRates = []
      }
    }
    if (data.referralRates !== undefined && data.referralEnabled !== false) {
      updateData.referralRates = data.referralRates
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const updated = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: updateData,
    })

    revalidatePath("/app/clube")

    return {
      success: true,
      plan: JSON.parse(JSON.stringify(updated)),
      message: "Plano atualizado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar plano:", error)
    return { success: false, error: "Falha ao atualizar plano." }
  }
}

/**
 * Ativa ou Desativa um plano rapidamente
 */
export async function toggleClubPlanStatus(planId: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const updated = await prisma.subscriptionPlan.updateMany({
      where: { id: planId, businessId: user.businessId },
      data: { isActive },
    })

    if (updated.count === 0) {
      return { success: false, error: "Plano não encontrado." }
    }

    revalidatePath("/app/clube")
    return { success: true, message: isActive ? "Plano ativado!" : "Plano pausado." }
  } catch (error) {
    console.error("Erro ao alternar status do plano:", error)
    return { success: false, error: "Falha ao alterar status do plano." }
  }
}

/**
 * Exclui um plano de assinatura do clube via Soft Delete (arquivamento seguro)
 */
export async function deleteClubPlan(planId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const deleted = await prisma.subscriptionPlan.updateMany({
      where: {
        id: planId,
        businessId: user.businessId,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    if (deleted.count === 0) {
      return { success: false, error: "Plano não encontrado." }
    }

    revalidatePath("/app/clube")
    return { success: true, message: "Plano excluído e arquivado com sucesso!" }
  } catch (error) {
    console.error("Erro ao excluir plano:", error)
    return { success: false, error: "Falha ao excluir plano." }
  }
}
