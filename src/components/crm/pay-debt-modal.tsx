"use client"

import * as React from "react"
import { useState } from "react"
import {
  X,
  Check,
  Banknote,
  QrCode,
  CreditCard,
  DollarSign,
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { payCustomerDebtAction } from "@/actions/debt-actions"

interface PayDebtModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  debt: any | null
}

export function PayDebtModal({ isOpen, onClose, onSuccess, debt }: PayDebtModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD">("PIX")
  const [notes, setNotes] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (debt) {
      setAmountPaid(String(debt.remainingAmount || debt.totalAmount || 0))
      setError(null)
      setNotes("")
    }
  }, [debt, isOpen])

  if (!isOpen || !debt) return null

  const remaining = Number(debt.remainingAmount || 0)
  const numPaid = parseFloat(amountPaid.replace(",", ".")) || 0
  const isFullPayment = numPaid >= remaining
  const balanceAfter = Math.max(0, Math.round((remaining - numPaid) * 100) / 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (numPaid <= 0) {
      setError("Informe um valor válido maior que zero.")
      return
    }

    if (numPaid > remaining) {
      setError(`O valor máximo para quitação é R$ ${remaining.toFixed(2)}.`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await payCustomerDebtAction({
        debtId: debt.id,
        amountPaid: numPaid,
        paymentMethod,
        notes: notes.trim() || undefined,
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || "Falha ao processar pagamento.")
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao registrar quitação.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Receber / Quitar Conta Cliente
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {debt.client?.name || "Cliente"} • {debt.description}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card com Detalhes do Débito */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Valor Total Original:</span>
              <span className="font-bold text-foreground">R$ {Number(debt.totalAmount).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Já Pago / Amortizado:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                R$ {Number(debt.paidAmount || 0).toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-1.5 border-t border-border/50">
              <span className="text-foreground">Saldo Devedor Atual:</span>
              <span className="text-amber-600 dark:text-amber-400">
                R$ {remaining.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          {/* Valor a Receber Agora */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Valor a Receber (R$)</label>
              <button
                type="button"
                onClick={() => setAmountPaid(String(remaining))}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Quitar Total (R$ {remaining.toFixed(2)})
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              max={remaining}
              min="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/50 bg-card text-base font-black text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />

            {numPaid > 0 && numPaid < remaining && (
              <p className="text-[11px] text-muted-foreground">
                Pagamento parcial. Saldo restante após este recebimento:{" "}
                <b className="text-foreground">R$ {balanceAfter.toFixed(2)}</b>
              </p>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Forma de Recebimento</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("PIX")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "PIX"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "CASH"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Banknote className="h-4 w-4" />
                <span>Dinheiro (Gaveta)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "CREDIT_CARD"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Cartão Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("DEBIT_CARD")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "DEBIT_CARD"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Cartão Débito</span>
              </button>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground">Observação (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Pagou metade via PIX..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Botões */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9 rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-md gap-1.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>{loading ? "Recebendo..." : `Confirmar Recebimento (R$ ${numPaid.toFixed(2)})`}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
