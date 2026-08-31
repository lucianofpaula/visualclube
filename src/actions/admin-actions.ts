"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/app/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  })

  if (user?.role !== "ADMIN" && user?.role !== "OWNER") {
    redirect("/app")
  }

  return user
}

// ----------------------------------------------------
// GESTÃO DE RECURSOS & SUB-RECURSOS (FEATURES)
// ----------------------------------------------------

export interface FeatureTreeNode {
  id: string
  code: string
  name: string
  description: string | null
  icon: string | null
  menuPath: string | null
  order: number
  isActive: boolean
  parentId: string | null
  children: FeatureTreeNode[]
}

/**
 * Retorna todos os recursos agrupados hierarquicamente (Pais com seus Filhos)
 */
export async function getAdminFeaturesTree(): Promise<FeatureTreeNode[]> {
  await requireAdmin()

  const allFeatures = await prisma.platformFeature.findMany({
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
    menuPath: p.menuPath,
    order: p.order,
    isActive: p.isActive,
    parentId: p.parentId,
    children: (childrenMap.get(p.id) || []).map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      icon: c.icon,
      menuPath: c.menuPath,
      order: c.order,
      isActive: c.isActive,
      parentId: c.parentId,
      children: [],
    })),
  }))
}

/**
 * Cria um novo recurso ou sub-recurso
 */
export async function createPlatformFeature(data: {
  code: string
  name: string
  description?: string
  icon?: string
  menuPath?: string
  parentId?: string | null
  order?: number
  isActive?: boolean
}): Promise<{ success: true; feature: any } | { success: false; error: string }> {
  try {
    await requireAdmin()

    const cleanCode = data.code.trim().toLowerCase().replace(/\s+/g, "_")

    const existing = await prisma.platformFeature.findUnique({
      where: { code: cleanCode },
    })
    if (existing) {
      return { success: false, error: "Já existe um recurso com este código único." }
    }

    const feature = await prisma.platformFeature.create({
      data: {
        code: cleanCode,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        icon: data.icon?.trim() || null,
        menuPath: data.menuPath?.trim() || null,
        parentId: data.parentId || null,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })

    revalidatePath("/admin/recursos")
    revalidatePath("/admin/planos")
    revalidatePath("/app")
    return { success: true, feature }
  } catch (error: any) {
    console.error("Erro ao criar recurso:", error)
    return { success: false, error: error?.message || "Falha ao criar recurso." }
  }
}

/**
 * Alterna rapidamente o status ativo/pausado de um recurso
 */
export async function togglePlatformFeatureStatus(id: string): Promise<{ success: true; isActive: boolean } | { success: false; error: string }> {
  try {
    await requireAdmin()

    const current = await prisma.platformFeature.findUnique({
      where: { id },
      select: { isActive: true },
    })

    if (!current) {
      return { success: false, error: "Recurso não encontrado." }
    }

    const updated = await prisma.platformFeature.update({
      where: { id },
      data: {
        isActive: !current.isActive,
      },
    })

    revalidatePath("/admin/recursos")
    revalidatePath("/admin/planos")
    revalidatePath("/app")
    return { success: true, isActive: updated.isActive }
  } catch (error: any) {
    return { success: false, error: error?.message || "Falha ao alternar status do recurso." }
  }
}

/**
 * Atualiza um recurso ou sub-recurso
 */
export async function updatePlatformFeature(
  id: string,
  data: {
    name: string
    description?: string
    icon?: string
    menuPath?: string
    order?: number
    isActive?: boolean
  }
): Promise<{ success: true; feature: any } | { success: false; error: string }> {
  try {
    await requireAdmin()

    const feature = await prisma.platformFeature.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        icon: data.icon?.trim() || null,
        menuPath: data.menuPath?.trim() || null,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    })

    revalidatePath("/admin/recursos")
    revalidatePath("/admin/planos")
    return { success: true, feature }
  } catch (error: any) {
    console.error("Erro ao atualizar recurso:", error)
    return { success: false, error: error?.message || "Falha ao atualizar recurso." }
  }
}

/**
 * Exclui um recurso e seus sub-recursos
 */
export async function deletePlatformFeature(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin()

    // Remove os filhos primeiro
    await prisma.platformFeature.deleteMany({
      where: { parentId: id },
    })

    // Remove o pai
    await prisma.platformFeature.delete({
      where: { id },
    })

    revalidatePath("/admin/recursos")
    revalidatePath("/admin/planos")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao excluir recurso:", error)
    return { success: false, error: error?.message || "Falha ao excluir recurso." }
  }
}

// ----------------------------------------------------
// GESTÃO DE PLANOS COM SELEÇÃO DE FEATURES & COMISSÕES
// ----------------------------------------------------

export interface AdminPlanDTO {
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
  isActive: boolean
  subscriberCount?: number
}

/**
 * Retorna todos os planos para o painel admin
 */
export async function getAdminPlans(): Promise<AdminPlanDTO[]> {
  await requireAdmin()

  const plans = await prisma.platformPlan.findMany({
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
    referralRates: (p.referralRates as any) || [],
    order: p.order,
    isActive: p.isActive,
  }))
}

/**
 * Cria ou atualiza um plano SaaS
 */
export async function upsertAdminPlan(data: {
  id?: string
  slug: string
  name: string
  description?: string
  badge?: string
  priceMonthly: number
  priceYearly: number
  trialDays?: number
  maxProfessionals?: number
  featureIds: string[]
  referralRates?: Array<{ level: number; percentage: number }>
  featuresText?: string[]
  notIncludedText?: string[]
  order?: number
  isActive?: boolean
}): Promise<{ success: true; plan: any } | { success: false; error: string }> {
  try {
    await requireAdmin()

    const cleanSlug = data.slug.trim().toLowerCase().replace(/\s+/g, "-")

    const planData = {
      slug: cleanSlug,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      badge: data.badge?.trim() || null,
      priceMonthly: Number(data.priceMonthly),
      priceYearly: Number(data.priceYearly),
      trialDays: Number(data.trialDays ?? 7),
      maxProfessionals: Number(data.maxProfessionals ?? 2),
      featureIds: data.featureIds || [],
      referralRates: data.referralRates || [],
      features: data.featuresText || [],
      notIncluded: data.notIncludedText || [],
      order: Number(data.order ?? 0),
      isActive: data.isActive ?? true,
    }

    let plan
    if (data.id) {
      plan = await prisma.platformPlan.update({
        where: { id: data.id },
        data: planData,
      })
    } else {
      plan = await prisma.platformPlan.create({
        data: planData,
      })
    }

    revalidatePath("/admin/planos")
    revalidatePath("/app")
    return { success: true, plan }
  } catch (error: any) {
    console.error("Erro ao salvar plano:", error)
    return { success: false, error: error?.message || "Falha ao salvar plano." }
  }
}

/**
 * Exclui um plano do sistema
 */
export async function deleteAdminPlan(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin()

    await prisma.platformPlan.delete({
      where: { id },
    })

    revalidatePath("/admin/planos")
    revalidatePath("/app")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao excluir plano:", error)
    return { success: false, error: error?.message || "Falha ao excluir plano." }
  }
}

/**
 * Estatísticas gerais do SaaS para o Dashboard Admin
 */
export async function getAdminStats() {
  await requireAdmin()

  const [totalUsers, totalSubscriptions, totalPlans, totalFeatures] = await Promise.all([
    prisma.user.count(),
    prisma.userPlatformSubscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
    prisma.platformPlan.count(),
    prisma.platformFeature.count(),
  ])

  return {
    totalUsers,
    totalSubscriptions,
    totalPlans,
    totalFeatures,
  }
}
