"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ProductSchema = z.object({
  name: z.string().min(2, "O nome do produto deve ter pelo menos 2 caracteres"),
  category: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  sku: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  unit: z.string().default("UN"),
  price: z.number().min(0, "O preço de venda deve ser maior ou igual a zero"),
  costPrice: z.number().min(0, "O preço de custo deve ser maior ou igual a zero").default(0),
  stock: z.number().int().min(0, "O estoque deve ser um número inteiro positivo").default(0),
  minStockAlert: z.number().int().min(0).default(5),
  trackStock: z.boolean().default(true),
  customCommission: z.number().min(0).max(100).optional().nullable(),
  isActive: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof ProductSchema>

/**
 * 1. Lista todos os produtos do estabelecimento com filtros e estatísticas de margem
 */
export async function getProductsAction(params?: {
  search?: string
  category?: string
  lowStockOnly?: boolean
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", products: [], stats: null }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", products: [], stats: null }
  }

  const businessId = currentUser.businessId
  const search = params?.search?.trim() || ""
  const category = params?.category?.trim() || ""
  const lowStockOnly = !!params?.lowStockOnly

  try {
    const whereClause: any = {
      businessId,
      isActive: true,
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && category !== "all") {
      whereClause.category = category
    }

    const allProducts = await (prisma.product as any).findMany({
      where: whereClause,
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: {
            orderItems: true,
            stockMovements: true,
          },
        },
      },
    })

    // Estatísticas gerais
    let totalItems = allProducts.length
    let lowStockCount = 0
    let totalStockValue = 0 // Valor total em estoque a preço de custo
    let totalPotentialRevenue = 0 // Valor total em estoque a preço de venda

    const enrichedProducts = allProducts.map((p: any) => {
      const isLowStock = p.trackStock && p.stock <= p.minStockAlert
      if (isLowStock) lowStockCount++

      const stockVal = p.stock * (p.costPrice || 0)
      const saleVal = p.stock * p.price
      totalStockValue += stockVal
      totalPotentialRevenue += saleVal

      // Recalcular margem para garantir precisão
      const margin = p.price > 0 
        ? Math.round((((p.price - (p.costPrice || 0)) / p.price) * 100) * 10) / 10 
        : 0

      return {
        ...p,
        isLowStock,
        calculatedMargin: margin,
      }
    })

    const filtered = lowStockOnly
      ? enrichedProducts.filter((p: any) => p.isLowStock)
      : enrichedProducts

    // Extrair lista única de categorias
    const categories = Array.from(
      new Set(allProducts.map((p: any) => p.category).filter(Boolean))
    ) as string[]

    return {
      success: true,
      products: filtered,
      categories,
      stats: {
        totalItems,
        lowStockCount,
        totalStockValue,
        totalPotentialRevenue,
        potentialProfit: totalPotentialRevenue - totalStockValue,
      },
    }
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error)
    return { success: false, error: "Falha ao carregar produtos.", products: [], stats: null }
  }
}

/**
 * 2. Busca um produto por código de barras ou SKU (usado no leitor do PDV)
 */
export async function getProductByBarcodeAction(code: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", product: null }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", product: null }
  }

  const cleanCode = code.trim()
  if (!cleanCode) return { success: false, error: "Código vazio.", product: null }

  try {
    const product = await (prisma.product as any).findFirst({
      where: {
        businessId: currentUser.businessId,
        isActive: true,
        OR: [
          { barcode: cleanCode },
          { sku: { equals: cleanCode, mode: "insensitive" } },
        ],
      },
    })

    if (!product) {
      return { success: false, error: "Produto não encontrado.", product: null }
    }

    return { success: true, product }
  } catch (error) {
    console.error("Erro ao buscar produto por barcode:", error)
    return { success: false, error: "Erro ao consultar produto.", product: null }
  }
}

/**
 * 3. Cria um novo produto com auditoria completa (Quem criou + Estabelecimento)
 */
export async function createProductAction(data: ProductInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Você precisa ter um estabelecimento cadastrado." }
  }

  const parsed = ProductSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos." }
  }

  const {
    name,
    category,
    description,
    imageUrl,
    sku,
    barcode,
    unit,
    price,
    costPrice,
    stock,
    minStockAlert,
    trackStock,
    customCommission,
    isActive,
  } = parsed.data

  try {
    const businessId = currentUser.businessId
    const cleanSku = sku?.trim() || `PRD-${Math.floor(1000 + Math.random() * 9000)}`
    const cleanBarcode = barcode?.trim() || null

    // Verificar unicidade de código de barras se fornecido
    if (cleanBarcode) {
      const existingBarcode = await (prisma.product as any).findFirst({
        where: { businessId, barcode: cleanBarcode, isActive: true },
      })
      if (existingBarcode) {
        return { success: false, error: `Já existe um produto com este código de barras (${existingBarcode.name}).` }
      }
    }

    // Calcular margem
    const marginPercent = price > 0
      ? Math.round((((price - costPrice) / price) * 100) * 10) / 10
      : 0

    const newProduct = await (prisma.product as any).create({
      data: {
        businessId,
        createdById: currentUser.id,
        createdByName: currentUser.name || "Gestor",
        name: name.trim(),
        category: category?.trim() || "Geral",
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        sku: cleanSku,
        barcode: cleanBarcode,
        unit: unit || "UN",
        price: Number(price),
        costPrice: Number(costPrice) || 0,
        marginPercent,
        stock: Number(stock) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        trackStock: trackStock !== undefined ? trackStock : true,
        customCommission: customCommission !== undefined && customCommission !== null ? Number(customCommission) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    // Se houver estoque inicial cadastrado, cria o registro de auditoria em StockMovement
    if (stock > 0 && trackStock) {
      await (prisma.stockMovement as any).create({
        data: {
          businessId,
          productId: newProduct.id,
          type: "IN_PURCHASE",
          quantity: stock,
          previousStock: 0,
          newStock: stock,
          costPrice: costPrice || 0,
          createdById: currentUser.id,
          creatorName: currentUser.name || "Gestor",
          notes: "Estoque inicial registrado no cadastro do produto.",
        },
      })
    }

    revalidatePath("/app/produtos")
    revalidatePath("/app/comandas")

    return {
      success: true,
      product: newProduct,
      message: "Produto cadastrado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao criar produto:", error)
    return { success: false, error: "Falha ao cadastrar produto." }
  }
}

/**
 * 4. Atualiza os dados de um produto existente
 */
export async function updateProductAction(id: string, data: Partial<ProductInput>) {
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

  try {
    const existing = await (prisma.product as any).findUnique({
      where: { id },
    })

    if (!existing || existing.businessId !== currentUser.businessId) {
      return { success: false, error: "Produto não encontrado ou acesso negado." }
    }

    const updatePayload: any = {}

    if (data.name !== undefined) updatePayload.name = data.name.trim()
    if (data.category !== undefined) updatePayload.category = data.category?.trim() || "Geral"
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null
    if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl?.trim() || null
    if (data.sku !== undefined) updatePayload.sku = data.sku?.trim() || existing.sku
    if (data.barcode !== undefined) updatePayload.barcode = data.barcode?.trim() || null
    if (data.unit !== undefined) updatePayload.unit = data.unit || "UN"
    if (data.minStockAlert !== undefined) updatePayload.minStockAlert = Number(data.minStockAlert)
    if (data.trackStock !== undefined) updatePayload.trackStock = data.trackStock
    if (data.customCommission !== undefined) {
      updatePayload.customCommission = data.customCommission !== null ? Number(data.customCommission) : null
    }
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive

    const price = data.price !== undefined ? Number(data.price) : existing.price
    const costPrice = data.costPrice !== undefined ? Number(data.costPrice) : (existing.costPrice || 0)

    if (data.price !== undefined) updatePayload.price = price
    if (data.costPrice !== undefined) updatePayload.costPrice = costPrice

    // Recalcula margem
    updatePayload.marginPercent = price > 0
      ? Math.round((((price - costPrice) / price) * 100) * 10) / 10
      : 0

    const updated = await (prisma.product as any).update({
      where: { id },
      data: updatePayload,
    })

    revalidatePath("/app/produtos")
    revalidatePath("/app/comandas")

    return {
      success: true,
      product: updated,
      message: "Produto atualizado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error)
    return { success: false, error: "Falha ao salvar alterações do produto." }
  }
}

/**
 * 5. Registra Movimentação Manual de Estoque (Entrada, Perda, Consumo Interno, Ajuste)
 */
export async function registerStockMovementAction(params: {
  productId: string
  type: "IN_PURCHASE" | "OUT_LOSS" | "INTERNAL_USE" | "ADJUSTMENT"
  quantity: number
  costPrice?: number
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

  const { productId, type, quantity, costPrice, notes } = params

  if (!quantity || quantity <= 0) {
    return { success: false, error: "A quantidade deve ser maior que zero." }
  }

  try {
    const product = await (prisma.product as any).findUnique({
      where: { id: productId },
    })

    if (!product || product.businessId !== currentUser.businessId) {
      return { success: false, error: "Produto não encontrado." }
    }

    const previousStock = product.stock
    let newStock = previousStock

    if (type === "IN_PURCHASE") {
      newStock = previousStock + quantity
    } else if (type === "OUT_LOSS" || type === "INTERNAL_USE") {
      if (previousStock < quantity) {
        return { success: false, error: `Estoque insuficiente. Saldo atual: ${previousStock} ${product.unit}.` }
      }
      newStock = previousStock - quantity
    } else if (type === "ADJUSTMENT") {
      // No ajuste de inventário, a quantidade informada é o novo saldo real apurado
      newStock = quantity
    }

    // Se houve atualização de custo de compra na entrada, atualiza também no produto
    const updateProductData: any = { stock: newStock }
    if (costPrice !== undefined && costPrice > 0 && type === "IN_PURCHASE") {
      updateProductData.costPrice = costPrice
      if (product.price > 0) {
        updateProductData.marginPercent = Math.round((((product.price - costPrice) / product.price) * 100) * 10) / 10
      }
    }

    await prisma.$transaction([
      (prisma.product as any).update({
        where: { id: productId },
        data: updateProductData,
      }),
      (prisma.stockMovement as any).create({
        data: {
          businessId: currentUser.businessId,
          productId: product.id,
          type,
          quantity: type === "ADJUSTMENT" ? newStock - previousStock : (type === "IN_PURCHASE" ? quantity : -quantity),
          previousStock,
          newStock,
          costPrice: costPrice || product.costPrice || 0,
          createdById: currentUser.id,
          creatorName: currentUser.name || "Gestor",
          notes: notes?.trim() || null,
        },
      }),
    ])

    revalidatePath("/app/produtos")
    revalidatePath("/app/comandas")

    return {
      success: true,
      newStock,
      message: "Movimentação de estoque registrada com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao registrar movimentação de estoque:", error)
    return { success: false, error: "Falha ao registrar movimentação." }
  }
}

/**
 * 6. Histórico de Movimentações de Estoque de um Produto (Auditoria)
 */
export async function getProductStockHistoryAction(productId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", movements: [] }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", movements: [] }
  }

  try {
    const movements = await (prisma.stockMovement as any).findMany({
      where: {
        productId,
        businessId: currentUser.businessId,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return { success: true, movements }
  } catch (error) {
    console.error("Erro ao buscar histórico de estoque:", error)
    return { success: false, error: "Erro ao carregar histórico.", movements: [] }
  }
}

/**
 * 7. Excluir produto com validação de histórico
 */
export async function deleteProductAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const product = await (prisma.product as any).findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (!product || product.businessId !== currentUser.businessId) {
      return { success: false, error: "Produto não encontrado." }
    }

    // Se já foi vendido em alguma comanda/pedido, desativa para preservar integridade
    if ((product._count?.orderItems || 0) > 0) {
      await (prisma.product as any).update({
        where: { id },
        data: { isActive: false },
      })

      revalidatePath("/app/produtos")
      revalidatePath("/app/comandas")

      return {
        success: true,
        wasDeactivated: true,
        message: "O produto possui histórico de vendas e foi pausado para preservar seus relatórios.",
      }
    }

    // Se não tem vendas vinculadas, pode excluir
    await (prisma.product as any).delete({
      where: { id },
    })

    revalidatePath("/app/produtos")
    revalidatePath("/app/comandas")

    return {
      success: true,
      wasDeactivated: false,
      message: "Produto removido com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao excluir produto:", error)
    return { success: false, error: "Falha ao remover produto." }
  }
}
