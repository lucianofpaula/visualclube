"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * 1. Apurar Relatório de Comissões e Produção da Equipe em Tempo Real
 */
export async function getCommissionReportAction(params?: {
  professionalId?: string
  startDate?: string
  endDate?: string
  onlyUnsettled?: boolean
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", data: null }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", data: null }
  }

  const businessId = currentUser.businessId
  const onlyUnsettled = params?.onlyUnsettled !== false // default true

  // Definir Período (Padrão: Mês Atual)
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const startDate = params?.startDate ? new Date(params.startDate) : defaultStart
  const endDate = params?.endDate ? new Date(`${params.endDate}T23:59:59.999Z`) : defaultEnd

  try {
    // 1. Buscar todos os profissionais ativos
    const professionals = await prisma.professional.findMany({
      where: { businessId, deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        specialty: true,
        phone: true,
        avatarUrl: true,
        colorHex: true,
        commissionPercent: true,
        productCommission: true,
        pixKey: true,
        pixKeyType: true,
      },
    })

    // Filtro de profissional se selecionado
    const targetProfId = params?.professionalId && params.professionalId !== "ALL"
      ? params.professionalId
      : undefined

    // 2. Buscar itens de comanda no período
    const orderItemWhere: any = {
      order: {
        businessId,
        status: { in: ["PAID", "COMPLETED"] },
        closedAt: { gte: startDate, lte: endDate },
      },
    }

    if (targetProfId) {
      orderItemWhere.professionalId = targetProfId
    } else {
      orderItemWhere.professionalId = { not: null }
    }

    if (onlyUnsettled) {
      orderItemWhere.settlementId = null
    }

    const items = await prisma.orderItem.findMany({
      where: orderItemWhere,
      include: {
        order: { select: { id: true, code: true, clientName: true, closedAt: true, paymentMethod: true } },
        professional: { select: { id: true, name: true, commissionPercent: true, productCommission: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // 3. Buscar vales / adiantamentos em aberto no período
    const advanceWhere: any = {
      businessId,
      date: { gte: startDate, lte: endDate },
    }

    if (targetProfId) {
      advanceWhere.professionalId = targetProfId
    }

    if (onlyUnsettled) {
      advanceWhere.isDeducted = false
    }

    const advances = await (prisma as any).professionalAdvance.findMany({
      where: advanceWhere,
      include: {
        professional: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    })

    // 4. Agrupar produção por profissional
    const reportMap = new Map<string, any>()

    professionals.forEach((prof) => {
      reportMap.set(prof.id, {
        professional: prof,
        servicesCount: 0,
        productsCount: 0,
        grossServices: 0,
        grossProducts: 0,
        grossSales: 0,
        serviceCommission: 0,
        productCommission: 0,
        totalCommission: 0,
        houseNet: 0,
        advancesTotal: 0,
        netPayout: 0,
        items: [] as any[],
        advances: [] as any[],
      })
    })

    // Preencher itens
    items.forEach((item) => {
      if (!item.professionalId) return
      const entry = reportMap.get(item.professionalId)
      if (!entry) return

      const isService = item.itemType === "SERVICE"
      const total = Number(item.totalPrice || 0)
      const commission = Number(item.commissionValue || 0)

      if (isService) {
        entry.servicesCount += Number(item.quantity || 1)
        entry.grossServices += total
        entry.serviceCommission += commission
      } else {
        entry.productsCount += Number(item.quantity || 1)
        entry.grossProducts += total
        entry.productCommission += commission
      }

      entry.grossSales += total
      entry.totalCommission += commission
      entry.houseNet += (total - commission)
      entry.items.push(item)
    })

    // Preencher vales
    advances.forEach((adv: any) => {
      const entry = reportMap.get(adv.professionalId)
      if (!entry) return

      const amount = Number(adv.amount || 0)
      entry.advancesTotal += amount
      entry.advances.push(adv)
    })

    // Calcular Líquido Final para cada profissional
    const reportList: any[] = []
    let globalGrossSales = 0
    let globalTotalCommission = 0
    let globalAdvancesTotal = 0
    let globalNetPayout = 0
    let globalHouseNet = 0

    reportMap.forEach((entry) => {
      entry.grossServices = Math.round(entry.grossServices * 100) / 100
      entry.grossProducts = Math.round(entry.grossProducts * 100) / 100
      entry.grossSales = Math.round(entry.grossSales * 100) / 100
      entry.serviceCommission = Math.round(entry.serviceCommission * 100) / 100
      entry.productCommission = Math.round(entry.productCommission * 100) / 100
      entry.totalCommission = Math.round(entry.totalCommission * 100) / 100
      entry.advancesTotal = Math.round(entry.advancesTotal * 100) / 100
      entry.netPayout = Math.max(0, Math.round((entry.totalCommission - entry.advancesTotal) * 100) / 100)
      entry.houseNet = Math.round(entry.houseNet * 100) / 100

      // Se filtrou por um profissional específico ou se o profissional teve produção/vale
      if (targetProfId) {
        if (entry.professional.id === targetProfId) {
          reportList.push(entry)
        }
      } else if (entry.grossSales > 0 || entry.advancesTotal > 0) {
        reportList.push(entry)
      }

      globalGrossSales += entry.grossSales
      globalTotalCommission += entry.totalCommission
      globalAdvancesTotal += entry.advancesTotal
      globalNetPayout += entry.netPayout
      globalHouseNet += entry.houseNet
    })

    return {
      success: true,
      professionals,
      reportList,
      kpis: {
        globalGrossSales: Math.round(globalGrossSales * 100) / 100,
        globalTotalCommission: Math.round(globalTotalCommission * 100) / 100,
        globalAdvancesTotal: Math.round(globalAdvancesTotal * 100) / 100,
        globalNetPayout: Math.round(globalNetPayout * 100) / 100,
        globalHouseNet: Math.round(globalHouseNet * 100) / 100,
        activeProfessionalsCount: reportList.length,
      },
    }
  } catch (error) {
    console.error("Erro ao apurar relatório de comissões:", error)
    return { success: false, error: "Falha ao apurar comissões da equipe.", data: null }
  }
}

/**
 * 2. Lançar Vale / Adiantamento para Profissional (com Saída de Caixa ou Banco)
 */
export async function createProfessionalAdvanceAction(params: {
  professionalId: string
  amount: number
  description: string
  date?: string
  source: "CASH_DRAWER" | "BANK_ACCOUNT"
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
  const amount = Number(params.amount) || 0

  if (amount <= 0) {
    return { success: false, error: "O valor do vale deve ser maior que zero." }
  }

  if (!params.professionalId) {
    return { success: false, error: "Selecione o profissional para o vale." }
  }

  try {
    const professional = await prisma.professional.findUnique({
      where: { id: params.professionalId },
      select: { id: true, name: true },
    })

    if (!professional) {
      return { success: false, error: "Profissional não encontrado." }
    }

    const date = params.date ? new Date(params.date) : new Date()

    // 1. Busca sessão de caixa aberta se a saída for em dinheiro físico do balcão
    let activeCashSession: any = null
    if (params.source === "CASH_DRAWER") {
      activeCashSession = await (prisma as any).cashRegisterSession.findFirst({
        where: { businessId, status: "OPEN" },
        select: { id: true, financialAccountId: true },
      })
    }

    // 2. Cria registro do Vale
    const advance = await (prisma as any).professionalAdvance.create({
      data: {
        businessId,
        professionalId: professional.id,
        amount,
        description: params.description?.trim() || "Vale / Adiantamento de Comissão",
        date,
        isDeducted: false,
        cashSessionId: activeCashSession?.id || null,
        financialAccountId: params.financialAccountId || activeCashSession?.financialAccountId || null,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Gestor",
      },
    })

    // 3. Se saiu do Caixa do dia em dinheiro, registra movimentação (Sangria/Despesa rápida)
    if (params.source === "CASH_DRAWER" && activeCashSession) {
      await (prisma as any).financialCashMovement.create({
        data: {
          sessionId: activeCashSession.id,
          businessId,
          type: "EXPENSE_OUT",
          amount,
          reason: `Vale Colaborador: ${professional.name} - ${params.description}`,
          createdById: currentUser.id,
          createdByName: currentUser.name || "Gestor",
        },
      })
    }

    // 4. Cria lançamento financeiro de despesa
    await prisma.financialTransaction.create({
      data: {
        businessId,
        cashSessionId: activeCashSession?.id || null,
        accountId: params.financialAccountId || activeCashSession?.financialAccountId || null,
        type: "EXPENSE",
        category: "Vales & Adiantamentos",
        description: `Adiantamento (${professional.name}) - ${params.description}`,
        amount,
        paymentMethod: params.source === "CASH_DRAWER" ? "CASH" : "PIX",
        isPaid: true,
        paidAt: date,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Gestor",
      },
    })

    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/comissoes")
    revalidatePath("/app/financeiro/caixa")

    return {
      success: true,
      message: `Vale de R$ ${amount.toFixed(2)} registrado com sucesso para ${professional.name}!`,
      advance,
    }
  } catch (error) {
    console.error("Erro ao registrar vale do profissional:", error)
    return { success: false, error: "Falha ao registrar vale." }
  }
}

/**
 * 3. Efetuar Fechamento & Pagamento de Comissão (Repasse com Bloqueio de Itens)
 */
export async function settleCommissionAction(params: {
  professionalId: string
  periodStart: string
  periodEnd: string
  itemIds: string[]
  advanceIds: string[]
  paymentMethod: "PIX" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "OTHER"
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

  if (!params.professionalId) {
    return { success: false, error: "Profissional não especificado." }
  }

  try {
    const professional = await prisma.professional.findUnique({
      where: { id: params.professionalId },
      select: { id: true, name: true, pixKey: true, pixKeyType: true, phone: true },
    })

    if (!professional) {
      return { success: false, error: "Profissional não encontrado." }
    }

    // 1. Busca e valida os itens selecionados
    const items = await prisma.orderItem.findMany({
      where: {
        id: { in: params.itemIds },
        professionalId: professional.id,
        settlementId: null, // Garante que nenhum foi pago antes
      },
    })

    let grossSales = 0
    let serviceCommission = 0
    let productCommission = 0

    items.forEach((i) => {
      const total = Number(i.totalPrice || 0)
      const commission = Number(i.commissionValue || 0)
      grossSales += total

      if (i.itemType === "SERVICE") {
        serviceCommission += commission
      } else {
        productCommission += commission
      }
    })

    const totalCommission = serviceCommission + productCommission

    // 2. Busca e valida os vales a abater
    let advanceDeductions = 0
    if (params.advanceIds && params.advanceIds.length > 0) {
      const advances = await (prisma as any).professionalAdvance.findMany({
        where: {
          id: { in: params.advanceIds },
          professionalId: professional.id,
          isDeducted: false,
        },
      })

      advances.forEach((adv: any) => {
        advanceDeductions += Number(adv.amount || 0)
      })
    }

    const netPaymentAmount = Math.max(0, Math.round((totalCommission - advanceDeductions) * 100) / 100)
    const now = new Date()

    // 3. Busca caixa aberto se o repasse for em dinheiro físico do balcão
    let activeCashSession: any = null
    if (params.paymentMethod === "CASH") {
      activeCashSession = await (prisma as any).cashRegisterSession.findFirst({
        where: { businessId, status: "OPEN" },
        select: { id: true, financialAccountId: true },
      })
    }

    // 4. Cria o Fechamento de Comissão
    const settlement = await (prisma as any).commissionSettlement.create({
      data: {
        businessId,
        professionalId: professional.id,
        periodStart: new Date(params.periodStart),
        periodEnd: new Date(params.periodEnd),
        grossSales: Math.round(grossSales * 100) / 100,
        serviceCommission: Math.round(serviceCommission * 100) / 100,
        productCommission: Math.round(productCommission * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        advanceDeductions: Math.round(advanceDeductions * 100) / 100,
        netPaymentAmount,
        status: "PAID",
        paidAt: now,
        paidMethod: params.paymentMethod as any,
        financialAccountId: params.financialAccountId || activeCashSession?.financialAccountId || null,
        cashSessionId: activeCashSession?.id || null,
        notes: params.notes?.trim() || null,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Gestor",
      },
    })

    // 5. Bloqueia os itens (marca como quitados para nunca serem pagos novamente)
    if (params.itemIds.length > 0) {
      await prisma.orderItem.updateMany({
        where: { id: { in: params.itemIds } },
        data: { settlementId: settlement.id },
      })
    }

    // 6. Marca os vales como abatidos
    if (params.advanceIds && params.advanceIds.length > 0) {
      await (prisma as any).professionalAdvance.updateMany({
        where: { id: { in: params.advanceIds } },
        data: { isDeducted: true, settlementId: settlement.id },
      })
    }

    // 7. Se pago em dinheiro do caixa, registra movimentação no Caixa
    if (params.paymentMethod === "CASH" && activeCashSession && netPaymentAmount > 0) {
      await (prisma as any).financialCashMovement.create({
        data: {
          sessionId: activeCashSession.id,
          businessId,
          type: "EXPENSE_OUT",
          amount: netPaymentAmount,
          reason: `Repasse de Comissão: ${professional.name}`,
          createdById: currentUser.id,
          createdByName: currentUser.name || "Gestor",
        },
      })
    }

    // 8. Cria lançamento financeiro de despesa
    if (netPaymentAmount > 0) {
      await prisma.financialTransaction.create({
        data: {
          businessId,
          cashSessionId: activeCashSession?.id || null,
          accountId: params.financialAccountId || activeCashSession?.financialAccountId || null,
          type: "EXPENSE",
          category: "Repasse de Comissões",
          description: `Repasse de Comissões (${professional.name}) - Período ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(params.periodStart))} a ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(params.periodEnd))}`,
          amount: netPaymentAmount,
          paymentMethod: params.paymentMethod as any,
          isPaid: true,
          paidAt: now,
          createdById: currentUser.id,
          createdByName: currentUser.name || "Gestor",
        },
      })
    }

    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/comissoes")
    revalidatePath("/app/financeiro/caixa")
    revalidatePath("/app/equipe")

    return {
      success: true,
      message: `Fechamento de R$ ${netPaymentAmount.toFixed(2)} efetuado para ${professional.name}!`,
      settlementId: settlement.id,
    }
  } catch (error) {
    console.error("Erro ao efetuar fechamento de comissão:", error)
    return { success: false, error: "Falha ao processar fechamento de comissão." }
  }
}

/**
 * 4. Histórico de Repasses e Fechamentos Anteriores
 */
export async function getSettlementHistoryAction(params?: {
  professionalId?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", settlements: [] }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", settlements: [] }
  }

  const businessId = currentUser.businessId
  const limit = params?.limit || 20
  const page = params?.page || 1
  const skip = (page - 1) * limit

  try {
    const where: any = { businessId }
    if (params?.professionalId && params.professionalId !== "ALL") {
      where.professionalId = params.professionalId
    }

    const [settlements, totalCount] = await Promise.all([
      (prisma as any).commissionSettlement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          professional: { select: { id: true, name: true, specialty: true, phone: true, avatarUrl: true, pixKey: true, pixKeyType: true } },
          _count: { select: { orderItems: true, advances: true } },
        },
      }),
      (prisma as any).commissionSettlement.count({ where }),
    ])

    return {
      success: true,
      settlements,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error("Erro ao buscar histórico de repasses:", error)
    return { success: false, error: "Falha ao carregar histórico.", settlements: [] }
  }
}

/**
 * 5. Detalhes de um Fechamento Específico para Recibo / Cupom Térmico
 */
export async function getSettlementDetailsAction(settlementId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", data: null }
  }

  try {
    const settlement = await (prisma as any).commissionSettlement.findUnique({
      where: { id: settlementId },
      include: {
        business: { select: { name: true, phone: true, address: true, city: true, state: true } },
        professional: { select: { id: true, name: true, specialty: true, phone: true, pixKey: true, pixKeyType: true } },
        orderItems: {
          include: {
            order: { select: { code: true, clientName: true, closedAt: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        advances: {
          orderBy: { date: "asc" },
        },
      },
    })

    if (!settlement) {
      return { success: false, error: "Fechamento não encontrado.", data: null }
    }

    return {
      success: true,
      data: settlement,
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes do repasse:", error)
    return { success: false, error: "Falha ao carregar detalhes.", data: null }
  }
}

/**
 * 6. Gerar Mensagem de Comprovante de Repasse via WhatsApp
 */
export async function generateSettlementWhatsAppProofAction(settlementId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", messageText: "", whatsappUrl: "" }
  }

  try {
    const res = await getSettlementDetailsAction(settlementId)
    if (!res.success || !res.data) {
      return { success: false, error: "Fechamento não encontrado.", messageText: "", whatsappUrl: "" }
    }

    const s = res.data
    const profFirstName = (s.professional?.name || "Colaborador").split(" ")[0]
    const businessName = s.business?.name || "VisualClube"
    const pStart = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(s.periodStart))
    const pEnd = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(s.periodEnd))
    const gross = Number(s.grossSales || 0).toFixed(2).replace(".", ",")
    const servComm = Number(s.serviceCommission || 0).toFixed(2).replace(".", ",")
    const prodComm = Number(s.productCommission || 0).toFixed(2).replace(".", ",")
    const totalComm = Number(s.totalCommission || 0).toFixed(2).replace(".", ",")
    const vales = Number(s.advanceDeductions || 0).toFixed(2).replace(".", ",")
    const netPaid = Number(s.netPaymentAmount || 0).toFixed(2).replace(".", ",")

    let msg = `💈 *COMPROVANTE DE REPASSE DE COMISSÃO*\n`
    msg += `🏢 *${businessName}*\n`
    msg += `👤 *Profissional:* ${s.professional?.name}\n`
    msg += `📅 *Período:* ${pStart} a ${pEnd}\n\n`

    msg += `📊 *RESUMO DA PRODUÇÃO:*\n`
    msg += `• Faturamento Gerado: R$ ${gross}\n`
    msg += `• Comissão Serviços: R$ ${servComm}\n`
    if (Number(s.productCommission) > 0) {
      msg += `• Comissão Produtos: R$ ${prodComm}\n`
    }
    msg += `• Total Comissão Bruta: *R$ ${totalComm}*\n`

    if (Number(s.advanceDeductions) > 0) {
      msg += `• (-) Vales / Adiantamentos: *R$ ${vales}*\n`
    }

    msg += `\n💰 *VALOR LÍQUIDO PAGO: R$ ${netPaid}*\n`
    msg += `💳 *Forma de Pagamento:* ${s.paidMethod || "PIX"}\n`
    if (s.professional?.pixKey) {
      msg += `🔑 *Chave PIX:* ${s.professional.pixKey} (${s.professional.pixKeyType || "PIX"})\n`
    }

    msg += `\n✨ *Obrigado pela dedicação e excelente trabalho!*`

    const cleanPhone = s.professional?.phone ? s.professional.phone.replace(/\D/g, "") : ""
    const whatsappUrl = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`

    return {
      success: true,
      messageText: msg,
      whatsappUrl,
      professionalPhone: s.professional?.phone || "",
    }
  } catch (error) {
    console.error("Erro ao gerar comprovante de repasse:", error)
    return { success: false, error: "Falha ao gerar comprovante.", messageText: "", whatsappUrl: "" }
  }
}
