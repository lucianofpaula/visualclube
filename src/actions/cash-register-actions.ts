"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * 1. Obter a Sessão de Caixa Atual (Aberta) do Estabelecimento
 */
export async function getCurrentCashSessionAction() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", session: null }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", session: null }
  }

  const businessId = currentUser.businessId

  try {
    // 1. Busca a sessão aberta mais recente
    const activeSession = await (prisma as any).cashRegisterSession.findFirst({
      where: {
        businessId,
        status: "OPEN",
      },
      orderBy: { openedAt: "desc" },
      include: {
        financialAccount: {
          select: { id: true, name: true, type: true, currentBalance: true, color: true },
        },
        movements: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    // 2. Busca contas financeiras para opções de Sangria / Suprimento
    const accounts = await prisma.financialAccount.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, type: true, currentBalance: true, color: true },
    })

    if (!activeSession) {
      return {
        success: true,
        isOpen: false,
        session: null,
        accounts,
      }
    }

    // 3. Busca vendas (Orders) pagas durante esta sessão
    const orders = await (prisma.order as any).findMany({
      where: {
        businessId,
        status: "PAID",
        OR: [
          { cashSessionId: activeSession.id },
          {
            closedAt: {
              gte: activeSession.openedAt,
            },
          },
        ],
      },
      select: {
        id: true,
        code: true,
        total: true,
        paymentMethod: true,
        splitPayments: true,
        cashReceived: true,
        cashChange: true,
        clientName: true,
        closedAt: true,
      },
    })

    // 4. Calcular métricas em tempo real
    let salesCash = 0
    let salesPix = 0
    let salesCard = 0
    let salesOther = 0

    orders.forEach((order: any) => {
      if (order.splitPayments && Array.isArray(order.splitPayments) && order.splitPayments.length > 0) {
        order.splitPayments.forEach((sp: any) => {
          const m = sp.method || sp.paymentMethod
          const amt = Number(sp.amount) || 0
          if (m === "CASH" || m === "DINHEIRO") salesCash += amt
          else if (m === "PIX") salesPix += amt
          else if (m === "CREDIT_CARD" || m === "DEBIT_CARD" || m === "CARTAO") salesCard += amt
          else salesOther += amt
        })
      } else {
        const amt = Number(order.total) || 0
        const m = order.paymentMethod
        if (m === "CASH") salesCash += amt
        else if (m === "PIX") salesPix += amt
        else if (m === "CREDIT_CARD" || m === "DEBIT_CARD") salesCard += amt
        else salesOther += amt
      }
    })

    let totalSupplies = 0
    let totalBleedings = 0
    let totalExpenses = 0
    let totalRefunds = 0

    activeSession.movements.forEach((mov: any) => {
      const amt = Number(mov.amount) || 0
      if (mov.type === "SUPPLY") totalSupplies += amt
      else if (mov.type === "BLEEDING") totalBleedings += amt
      else if (mov.type === "EXPENSE_OUT") totalExpenses += amt
      else if (mov.type === "REFUND_OUT") totalRefunds += amt
    })

    const initial = Number(activeSession.initialBalance) || 0
    const currentDrawerCash = initial + salesCash + totalSupplies - totalBleedings - totalExpenses - totalRefunds

    return {
      success: true,
      isOpen: true,
      session: {
        ...activeSession,
        liveMetrics: {
          initialBalance: initial,
          salesCash,
          salesPix,
          salesCard,
          salesOther,
          totalSales: salesCash + salesPix + salesCard + salesOther,
          totalSupplies,
          totalBleedings,
          totalExpenses,
          totalRefunds,
          currentDrawerCash,
          ordersCount: orders.length,
          movementsCount: activeSession.movements.length,
        },
      },
      accounts,
    }
  } catch (error: any) {
    console.error("Erro ao carregar sessão de caixa:", error)
    return { success: false, error: "Falha ao carregar informações de caixa.", session: null }
  }
}

/**
 * 2. Abertura de Caixa (Novo Turno / Fundo de Troco)
 */
export async function openCashSessionAction(params: {
  initialBalance: number
  financialAccountId?: string
  notes?: string
  breakdown?: Record<string, number>
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
  const initialBalance = Number(params.initialBalance) || 0

  if (initialBalance < 0) {
    return { success: false, error: "O fundo de troco inicial não pode ser negativo." }
  }

  try {
    // 1. Verifica se já existe caixa aberto
    const existing = await (prisma as any).cashRegisterSession.findFirst({
      where: {
        businessId,
        status: "OPEN",
      },
    })

    if (existing) {
      return { success: false, error: "Já existe uma sessão de caixa aberta para este estabelecimento." }
    }

    // 2. Cria a nova sessão
    const newSession = await (prisma as any).cashRegisterSession.create({
      data: {
        businessId,
        financialAccountId: params.financialAccountId || null,
        openedById: currentUser.id,
        openedByName: currentUser.name || "Operador",
        openedAt: new Date(),
        status: "OPEN",
        initialBalance,
        closingNotes: params.notes || null,
      },
    })

    // 3. Cria a movimentação de abertura
    await (prisma as any).financialCashMovement.create({
      data: {
        sessionId: newSession.id,
        businessId,
        type: "OPENING_BALANCE",
        amount: initialBalance,
        reason: params.notes ? `Abertura de Caixa: ${params.notes}` : "Abertura de Caixa - Fundo de Troco Inicial",
        createdById: currentUser.id,
        createdByName: currentUser.name || "Operador",
      },
    })

    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/caixa")
    revalidatePath("/app/comandas")

    return {
      success: true,
      message: `Caixa aberto com sucesso! Fundo inicial: R$ ${initialBalance.toFixed(2)}`,
      session: newSession,
    }
  } catch (error: any) {
    console.error("Erro ao abrir caixa:", error)
    return { success: false, error: "Falha ao abrir sessão de caixa." }
  }
}

/**
 * 3. Lançar Movimentação de Caixa (Sangria, Suprimento, Despesa Balcão)
 */
export async function addCashMovementAction(params: {
  sessionId?: string
  type: "BLEEDING" | "SUPPLY" | "EXPENSE_OUT" | "MANUAL_ADJUST"
  amount: number
  reason: string
  destinationAccountId?: string
  authorizedBy?: string
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
    return { success: false, error: "O valor da movimentação deve ser maior que zero." }
  }

  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: "Informe o motivo ou justificativa da movimentação." }
  }

  try {
    // 1. Localiza a sessão aberta
    let currentSession = null
    if (params.sessionId) {
      currentSession = await (prisma as any).cashRegisterSession.findUnique({
        where: { id: params.sessionId },
      })
    } else {
      currentSession = await (prisma as any).cashRegisterSession.findFirst({
        where: { businessId, status: "OPEN" },
        orderBy: { openedAt: "desc" },
      })
    }

    if (!currentSession || currentSession.status !== "OPEN") {
      return { success: false, error: "Não há sessão de caixa aberta para registrar esta movimentação." }
    }

    // 2. Registra a movimentação
    const movement = await (prisma as any).financialCashMovement.create({
      data: {
        sessionId: currentSession.id,
        businessId,
        type: params.type,
        amount,
        reason: params.reason.trim(),
        destinationAccountId: params.destinationAccountId || null,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Operador",
        authorizedBy: params.authorizedBy?.trim() || null,
      },
    })

    // 3. Se for Sangria com destino ou Despesa Rápida, integra com o financeiro
    if (params.type === "BLEEDING" && params.destinationAccountId) {
      // Transferência entre gaveta e conta de destino (cofre/banco)
      await prisma.financialTransaction.create({
        data: {
          businessId,
          cashSessionId: currentSession.id,
          accountId: currentSession.financialAccountId || null,
          toAccountId: params.destinationAccountId,
          type: "TRANSFER",
          category: "Sangria de Caixa",
          description: `Sangria Caixa (${currentUser.name}) -> Destino: ${params.reason.trim()}`,
          amount,
          isPaid: true,
          paidAt: new Date(),
          createdById: currentUser.id,
          createdByName: currentUser.name || "Operador",
        },
      })
    } else if (params.type === "EXPENSE_OUT") {
      // Despesa operacional rápida do balcão (Petty Cash)
      await prisma.financialTransaction.create({
        data: {
          businessId,
          cashSessionId: currentSession.id,
          accountId: currentSession.financialAccountId || null,
          type: "EXPENSE",
          category: "Despesas de Balcão / Caixa",
          description: `Despesa Balcão: ${params.reason.trim()}`,
          amount,
          isPaid: true,
          paidAt: new Date(),
          createdById: currentUser.id,
          createdByName: currentUser.name || "Operador",
        },
      })
    }

    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/caixa")
    revalidatePath("/app/comandas")

    const typeLabels: Record<string, string> = {
      BLEEDING: "Sangria realizada com sucesso",
      SUPPLY: "Suprimento registrado com sucesso",
      EXPENSE_OUT: "Despesa rápida de balcão registrada",
      MANUAL_ADJUST: "Ajuste manual gravado com sucesso",
    }

    return {
      success: true,
      message: `${typeLabels[params.type] || "Movimentação registrada"}: R$ ${amount.toFixed(2)}`,
      movement,
    }
  } catch (error: any) {
    console.error("Erro ao registrar movimentação de caixa:", error)
    return { success: false, error: "Falha ao registrar movimentação." }
  }
}

/**
 * 4. Fechamento de Caixa (Conferência Cega & Balanço Final)
 */
export async function closeCashSessionAction(params: {
  sessionId?: string
  reportedCash: number
  reportedPix?: number
  reportedCard?: number
  reportedOther?: number
  closingNotes?: string
  breakdown?: Record<string, number>
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

  try {
    // 1. Localiza a sessão aberta
    let currentSession = null
    if (params.sessionId) {
      currentSession = await (prisma as any).cashRegisterSession.findUnique({
        where: { id: params.sessionId },
        include: { movements: true },
      })
    } else {
      currentSession = await (prisma as any).cashRegisterSession.findFirst({
        where: { businessId, status: "OPEN" },
        orderBy: { openedAt: "desc" },
        include: { movements: true },
      })
    }

    if (!currentSession || currentSession.status !== "OPEN") {
      return { success: false, error: "Nenhuma sessão de caixa aberta encontrada para encerramento." }
    }

    // 2. Busca todas as vendas no período desta sessão
    const orders = await (prisma.order as any).findMany({
      where: {
        businessId,
        status: "PAID",
        OR: [
          { cashSessionId: currentSession.id },
          {
            closedAt: {
              gte: currentSession.openedAt,
            },
          },
        ],
      },
      select: {
        id: true,
        total: true,
        paymentMethod: true,
        splitPayments: true,
      },
    })

    // 3. Totalização esperada pelo sistema
    let calculatedSalesCash = 0
    let calculatedSalesPix = 0
    let calculatedSalesCard = 0
    let calculatedSalesOther = 0

    orders.forEach((order: any) => {
      if (order.splitPayments && Array.isArray(order.splitPayments) && order.splitPayments.length > 0) {
        order.splitPayments.forEach((sp: any) => {
          const m = sp.method || sp.paymentMethod
          const amt = Number(sp.amount) || 0
          if (m === "CASH" || m === "DINHEIRO") calculatedSalesCash += amt
          else if (m === "PIX") calculatedSalesPix += amt
          else if (m === "CREDIT_CARD" || m === "DEBIT_CARD" || m === "CARTAO") calculatedSalesCard += amt
          else calculatedSalesOther += amt
        })
      } else {
        const amt = Number(order.total) || 0
        const m = order.paymentMethod
        if (m === "CASH") calculatedSalesCash += amt
        else if (m === "PIX") calculatedSalesPix += amt
        else if (m === "CREDIT_CARD" || m === "DEBIT_CARD") calculatedSalesCard += amt
        else calculatedSalesOther += amt
      }
    })

    let totalSupplies = 0
    let totalBleedings = 0
    let totalExpenses = 0
    let totalRefunds = 0

    currentSession.movements.forEach((mov: any) => {
      const amt = Number(mov.amount) || 0
      if (mov.type === "SUPPLY") totalSupplies += amt
      else if (mov.type === "BLEEDING") totalBleedings += amt
      else if (mov.type === "EXPENSE_OUT") totalExpenses += amt
      else if (mov.type === "REFUND_OUT") totalRefunds += amt
    })

    const initial = Number(currentSession.initialBalance) || 0
    const calculatedCash = Math.round((initial + calculatedSalesCash + totalSupplies - totalBleedings - totalExpenses - totalRefunds) * 100) / 100
    const calculatedPix = Math.round(calculatedSalesPix * 100) / 100
    const calculatedCard = Math.round(calculatedSalesCard * 100) / 100
    const calculatedOther = Math.round(calculatedSalesOther * 100) / 100
    const calculatedTotal = Math.round((calculatedCash + calculatedPix + calculatedCard + calculatedOther) * 100) / 100

    // 4. Valores informados pelo operador na conferência
    const reportedCash = Math.round(Number(params.reportedCash || 0) * 100) / 100
    const reportedPix = Math.round(Number(params.reportedPix !== undefined ? params.reportedPix : calculatedPix) * 100) / 100
    const reportedCard = Math.round(Number(params.reportedCard !== undefined ? params.reportedCard : calculatedCard) * 100) / 100
    const reportedOther = Math.round(Number(params.reportedOther !== undefined ? params.reportedOther : calculatedOther) * 100) / 100
    const reportedTotal = Math.round((reportedCash + reportedPix + reportedCard + reportedOther) * 100) / 100

    // Diferença em dinheiro (Quebra / Sobra de Caixa)
    const differenceAmount = Math.round((reportedCash - calculatedCash) * 100) / 100

    const now = new Date()

    // 5. Atualiza e fecha a sessão
    const closedSession = await (prisma as any).cashRegisterSession.update({
      where: { id: currentSession.id },
      data: {
        status: "CLOSED",
        closedById: currentUser.id,
        closedByName: currentUser.name || "Operador",
        closedAt: now,

        calculatedCash,
        calculatedPix,
        calculatedCard,
        calculatedOther,
        calculatedTotal,

        reportedCash,
        reportedPix,
        reportedCard,
        reportedOther,
        reportedTotal,

        differenceAmount,
        closingNotes: params.closingNotes?.trim() || null,
      },
    })

    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/caixa")
    revalidatePath("/app/comandas")

    return {
      success: true,
      message: "Caixa encerrado com sucesso!",
      session: closedSession,
      summary: {
        calculatedCash,
        reportedCash,
        differenceAmount,
        status: differenceAmount === 0 ? "EXACT" : differenceAmount > 0 ? "SURPLUS" : "DEFICIT",
      },
    }
  } catch (error: any) {
    console.error("Erro ao fechar caixa:", error)
    return { success: false, error: "Falha ao fechar sessão de caixa." }
  }
}

/**
 * 5. Histórico de Sessões de Caixa Anteriores
 */
export async function getCashSessionHistoryAction(params?: {
  limit?: number
  page?: number
  startDate?: string
  endDate?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", sessions: [], total: 0 }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", sessions: [], total: 0 }
  }

  const businessId = currentUser.businessId
  const limit = params?.limit || 20
  const page = params?.page || 1
  const skip = (page - 1) * limit

  try {
    const where: any = { businessId }

    if (params?.startDate || params?.endDate) {
      where.openedAt = {}
      if (params?.startDate) where.openedAt.gte = new Date(params.startDate)
      if (params?.endDate) where.openedAt.lte = new Date(params.endDate)
    }

    const [sessions, total] = await Promise.all([
      (prisma as any).cashRegisterSession.findMany({
        where,
        orderBy: { openedAt: "desc" },
        take: limit,
        skip,
        include: {
          financialAccount: { select: { id: true, name: true, type: true } },
          _count: {
            select: { movements: true, orders: true },
          },
        },
      }),
      (prisma as any).cashRegisterSession.count({ where }),
    ])

    return {
      success: true,
      sessions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    }
  } catch (error: any) {
    console.error("Erro ao buscar histórico de caixas:", error)
    return { success: false, error: "Falha ao carregar histórico.", sessions: [], total: 0 }
  }
}

/**
 * 6. Detalhes Completos de uma Sessão para Impressão Térmica / Auditoria
 */
export async function getCashSessionDetailsAction(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", data: null }
  }

  try {
    const cashSession = await (prisma as any).cashRegisterSession.findUnique({
      where: { id: sessionId },
      include: {
        business: {
          select: { id: true, name: true, phone: true, document: true, slug: true },
        },
        financialAccount: {
          select: { id: true, name: true, type: true },
        },
        movements: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!cashSession) {
      return { success: false, error: "Sessão não encontrada.", data: null }
    }

    return { success: true, data: cashSession }
  } catch (error: any) {
    console.error("Erro ao buscar detalhes da sessão:", error)
    return { success: false, error: "Falha ao carregar detalhes.", data: null }
  }
}
