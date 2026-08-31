"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PaymentMethodSchema = z.object({
  name: z.string().min(1, "Nome do meio de pagamento é obrigatório."),
  type: z.string().default("OTHER"),
  accountId: z.string().nullish(),
  feePercentage: z.coerce.number().min(0).max(100).default(0),
  payoutDays: z.coerce.number().int().min(0).default(0),
  details: z.string().nullish(),
  pixKey: z.string().nullish(),
  pixKeyType: z.string().nullish(),
  isActive: z.boolean().default(true),
})

export type PaymentMethodInput = z.infer<typeof PaymentMethodSchema>

/**
 * Helper para formatar documento vindo do MongoDB para objeto limpo
 */
function formatDoc(doc: any) {
  if (!doc) return null
  return {
    id: doc._id?.$oid || doc._id?.toString() || doc.id,
    businessId: doc.businessId?.$oid || doc.businessId?.toString() || doc.businessId,
    accountId: doc.accountId?.$oid || doc.accountId?.toString() || doc.accountId || null,
    name: doc.name,
    type: doc.type || "OTHER",
    feePercentage: doc.feePercentage !== undefined ? Number(doc.feePercentage) : 0,
    payoutDays: doc.payoutDays !== undefined ? Number(doc.payoutDays) : 0,
    details: doc.details || null,
    pixKey: doc.pixKey || null,
    pixKeyType: doc.pixKeyType || null,
    isDefault: !!doc.isDefault,
    isActive: doc.isActive !== undefined ? !!doc.isActive : true,
    order: doc.order !== undefined ? Number(doc.order) : 0,
    createdById: doc.createdById?.$oid || doc.createdById?.toString() || doc.createdById || null,
    createdByName: doc.createdByName || null,
    createdAt: doc.createdAt?.$date ? new Date(doc.createdAt.$date) : (doc.createdAt ? new Date(doc.createdAt) : new Date()),
    updatedAt: doc.updatedAt?.$date ? new Date(doc.updatedAt.$date) : (doc.updatedAt ? new Date(doc.updatedAt) : new Date()),
  }
}

/**
 * Helper para obter o negócio do usuário autenticado
 */
async function getEffectiveBusiness(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      businessId: true,
      business: {
        select: { id: true, name: true, pixKey: true, pixKeyType: true },
      },
    },
  })

  if (!user) return null

  if (user.businessId && user.business) {
    return { user, business: user.business, businessId: user.businessId }
  }

  // Fallback para primeiro negócio do sistema
  const firstBusiness = await prisma.business.findFirst({
    select: { id: true, name: true, pixKey: true, pixKeyType: true },
  })

  if (firstBusiness) {
    await prisma.user.update({
      where: { id: user.id },
      data: { businessId: firstBusiness.id },
    })
    return { user, business: firstBusiness, businessId: firstBusiness.id }
  }

  return null
}

/**
 * 1. Lista todos os meios de pagamento do estabelecimento (inicializa padrões se for o 1º acesso)
 */
export async function getPaymentMethodsAction() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", paymentMethods: [] }
  }

  const effective = await getEffectiveBusiness(session.user.id)
  if (!effective) {
    return { success: false, error: "Estabelecimento não encontrado.", paymentMethods: [] }
  }

  const { user, business, businessId } = effective

  try {
    const rawRes: any = await prisma.$runCommandRaw({
      find: "PaymentMethodConfig",
      filter: {
        $or: [
          { businessId: { $oid: businessId } },
          { businessId: businessId },
        ],
      },
      sort: { order: 1, createdAt: 1 },
    })

    const rawDocs = rawRes?.cursor?.firstBatch || []
    let methods = rawDocs.map(formatDoc)

    // Se o estabelecimento ainda não tem meios de pagamento configurados, inicializa os 4 padrões
    if (!methods || methods.length === 0) {
      const nowIso = new Date().toISOString()
      const defaults = [
        {
          businessId: { $oid: businessId },
          name: "PIX Instantâneo",
          type: "PIX",
          feePercentage: 0.0,
          payoutDays: 0,
          details: "Transferência instantânea via QR Code",
          pixKey: business.pixKey || null,
          pixKeyType: business.pixKeyType || "CHAVE",
          isDefault: true,
          isActive: true,
          order: 1,
          createdById: { $oid: user.id },
          createdByName: user.name || "Sistema",
          createdAt: { $date: nowIso },
          updatedAt: { $date: nowIso },
        },
        {
          businessId: { $oid: businessId },
          name: "Dinheiro Físico",
          type: "CASH",
          feePercentage: 0.0,
          payoutDays: 0,
          details: "Pagamento em espécie com calculadora de troco",
          isDefault: true,
          isActive: true,
          order: 2,
          createdById: { $oid: user.id },
          createdByName: user.name || "Sistema",
          createdAt: { $date: nowIso },
          updatedAt: { $date: nowIso },
        },
        {
          businessId: { $oid: businessId },
          name: "Cartão de Débito",
          type: "DEBIT_CARD",
          feePercentage: 1.89,
          payoutDays: 1,
          details: "Maquininha no balcão (D+1)",
          isDefault: true,
          isActive: true,
          order: 3,
          createdById: { $oid: user.id },
          createdByName: user.name || "Sistema",
          createdAt: { $date: nowIso },
          updatedAt: { $date: nowIso },
        },
        {
          businessId: { $oid: businessId },
          name: "Cartão de Crédito",
          type: "CREDIT_CARD",
          feePercentage: 3.49,
          payoutDays: 30,
          details: "Maquininha à vista / parcelado (D+30)",
          isDefault: true,
          isActive: true,
          order: 4,
          createdById: { $oid: user.id },
          createdByName: user.name || "Sistema",
          createdAt: { $date: nowIso },
          updatedAt: { $date: nowIso },
        },
      ]

      await prisma.$runCommandRaw({
        insert: "PaymentMethodConfig",
        documents: defaults,
      })

      const afterInit: any = await prisma.$runCommandRaw({
        find: "PaymentMethodConfig",
        filter: {
          $or: [
            { businessId: { $oid: businessId } },
            { businessId: businessId },
          ],
        },
        sort: { order: 1, createdAt: 1 },
      })

      methods = (afterInit?.cursor?.firstBatch || []).map(formatDoc)
    }

    return { success: true, paymentMethods: methods }
  } catch (error: any) {
    console.error("Erro ao buscar meios de pagamento:", error)
    return { success: false, error: error?.message || "Falha ao carregar meios de pagamento.", paymentMethods: [] }
  }
}

/**
 * 2. Cadastra um novo meio de pagamento (Customizado / Regional) com Auditoria
 */
export async function createPaymentMethodAction(data: PaymentMethodInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const effective = await getEffectiveBusiness(session.user.id)
  if (!effective) {
    return { success: false, error: "Você precisa ter um estabelecimento configurado." }
  }

  const { user, businessId } = effective

  const parsed = PaymentMethodSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos." }
  }

  try {
    const countRes: any = await prisma.$runCommandRaw({
      count: "PaymentMethodConfig",
      query: {
        $or: [
          { businessId: { $oid: businessId } },
          { businessId: businessId },
        ],
      },
    })

    const totalCount = countRes?.n || 0

    const validTypes = [
      "PIX",
      "CREDIT_CARD",
      "DEBIT_CARD",
      "CASH",
      "CITY_CARD",
      "VOUCHER",
      "LOCAL_AGREEMENT",
      "BANK_TRANSFER",
      "OTHER",
    ]
    const methodType = validTypes.includes(parsed.data.type) ? parsed.data.type : "OTHER"
    const nowIso = new Date().toISOString()

    const newDoc = {
      businessId: { $oid: businessId },
      accountId: parsed.data.accountId ? { $oid: parsed.data.accountId } : null,
      name: parsed.data.name.trim(),
      type: methodType,
      feePercentage: Number(parsed.data.feePercentage) || 0,
      payoutDays: Number(parsed.data.payoutDays) || 0,
      details: parsed.data.details ? parsed.data.details.trim() : null,
      pixKey: parsed.data.pixKey ? parsed.data.pixKey.trim() : null,
      pixKeyType: parsed.data.pixKeyType ? parsed.data.pixKeyType.trim() : null,
      isActive: parsed.data.isActive !== undefined ? parsed.data.isActive : true,
      isDefault: false,
      order: totalCount + 1,
      createdById: { $oid: user.id },
      createdByName: user.name || "Gestor",
      createdAt: { $date: nowIso },
      updatedAt: { $date: nowIso },
    }

    const insertResult = await prisma.$runCommandRaw({
      insert: "PaymentMethodConfig",
      documents: [newDoc],
    })

    revalidatePath("/app/financeiro/meios-de-pagamento")
    revalidatePath("/app/financeiro/contas")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/comandas")

    return {
      success: true,
      paymentMethod: formatDoc(newDoc),
      message: `Meio de pagamento "${parsed.data.name}" cadastrado com sucesso!`,
    }
  } catch (error: any) {
    console.error("Erro ao criar meio de pagamento:", error)
    return { success: false, error: error?.message || "Falha ao cadastrar meio de pagamento." }
  }
}

/**
 * 3. Atualiza um meio de pagamento existente
 */
export async function updatePaymentMethodAction(id: string, data: Partial<PaymentMethodInput>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const effective = await getEffectiveBusiness(session.user.id)
  if (!effective) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    const updateFields: any = {
      updatedAt: { $date: new Date().toISOString() },
    }

    if (data.name !== undefined) updateFields.name = data.name.trim()
    if (data.type !== undefined) updateFields.type = data.type
    if (data.accountId !== undefined) updateFields.accountId = data.accountId ? { $oid: data.accountId } : null
    if (data.feePercentage !== undefined) updateFields.feePercentage = Number(data.feePercentage) || 0
    if (data.payoutDays !== undefined) updateFields.payoutDays = Number(data.payoutDays) || 0
    if (data.details !== undefined) updateFields.details = data.details ? data.details.trim() : null
    if (data.pixKey !== undefined) updateFields.pixKey = data.pixKey ? data.pixKey.trim() : null
    if (data.pixKeyType !== undefined) updateFields.pixKeyType = data.pixKeyType ? data.pixKeyType.trim() : null
    if (data.isActive !== undefined) updateFields.isActive = data.isActive

    await prisma.$runCommandRaw({
      update: "PaymentMethodConfig",
      updates: [
        {
          q: {
            $or: [
              { _id: { $oid: id } },
              { id: id },
            ],
          },
          u: { $set: updateFields },
        },
      ],
    })

    revalidatePath("/app/financeiro/meios-de-pagamento")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/comandas")

    return {
      success: true,
      message: "Meio de pagamento atualizado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar meio de pagamento:", error)
    return { success: false, error: error?.message || "Falha ao salvar alterações." }
  }
}

/**
 * 4. Alterna status de ativação (Ativo / Inativo no PDV)
 */
export async function togglePaymentMethodAction(id: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    await prisma.$runCommandRaw({
      update: "PaymentMethodConfig",
      updates: [
        {
          q: {
            $or: [
              { _id: { $oid: id } },
              { id: id },
            ],
          },
          u: {
            $set: {
              isActive,
              updatedAt: { $date: new Date().toISOString() },
            },
          },
        },
      ],
    })

    revalidatePath("/app/financeiro/meios-de-pagamento")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/comandas")

    return {
      success: true,
      message: isActive ? "Meio habilitado no PDV!" : "Meio pausado no PDV.",
    }
  } catch (error: any) {
    console.error("Erro ao alternar status do meio:", error)
    return { success: false, error: error?.message || "Falha ao atualizar status." }
  }
}

/**
 * 5. Excluir meio de pagamento customizado
 */
export async function deletePaymentMethodAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    const findRes: any = await prisma.$runCommandRaw({
      find: "PaymentMethodConfig",
      filter: {
        $or: [
          { _id: { $oid: id } },
          { id: id },
        ],
      },
    })

    const doc = findRes?.cursor?.firstBatch?.[0]
    if (doc?.isDefault) {
      // Se for padrão, desativa em vez de deletar
      await prisma.$runCommandRaw({
        update: "PaymentMethodConfig",
        updates: [
          {
            q: {
              $or: [
                { _id: { $oid: id } },
                { id: id },
              ],
            },
            u: {
              $set: {
                isActive: false,
                updatedAt: { $date: new Date().toISOString() },
              },
            },
          },
        ],
      })

      revalidatePath("/app/financeiro/meios-de-pagamento")
      revalidatePath("/app/financeiro")
      revalidatePath("/app/comandas")

      return {
        success: true,
        message: "Este é um meio padrão do sistema e foi desativado no PDV.",
      }
    }

    await prisma.$runCommandRaw({
      delete: "PaymentMethodConfig",
      deletes: [
        {
          q: {
            $or: [
              { _id: { $oid: id } },
              { id: id },
            ],
          },
          limit: 1,
        },
      ],
    })

    revalidatePath("/app/financeiro/meios-de-pagamento")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/comandas")

    return {
      success: true,
      message: "Meio de pagamento removido com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao excluir meio de pagamento:", error)
    return { success: false, error: error?.message || "Falha ao remover meio de pagamento." }
  }
}
