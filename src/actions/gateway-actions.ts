"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MercadoPagoConfig, User } from "mercadopago"

async function verifyAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    throw new Error("Acesso restrito para administradores.")
  }
  return session.user
}

export interface GatewayConfigDTO {
  id?: string
  provider: string
  isSandbox: boolean
  sandboxPublicKey: string
  sandboxAccessToken: string
  prodPublicKey: string
  prodAccessToken: string
  webhookSecret: string
  isActive: boolean
}

/**
 * Busca a configuração salva do Mercado Pago
 */
export async function getPlatformGatewayConfig(): Promise<GatewayConfigDTO> {
  await verifyAdmin()

  const config = await prisma.platformGatewayConfig.findUnique({
    where: { provider: "MERCADOPAGO" },
  })

  if (!config) {
    return {
      provider: "MERCADOPAGO",
      isSandbox: true,
      sandboxPublicKey: process.env.MP_PUBLIC_KEY || "",
      sandboxAccessToken: process.env.MP_ACCESS_TOKEN || "",
      prodPublicKey: "",
      prodAccessToken: "",
      webhookSecret: process.env.MP_WEBHOOK_SECRET || "",
      isActive: true,
    }
  }

  return {
    id: config.id,
    provider: config.provider,
    isSandbox: config.isSandbox,
    sandboxPublicKey: config.sandboxPublicKey || "",
    sandboxAccessToken: config.sandboxAccessToken || "",
    prodPublicKey: config.prodPublicKey || "",
    prodAccessToken: config.prodAccessToken || "",
    webhookSecret: config.webhookSecret || "",
    isActive: config.isActive,
  }
}

/**
 * Salva ou atualiza as configurações do Mercado Pago
 */
export async function savePlatformGatewayConfig(data: {
  isSandbox: boolean
  sandboxPublicKey: string
  sandboxAccessToken: string
  prodPublicKey: string
  prodAccessToken: string
  webhookSecret: string
  isActive: boolean
}) {
  await verifyAdmin()

  const updated = await prisma.platformGatewayConfig.upsert({
    where: { provider: "MERCADOPAGO" },
    create: {
      provider: "MERCADOPAGO",
      isSandbox: data.isSandbox,
      sandboxPublicKey: data.sandboxPublicKey.trim(),
      sandboxAccessToken: data.sandboxAccessToken.trim(),
      prodPublicKey: data.prodPublicKey.trim(),
      prodAccessToken: data.prodAccessToken.trim(),
      webhookSecret: data.webhookSecret.trim(),
      isActive: data.isActive,
    },
    update: {
      isSandbox: data.isSandbox,
      sandboxPublicKey: data.sandboxPublicKey.trim(),
      sandboxAccessToken: data.sandboxAccessToken.trim(),
      prodPublicKey: data.prodPublicKey.trim(),
      prodAccessToken: data.prodAccessToken.trim(),
      webhookSecret: data.webhookSecret.trim(),
      isActive: data.isActive,
    },
  })

  revalidatePath("/admin/gateway")
  revalidatePath("/admin")
  revalidatePath("/app")

  return {
    success: true,
    message: "Configurações do Mercado Pago salvas com sucesso!",
    config: updated,
  }
}

/**
 * Testa a conexão com a API do Mercado Pago utilizando o token informado
 */
export async function testMercadoPagoConnection(token: string) {
  await verifyAdmin()

  if (!token || token.trim().length === 0) {
    return { success: false, error: "Informe um Access Token para testar a conexão." }
  }

  try {
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      return {
        success: false,
        error: errJson.message || `Falha na autenticação (Status ${res.status}: ${res.statusText})`,
      }
    }

    const data = await res.json()
    return {
      success: true,
      message: `Conexão bem-sucedida! Conta conectada: ${data.nickname || data.email || data.id} (${data.site_id || "Brasil"})`,
      user: {
        id: data.id,
        nickname: data.nickname,
        email: data.email,
        siteId: data.site_id,
      },
    }
  } catch (error: any) {
    console.error("Erro ao testar Mercado Pago:", error)
    return {
      success: false,
      error: error.message || "Erro de rede ao conectar com os servidores do Mercado Pago.",
    }
  }
}
