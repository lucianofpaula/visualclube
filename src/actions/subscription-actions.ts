"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface PlatformPlanDTO {
  id: string
  slug: string
  name: string
  description: string | null
  badge: string | null
  priceMonthly: number
  priceYearly: number
  trialDays: number
  maxProfessionals: number
  hasWhatsappBot: boolean
  hasVipClub: boolean
  hasMultiUnits: boolean
  features: string[]
  notIncluded: string[]
  featureIds: string[]
  referralRates: Array<{ level: number; percentage: number }> | null
  order: number
}

export interface FeatureCatalogItemDTO {
  id: string
  code: string
  name: string
  description: string | null
  icon: string | null
  menuPath: string | null
  order: number
  children: Array<{
    id: string
    code: string
    name: string
    description: string | null
    icon: string | null
    menuPath: string | null
  }>
}

/**
 * Busca o catálogo completo de recursos e sub-recursos ativos do banco
 */
export async function getPlatformFeaturesCatalog(): Promise<FeatureCatalogItemDTO[]> {
  const allFeatures = await prisma.platformFeature.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  })

  const parents = allFeatures.filter((f) => !f.parentId)
  const childrenMap = new Map<string, typeof allFeatures>()

  for (const f of allFeatures) {
    if (f.parentId) {
      const list = childrenMap.get(f.parentId) || []
      list.push(f)
      childrenMap.set(f.parentId, list)
    }
  }

  return parents.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    icon: p.icon,
    menuPath: p.menuPath || `/app/${p.code.replace(/_/g, "-")}`,
    order: p.order,
    children: (childrenMap.get(p.id) || []).map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      icon: c.icon,
      menuPath: c.menuPath,
    })),
  }))
}

/**
 * Busca todos os planos ativos da plataforma
 */
export async function getPlatformPlans(): Promise<PlatformPlanDTO[]> {
  const plans = await prisma.platformPlan.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  })

  return plans.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    badge: p.badge,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    trialDays: p.trialDays,
    maxProfessionals: p.maxProfessionals,
    hasWhatsappBot: p.hasWhatsappBot,
    hasVipClub: p.hasVipClub,
    hasMultiUnits: p.hasMultiUnits,
    features: p.features,
    notIncluded: p.notIncluded,
    featureIds: p.featureIds || [],
    referralRates: (p.referralRates as any) || null,
    order: p.order,
  }))
}

/**
 * Busca a assinatura ativa ou trial do usuário logado e os códigos de recursos liberados
 */
export async function getCurrentUserSubscription() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const sub = await prisma.userPlatformSubscription.findFirst({
    where: {
      userId: session.user.id,
      status: {
        in: ["TRIALING", "ACTIVE"],
      },
    },
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Verifica papel de ADMIN do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  })
  const isAdmin = user?.role === "ADMIN" || user?.role === "OWNER"

  if (!sub) {
    if (isAdmin) {
      const allFeatures = await prisma.platformFeature.findMany({
        where: { isActive: true },
        select: { code: true },
      })
      return {
        id: "admin-subscription",
        status: "ACTIVE" as const,
        billingCycle: "MONTHLY",
        pricePaid: 0,
        trialStartsAt: new Date(),
        trialEndsAt: null,
        currentPeriodEnd: null,
        allowedFeatureCodes: allFeatures.map((f) => f.code),
        plan: {
          id: "admin-plan",
          slug: "admin",
          name: "Plano Administrador",
          badge: "ADMIN",
          priceMonthly: 0,
          priceYearly: 0,
          maxProfessionals: -1,
          hasWhatsappBot: true,
          hasVipClub: true,
          hasMultiUnits: true,
          featureIds: [],
          referralRates: null,
        },
      }
    }
    return null
  }

  // Busca os recursos associados ao plano (com herança de pai e filhos)
  let allowedFeatureCodes: string[] = []
  
  if (isAdmin) {
    const allFeatures = await prisma.platformFeature.findMany({
      where: { isActive: true },
      select: { code: true },
    })
    allowedFeatureCodes = allFeatures.map((f) => f.code)
  } else if (sub.plan.featureIds && sub.plan.featureIds.length > 0) {
    const allActiveFeatures = await prisma.platformFeature.findMany({
      where: { isActive: true },
    })

    const selectedSet = new Set(sub.plan.featureIds)
    const codeSet = new Set<string>()

    for (const feat of allActiveFeatures) {
      // Se a feature está explicitamente no plano
      if (selectedSet.has(feat.id)) {
        codeSet.add(feat.code)
        // Se for filho, adiciona também o código do pai
        if (feat.parentId) {
          const parent = allActiveFeatures.find((p) => p.id === feat.parentId)
          if (parent) codeSet.add(parent.code)
        }
      }

      // Se o pai desta feature está no plano, o filho herda a liberação
      if (feat.parentId && selectedSet.has(feat.parentId)) {
        codeSet.add(feat.code)
      }
    }

    allowedFeatureCodes = Array.from(codeSet)
  }

  // Verifica se o trial expirou
  const now = new Date()
  const isExpired = sub.status === "TRIALING" && sub.trialEndsAt && sub.trialEndsAt < now

  return {
    id: sub.id,
    status: isExpired ? ("EXPIRED" as const) : sub.status,
    billingCycle: sub.billingCycle,
    pricePaid: sub.pricePaid,
    trialStartsAt: sub.trialStartsAt,
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd,
    allowedFeatureCodes,
    plan: {
      id: sub.plan.id,
      slug: sub.plan.slug,
      name: sub.plan.name,
      badge: sub.plan.badge,
      priceMonthly: sub.plan.priceMonthly,
      priceYearly: sub.plan.priceYearly,
      maxProfessionals: sub.plan.maxProfessionals,
      hasWhatsappBot: sub.plan.hasWhatsappBot,
      hasVipClub: sub.plan.hasVipClub,
      hasMultiUnits: sub.plan.hasMultiUnits,
      featureIds: sub.plan.featureIds || [],
      referralRates: (sub.plan.referralRates as any) || null,
    },
  }
}

/**
 * Ativa o período de teste grátis (7 dias) ou assina um plano
 */
export async function activateTrialOrSubscribe(data: {
  planSlug: string
  billingCycle: "MONTHLY" | "YEARLY"
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado para assinar um plano." }
  }

  const plan = await prisma.platformPlan.findUnique({
    where: { slug: data.planSlug },
  })

  if (!plan) {
    return { success: false, error: "Plano selecionado não foi encontrado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      businessId: true,
      uplineIds: true,
      sponsorId: true,
    },
  })

  if (!user) {
    return { success: false, error: "Usuário não encontrado." }
  }

  const now = new Date()
  const trialEndsAt = new Date()
  trialEndsAt.setDate(now.getDate() + (plan.trialDays || 7))

  const periodEnd = new Date()
  if (data.billingCycle === "YEARLY") {
    periodEnd.setFullYear(now.getFullYear() + 1)
  } else {
    periodEnd.setMonth(now.getMonth() + 1)
  }

  const pricePaid = data.billingCycle === "YEARLY" ? plan.priceYearly * 12 : plan.priceMonthly

  // 1. Criar ou atualizar assinatura do usuário
  const subscription = await prisma.userPlatformSubscription.create({
    data: {
      userId: user.id,
      businessId: user.businessId,
      planId: plan.id,
      status: "TRIALING",
      billingCycle: data.billingCycle,
      pricePaid,
      trialStartsAt: now,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      paymentProvider: "TRIAL_FREE",
    },
  })

  // 2. Disparar comissões multinível com base no JSON referralRates do plano
  try {
    if (plan.referralRates && Array.isArray(plan.referralRates)) {
      const rates = plan.referralRates as Array<{ level: number; percentage: number }>
      const uplineList = [...(user.uplineIds || [])].reverse()

      for (const rateConfig of rates) {
        const uplineIndex = rateConfig.level - 1
        const beneficiaryId = uplineList[uplineIndex]

        if (beneficiaryId) {
          const commissionAmount = (pricePaid * rateConfig.percentage) / 100

          await prisma.referralCommission.create({
            data: {
              beneficiaryId,
              originUserId: user.id,
              level: rateConfig.level,
              percentage: rateConfig.percentage,
              amount: commissionAmount,
              status: "PENDING",
              description: `Comissão Nível ${rateConfig.level} (${rateConfig.percentage}%) - Período de Teste Plano ${plan.name}`,
            },
          })
        }
      }
    }
  } catch (commError) {
    console.error("Erro ao gerar comissões do plano:", commError)
  }

  revalidatePath("/app")
  return {
    success: true,
    message: `Plano ${plan.name} ativado com sucesso por 7 dias grátis!`,
    subscriptionId: subscription.id,
  }
}

/**
 * Valida se o estabelecimento atingiu o limite de profissionais cadastrados pelo plano atual
 */
export async function checkBusinessProfessionalLimit(businessId: string) {
  // 1. Contagem atual de profissionais ativos (não arquivados)
  const currentCount = await prisma.professional.count({
    where: {
      businessId,
      deletedAt: null,
    },
  })

  // 2. Busca assinatura ativa do negócio ou do dono
  const sub = await prisma.userPlatformSubscription.findFirst({
    where: {
      OR: [
        { businessId },
        { business: { id: businessId } },
      ],
      status: { in: ["ACTIVE", "TRIALING"] },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  })

  // Se não tem plano ativo cadastrado, usamos o plano Starter padrão (máx 2 profissionais)
  const maxAllowed = sub?.plan?.maxProfessionals !== undefined ? sub.plan.maxProfessionals : 2
  const planName = sub?.plan?.name || "Plano Inicial"
  const isUnlimited = maxAllowed === -1

  if (!isUnlimited && currentCount >= maxAllowed) {
    return {
      canAdd: false,
      currentCount,
      maxAllowed,
      planName,
      isUnlimited: false,
      error: `Seu plano atual (${planName}) atingiu o limite de ${maxAllowed} profissionais cadastrados. Faça um upgrade de plano para adicionar mais integrantes à sua equipe.`,
    }
  }

  return {
    canAdd: true,
    currentCount,
    maxAllowed,
    planName,
    isUnlimited,
  }
}

