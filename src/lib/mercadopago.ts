import { MercadoPagoConfig, Preference, Payment, PreApproval } from "mercadopago"
import { prisma } from "@/lib/prisma"

export interface MercadoPagoCredentials {
  accessToken: string | null
  publicKey: string | null
  webhookSecret: string | null
  isSandbox: boolean
  isConfigured: boolean
}

/**
 * Recupera as credenciais ativas do Mercado Pago (do banco de dados com fallback para .env)
 */
export async function getActiveMercadoPagoCredentials(): Promise<MercadoPagoCredentials> {
  try {
    const config = await prisma.platformGatewayConfig.findUnique({
      where: { provider: "MERCADOPAGO" },
    })

    if (config && config.isActive) {
      const isSandbox = config.isSandbox
      const accessToken = isSandbox ? config.sandboxAccessToken : config.prodAccessToken
      const publicKey = isSandbox ? config.sandboxPublicKey : config.prodPublicKey

      if (accessToken) {
        return {
          accessToken,
          publicKey: publicKey || null,
          webhookSecret: config.webhookSecret || process.env.MP_WEBHOOK_SECRET || null,
          isSandbox,
          isConfigured: true,
        }
      }
    }
  } catch (error) {
    console.error("Erro ao buscar configurações do Mercado Pago no banco:", error)
  }

  // Fallback para variáveis de ambiente
  const envToken = process.env.MP_ACCESS_TOKEN || null
  const envPublicKey = process.env.MP_PUBLIC_KEY || null
  const envSandbox = process.env.MP_SANDBOX !== "false"

  return {
    accessToken: envToken,
    publicKey: envPublicKey,
    webhookSecret: process.env.MP_WEBHOOK_SECRET || null,
    isSandbox: envSandbox,
    isConfigured: !!envToken,
  }
}

/**
 * Cria e retorna uma instância do cliente MercadoPagoConfig
 */
export async function getMercadoPagoClient(): Promise<{ client: MercadoPagoConfig; isSandbox: boolean }> {
  const creds = await getActiveMercadoPagoCredentials()

  if (!creds.accessToken) {
    throw new Error(
      "Credenciais do Mercado Pago não configuradas. Acesse o Painel Admin > Gateway de Pagamento para configurar."
    )
  }

  const client = new MercadoPagoConfig({
    accessToken: creds.accessToken,
    options: {
      timeout: 10000,
    },
  })

  return { client, isSandbox: creds.isSandbox }
}
