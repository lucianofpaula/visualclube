"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export interface FinancialFlowFilter {
  period?: "today" | "yesterday" | "7days" | "month" | "last_month" | "year" | "custom"
  startDate?: string // ISO
  endDate?: string // ISO
  accountId?: string
  type?: "INCOME" | "EXPENSE" | "TRANSFER" | "ALL"
  category?: string
  search?: string
}

/**
 * Helper para resolver intervalo de datas
 */
function resolveDateRange(filter: FinancialFlowFilter) {
  const now = new Date()
  let start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  switch (filter.period) {
    case "today": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      break
    }
    case "yesterday": {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0)
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999)
      break
    }
    case "7days": {
      const d7 = new Date(now)
      d7.setDate(d7.getDate() - 6)
      start = new Date(d7.getFullYear(), d7.getMonth(), d7.getDate(), 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      break
    }
    case "last_month": {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      break
    }
    case "year": {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      break
    }
    case "custom": {
      if (filter.startDate) {
        start = new Date(filter.startDate)
      }
      if (filter.endDate) {
        end = new Date(filter.endDate)
        end.setHours(23, 59, 59, 999)
      }
      break
    }
    case "month":
    default: {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      break
    }
  }

  return { start, end }
}

/**
 * Busca dados consolidados de Fluxo de Caixa, KPIs, Gráficos e Extrato
 */
export async function getFinancialFlowAction(filter: FinancialFlowFilter = {}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const businessId = user.businessId
  const { start, end } = resolveDateRange(filter)

  try {
    // 1. Buscar todas as contas ativas do estabelecimento para vinculação e filtro
    const rawAccounts: any = await prisma.$runCommandRaw({
      find: "FinancialAccount",
      filter: {
        $or: [
          { businessId: { $oid: businessId } },
          { businessId: businessId },
        ],
      },
      sort: { isDefault: -1, createdAt: 1 },
    })

    const accountsDocs = rawAccounts?.cursor?.firstBatch || []
    const accounts = accountsDocs.map((doc: any) => ({
      id: doc._id?.$oid || doc._id?.toString() || doc.id,
      name: doc.name,
      type: doc.type,
      bankName: doc.bankName,
      color: doc.color || "emerald",
      currentBalance: Number(doc.currentBalance) || 0,
      isDefault: !!doc.isDefault,
    }))

    const accountMap = new Map<string, typeof accounts[0]>()
    for (const a of accounts) {
      accountMap.set(a.id, a)
    }

    // 2. Montar filtro do MongoDB para transações
    const mongoFilter: any = {
      $and: [
        {
          $or: [
            { businessId: { $oid: businessId } },
            { businessId: businessId },
          ],
        },
        {
          createdAt: {
            $gte: { $date: start.toISOString() },
            $lte: { $date: end.toISOString() },
          },
        },
      ],
    }

    // Filtro por Conta Específica
    if (filter.accountId) {
      mongoFilter.$and.push({
        $or: [
          { accountId: { $oid: filter.accountId } },
          { accountId: filter.accountId },
          { toAccountId: { $oid: filter.accountId } },
          { toAccountId: filter.accountId },
        ],
      })
    }

    // Filtro por Tipo de Transação
    if (filter.type && filter.type !== "ALL") {
      mongoFilter.$and.push({ type: filter.type })
    }

    // 3. Buscar transações no período
    const rawTrans: any = await prisma.$runCommandRaw({
      find: "FinancialTransaction",
      filter: mongoFilter,
      sort: { createdAt: -1 },
      limit: 300,
    })

    const transDocs = rawTrans?.cursor?.firstBatch || []
    const transactions = transDocs.map((doc: any) => {
      const accId = doc.accountId?.$oid || doc.accountId?.toString() || doc.accountId
      const toAccId = doc.toAccountId?.$oid || doc.toAccountId?.toString() || doc.toAccountId
      const originAccount = accId ? accountMap.get(accId) : null
      const destAccount = toAccId ? accountMap.get(toAccId) : null

      return {
        id: doc._id?.$oid || doc._id?.toString() || doc.id,
        orderId: doc.orderId?.$oid || doc.orderId?.toString() || doc.orderId || null,
        type: doc.type as "INCOME" | "EXPENSE" | "TRANSFER",
        category: doc.category || "Outros",
        description: doc.description || "",
        amount: Number(doc.amount) || 0,
        paymentMethod: doc.paymentMethod || null,
        isPaid: !!doc.isPaid,
        accountId: accId,
        accountName: originAccount?.name || "Conta Principal",
        accountColor: originAccount?.color || "emerald",
        toAccountId: toAccId,
        toAccountName: destAccount?.name || null,
        createdByName: doc.createdByName || "Sistema",
        createdAt: doc.createdAt?.$date ? new Date(doc.createdAt.$date) : (doc.createdAt ? new Date(doc.createdAt) : new Date()),
      }
    })

    // 4. Calcular KPIs Consolidados
    let totalIncome = 0
    let totalExpense = 0
    let salesCount = 0
    let salesTotal = 0

    const paymentMethodTotals: Record<string, { total: number; count: number; label: string }> = {
      PIX: { total: 0, count: 0, label: "PIX Instantâneo" },
      CREDIT_CARD: { total: 0, count: 0, label: "Cartão de Crédito" },
      DEBIT_CARD: { total: 0, count: 0, label: "Cartão de Débito" },
      CASH: { total: 0, count: 0, label: "Dinheiro em Espécie" },
      SPLIT_PAYMENT: { total: 0, count: 0, label: "Split / Múltiplos Meios" },
      CITY_CARD: { total: 0, count: 0, label: "Cartão Cidadão / Social" },
      OTHER: { total: 0, count: 0, label: "Outros Meios" },
    }

    const expenseCategoryTotals: Record<string, { total: number; count: number }> = {}

    // Montar mapa diário para gráfico
    const dailyMap = new Map<string, { income: number; expense: number; count: number }>()

    // Preencher dias do período para o gráfico
    const curr = new Date(start)
    while (curr <= end && curr <= new Date()) {
      const key = curr.toISOString().split("T")[0]
      dailyMap.set(key, { income: 0, expense: 0, count: 0 })
      curr.setDate(curr.getDate() + 1)
    }

    for (const t of transactions) {
      const dayKey = t.createdAt.toISOString().split("T")[0]
      const dayData = dailyMap.get(dayKey) || { income: 0, expense: 0, count: 0 }

      if (t.type === "INCOME") {
        totalIncome += t.amount
        dayData.income += t.amount
        dayData.count += 1

        if (t.category.toLowerCase().includes("venda") || t.category.toLowerCase().includes("comanda")) {
          salesCount += 1
          salesTotal += t.amount
        }

        // Agregação por forma de pagamento
        const pm = t.paymentMethod || "OTHER"
        if (!paymentMethodTotals[pm]) {
          paymentMethodTotals[pm] = { total: 0, count: 0, label: pm }
        }
        paymentMethodTotals[pm].total += t.amount
        paymentMethodTotals[pm].count += 1
      } else if (t.type === "EXPENSE") {
        totalExpense += t.amount
        dayData.expense += t.amount
        dayData.count += 1

        // Agregação por categoria de despesa
        const cat = t.category || "Outras Despesas"
        if (!expenseCategoryTotals[cat]) {
          expenseCategoryTotals[cat] = { total: 0, count: 0 }
        }
        expenseCategoryTotals[cat].total += t.amount
        expenseCategoryTotals[cat].count += 1
      }

      dailyMap.set(dayKey, dayData)
    }

    const netProfit = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
    const averageTicket = salesCount > 0 ? salesTotal / salesCount : (totalIncome > 0 ? totalIncome / transactions.filter((t: any) => t.type === "INCOME").length : 0)

    // Formatar série diária para o gráfico
    const dailyTimeline = Array.from(dailyMap.entries()).map(([dateStr, data]) => {
      const parts = dateStr.split("-")
      const formattedDate = `${parts[2]}/${parts[1]}`
      return {
        date: dateStr,
        formattedDate,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
        count: data.count,
      }
    })

    // Formatar distribuição por meio de pagamento
    const paymentMethodsBreakdown = Object.entries(paymentMethodTotals)
      .filter(([_, val]) => val.total > 0)
      .map(([method, val]) => ({
        method,
        label: val.label,
        total: val.total,
        count: val.count,
        percentage: totalIncome > 0 ? (val.total / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)

    // Formatar distribuição por categorias de despesa
    const expenseCategoriesBreakdown = Object.entries(expenseCategoryTotals)
      .map(([category, val]) => ({
        category,
        total: val.total,
        count: val.count,
        percentage: totalExpense > 0 ? (val.total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)

    // Saldo Total Atual em todas as contas
    const totalConsolidatedBalance = accounts.reduce((acc: number, a: any) => acc + (a.currentBalance || 0), 0)

    return {
      success: true,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      kpis: {
        totalIncome,
        totalExpense,
        netProfit,
        profitMargin,
        totalTransactions: transactions.length,
        salesCount,
        averageTicket,
        totalConsolidatedBalance,
      },
      dailyTimeline,
      paymentMethodsBreakdown,
      expenseCategoriesBreakdown,
      transactions,
      accounts,
    }
  } catch (error: any) {
    console.error("Erro ao processar fluxo de caixa:", error)
    return { success: false, error: error?.message || "Falha ao processar fluxo de caixa." }
  }
}
