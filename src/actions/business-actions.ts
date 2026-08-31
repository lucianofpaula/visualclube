"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const BusinessSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "Link deve ter pelo menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  type: z.enum([
    "BARBERSHOP",
    "HAIR_SALON",
    "NAIL_SALON",
    "ESTHETICS_CLINIC",
    "SPA",
    "OTHER",
  ]),
  document: z.string().optional().nullable(),
  phone: z.string().min(10, "Informe um WhatsApp válido com DDD"),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  pixKeyType: z.string().optional().nullable(),
  themeColor: z.string().optional().nullable(),
})

export type CreateBusinessInput = z.infer<typeof BusinessSchema>

/**
 * Verifica se um slug está disponível para o link público
 */
export async function checkSlugAvailability(slug: string, currentBusinessId?: string) {
  const cleanSlug = slug.toLowerCase().trim()
  if (!cleanSlug || cleanSlug.length < 2) {
    return { available: false, message: "Link muito curto" }
  }

  const existing = await prisma.business.findUnique({
    where: { slug: cleanSlug },
    select: { id: true },
  })

  if (existing && existing.id !== currentBusinessId) {
    return { available: false, message: "Este link já está em uso por outro espaço" }
  }

  return { available: true, message: "Link disponível!" }
}

/**
 * Retorna os dados do negócio do usuário autenticado
 */
export async function getCurrentBusiness() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      business: true,
    },
  })

  return user?.business || null
}

/**
 * Cria o estabelecimento e vincula ao usuário atual como OWNER
 */
export async function createBusiness(data: CreateBusinessInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const parsed = BusinessSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Dados inválidos.",
    }
  }

  const {
    name,
    slug,
    type,
    document,
    phone,
    email,
    description,
    postalCode,
    address,
    neighborhood,
    city,
    state,
    pixKey,
    pixKeyType,
  } = parsed.data

  const cleanSlug = slug.toLowerCase().trim()

  // 1. Verificar se o slug já existe
  const slugExists = await prisma.business.findUnique({
    where: { slug: cleanSlug },
    select: { id: true },
  })

  if (slugExists) {
    return { success: false, error: "Este link já está em uso. Escolha outro.", field: "slug" }
  }

  try {
    // Monta o endereço completo compatível
    const fullAddress = [
      address?.trim(),
      neighborhood?.trim() ? `Bairro ${neighborhood.trim()}` : null,
      postalCode?.trim() ? `CEP ${postalCode.trim()}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || null

    // 2. Criar o Business no MongoDB
    const newBusiness = await prisma.business.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        type,
        document: document?.trim() || null,
        phone: phone.replace(/\D/g, ""),
        email: email?.trim().toLowerCase() || null,
        description: description?.trim() || null,
        address: fullAddress,
        city: city?.trim() || null,
        state: state?.trim().toUpperCase() || null,
        pixKey: pixKey?.trim() || null,
        pixKeyType: pixKeyType || null,
      },
    })

    // 3. Atualizar o usuário para role OWNER e vincular ao businessId
    const currentRole = (session.user as any)?.role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        businessId: newBusiness.id,
        role: currentRole === "ADMIN" ? "ADMIN" : "OWNER",
      },
    })

    revalidatePath("/app")
    revalidatePath("/app/configuracoes")
    revalidatePath("/app/website")

    return {
      success: true,
      business: newBusiness,
      message: "Espaço criado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao criar estabelecimento:", error)
    return { 
      success: false, 
      error: error?.message ? `Erro: ${error.message}` : "Falha ao cadastrar o espaço. Tente novamente." 
    }
  }
}

/**
 * Atualiza os dados do estabelecimento do usuário autenticado
 */
export async function updateBusiness(businessId: string, data: Partial<CreateBusinessInput>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado." }
  }

  try {
    const updatePayload: any = {}
    if (data.name) updatePayload.name = data.name.trim()
    if (data.slug) updatePayload.slug = data.slug.toLowerCase().trim()
    if (data.type) updatePayload.type = data.type
    if (data.phone) updatePayload.phone = data.phone.replace(/\D/g, "")
    if (data.email !== undefined) updatePayload.email = data.email ? data.email.trim().toLowerCase() : null
    if (data.document !== undefined) updatePayload.document = data.document?.trim() || null
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null
    if (data.city !== undefined) updatePayload.city = data.city?.trim() || null
    if (data.state !== undefined) updatePayload.state = data.state?.trim().toUpperCase() || null
    if (data.pixKey !== undefined) updatePayload.pixKey = data.pixKey?.trim() || null
    if (data.pixKeyType !== undefined) updatePayload.pixKeyType = data.pixKeyType || null
    if (data.themeColor !== undefined) updatePayload.themeColor = data.themeColor || null

    if (data.address !== undefined || data.neighborhood !== undefined || data.postalCode !== undefined) {
      const parts = [
        data.address?.trim(),
        data.neighborhood?.trim() ? `Bairro ${data.neighborhood.trim()}` : null,
        data.postalCode?.trim() ? `CEP ${data.postalCode.trim()}` : null,
      ].filter(Boolean)
      if (parts.length > 0) {
        updatePayload.address = parts.join(" - ")
      }
    }

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: updatePayload,
    })

    revalidatePath("/app")
    revalidatePath("/app/configuracoes")
    revalidatePath("/app/website")
    revalidatePath(`/b/${updated.slug}`)

    return { success: true, business: updated, message: "Dados atualizados com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao atualizar estabelecimento:", error)
    return { success: false, error: "Falha ao salvar alterações." }
  }
}

/**
 * Busca dados públicos do estabelecimento por slug para a página /b/[slug]
 */
export async function getPublicBusinessBySlug(slug: string) {
  if (!slug) return null

  try {
    const business = await prisma.business.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        professionals: {
          where: { isActive: true, showInCalendar: true, deletedAt: null },
          orderBy: { name: "asc" },
        },
        subscriptions: {
          where: {
            isActive: true,
            OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
          },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        },
      },
    })

    return business ? JSON.parse(JSON.stringify(business)) : null
  } catch (error) {
    console.error("Erro ao buscar estabelecimento público:", error)
    return null
  }
}

/**
 * Salva as customizações do Website Premium (Banner, Logo, Textos e Horários)
 */
export async function updateBusinessWebsite(
  businessId: string,
  data: {
    name?: string
    description?: string
    logoUrl?: string | null
    bannerUrl?: string | null
    openingHours?: string | null
    phone?: string | null
    address?: string | null
    themeColor?: string | null
  }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado." }
  }

  try {
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: data.name?.trim(),
        description: data.description?.trim(),
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        openingHours: data.openingHours,
        phone: data.phone ? data.phone.replace(/\D/g, "") : undefined,
        address: data.address?.trim(),
        themeColor: data.themeColor || undefined,
      },
    })

    revalidatePath("/app")
    revalidatePath("/app/website")
    revalidatePath("/app/meu-negocio/web-site")
    revalidatePath(`/b/${updated.slug}`)

    return {
      success: true,
      business: updated,
      message: "Website Premium atualizado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar Website:", error)
    return { success: false, error: "Falha ao salvar customizações do Website." }
  }
}

