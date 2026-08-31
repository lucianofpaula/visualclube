"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Building2, 
  Plus, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Edit3, 
  CreditCard, 
  QrCode, 
  Banknote, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  DollarSign,
  ShieldCheck
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AccountModal } from "@/components/financial/account-modal"
import { AccountTransactionModal } from "@/components/financial/account-transaction-modal"

interface AccountsManagerProps {
  accounts: any[]
  stats: any
  transactions: any[]
  onRefresh: () => void
}

export function AccountsManager({
  accounts,
  stats,
  transactions,
  onRefresh,
}: AccountsManagerProps) {
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any | null>(null)

  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE")
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined)

  const getCardStyle = (color: string) => {
    switch (color) {
      case "rose":
        return "from-rose-600 to-rose-800 text-white border-rose-500/40"
      case "purple":
        return "from-purple-600 to-purple-900 text-white border-purple-500/40"
      case "amber":
        return "from-amber-600 to-amber-800 text-white border-amber-500/40"
      case "emerald":
        return "from-emerald-600 to-emerald-800 text-white border-emerald-500/40"
      case "blue":
        return "from-blue-600 to-blue-800 text-white border-blue-500/40"
      default:
        return "from-zinc-800 to-zinc-950 text-white border-zinc-700"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CHECKING_ACCOUNT":
        return "Conta Corrente"
      case "CASH_DRAWER":
        return "Caixa Físico"
      case "GATEWAY_ACCOUNT":
        return "Conta Maquininha"
      case "DIGITAL_WALLET":
        return "Carteira Digital"
      case "SAVINGS":
        return "Poupança / Reserva"
      default:
        return "Carteira"
    }
  }

  const handleOpenTransaction = (type: "EXPENSE" | "INCOME" | "TRANSFER", accId?: string) => {
    setTransactionType(type)
    setSelectedAccountId(accId)
    setTransactionModalOpen(true)
  }

  const totalBalance = stats?.totalBalance || 0
  const checkingBalance = stats?.checkingBalance || 0
  const cashBalance = stats?.cashBalance || 0

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-blue-500" />
            Contas Bancárias & Carteiras
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie suas contas correntes (Bradesco, Itaú, Nubank), caixa físico e saídas do negócio.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => handleOpenTransaction("TRANSFER")}
            variant="outline"
            className="text-xs font-bold h-9 rounded-xl gap-1.5"
          >
            <ArrowLeftRight className="h-4 w-4 text-blue-500" />
            <span>Transferir</span>
          </Button>

          <Button
            onClick={() => handleOpenTransaction("EXPENSE")}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>+ Lançar Despesa</span>
          </Button>

          <Button
            onClick={() => {
              setEditingAccount(null)
              setAccountModalOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Conta</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Consolidado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl border-border/60 bg-card/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Saldo Total Consolidado
          </span>
          <div className="text-2xl font-black text-foreground">
            R$ {totalBalance.toFixed(2).replace(".", ",")}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Soma de todas as contas e caixas
          </span>
        </Card>

        <Card className="p-4 rounded-2xl border-border/60 bg-card/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Saldo em Contas Bancárias
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            R$ {checkingBalance.toFixed(2).replace(".", ",")}
          </div>
          <span className="text-[10px] text-muted-foreground block">Bradesco, Itaú, Nubank e outros</span>
        </Card>

        <Card className="p-4 rounded-2xl border-border/60 bg-card/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Saldo em Dinheiro / Gaveta
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            R$ {cashBalance.toFixed(2).replace(".", ",")}
          </div>
          <span className="text-[10px] text-muted-foreground block">Disponível em espécie no balcão</span>
        </Card>
      </div>

      {/* Grade de Contas (Cartões Visuais Estilo Cartão Bancário) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-foreground">Minhas Contas & Carteiras Ativas</h2>
          <span className="text-xs text-muted-foreground">{accounts.length} contas cadastradas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const cardBg = getCardStyle(account.color)
            const balance = account.currentBalance || 0

            return (
              <div
                key={account.id}
                className={`relative rounded-3xl p-5 bg-gradient-to-br ${cardBg} border shadow-lg flex flex-col justify-between min-h-[190px] transition-all hover:scale-[1.01] overflow-hidden`}
              >
                {/* Background Details */}
                <div className="absolute right-[-20px] top-[-20px] w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 bg-black/10 rounded-full blur-lg pointer-events-none" />

                {/* Top Row: Bank + Type Badge + Actions */}
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-white/90">
                        {account.bankName || "Banco"}
                      </span>
                      {account.isDefault && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                          Principal
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold text-white truncate max-w-[180px] mt-0.5">
                      {account.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingAccount(account)
                        setAccountModalOpen(true)
                      }}
                      className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
                      title="Editar Conta"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle: Saldo em Destaque */}
                <div className="relative z-10 my-2">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">Saldo Atual</span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    R$ {balance.toFixed(2).replace(".", ",")}
                  </div>
                </div>

                {/* Bottom Row: Agency / Account / Action Buttons */}
                <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-white/80 font-mono truncate max-w-[150px]">
                    {account.agency ? `Ag: ${account.agency} ` : ""}
                    {account.accountNumber ? `Cc: ${account.accountNumber}` : getTypeLabel(account.type)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenTransaction("EXPENSE", account.id)}
                      className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <ArrowDownRight className="h-3 w-3" />
                      <span>Despesa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenTransaction("INCOME", account.id)}
                      className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      <span>Entrada</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Extrato Recente de Movimentações */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Extrato de Movimentações Recentes</h3>
            <p className="text-xs text-muted-foreground">Últimas saídas, despesas, transferências e entradas registradas.</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenTransaction("EXPENSE")}
            className="text-xs h-8 rounded-xl font-bold"
          >
            + Novo Lançamento
          </Button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Nenhuma movimentação registrada recentemente.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {transactions.map((t) => {
              const originAcc = accounts.find((a) => a.id === t.accountId)
              const destAcc = accounts.find((a) => a.id === t.toAccountId)

              return (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        t.type === "INCOME"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : t.type === "TRANSFER"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {t.type === "INCOME" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : t.type === "TRANSFER" ? (
                        <ArrowLeftRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{t.description}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-foreground">{t.category}</span>
                        <span>•</span>
                        {t.type === "TRANSFER" ? (
                          <span>
                            De: {originAcc?.name || "Conta"} $\rightarrow$ Para: {destAcc?.name || "Conta"}
                          </span>
                        ) : (
                          <span>Conta: {originAcc?.name || "Conta Principal"}</span>
                        )}
                        <span>•</span>
                        <span>Por: {t.createdByName || "Gestor"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-sm block ${
                        t.type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : t.type === "TRANSFER"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "-" : ""} R${" "}
                      {t.amount.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Conta */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        accountToEdit={editingAccount}
        onSuccess={onRefresh}
      />

      {/* Modal de Transação */}
      <AccountTransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        accounts={accounts}
        initialAccountId={selectedAccountId}
        initialType={transactionType}
        onSuccess={onRefresh}
      />
    </div>
  )
}
