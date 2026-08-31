"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowLeftRight, 
  DollarSign, 
  Building2, 
  Layers, 
  Check, 
  AlertCircle,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createAccountTransactionAction, AccountTransactionInput } from "@/actions/account-actions"

interface AccountTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: any[]
  initialAccountId?: string
  initialType?: "EXPENSE" | "INCOME" | "TRANSFER"
  onSuccess: () => void
}

export function AccountTransactionModal({
  isOpen,
  onClose,
  accounts,
  initialAccountId,
  initialType = "EXPENSE",
  onSuccess,
}: AccountTransactionModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">(initialType)
  const [accountId, setAccountId] = useState<string>("")
  const [toAccountId, setToAccountId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [category, setCategory] = useState<string>("Material de Limpeza")
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const expenseCategories = [
    "Material de Limpeza & Higiene",
    "Insumos & Produtos de Bancada",
    "Estoque & Revenda",
    "Aluguel & Condomínio",
    "Energia, Água & Internet",
    "Repasse de Comissão / Equipe",
    "Manutenção de Equipamentos",
    "Marketing & Anúncios",
    "Pró-Labore / Retirada dos Sócios",
    "Impostos & Taxas",
    "Outras Despesas Operacionais",
  ]

  const incomeCategories = [
    "Aporte de Capital / Investimento",
    "Venda Avulsa / Eventos Externos",
    "Reembolso / Estorno Recebido",
    "Rendimento de Aplicação",
    "Outras Entradas",
  ]

  useEffect(() => {
    setType(initialType)
    if (accounts && accounts.length > 0) {
      const defaultAcc = accounts.find((a) => a.id === initialAccountId) || accounts.find((a) => a.isDefault) || accounts[0]
      setAccountId(defaultAcc?.id || accounts[0].id)
      
      const secondAcc = accounts.find((a) => a.id !== defaultAcc?.id) || accounts[0]
      setToAccountId(secondAcc?.id || "")
    }
    setAmount("")
    setDescription("")
    setError(null)
  }, [isOpen, initialAccountId, initialType, accounts])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numAmount = parseFloat(amount.replace(",", "."))
    if (!numAmount || numAmount <= 0) {
      setError("Por favor, informe um valor válido maior que zero.")
      return
    }

    if (!accountId) {
      setError("Selecione a conta de origem.")
      return
    }

    if (type === "TRANSFER" && (!toAccountId || toAccountId === accountId)) {
      setError("Selecione uma conta de destino diferente da conta de origem.")
      return
    }

    setLoading(true)

    const payload: AccountTransactionInput = {
      accountId,
      type,
      amount: numAmount,
      category: type === "TRANSFER" ? "Transferência entre Contas" : category,
      description: description.trim() || (type === "TRANSFER" ? "Transferência interna de saldo" : category),
      toAccountId: type === "TRANSFER" ? toAccountId : undefined,
    }

    try {
      const res = await createAccountTransactionAction(payload)
      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || "Falha ao registrar movimentação.")
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao registrar.")
    } finally {
      setLoading(false)
    }
  }

  const selectedOrigin = accounts.find((a) => a.id === accountId)
  const selectedDest = accounts.find((a) => a.id === toAccountId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border ${
              type === "EXPENSE"
                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                : type === "INCOME"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }`}>
              {type === "EXPENSE" ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : type === "INCOME" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowLeftRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                {type === "EXPENSE"
                  ? "Lançar Despesa / Saída de Conta"
                  : type === "INCOME"
                  ? "Lançar Entrada / Aporte em Conta"
                  : "Transferência entre Contas Internas"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {type === "EXPENSE"
                  ? "Debite materiais de limpeza, aluguel, insumos e retiradas."
                  : type === "INCOME"
                  ? "Credite aportes ou receitas extras em uma conta específica."
                  : "Mova saldo do caixa para o banco (sangria) ou entre contas."}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Abas de Tipo */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/50 shrink-0">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === "EXPENSE"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>Despesa</span>
          </button>

          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === "INCOME"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Entrada</span>
          </button>

          <button
            type="button"
            onClick={() => setType("TRANSFER")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === "TRANSFER"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Transferir</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Valor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Valor da Movimentação (R$) *</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-base text-muted-foreground font-black">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-2.5 rounded-2xl border border-border/70 bg-muted/20 text-lg font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Seleção de Contas */}
          {type === "TRANSFER" ? (
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/20 border border-border/60">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-rose-600 dark:text-rose-400">Conta de Origem (Sai)</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (R$ {(a.currentBalance || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground block">
                  Saldo: R$ {(selectedOrigin?.currentBalance || 0).toFixed(2)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Conta Destino (Entra)</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (R$ {(a.currentBalance || 0).toFixed(2)})
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-muted-foreground block">
                  Saldo: R$ {(selectedDest?.currentBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {type === "EXPENSE" ? "Debitar de qual Conta? *" : "Creditar em qual Conta? *"}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — Saldo Atual: R$ {(a.currentBalance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categoria (se não for transferência) */}
          {type !== "TRANSFER" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Categoria da Movimentação *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
              >
                {(type === "EXPENSE" ? expenseCategories : incomeCategories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descrição / Detalhes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Descrição / Observações</label>
            <input
              type="text"
              placeholder={
                type === "EXPENSE"
                  ? "Ex: Compra de 5 galões de desinfetante e papel toalha"
                  : type === "INCOME"
                  ? "Ex: Aporte inicial de capital de giro"
                  : "Ex: Sangria do caixa balcão para depósito no Bradesco"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </form>

        {/* Rodapé */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-2 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9 rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5 ${
              type === "EXPENSE"
                ? "bg-rose-600 hover:bg-rose-500"
                : type === "INCOME"
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            <Check className="h-4 w-4" />
            <span>
              {loading
                ? "Processando..."
                : type === "EXPENSE"
                ? "Confirmar Despesa"
                : type === "INCOME"
                ? "Confirmar Entrada"
                : "Confirmar Transferência"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
