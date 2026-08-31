"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { z } from "zod"

/**
 * 1. Criar Convite de Equipe (Pelo Dono)
 */
const CreateInviteSchema = z.object({
  phone: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos (DDD + Número)"),
  specialty: z.string().min(2, "Selecione a função do integrante"),
  durationHours: z.number().min(0.5).max(720).default(1), // Padrão: 1 hora
  commissionPercent: z.number().min(0).max(100).default(50.0),
  productCommission: z.number().min(0).max(100).default(10.0),
  colorHex: z.string().default("#10b981"),
})

export async function createTeamInviteAction(data: {
  phone: string
  specialty: string
  durationHours?: number
  commissionPercent?: number
  productCommission?: number
  colorHex?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true, business: { select: { id: true, name: true, phone: true } } },
  })

  if (!user?.businessId || !user.business) {
    return { success: false, error: "Você precisa ter um estabelecimento cadastrado." }
  }

  // 1. Validação de Limite de Profissionais pelo Plano Ativo
  const { checkBusinessProfessionalLimit } = await import("./subscription-actions")
  const limitCheck = await checkBusinessProfessionalLimit(user.businessId)
  if (!limitCheck.canAdd) {
    return { success: false, error: limitCheck.error }
  }

  const parsed = CreateInviteSchema.safeParse({
    ...data,
    durationHours: data.durationHours || 1,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const cleanPhone = data.phone.replace(/\D/g, "")
    const durationHours = data.durationHours || 1
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000)
    
    // Gera token seguro e criptográfico
    const token = crypto.randomBytes(24).toString("hex")

    const invite = await prisma.teamInvite.create({
      data: {
        businessId: user.businessId,
        phone: cleanPhone,
        specialty: data.specialty.trim(),
        commissionPercent: Number(data.commissionPercent) || 50.0,
        productCommission: Number(data.productCommission) || 10.0,
        colorHex: data.colorHex || "#10b981",
        token,
        expiresAt,
        status: "PENDING",
      },
    })

    // Monta texto e links
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const inviteUrl = `${baseUrl}/convite/equipe?token=${token}`
    
    const durationLabel = durationHours === 1 ? "1 hora" : durationHours < 24 ? `${durationHours} horas` : `${Math.round(durationHours / 24)} dias`

    const messageText = `Olá! Você foi convidado(a) para fazer parte da equipe de *${user.business.name}* na função de *${data.specialty}*.\n\nAcesse o link seguro abaixo para concluir seu cadastro e criar sua senha de acesso:\n👉 ${inviteUrl}\n\n⚠️ *Atenção:* Este link é de uso único e expira em ${durationLabel}.`

    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`

    revalidatePath("/app/equipe")

    return {
      success: true,
      invite,
      token,
      inviteUrl,
      whatsappUrl,
      whatsappMessage: messageText,
      message: "Convite gerado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao gerar convite:", error)
    return { success: false, error: "Falha ao gerar link de convite." }
  }
}

/**
 * 2. Listar Convites Pendentes do Estabelecimento
 */
export async function getBusinessPendingInvitesAction() {
  const session = await auth()
  if (!session?.user?.id) return []

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) return []

  // Busca todos os convites pendentes e verifica expiração
  const invites = await prisma.teamInvite.findMany({
    where: {
      businessId: user.businessId,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  })

  const now = new Date()
  const activeInvites = []

  for (const inv of invites) {
    if (inv.expiresAt < now) {
      await prisma.teamInvite.update({
        where: { id: inv.id },
        data: { status: "EXPIRED" },
      })
    } else {
      activeInvites.push(inv)
    }
  }

  return activeInvites
}

/**
 * 3. Cancelar Convite Pendente
 */
export async function cancelTeamInviteAction(inviteId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status: "CANCELED" },
    })

    revalidatePath("/app/equipe")

    return { success: true, message: "Convite cancelado com sucesso." }
  } catch (error) {
    return { success: false, error: "Falha ao cancelar convite." }
  }
}

/**
 * 4. Validar Token de Convite (Ação Pública para o Onboarding)
 */
export async function validateInviteTokenAction(token: string) {
  if (!token) {
    return { valid: false, error: "Token de convite não informado." }
  }

  try {
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            bannerUrl: true,
            type: true,
            city: true,
            state: true,
            themeColor: true,
          },
        },
      },
    })

    if (!invite || invite.status === "CANCELED") {
      return { valid: false, error: "Este link de convite é inválido ou foi cancelado pelo responsável." }
    }

    if (invite.status === "ACCEPTED") {
      return { valid: false, isAccepted: true, error: "Este convite já foi utilizado e concluído com sucesso." }
    }

    if (invite.expiresAt < new Date() || invite.status === "EXPIRED") {
      if (invite.status !== "EXPIRED") {
        await prisma.teamInvite.update({
          where: { id: invite.id },
          data: { status: "EXPIRED" },
        })
      }
      return { 
        valid: false, 
        isExpired: true, 
        error: "Este link de convite expirou. Solicite um novo link ao responsável do estabelecimento." 
      }
    }

    return {
      valid: true,
      invite: {
        id: invite.id,
        phone: invite.phone,
        specialty: invite.specialty,
        commissionPercent: invite.commissionPercent,
        productCommission: invite.productCommission,
        colorHex: invite.colorHex,
        expiresAt: invite.expiresAt,
        business: invite.business,
      },
    }
  } catch (error) {
    console.error("Erro ao validar token de convite:", error)
    return { valid: false, error: "Erro ao verificar validade do convite." }
  }
}

/**
 * 5. Aceitar Convite & Concluir Cadastro do Profissional (Ação Pública)
 */
const AcceptInviteSchema = z.object({
  token: z.string(),
  name: z.string().min(2, "Nome completo é obrigatório"),
  email: z.string().email("E-mail válido é obrigatório"),
  phone: z.string().min(10, "WhatsApp é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  bio: z.string().optional().or(z.literal("")),
  pixKey: z.string().optional().or(z.literal("")),
  pixKeyType: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
})

export async function acceptTeamInviteAction(data: z.infer<typeof AcceptInviteSchema>) {
  const parsed = AcceptInviteSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    // 1. Valida o convite
    const invite = await prisma.teamInvite.findUnique({
      where: { token: data.token },
      include: {
        business: {
          select: { id: true, name: true },
        },
      },
    })

    if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      return { success: false, error: "Este convite expirou ou já foi utilizado." }
    }

    // 1.1 Valida se o estabelecimento ainda possui vaga no plano
    const { checkBusinessProfessionalLimit } = await import("./subscription-actions")
    const limitCheck = await checkBusinessProfessionalLimit(invite.businessId)
    if (!limitCheck.canAdd) {
      return { success: false, error: limitCheck.error }
    }

    // 2. Criptografa a senha com bcrypt
    const passwordHash = await bcrypt.hash(data.password, 10)
    const cleanPhone = data.phone.replace(/\D/g, "")

    // 3. Cria a entidade independente do Profissional
    const professional = await prisma.professional.create({
      data: {
        businessId: invite.businessId,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: cleanPhone,
        passwordHash,
        avatarUrl: data.avatarUrl?.trim() || null,
        specialty: invite.specialty, // Fixado pelo dono
        bio: data.bio?.trim() || null,
        colorHex: invite.colorHex || "#10b981",
        commissionPercent: invite.commissionPercent || 50.0,
        productCommission: invite.productCommission || 10.0,
        pixKey: data.pixKey?.trim() || null,
        pixKeyType: data.pixKeyType || null,
        isActive: true,
      },
    })

    // 4. Marca o convite como aceito
    await prisma.teamInvite.update({
      where: { id: invite.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        professionalId: professional.id,
      },
    })

    // 5. Inicia a sessão automática no Portal do Profissional (/pro)
    try {
      const { setProSessionDirectly } = await import("./pro-auth-actions")
      await setProSessionDirectly(professional.id, invite.businessId, professional.name)
    } catch (e) {
      console.error("Erro ao definir sessão direta:", e)
    }

    revalidatePath("/app/equipe")
    revalidatePath("/app/website")
    revalidatePath("/pro")

    return {
      success: true,
      professional,
      businessName: invite.business.name,
      redirectUrl: "/pro",
      message: `Cadastro concluído com sucesso! Bem-vindo(a) à equipe de ${invite.business.name}.`,
    }
  } catch (error: any) {
    console.error("Erro ao aceitar convite:", error)
    return { success: false, error: error?.message || "Ocorreu um erro ao concluir seu cadastro. Tente novamente." }
  }
}
