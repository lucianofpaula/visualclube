import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMercadoPagoClient } from "@/lib/mercadopago"
import { Payment } from "mercadopago"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get("topic") || url.searchParams.get("type")
    const queryId = url.searchParams.get("id") || url.searchParams.get("data.id")

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Body pode ser vazio ou query params apenas
    }

    const eventType = body?.type || body?.action || topic
    const entityId = body?.data?.id || queryId || body?.id

    console.log(`[MercadoPago Webhook] Evento recebido: ${eventType}, ID: ${entityId}`)

    if (!entityId) {
      return NextResponse.json({ received: true, note: "Sem ID na notificação" }, { status: 200 })
    }

    // Processar notificações de pagamento
    if (eventType === "payment" || eventType?.startsWith("payment.") || topic === "payment") {
      const { client } = await getMercadoPagoClient()
      const paymentClient = new Payment(client)

      const payment = await paymentClient.get({ id: String(entityId) })

      if (!payment || !payment.id) {
        console.warn(`[MercadoPago Webhook] Pagamento não encontrado no MP: ${entityId}`)
        return NextResponse.json({ received: true }, { status: 200 })
      }

      console.log(`[MercadoPago Webhook] Status do pagamento ${payment.id}: ${payment.status}`)

      // Se pagamento aprovado, efetiva a assinatura
      if (payment.status === "approved") {
        let meta: any = {}
        try {
          if (payment.external_reference) {
            meta = JSON.parse(payment.external_reference)
          }
        } catch {
          console.warn("[MercadoPago Webhook] external_reference não é JSON válido:", payment.external_reference)
        }

        const { userId, businessId, planId, billingCycle, pricePaid } = meta

        if (userId && planId) {
          const now = new Date()
          const periodEnd = new Date()
          if (billingCycle === "YEARLY") {
            periodEnd.setFullYear(now.getFullYear() + 1)
          } else {
            periodEnd.setMonth(now.getMonth() + 1)
          }

          const amountPaid = payment.transaction_amount || pricePaid || 0

          // 1. Atualizar ou Criar assinatura ativa
          const activeSub = await prisma.userPlatformSubscription.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
          })

          if (activeSub) {
            await prisma.userPlatformSubscription.update({
              where: { id: activeSub.id },
              data: {
                planId,
                status: "ACTIVE",
                billingCycle: billingCycle || "MONTHLY",
                pricePaid: amountPaid,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                paymentProvider: "MERCADOPAGO",
                externalSubscriptionId: String(payment.id),
                canceledAt: null,
              },
            })
          } else {
            await prisma.userPlatformSubscription.create({
              data: {
                userId,
                businessId: businessId || null,
                planId,
                status: "ACTIVE",
                billingCycle: billingCycle || "MONTHLY",
                pricePaid: amountPaid,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                paymentProvider: "MERCADOPAGO",
                externalSubscriptionId: String(payment.id),
              },
            })
          }

          // 2. Liberar comissões de indicação pendentes do usuário
          try {
            await prisma.referralCommission.updateMany({
              where: {
                originUserId: userId,
                status: "PENDING",
              },
              data: {
                status: "AVAILABLE",
              },
            })
          } catch (commErr) {
            console.error("[MercadoPago Webhook] Erro ao aprovar comissões:", commErr)
          }

          console.log(`[MercadoPago Webhook] Assinatura do usuário ${userId} ativada com sucesso!`)
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error("[MercadoPago Webhook] Erro ao processar webhook:", error)
    // Retornamos 200 para evitar retentativas infinitas do webhook do MP em erros de parsing
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 200 })
  }
}
