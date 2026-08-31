"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const FinancialAccountSchema = z.object({
  name: z.string().min(1, "Nome da conta é obrigatório."),
  type: z.enum([
    "CHECKING_ACCOUNT",
    "CASH_DRAWER",
    "GATEWAY_ACCOUNT",
    "DIGITAL_WALLET",
    "SAVINGS",
    "OTHER",
  ]).default("CHECKING_ACCOUNT"),
  bankName: z.string().nullish(),
  initialBalance: z.coerce.number().default(0),
  agency: z.string().nullish(),
  accountNumber: z.string().nullish(),
  pixKey: z.string().nullish(),
  color: z.string().default("emerald"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type FinancialAccountInput = z.infer<typeof FinancialAccountSchema>

const AccountTransactionSchema = z.object({
  accountId: z.string().min(1, "Conta de origem é obrigatória."),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().positive("O valor deve ser maior que zero."),
  category: z.string().min(1, "Categoria é obrigatória."),
  description: z.string().min(1, "Descrição é obrigatória."),
  toAccountId: z.string().optional(),
  dueDate: z.string().optional(),
  paidAt: z.string().optional(),
})

export type AccountTransactionInput = z.infer<typeof AccountTransactionSchema>

/**
 * Helper para formatar documento vindo do MongoDB para objeto limpo
 */
function formatAccountDoc(doc: any) {
  if (!doc) return null
  return {
    id: doc._id?.$oid || doc._id?.toString() || doc.id,
    businessId: doc.businessId?.$oid || doc.businessId?.toString() || doc.businessId,
    name: doc.name,
    type: doc.type || "CHECKING_ACCOUNT",
    bankName: doc.bankName || null,
    initialBalance: doc.initialBalance !== undefined ? Number(doc.initialBalance) : 0,
    currentBalance: doc.currentBalance !== undefined ? Number(doc.currentBalance) : 0,
    agency: doc.agency || null,
    accountNumber: doc.accountNumber || null,
    pixKey: doc.pixKey || null,
    isDefault: !!doc.isDefault,
    isActive: doc.isActive !== undefined ? !!doc.isActive : true,
    color: doc.color || "emerald",
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
 * 1. Lista todas as contas e carteiras do estabelecimento (inicializa padrões se for o 1º acesso)
 */
export async function getFinancialAccountsAction() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", accounts: [], stats: null }
  }

  const effective = await getEffectiveBusiness(session.user.id)
  if (!effective) {
    return { success: false, error: "Estabelecimento não encontrado.", accounts: [], stats: null }
  }

  const { user, business, businessId } = effective

  try {
    const rawRes: any = await prisma.$runCommandRaw({
      find: "FinancialAccount",
      filter: {
        $or: [
          { businessId: { $oid: businessId } },
          { businessId: businessId },
        ],
      },
      sort: { isDefault: -1, createdAt: 1 },
    })

    const rawDocs = rawRes?.cursor?.firstBatch || []
    let accounts = rawDocs.map(formatAccountDoc)

    // Se o estabelecimento ainda não tem contas, inicializa as 2 contas padrão
    if (!accounts || accounts.length === 0) {
      const nowIso = new Date().toISOString()
      const defaults = [
        {
          businessId: { $oid: businessId },
          name: "Conta Corrente Principal",
          type: "CHECKING_ACCOUNT",
          bankName: "Banco Bradesco",
          initialBalance: 0.0,
          currentBalance: 0.0,
          pixKey: business.pixKey || null,
          isDefault: true,
          isActive: true,
          color: "blue",
          createdById: { $oid: user.id },
          createdByName: user.name || "Sistema",
          createdAt: { $date: nowIso },
          updatedAt: { $date: nowIso },
        },
        {
          businessId: { $oid: businessId },
          name: "Caixa Físico / Gaveta",
          type: "CASH_DRAWER",
          bankName: "Dinheiro em Espécie",
          initialBalance: 0.0,
          currentBalance: 0.0,
          isDefault: false,
          isActive: true,
          color: "emerald",
          createdById: { $oid: user.id },
          createdByName: user.name || "Sistema",
          createdAt: { $date: nowIso },
          updatedAt: { $date: nowIso },
        },
      ]

      await prisma.$runCommandRaw({
        insert: "FinancialAccount",
        documents: defaults,
      })

      const afterInit: any = await prisma.$runCommandRaw({
        find: "FinancialAccount",
        filter: {
          $or: [
            { businessId: { $oid: businessId } },
            { businessId: businessId },
          ],
        },
        sort: { isDefault: -1, createdAt: 1 },
      })

      accounts = (afterInit?.cursor?.firstBatch || []).map(formatAccountDoc)
    }

    // Calcular estatísticas agregadas
    const totalBalance = accounts.reduce((acc: number, a: any) => acc + (a.currentBalance || 0), 0)
    const checkingBalance = accounts
      .filter((a: any) => a.type === "CHECKING_ACCOUNT")
      .reduce((acc: number, a: any) => acc + (a.currentBalance || 0), 0)
    const cashBalance = accounts
      .filter((a: any) => a.type === "CASH_DRAWER")
      .reduce((acc: number, a: any) => acc + (a.currentBalance || 0), 0)
    const gatewayBalance = accounts
      .filter((a: any) => ["GATEWAY_ACCOUNT", "DIGITAL_WALLET"].includes(a.type))
      .reduce((acc: number, a: any) => acc + (a.currentBalance || 0), 0)

    return {
      success: true,
      accounts,
      stats: {
        totalBalance,
        checkingBalance,
        cashBalance,
        gatewayBalance,
        activeAccountsCount: accounts.filter((a: any) => a.isActive).length,
      },
    }
  } catch (error: any) {
    console.error("Erro ao buscar contas financeiras:", error)
    return { success: false, error: error?.message || "Falha ao carregar contas.", accounts: [], stats: null }
  }
}

/**
 * 2. Cadastra uma nova conta corrente ou carteira com saldo inicial
 */
export async function createFinancialAccountAction(data: FinancialAccountInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const effective = await getEffectiveBusiness(session.user.id)
  if (!effective) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const { user, businessId } = effective

  const parsed = FinancialAccountSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos." }
  }

  try {
    const initialBal = Number(parsed.data.initialBalance) || 0
    const nowIso = new Date().toISOString()

    const newAccountDoc = {
      businessId: { $oid: businessId },
      name: parsed.data.name.trim(),
      type: parsed.data.type,
      bankName: parsed.data.bankName ? parsed.data.bankName.trim() : null,
      initialBalance: initialBal,
      currentBalance: initialBal,
      agency: parsed.data.agency ? parsed.data.agency.trim() : null,
      accountNumber: parsed.data.accountNumber ? parsed.data.accountNumber.trim() : null,
      pixKey: parsed.data.pixKey ? parsed.data.pixKey.trim() : null,
      color: parsed.data.color || "emerald",
      isDefault: !!parsed.data.isDefault,
      isActive: parsed.data.isActive !== undefined ? parsed.data.isActive : true,
      createdById: { $oid: user.id },
      createdByName: user.name || "Gestor",
      createdAt: { $date: nowIso },
      updatedAt: { $date: nowIso },
    }

    const insertRes: any = await prisma.$runCommandRaw({
      insert: "FinancialAccount",
      documents: [newAccountDoc],
    })

    // Se houve saldo inicial, registrar transação de abertura
    if (initialBal > 0) {
      await prisma.$runCommandRaw({
        insert: "FinancialTransaction",
        documents: [
          {
            businessId: { $oid: businessId },
            accountId: insertRes?._id ? { $oid: insertRes._id } : undefined,
            type: "INCOME",
            category: "Aporte Inicial / Saldo de Abertura",
            description: `Saldo inicial da conta ${parsed.data.name}`,
            amount: initialBal,
            isPaid: true,
            paidAt: { $date: nowIso },
            createdById: { $oid: user.id },
            createdByName: user.name || "Gestor",
            createdAt: { $date: nowIso },
            updatedAt: { $date: nowIso },
          },
        ],
      })
    }

    revalidatePath("/app/financeiro/contas")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/meios-de-pagamento")

    return {
      success: true,
      message: `Conta "${parsed.data.name}" cadastrada com sucesso!`,
    }
  } catch (error: any) {
    console.error("Erro ao criar conta financeira:", error)
    return { success: false, error: error?.message || "Falha ao cadastrar conta." }
  }
}

/**
 * 3. Atualiza uma conta corrente / carteira existente
 */
export async function updateFinancialAccountAction(id: string, data: Partial<FinancialAccountInput>) {
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
    if (data.bankName !== undefined) updateFields.bankName = data.bankName ? data.bankName.trim() : null
    if (data.agency !== undefined) updateFields.agency = data.agency ? data.agency.trim() : null
    if (data.accountNumber !== undefined) updateFields.accountNumber = data.accountNumber ? data.accountNumber.trim() : null
    if (data.pixKey !== undefined) updateFields.pixKey = data.pixKey ? data.pixKey.trim() : null
    if (data.color !== undefined) updateFields.color = data.color
    if (data.isDefault !== undefined) updateFields.isDefault = !!data.isDefault
    if (data.isActive !== undefined) updateFields.isActive = !!data.isActive

    await prisma.$runCommandRaw({
      update: "FinancialAccount",
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

    revalidatePath("/app/financeiro/contas")
    revalidatePath("/app/financeiro")
    revalidatePath("/app/financeiro/meios-de-pagamento")

    return {
      success: true,
      message: "Conta atualizada com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar conta:", error)
    return { success: false, error: error?.message || "Falha ao salvar alterações da conta." }
  }
}

/**
 * 4. Lança uma Movimentação (Despesa, Entrada ou Transferência entre Contas)
 */
export async function createAccountTransactionAction(data: AccountTransactionInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const effective = await getEffectiveBusiness(session.user.id)
  if (!effective) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  const { user, businessId } = effective

  const parsed = AccountTransactionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos." }
  }

  const { accountId, type, amount, category, description, toAccountId } = parsed.data

  try {
    // 1. Buscar a conta de origem
    const findOrigin: any = await prisma.$runCommandRaw({
      find: "FinancialAccount",
      filter: {
        $or: [
          { _id: { $oid: accountId } },
          { id: accountId },
        ],
      },
    })

    const originDoc = findOrigin?.cursor?.firstBatch?.[0]
    if (!originDoc) {
      return { success: false, error: "Conta de origem não encontrada." }
    }

    const originBalance = Number(originDoc.currentBalance) || 0
    const nowIso = new Date().toISOString()

    // 2. Se for TRANSFERÊNCIA interna entre contas
    if (type === "TRANSFER") {
      if (!toAccountId || toAccountId === accountId) {
        return { success: false, error: "Selecione uma conta de destino diferente da conta de origem." }
      }

      const findDest: any = await prisma.$runCommandRaw({
        find: "FinancialAccount",
        filter: {
          $or: [
            { _id: { $oid: toAccountId } },
            { id: toAccountId },
          ],
        },
      })

      const destDoc = findDest?.cursor?.firstBatch?.[0]
      if (!destDoc) {
        return { success: false, error: "Conta de destino não encontrada." }
      }

      const destBalance = Number(destDoc.currentBalance) || 0

      // Debitar da origem
      await prisma.$runCommandRaw({
        update: "FinancialAccount",
        updates: [
          {
            q: { $or: [{ _id: { $oid: accountId } }, { id: accountId }] },
            u: {
              $set: {
                currentBalance: originBalance - amount,
                updatedAt: { $date: nowIso },
              },
            },
          },
        ],
      })

      // Creditar no destino
      await prisma.$runCommandRaw({
        update: "FinancialAccount",
        updates: [
          {
            q: { $or: [{ _id: { $oid: toAccountId } }, { id: toAccountId }] },
            u: {
              $set: {
                currentBalance: destBalance + amount,
                updatedAt: { $date: nowIso },
              },
            },
          },
        ],
      })

      // Criar registro da transferência
      await prisma.$runCommandRaw({
        insert: "FinancialTransaction",
        documents: [
          {
            businessId: { $oid: businessId },
            accountId: { $oid: accountId },
            toAccountId: { $oid: toAccountId },
            type: "TRANSFER",
            category: "Transferência entre Contas",
            description: description || `Transferência de ${originDoc.name} para ${destDoc.name}`,
            amount: amount,
            isPaid: true,
            paidAt: { $date: nowIso },
            createdById: { $oid: user.id },
            createdByName: user.name || "Gestor",
            createdAt: { $date: nowIso },
            updatedAt: { $date: nowIso },
          },
        ],
      })

      revalidatePath("/app/financeiro/contas")
      revalidatePath("/app/financeiro")

      return {
        success: true,
        message: `Transferência de R$ ${amount.toFixed(2)} realizada com sucesso de "${originDoc.name}" para "${destDoc.name}"!`,
      }
    }

    // 3. Se for DESPESA (ex: Material de Limpeza, Insumos)
    if (type === "EXPENSE") {
      await prisma.$runCommandRaw({
        update: "FinancialAccount",
        updates: [
          {
            q: { $or: [{ _id: { $oid: accountId } }, { id: accountId }] },
            u: {
              $set: {
                currentBalance: originBalance - amount,
                updatedAt: { $date: nowIso },
              },
            },
          },
        ],
      })

      await prisma.$runCommandRaw({
        insert: "FinancialTransaction",
        documents: [
          {
            businessId: { $oid: businessId },
            accountId: { $oid: accountId },
            type: "EXPENSE",
            category: category.trim(),
            description: description.trim(),
            amount: amount,
            isPaid: true,
            paidAt: { $date: nowIso },
            createdById: { $oid: user.id },
            createdByName: user.name || "Gestor",
            createdAt: { $date: nowIso },
            updatedAt: { $date: nowIso },
          },
        ],
      })

      revalidatePath("/app/financeiro/contas")
      revalidatePath("/app/financeiro")

      return {
        success: true,
        message: `Despesa de R$ ${amount.toFixed(2)} registrada na conta "${originDoc.name}"!`,
      }
    }

    // 4. Se for ENTRADA (ex: Aporte, Venda Avulsa)
    if (type === "INCOME") {
      await prisma.$runCommandRaw({
        update: "FinancialAccount",
        updates: [
          {
            q: { $or: [{ _id: { $oid: accountId } }, { id: accountId }] },
            u: {
              $set: {
                currentBalance: originBalance + amount,
                updatedAt: { $date: nowIso },
              },
            },
          },
        ],
      })

      await prisma.$runCommandRaw({
        insert: "FinancialTransaction",
        documents: [
          {
            businessId: { $oid: businessId },
            accountId: { $oid: accountId },
            type: "INCOME",
            category: category.trim(),
            description: description.trim(),
            amount: amount,
            isPaid: true,
            paidAt: { $date: nowIso },
            createdById: { $oid: user.id },
            createdByName: user.name || "Gestor",
            createdAt: { $date: nowIso },
            updatedAt: { $date: nowIso },
          },
        ],
      })

      revalidatePath("/app/financeiro/contas")
      revalidatePath("/app/financeiro")

      return {
        success: true,
        message: `Entrada de R$ ${amount.toFixed(2)} creditada na conta "${originDoc.name}"!`,
      }
    }

    return { success: false, error: "Tipo de movimentação inválido." }
  } catch (error: any) {
    console.error("Erro ao registrar movimentação na conta:", error)
    return { success: false, error: error?.message || "Falha ao registrar movimentação." }
  }
}

/**
 * 5. Busca extrato de transações de uma conta específica ou de todas as contas
 */
export async function getAccountTransactionsAction(accountId?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", transactions: [] }
  }

  const effective = await getEffectiveBusiness(session.user.id)
  if (!effective) {
    return { success: false, error: "Estabelecimento não encontrado.", transactions: [] }
  }

  const { businessId } = effective

  try {
    const filterQuery: any = {
      $or: [
        { businessId: { $oid: businessId } },
        { businessId: businessId },
      ],
    }

    if (accountId) {
      filterQuery.$and = [
        {
          $or: [
            { accountId: { $oid: accountId } },
            { accountId: accountId },
            { toAccountId: { $oid: accountId } },
            { toAccountId: accountId },
          ],
        },
      ]
    }

    const rawRes: any = await prisma.$runCommandRaw({
      find: "FinancialTransaction",
      filter: filterQuery,
      sort: { createdAt: -1 },
      limit: 50,
    })

    const rawDocs = rawRes?.cursor?.firstBatch || []
    const transactions = rawDocs.map((doc: any) => ({
      id: doc._id?.$oid || doc._id?.toString() || doc.id,
      accountId: doc.accountId?.$oid || doc.accountId?.toString() || doc.accountId,
      toAccountId: doc.toAccountId?.$oid || doc.toAccountId?.toString() || doc.toAccountId,
      type: doc.type,
      category: doc.category,
      description: doc.description,
      amount: Number(doc.amount) || 0,
      paymentMethod: doc.paymentMethod || null,
      isPaid: !!doc.isPaid,
      createdByName: doc.createdByName || "Sistema",
      createdAt: doc.createdAt?.$date ? new Date(doc.createdAt.$date) : (doc.createdAt ? new Date(doc.createdAt) : new Date()),
    }))

    return { success: true, transactions }
  } catch (error: any) {
    console.error("Erro ao buscar extrato da conta:", error)
    return { success: false, error: error?.message || "Falha ao buscar extrato.", transactions: [] }
  }
}
