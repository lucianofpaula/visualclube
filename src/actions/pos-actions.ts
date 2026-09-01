"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

/**
 * 1. Busca todas as comandas abertas / em andamento do estabelecimento
 */
export async function getPosActiveOrdersAction() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", orders: [] }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", orders: [] }
  }

  try {
    const orders = await (prisma.order as any).findMany({
      where: {
        businessId: currentUser.businessId,
        status: "OPEN",
      },
      orderBy: { openedAt: "desc" },
      include: {
        client: {
          select: { id: true, name: true, phone: true, image: true, referralCode: true },
        },
        items: {
          include: {
            service: { select: { id: true, name: true, durationMinutes: true } },
            product: { select: { id: true, name: true, sku: true, unit: true } },
            professional: { select: { id: true, name: true, colorHex: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    return { success: true, orders }
  } catch (error) {
    console.error("Erro ao buscar comandas ativas:", error)
    return { success: false, error: "Falha ao carregar comandas.", orders: [] }
  }
}

/**
 * 2. Catálogo unificado do PDV (Serviços + Produtos + Equipe + Dados do Espaço)
 */
export async function getPosCatalogAction() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", data: null }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          phone: true,
          pixKey: true,
          pixKeyType: true,
          themeColor: true,
        },
      },
    },
  })

  if (!currentUser?.businessId || !currentUser.business) {
    return { success: false, error: "Estabelecimento não encontrado.", data: null }
  }

  const businessId = currentUser.businessId

  try {
    const { getPaymentMethodsAction } = await import("@/actions/payment-method-actions")
    const [services, products, professionals, paymentMethodsRes] = await Promise.all([
      prisma.service.findMany({
        where: { businessId, isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      (prisma.product as any).findMany({
        where: { businessId, isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.professional.findMany({
        where: { businessId, isActive: true },
        orderBy: { name: "asc" },
      }),
      getPaymentMethodsAction(),
    ])

    const validProfessionals = professionals.filter((p) => !p.deletedAt)

    // Extrair categorias de produtos e serviços
    const productCategories = Array.from(
      new Set(products.map((p: any) => p.category).filter(Boolean))
    ) as string[]

    const serviceCategories = Array.from(
      new Set(services.map((s) => s.category).filter(Boolean))
    ) as string[]

    const paymentMethods = paymentMethodsRes.success ? paymentMethodsRes.paymentMethods : []

    return {
      success: true,
      data: {
        business: currentUser.business,
        operator: {
          id: currentUser.id,
          name: currentUser.name || "Operador do Caixa",
        },
        services,
        products,
        professionals: validProfessionals,
        paymentMethods,
        categories: {
          products: productCategories,
          services: serviceCategories,
        },
      },
    }
  } catch (error) {
    console.error("Erro ao carregar catálogo do PDV:", error)
    return { success: false, error: "Falha ao carregar catálogo.", data: null }
  }
}

/**
 * 3. Abrir nova comanda ou registrar venda rápida no balcão
 */
export async function openOrderAction(params: {
  type?: "ORDER" | "QUICK_SALE"
  clientName?: string
  clientPhone?: string
  clientId?: string
  professionalId?: string
  chairOrTable?: string
  notes?: string
  initialItems?: Array<{
    itemType: "SERVICE" | "PRODUCT"
    serviceId?: string
    productId?: string
    name: string
    quantity: number
    unitPrice: number
    costPrice?: number
    professionalId?: string
    commissionRate?: number
  }>
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
  const type = params.type || "ORDER"
  const prefix = type === "ORDER" ? "CMD" : "VD"
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  const code = `${prefix}-${randomSuffix}`

  try {
    let clientName = params.clientName?.trim() || null
    let clientPhone = params.clientPhone?.replace(/\D/g, "") || null

    // Se passou clientId, busca dados do cliente
    if (params.clientId) {
      const client = await prisma.user.findUnique({
        where: { id: params.clientId },
        select: { name: true, phone: true },
      })
      if (client) {
        clientName = client.name || clientName
        clientPhone = client.phone || clientPhone
      }
    }

    // Se nenhum nome foi passado, preenche como "Cliente Balcão"
    if (!clientName) {
      clientName = type === "ORDER" ? "Cliente em Atendimento" : "Venda Rápida de Balcão"
    }

    // Calcular itens iniciais se houver
    const items = params.initialItems || []
    let subtotal = 0
    let costTotal = 0
    let totalCommission = 0

    const orderItemsData: any[] = []

    for (const item of items) {
      const qty = Math.max(1, item.quantity || 1)
      const unitPrice = Number(item.unitPrice) || 0
      const costPrice = Number(item.costPrice) || 0
      const totalPrice = unitPrice * qty
      const commissionRate = Number(item.commissionRate) || 0
      const commissionValue = (totalPrice * commissionRate) / 100

      subtotal += totalPrice
      costTotal += costPrice * qty
      totalCommission += commissionValue

      orderItemsData.push({
        itemType: item.itemType,
        serviceId: item.serviceId || null,
        productId: item.productId || null,
        professionalId: item.professionalId || params.professionalId || null,
        addedByUserId: currentUser.id,
        addedByName: currentUser.name || "Operador",
        name: item.name,
        quantity: qty,
        unitPrice,
        costPrice,
        totalPrice,
        commissionRate,
        commissionValue,
      })
    }

    const total = subtotal
    const netProfit = total - costTotal - totalCommission

    // 1. Cria a comanda no banco
    const order = await (prisma.order as any).create({
      data: {
        businessId,
        code,
        type,
        status: "OPEN",
        clientId: params.clientId || null,
        clientName,
        clientPhone,
        professionalId: params.professionalId || null,
        chairOrTable: params.chairOrTable?.trim() || (type === "ORDER" ? "Cadeira Principal" : "Balcão"),
        openedByUserId: currentUser.id,
        openedByName: currentUser.name || "Operador",
        subtotal,
        total,
        costTotal,
        totalCommission,
        netProfit,
        notes: params.notes?.trim() || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    })

    // 2. Dar baixa no estoque para produtos lançados na abertura
    for (const item of items) {
      if (item.itemType === "PRODUCT" && item.productId) {
        const prod = await (prisma.product as any).findUnique({
          where: { id: item.productId },
        })

        if (prod && prod.trackStock) {
          const prev = prod.stock
          const newStk = Math.max(0, prev - (item.quantity || 1))

          await prisma.$transaction([
            (prisma.product as any).update({
              where: { id: prod.id },
              data: { stock: newStk },
            }),
            (prisma.stockMovement as any).create({
              data: {
                businessId,
                productId: prod.id,
                type: "OUT_SALE",
                quantity: -(item.quantity || 1),
                previousStock: prev,
                newStock: newStk,
                costPrice: prod.costPrice || 0,
                orderId: order.id,
                createdById: currentUser.id,
                creatorName: currentUser.name || "Operador",
                notes: `Saída por lançamento na comanda ${order.code}`,
              },
            }),
          ])
        }
      }
    }

    revalidatePath("/app/comandas")
    revalidatePath("/app/produtos")

    return {
      success: true,
      order,
      message: `${type === "ORDER" ? "Comanda" : "Venda"} ${code} aberta com sucesso!`,
    }
  } catch (error: any) {
    console.error("Erro ao abrir comanda:", error)
    return { success: false, error: "Falha ao abrir comanda." }
  }
}

/**
 * 4. Adicionar item (Serviço ou Produto) em uma comanda aberta com baixa de estoque e auditoria
 */
export async function addItemToOrderAction(params: {
  orderId: string
  itemType: "SERVICE" | "PRODUCT"
  serviceId?: string
  productId?: string
  name: string
  quantity: number
  unitPrice: number
  costPrice?: number
  professionalId?: string
  commissionRate?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const { orderId, itemType, serviceId, productId, name, quantity, unitPrice, costPrice, professionalId, commissionRate } = params
  const qty = Math.max(1, quantity || 1)
  const price = Number(unitPrice) || 0
  const cost = Number(costPrice) || 0
  const totalPrice = price * qty
  const rate = Number(commissionRate) || 0
  const commissionValue = (totalPrice * rate) / 100

  try {
    const order = await (prisma.order as any).findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order || order.businessId !== currentUser.businessId) {
      return { success: false, error: "Comanda não encontrada." }
    }

    if (order.status !== "OPEN") {
      return { success: false, error: "Não é possível adicionar itens a uma comanda já fechada ou cancelada." }
    }

    // Se for produto, valida estoque e dá baixa
    if (itemType === "PRODUCT" && productId) {
      const prod = await (prisma.product as any).findUnique({
        where: { id: productId },
      })

      if (prod && prod.trackStock) {
        if (prod.stock < qty) {
          return {
            success: false,
            error: `Estoque insuficiente para "${prod.name}". Saldo disponível: ${prod.stock} ${prod.unit}.`,
          }
        }

        const prev = prod.stock
        const newStk = prev - qty

        await prisma.$transaction([
          (prisma.product as any).update({
            where: { id: prod.id },
            data: { stock: newStk },
          }),
          (prisma.stockMovement as any).create({
            data: {
              businessId: currentUser.businessId,
              productId: prod.id,
              type: "OUT_SALE",
              quantity: -qty,
              previousStock: prev,
              newStock: newStk,
              costPrice: prod.costPrice || cost,
              orderId: order.id,
              createdById: currentUser.id,
              creatorName: currentUser.name || "Operador",
              notes: `Lançamento na comanda ${order.code}`,
            },
          }),
        ])
      }
    }

    // Cria o item na comanda com auditoria de quem lançou
    await (prisma.orderItem as any).create({
      data: {
        orderId: order.id,
        itemType,
        serviceId: serviceId || null,
        productId: productId || null,
        professionalId: professionalId || order.professionalId || null,
        addedByUserId: currentUser.id,
        addedByName: currentUser.name || "Operador",
        name: name.trim(),
        quantity: qty,
        unitPrice: price,
        costPrice: cost,
        totalPrice,
        commissionRate: rate,
        commissionValue,
      },
    })

    // Recalcular totais da comanda
    const allItems = await (prisma.orderItem as any).findMany({
      where: { orderId: order.id },
    })

    const newSubtotal = allItems.reduce((acc: number, i: any) => acc + i.totalPrice, 0)
    const newCostTotal = allItems.reduce((acc: number, i: any) => acc + (i.costPrice || 0) * i.quantity, 0)
    const newCommissionTotal = allItems.reduce((acc: number, i: any) => acc + (i.commissionValue || 0), 0)
    const discount = order.discount || 0
    const newTotal = Math.max(0, newSubtotal - discount)
    const newNetProfit = newTotal - newCostTotal - newCommissionTotal

    await (prisma.order as any).update({
      where: { id: order.id },
      data: {
        subtotal: newSubtotal,
        total: newTotal,
        costTotal: newCostTotal,
        totalCommission: newCommissionTotal,
        netProfit: newNetProfit,
      },
    })

    revalidatePath("/app/comandas")
    revalidatePath("/app/produtos")

    return {
      success: true,
      message: `Item "${name}" adicionado à comanda!`,
    }
  } catch (error: any) {
    console.error("Erro ao adicionar item na comanda:", error)
    return { success: false, error: "Falha ao adicionar item." }
  }
}

/**
 * 5. Remover item da comanda (com recomposição de estoque se for produto)
 */
export async function removeItemFromOrderAction(orderId: string, itemId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const item = await (prisma.orderItem as any).findUnique({
      where: { id: itemId },
      include: { order: true },
    })

    if (!item || item.order.businessId !== currentUser.businessId) {
      return { success: false, error: "Item não encontrado." }
    }

    if (item.order.status !== "OPEN") {
      return { success: false, error: "Esta comanda já foi finalizada." }
    }

    // Se era produto, devolve a quantidade ao estoque com registro de auditoria
    if (item.itemType === "PRODUCT" && item.productId) {
      const prod = await (prisma.product as any).findUnique({
        where: { id: item.productId },
      })

      if (prod && prod.trackStock) {
        const prev = prod.stock
        const newStk = prev + item.quantity

        await prisma.$transaction([
          (prisma.product as any).update({
            where: { id: prod.id },
            data: { stock: newStk },
          }),
          (prisma.stockMovement as any).create({
            data: {
              businessId: currentUser.businessId,
              productId: prod.id,
              type: "ADJUSTMENT",
              quantity: item.quantity,
              previousStock: prev,
              newStock: newStk,
              costPrice: prod.costPrice || 0,
              orderId: item.order.id,
              createdById: currentUser.id,
              creatorName: currentUser.name || "Operador",
              notes: `Estorno de item cancelado na comanda ${item.order.code}`,
            },
          }),
        ])
      }
    }

    // Deleta o item
    await (prisma.orderItem as any).delete({
      where: { id: itemId },
    })

    // Recalcula totais da comanda
    const allItems = await (prisma.orderItem as any).findMany({
      where: { orderId: item.order.id },
    })

    const newSubtotal = allItems.reduce((acc: number, i: any) => acc + i.totalPrice, 0)
    const newCostTotal = allItems.reduce((acc: number, i: any) => acc + (i.costPrice || 0) * i.quantity, 0)
    const newCommissionTotal = allItems.reduce((acc: number, i: any) => acc + (i.commissionValue || 0), 0)
    const discount = item.order.discount || 0
    const newTotal = Math.max(0, newSubtotal - discount)
    const newNetProfit = newTotal - newCostTotal - newCommissionTotal

    await (prisma.order as any).update({
      where: { id: item.order.id },
      data: {
        subtotal: newSubtotal,
        total: newTotal,
        costTotal: newCostTotal,
        totalCommission: newCommissionTotal,
        netProfit: newNetProfit,
      },
    })

    revalidatePath("/app/comandas")
    revalidatePath("/app/produtos")

    return { success: true, message: "Item removido da comanda." }
  } catch (error: any) {
    console.error("Erro ao remover item:", error)
    return { success: false, error: "Falha ao remover item da comanda." }
  }
}

/**
 * 6. Checkout & Fechamento de Venda no PDV (PIX, Dinheiro, Cartão, Split Payment)
 */
export async function checkoutOrderAction(params: {
  orderId: string
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "SPLIT_PAYMENT" | "SUBSCRIPTION_CLUB" | "CUSTOMER_TAB"
  splitPayments?: Array<{ method: string; amount: number; label?: string }>
  discount?: number
  discountType?: "FIXED" | "PERCENT"
  cashReceived?: number
  notes?: string
  customerDebtDueDate?: string
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

  const { orderId, paymentMethod, splitPayments, discount = 0, discountType = "FIXED", cashReceived, notes, customerDebtDueDate } = params

  try {
    const order = await (prisma.order as any).findUnique({
      where: { id: orderId },
      include: {
        items: true,
        client: true,
      },
    })

    if (!order || order.businessId !== currentUser.businessId) {
      return { success: false, error: "Comanda não encontrada." }
    }

    if (order.status === "PAID") {
      return { success: false, error: "Esta comanda já foi finalizada." }
    }

    if (!order.items || order.items.length === 0) {
      return { success: false, error: "Não é possível fechar uma comanda sem itens lançados." }
    }

    const subtotal = order.subtotal || 0
    let discountValue = 0

    if (discount > 0) {
      if (discountType === "PERCENT") {
        discountValue = (subtotal * discount) / 100
      } else {
        discountValue = discount
      }
    }

    const finalTotal = Math.max(0, subtotal - discountValue)
    const costTotal = order.costTotal || 0
    const totalCommission = order.totalCommission || 0
    const netProfit = finalTotal - costTotal - totalCommission

    // Calcular troco para dinheiro se aplicável
    let cashChange: number | null = null
    if (paymentMethod === "CASH" && cashReceived && cashReceived > finalTotal) {
      cashChange = Math.round((cashReceived - finalTotal) * 100) / 100
    }

    const now = new Date()

    // 0. Busca sessão de caixa aberta para vincular (apenas para pagamentos à vista/dinheiro/cartão/pix)
    const activeCashSession = await (prisma as any).cashRegisterSession.findFirst({
      where: {
        businessId: currentUser.businessId,
        status: "OPEN",
      },
      select: { id: true, financialAccountId: true },
    })

    // Se for Pagar Depois / Fiado (CUSTOMER_TAB), garante que existe um cliente vinculado
    let finalClientId = order.clientId

    if (paymentMethod === "CUSTOMER_TAB") {
      if (!finalClientId) {
        // Tenta buscar por telefone ou criar cliente rápido
        const cleanPhone = order.clientPhone ? order.clientPhone.replace(/\D/g, "") : ""
        if (cleanPhone) {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [{ phone: cleanPhone }, { phone: `55${cleanPhone}` }],
            },
          })
          if (existingUser) {
            finalClientId = existingUser.id
          } else {
            const newClient = await prisma.user.create({
              data: {
                name: order.clientName || "Cliente Conta Cliente",
                phone: cleanPhone,
                role: "USER",
                businessId: currentUser.businessId,
              },
            })
            finalClientId = newClient.id
          }
        } else {
          const newClient = await prisma.user.create({
            data: {
              name: order.clientName || "Cliente Balcão (Conta Cliente)",
              role: "USER",
              businessId: currentUser.businessId,
            },
          })
          finalClientId = newClient.id
        }
      }
    }

    // 1. Atualizar a comanda com dados de fechamento e auditoria
    const updatedOrder = await (prisma.order as any).update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentMethod,
        splitPayments: splitPayments || null,
        discount: discountValue,
        discountType,
        total: finalTotal,
        netProfit,
        cashReceived: cashReceived || null,
        cashChange,
        clientId: finalClientId || order.clientId,
        cashSessionId: activeCashSession?.id || null,
        closedByUserId: currentUser.id,
        closedByName: currentUser.name || "Operador",
        closedAt: now,
        notes: notes?.trim() || order.notes,
      },
      include: {
        items: true,
      },
    })

    // 2. Se for Pagar Depois (Conta Cliente), cria o registro de CustomerDebt
    if (paymentMethod === "CUSTOMER_TAB" && finalClientId) {
      await (prisma as any).customerDebt.create({
        data: {
          businessId: currentUser.businessId,
          clientId: finalClientId,
          orderId: order.id,
          description: `Consumo Comanda #${order.code} (${order.clientName || "Cliente"})`,
          totalAmount: finalTotal,
          paidAmount: 0.0,
          remainingAmount: finalTotal,
          status: "PENDING",
          dueDate: customerDebtDueDate ? new Date(customerDebtDueDate) : null,
          notes: notes?.trim() || null,
          createdById: currentUser.id,
          createdByName: currentUser.name || "Operador",
        },
      })
    }

    // 3. Gerar lançamento no Financeiro
    const isDeferred = paymentMethod === "CUSTOMER_TAB"
    await prisma.financialTransaction.create({
      data: {
        businessId: currentUser.businessId,
        orderId: order.id,
        cashSessionId: isDeferred ? null : (activeCashSession?.id || null),
        accountId: isDeferred ? null : (activeCashSession?.financialAccountId || null),
        type: "INCOME",
        category: isDeferred ? "Contas a Receber / Conta Cliente" : "Vendas / Comandas",
        description: isDeferred
          ? `Venda a Prazo (Conta Cliente) ${order.code} - ${order.clientName || "Cliente"}`
          : `Recebimento ${order.code} - ${order.clientName || "Balcão"}`,
        amount: finalTotal,
        paymentMethod: paymentMethod as any,
        isPaid: !isDeferred,
        dueDate: isDeferred && customerDebtDueDate ? new Date(customerDebtDueDate) : null,
        paidAt: isDeferred ? null : now,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Operador",
      },
    })

    // 4. Se houver agendamento vinculado a esta comanda, marca como COMPLETED na Agenda
    await prisma.appointment.updateMany({
      where: {
        businessId: currentUser.businessId,
        orderId: order.id,
      },
      data: {
        status: "COMPLETED",
      },
    })

    revalidatePath("/app/comandas")
    revalidatePath("/app/agenda")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/clientes")

    return {
      success: true,
      order: updatedOrder,
      cashChange,
      message: paymentMethod === "CUSTOMER_TAB"
        ? `Comanda ${order.code} registrada como "Pagar Depois (Conta Cliente)" com sucesso!`
        : `Comanda ${order.code} finalizada com sucesso!`,
    }
  } catch (error: any) {
    console.error("Erro ao fechar comanda:", error)
    return { success: false, error: "Falha ao finalizar comanda." }
  }
}

/**
 * 7. Cancelar / Estornar comanda aberta ou fechada com retorno de estoque
 */
export async function cancelOrderAction(orderId: string, reason?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const order = await (prisma.order as any).findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order || order.businessId !== currentUser.businessId) {
      return { success: false, error: "Comanda não encontrada." }
    }

    if (order.status === "CANCELED") {
      return { success: false, error: "Esta comanda já está cancelada." }
    }

    // Recompor estoque de todos os produtos da comanda
    for (const item of order.items) {
      if (item.itemType === "PRODUCT" && item.productId) {
        const prod = await (prisma.product as any).findUnique({
          where: { id: item.productId },
        })

        if (prod && prod.trackStock) {
          const prev = prod.stock
          const newStk = prev + item.quantity

          await prisma.$transaction([
            (prisma.product as any).update({
              where: { id: prod.id },
              data: { stock: newStk },
            }),
            (prisma.stockMovement as any).create({
              data: {
                businessId: currentUser.businessId,
                productId: prod.id,
                type: "ADJUSTMENT",
                quantity: item.quantity,
                previousStock: prev,
                newStock: newStk,
                costPrice: prod.costPrice || 0,
                orderId: order.id,
                createdById: currentUser.id,
                creatorName: currentUser.name || "Operador",
                notes: `Estorno por cancelamento da comanda ${order.code}: ${reason || "Cancelado pelo gestor"}`,
              },
            }),
          ])
        }
      }
    }

    // Atualiza status da comanda
    await (prisma.order as any).update({
      where: { id: order.id },
      data: {
        status: "CANCELED",
        notes: reason ? `${order.notes || ""} [Cancelado: ${reason}]`.trim() : order.notes,
      },
    })

    // Cancela transação financeira vinculada se houver
    await prisma.financialTransaction.updateMany({
      where: { orderId: order.id },
      data: { isPaid: false, description: `[CANCELADA] Recebimento ${order.code}` },
    })

    revalidatePath("/app/comandas")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/produtos")

    return {
      success: true,
      message: `Comanda ${order.code} cancelada e estoque estornado!`,
    }
  } catch (error: any) {
    console.error("Erro ao cancelar comanda:", error)
    return { success: false, error: "Falha ao cancelar comanda." }
  }
}

/**
 * 8. Gerar Payload e Link de Recibo Digital do WhatsApp para a comanda
 */
export async function getDigitalReceiptAction(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    const order = await (prisma.order as any).findUnique({
      where: { id: orderId },
      include: {
        business: { select: { name: true, phone: true, address: true } },
        items: {
          include: {
            professional: { select: { name: true } },
          },
        },
      },
    })

    if (!order) {
      return { success: false, error: "Comanda não encontrada." }
    }

    const businessName = order.business?.name || "VisualClube"
    const clientFirstName = (order.clientName || "Cliente").split(" ")[0]
    const dateFormatted = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(order.closedAt || order.createdAt)

    let itemsText = order.items
      .map((i: any) => `• ${i.name} (${i.quantity}x) — R$ ${i.totalPrice.toFixed(2).replace(".", ",")}`)
      .join("\n")

    let messageText = `🧾 *COMPROVANTE DE ATENDIMENTO*\n*${businessName}*\n\n`
    messageText += `Olá, *${clientFirstName}*! Agradecemos a sua preferência. Segue o detalhamento do seu atendimento:\n\n`
    messageText += `📋 *Comanda:* #${order.code}\n`
    messageText += `📅 *Data:* ${dateFormatted}\n\n`
    messageText += `🛍️ *Itens consumidos:*\n${itemsText}\n\n`

    if (order.discount && order.discount > 0) {
      messageText += `🏷️ *Desconto:* - R$ ${order.discount.toFixed(2).replace(".", ",")}\n`
    }

    messageText += `💰 *TOTAL PAGO:* *R$ ${order.total.toFixed(2).replace(".", ",")}*\n`
    messageText += `💳 *Forma de Pagamento:* ${order.paymentMethod || "Não informado"}\n\n`
    messageText += `💈 *Volte sempre!* ✨`

    const cleanPhone = order.clientPhone ? order.clientPhone.replace(/\D/g, "") : ""
    const whatsappUrl = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`
      : `https://wa.me/?text=${encodeURIComponent(messageText)}`

    return {
      success: true,
      receipt: {
        order,
        businessName,
        messageText,
        whatsappUrl,
        dateFormatted,
      },
    }
  } catch (error) {
    console.error("Erro ao gerar recibo:", error)
    return { success: false, error: "Falha ao gerar recibo." }
  }
}
