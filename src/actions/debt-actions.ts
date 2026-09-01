"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * 1. Criar Débito / Fiado para um Cliente (Pagar Depois)
 */
export async function createCustomerDebtAction(params: {
  clientId: string
  orderId?: string
  description: string
  amount: number
  dueDate?: string
  notes?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const businessId = currentUser.businessId
  const amount = Number(params.amount) || 0

  if (amount <= 0) {
    return { success: false, error: "O valor do débito deve ser maior que zero." }
  }

  if (!params.clientId) {
    return { success: false, error: "Selecione o cliente para vincular ao fiado/pagar depois." }
  }

  try {
    const client = await prisma.user.findUnique({
      where: { id: params.clientId },
      select: { id: true, name: true, phone: true, creditLimit: true },
    })

    if (!client) {
      return { success: false, error: "Cliente não encontrado no sistema." }
    }

    const dueDate = params.dueDate ? new Date(params.dueDate) : null

    const debt = await (prisma as any).customerDebt.create({
      data: {
        businessId,
        clientId: client.id,
        orderId: params.orderId || null,
        description: params.description?.trim() || "Consumo / Atendimento a Prazo",
        totalAmount: amount,
        paidAmount: 0.0,
        remainingAmount: amount,
        status: "PENDING",
        dueDate,
        notes: params.notes?.trim() || null,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Atendente",
      },
    })

    revalidatePath("/app/clientes")
    revalidatePath("/app/comandas")
    revalidatePath("/app/financeiro")

    return {
      success: true,
      message: `Débito de R$ ${amount.toFixed(2)} registrado para ${client.name || "o cliente"}.`,
      debt,
    }
  } catch (error: any) {
    console.error("Erro ao registrar débito/fiado:", error)
    return { success: false, error: "Falha ao registrar débito do cliente." }
  }
}

/**
 * 2. Quitar ou Amortizar Débito / Fiado de Cliente (Entrada no Caixa do Dia)
 */
export async function payCustomerDebtAction(params: {
  debtId: string
  amountPaid: number
  paymentMethod: "CASH" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD"
  notes?: string
  financialAccountId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const businessId = currentUser.businessId
  const amountPaid = Math.round(Number(params.amountPaid) * 100) / 100

  if (amountPaid <= 0) {
    return { success: false, error: "O valor de pagamento deve ser maior que zero." }
  }

  try {
    const debt = await (prisma as any).customerDebt.findUnique({
      where: { id: params.debtId },
      include: {
        client: { select: { id: true, name: true, phone: true } },
      },
    })

    if (!debt || debt.businessId !== businessId) {
      return { success: false, error: "Registro de débito não encontrado." }
    }

    if (debt.status === "PAID") {
      return { success: false, error: "Este débito já foi totalmente quitado." }
    }

    const currentPaid = Number(debt.paidAmount || 0)
    const newPaidAmount = Math.round((currentPaid + amountPaid) * 100) / 100
    const newRemaining = Math.max(0, Math.round((Number(debt.totalAmount) - newPaidAmount) * 100) / 100)
    const newStatus = newRemaining <= 0 ? "PAID" : "PARTIAL"
    const now = new Date()

    // 1. Busca caixa aberto no momento para vincular
    const activeCashSession = await (prisma as any).cashRegisterSession.findFirst({
      where: { businessId, status: "OPEN" },
      select: { id: true, financialAccountId: true },
    })

    // 2. Atualiza o registro de débito
    const updatedDebt = await (prisma as any).customerDebt.update({
      where: { id: debt.id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemaining,
        status: newStatus,
        paidAt: now,
        paidMethod: params.paymentMethod as any,
        cashSessionId: activeCashSession?.id || null,
        notes: params.notes?.trim() || debt.notes,
      },
    })

    // 3. Gera lançamento financeiro (Receita / Quitação de Débito)
    await prisma.financialTransaction.create({
      data: {
        businessId,
        cashSessionId: activeCashSession?.id || null,
        accountId: params.financialAccountId || activeCashSession?.financialAccountId || null,
        type: "INCOME",
        category: "Recebimento Conta Cliente / A Receber",
        description: `Recebimento Débito (${debt.client?.name || "Cliente"}) - ${debt.description}`,
        amount: amountPaid,
        paymentMethod: params.paymentMethod as any,
        isPaid: true,
        paidAt: now,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Operador",
      },
    })

    // 4. Se o pagamento foi em DINHEIRO FÍSICO e há caixa aberto, registra movimentação no caixa
    if (params.paymentMethod === "CASH" && activeCashSession) {
      await (prisma as any).financialCashMovement.create({
        data: {
          sessionId: activeCashSession.id,
          businessId,
          type: "SALE_IN",
          amount: amountPaid,
          reason: `Recebimento Conta Cliente: ${debt.client?.name || "Cliente"} (${debt.description})`,
          createdById: currentUser.id,
          createdByName: currentUser.name || "Operador",
        },
      })
    }

    revalidatePath("/app/clientes")
    revalidatePath("/app/comandas")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/caixa")

    return {
      success: true,
      message: newStatus === "PAID"
        ? `Débito de ${debt.client?.name || "Cliente"} quitado integralmente com sucesso!`
        : `Amortização de R$ ${amountPaid.toFixed(2)} registrada! Saldo restante: R$ ${newRemaining.toFixed(2)}`,
      debt: updatedDebt,
    }
  } catch (error: any) {
    console.error("Erro ao quitar débito de cliente:", error)
    return { success: false, error: "Falha ao processar quitação de débito." }
  }
}

/**
 * 3. Consultar Débitos e Saldo Devedor de um Cliente Específico
 */
export async function getClientDebtsSummaryAction(clientId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", data: null }
  }

  try {
    const debts = await (prisma as any).customerDebt.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { code: true, items: { select: { name: true, quantity: true, totalPrice: true } } } },
      },
    })

    let totalDebt = 0
    let totalPending = 0
    let totalPaid = 0

    debts.forEach((d: any) => {
      totalDebt += Number(d.totalAmount || 0)
      totalPaid += Number(d.paidAmount || 0)
      if (d.status === "PENDING" || d.status === "PARTIAL") {
        totalPending += Number(d.remainingAmount || 0)
      }
    })

    return {
      success: true,
      data: {
        debts,
        totalDebt: Math.round(totalDebt * 100) / 100,
        totalPending: Math.round(totalPending * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        hasPending: totalPending > 0,
      },
    }
  } catch (error) {
    console.error("Erro ao buscar débitos do cliente:", error)
    return { success: false, error: "Falha ao carregar débitos.", data: null }
  }
}

/**
 * 4. Dashboard de Contas a Receber / Fiados do Estabelecimento
 */
export async function getBusinessDebtsDashboardAction(params?: {
  status?: "ALL" | "PENDING" | "PAID" | "OVERDUE"
  search?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", data: null }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", data: null }
  }

  const businessId = currentUser.businessId
  const limit = params?.limit || 30
  const page = params?.page || 1
  const skip = (page - 1) * limit
  const statusFilter = params?.status || "ALL"
  const now = new Date()

  try {
    const where: any = { businessId }

    if (statusFilter === "PENDING") {
      where.status = { in: ["PENDING", "PARTIAL"] }
    } else if (statusFilter === "PAID") {
      where.status = "PAID"
    } else if (statusFilter === "OVERDUE") {
      where.status = { in: ["PENDING", "PARTIAL"] }
      where.dueDate = { lt: now }
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { client: { name: { contains: q, mode: "insensitive" } } },
        { client: { phone: { contains: q } } },
        { description: { contains: q, mode: "insensitive" } },
      ]
    }

    const [debts, totalCount, allDebtsForKpis] = await Promise.all([
      (prisma as any).customerDebt.findMany({
        where,
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: limit,
        skip,
        include: {
          client: { select: { id: true, name: true, phone: true, image: true } },
          order: { select: { id: true, code: true } },
        },
      }),
      (prisma as any).customerDebt.count({ where }),
      (prisma as any).customerDebt.findMany({
        where: { businessId },
        select: { totalAmount: true, paidAmount: true, remainingAmount: true, status: true, dueDate: true },
      }),
    ])

    // Calcular KPIs Globais
    let totalPendingAmount = 0
    let totalPaidAmount = 0
    let totalOverdueAmount = 0
    let overdueCount = 0
    let pendingCount = 0

    allDebtsForKpis.forEach((d: any) => {
      const rem = Number(d.remainingAmount || 0)
      const paid = Number(d.paidAmount || 0)
      totalPaidAmount += paid

      if (d.status === "PENDING" || d.status === "PARTIAL") {
        totalPendingAmount += rem
        pendingCount += 1
        if (d.dueDate && new Date(d.dueDate) < now) {
          totalOverdueAmount += rem
          overdueCount += 1
        }
      }
    })

    return {
      success: true,
      debts,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      kpis: {
        totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
        totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
        totalOverdueAmount: Math.round(totalOverdueAmount * 100) / 100,
        pendingCount,
        overdueCount,
      },
    }
  } catch (error) {
    console.error("Erro ao buscar dashboard de fiados:", error)
    return { success: false, error: "Falha ao carregar fiados.", data: null }
  }
}

/**
 * 5. Gerar Mensagem de Cobrança Amigável via WhatsApp com Link / Chave PIX
 */
export async function generateDebtWhatsAppReminderAction(debtId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", messageText: "", whatsappUrl: "" }
  }

  try {
    const debt = await (prisma as any).customerDebt.findUnique({
      where: { id: debtId },
      include: {
        business: { select: { name: true, pixKey: true, pixKeyType: true, phone: true } },
        client: { select: { id: true, name: true, phone: true } },
      },
    })

    if (!debt) {
      return { success: false, error: "Débito não encontrado.", messageText: "", whatsappUrl: "" }
    }

    const clientFirstName = (debt.client?.name || "Cliente").split(" ")[0]
    const businessName = debt.business?.name || "VisualClube"
    const remaining = Number(debt.remainingAmount || 0).toFixed(2).replace(".", ",")
    
    let dueText = ""
    if (debt.dueDate) {
      const dFormatted = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(debt.dueDate))
      dueText = ` com vencimento para *${dFormatted}*`
    }

    let msg = `Olá, *${clientFirstName}*! Tudo bem? 😊\n\n`
    msg += `Passando para lembrar do seu saldo em aberto de *R$ ${remaining}* na *${businessName}*${dueText}.\n`
    msg += `📋 *Referente a:* ${debt.description}\n\n`

    if (debt.business?.pixKey) {
      msg += `💡 Para facilitar seu pagamento, você pode usar nossa chave PIX:\n`
      msg += `🔑 *Chave PIX (${debt.business.pixKeyType || "PIX"}):* \`${debt.business.pixKey}\`\n\n`
    }

    msg += `Assim que efetuar o pagamento, basta nos enviar o comprovante por aqui. Muito obrigado pela preferência! ✨`

    const cleanPhone = debt.client?.phone ? debt.client.phone.replace(/\D/g, "") : ""
    const whatsappUrl = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`

    return {
      success: true,
      messageText: msg,
      whatsappUrl,
      clientPhone: debt.client?.phone || "",
    }
  } catch (error) {
    console.error("Erro ao gerar mensagem de cobrança:", error)
    return { success: false, error: "Falha ao gerar cobrança.", messageText: "", whatsappUrl: "" }
  }
}
