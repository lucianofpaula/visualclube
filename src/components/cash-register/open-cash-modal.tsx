"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  Unlock, 
  DollarSign, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { openCashSessionAction } from "@/actions/cash-register-actions"

interface OpenCashModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  accounts?: any[]
}

const BILL_VALUES = [100, 50, 20, 10, 5, 2]
const COIN_VALUES = [1, 0.5, 0.25, 0.1, 0.05]

export function OpenCashModal({
  open,
  onClose,
  onSuccess,
  accounts = [],
}: OpenCashModalProps) {
  const [initialBalance, setInitialBalance] = useState<string>("100.00")
  const [notes, setNotes] = useState<string>("")
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || "")
  const [showDenominationCalc, setShowDenominationCalc] = useState<boolean>(false)
  const [counts, setCounts] = useState<Record<string, number>>({})
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  // Atualiza o total ao usar a calculadora de cédulas
  const handleCountChange = (valStr: string, qty: number) => {
    const nextCounts = { ...counts, [valStr]: Math.max(0, qty) }
    setCounts(nextCounts)

    let total = 0
    Object.entries(nextCounts).forEach(([v, q]) => {
      total += parseFloat(v) * (q || 0)
    })
    setInitialBalance(total.toFixed(2))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numVal = parseFloat(initialBalance.replace(",", "."))
    if (isNaN(numVal) || numVal < 0) {
      setError("Informe um valor válido para o fundo de troco inicial.")
      return
    }

    startTransition(async () => {
      const res = await openCashSessionAction({
        initialBalance: numVal,
        financialAccountId: selectedAccountId || undefined,
        notes: notes.trim() || undefined,
      })

      if (res.success) {
        onSuccess()
      } else {
        setError(res.error || "Falha ao abrir caixa.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Abertura de Caixa</h2>
              <p className="text-xs text-muted-foreground">Inicie o turno informando o fundo de troco na gaveta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll se necessário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Valor do Fundo de Troco */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Fundo de Troco Inicial (R$) *
              </label>
              <button
                type="button"
                onClick={() => setShowDenominationCalc(!showDenominationCalc)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Calculator className="w-3.5 h-3.5" />
                {showDenominationCalc ? "Ocultar Contagem" : "Contador de Notas & Moedas"}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0,00"
                className="pl-10 text-lg font-bold h-12 text-emerald-600 dark:text-emerald-400"
                required
              />
            </div>
          </div>

          {/* Calculadora Rápida de Notas e Moedas */}
          {showDenominationCalc && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-3 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span>Contagem de Cédulas e Moedas Físicas</span>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BILL_VALUES.map((bill) => (
                  <div key={bill} className="space-y-1 text-center">
                    <span className="text-[10px] font-semibold text-muted-foreground block">
                      R$ {bill}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={counts[bill.toString()] || ""}
                      onChange={(e) => handleCountChange(bill.toString(), parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8 text-xs text-center p-1"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 border-t border-border/40">
                {COIN_VALUES.map((coin) => (
                  <div key={coin} className="space-y-1 text-center">
                    <span className="text-[10px] font-semibold text-muted-foreground block">
                      R$ {coin.toFixed(2)}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={counts[coin.toString()] || ""}
                      onChange={(e) => handleCountChange(coin.toString(), parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8 text-xs text-center p-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de Conta / Caixa Físico (Opcional) */}
          {accounts.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Vincular à Conta / Gaveta
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="">Nenhum vínculo específico (Caixa Geral)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type === "CASH_DRAWER" ? "Gaveta Balcão" : "Conta Bancária"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Observações de Abertura */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Observações do Turno (Opcional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Turno da manhã, recebi R$ 50 em notas de 5 e 10..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Botões do Rodapé */}
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
              disabled={isPending}
              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Abrindo...
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  Confirmar Abertura
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
