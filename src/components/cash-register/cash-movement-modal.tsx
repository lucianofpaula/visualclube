"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  ArrowDownLeft, 
  PlusCircle, 
  MinusCircle, 
  DollarSign, 
  AlertCircle, 
  Loader2, 
  X,
  Building2,
  ShieldAlert,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addCashMovementAction } from "@/actions/cash-register-actions"
import { cn } from "@/lib/utils"

interface CashMovementModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  type: "BLEEDING" | "SUPPLY" | "EXPENSE_OUT"
  currentDrawerCash: number
  accounts?: any[]
}

const TYPE_CONFIG = {
  BLEEDING: {
    title: "Sangria de Caixa (Retirada de Segurança)",
    subtitle: "Recolha o excesso de dinheiro da gaveta para o cofre ou banco",
    icon: ArrowDownLeft,
    colorClass: "bg-amber-500/10 border-amber-500/20 text-amber-600",
    btnColorClass: "bg-amber-600 hover:bg-amber-700 text-white",
    defaultReason: "Sangria de segurança para o cofre",
    requireDestination: true,
  },
  SUPPLY: {
    title: "Suprimento de Caixa (Aporte de Troco)",
    subtitle: "Entrada de dinheiro para reforçar o troco da gaveta",
    icon: PlusCircle,
    colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    btnColorClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    defaultReason: "Suprimento para troco (moedas/notas)",
    requireDestination: false,
  },
  EXPENSE_OUT: {
    title: "Despesa Rápida de Balcão (Petty Cash)",
    subtitle: "Pequenos gastos operacionais pagos diretamente com o dinheiro do caixa",
    icon: MinusCircle,
    colorClass: "bg-rose-500/10 border-rose-500/20 text-rose-600",
    btnColorClass: "bg-rose-600 hover:bg-rose-700 text-white",
    defaultReason: "Compra de material de limpeza / café",
    requireDestination: false,
  },
}

export function CashMovementModal({
  open,
  onClose,
  onSuccess,
  type,
  currentDrawerCash,
  accounts = [],
}: CashMovementModalProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.BLEEDING
  const Icon = config.icon

  const [amount, setAmount] = useState<string>("")
  const [reason, setReason] = useState<string>(config.defaultReason)
  const [destinationAccountId, setDestinationAccountId] = useState<string>("")
  const [authorizedBy, setAuthorizedBy] = useState<string>("")
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  const isExceedingCash = (type === "BLEEDING" || type === "EXPENSE_OUT") && 
    parseFloat(amount || "0") > currentDrawerCash

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numVal = parseFloat(amount.replace(",", "."))
    if (isNaN(numVal) || numVal <= 0) {
      setError("Informe um valor maior que zero para a movimentação.")
      return
    }

    if (!reason.trim()) {
      setError("Por favor, descreva o motivo da movimentação.")
      return
    }

    if (isExceedingCash) {
      setError(`O valor solicitado (R$ ${numVal.toFixed(2)}) é maior que o saldo em gaveta (R$ ${currentDrawerCash.toFixed(2)}).`)
      return
    }

    startTransition(async () => {
      const res = await addCashMovementAction({
        type,
        amount: numVal,
        reason: reason.trim(),
        destinationAccountId: destinationAccountId || undefined,
        authorizedBy: authorizedBy.trim() || undefined,
      })

      if (res.success) {
        onSuccess()
      } else {
        setError(res.error || "Falha ao registrar movimentação.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", config.colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{config.title}</h2>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Saldo Atual em Gaveta */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Saldo Físico em Gaveta:</span>
            <span className="text-sm font-extrabold text-foreground">
              R$ {currentDrawerCash.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Valor da Movimentação */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Valor da Movimentação (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="pl-10 text-lg font-bold h-12"
                required
                autoFocus
              />
            </div>
            {isExceedingCash && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Valor excede o total em dinheiro disponível na gaveta.
              </p>
            )}
          </div>

          {/* Destino da Sangria (Cofre / Banco) */}
          {type === "BLEEDING" && accounts.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Destino do Dinheiro (Conta / Cofre)
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="">Cofre Físico Geral (Sem transferência automática)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.bankName || (acc.type === "CHECKING_ACCOUNT" ? "Banco PJ" : "Carteira")})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground">
                Ao selecionar uma conta, o sistema lança automaticamente a transferência de entrada nesta conta bancária.
              </p>
            </div>
          )}

          {/* Motivo / Justificativa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Motivo / Justificativa *
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo desta movimentação..."
              rows={2}
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Autorizado por (Opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Autorizado por (Gerente / Supervisor)
            </label>
            <Input
              type="text"
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              placeholder="Ex: Carlos Gerente"
              className="text-xs h-9"
            />
          </div>

          {/* Rodapé de Ações */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || isExceedingCash}
              className={cn("text-xs h-9 font-semibold gap-1.5", config.btnColorClass)}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Icon className="w-3.5 h-3.5" />
                  Confirmar Lançamento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
