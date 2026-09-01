"use client"

import * as React from "react"
import { useState } from "react"
import {
  X,
  Check,
  DollarSign,
  AlertCircle,
  Loader2,
  Banknote,
  Building2,
  Calendar,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createProfessionalAdvanceAction } from "@/actions/commission-actions"

interface AdvanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  professionals: any[]
  defaultProfessionalId?: string
}

export function AdvanceModal({
  isOpen,
  onClose,
  onSuccess,
  professionals,
  defaultProfessionalId,
}: AdvanceModalProps) {
  const [professionalId, setProfessionalId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [source, setSource] = useState<"CASH_DRAWER" | "BANK_ACCOUNT">("CASH_DRAWER")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      setProfessionalId(defaultProfessionalId || professionals[0]?.id || "")
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
      setError(null)
    }
  }, [isOpen, defaultProfessionalId, professionals])

  if (!isOpen) return null

  const numAmount = parseFloat(amount.replace(",", ".")) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!professionalId) {
      setError("Selecione o profissional.")
      return
    }

    if (numAmount <= 0) {
      setError("Informe um valor válido maior que zero.")
      return
    }

    if (!description.trim()) {
      setError("Informe o motivo ou descrição do vale.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await createProfessionalAdvanceAction({
        professionalId,
        amount: numAmount,
        description: description.trim(),
        date,
        source,
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || "Falha ao registrar vale.")
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao registrar vale.")
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
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Lançar Vale / Adiantamento
              </h2>
              <p className="text-xs text-muted-foreground">
                Registra a saída de valor para abater no fechamento
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
          {/* Seletor de Profissional */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Profissional / Colaborador</label>
            <select
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.specialty || "Geral"})
                </option>
              ))}
            </select>
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Valor do Vale (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="R$ 50,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/50 bg-card text-sm font-black text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Data do Vale</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Origem da Saída do Dinheiro */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">De onde sai o dinheiro?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSource("CASH_DRAWER")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  source === "CASH_DRAWER"
                    ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Banknote className="h-4 w-4" />
                <span>Caixa do Balcão</span>
              </button>

              <button
                type="button"
                onClick={() => setSource("BANK_ACCOUNT")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  source === "BANK_ACCOUNT"
                    ? "bg-primary/15 border-primary text-primary ring-2 ring-primary/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Conta Bancária / PIX</span>
              </button>
            </div>
          </div>

          {/* Motivo / Descrição */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground">Motivo / Descrição</label>
            <input
              type="text"
              placeholder="Ex: Adiantamento para almoço, gasolina, material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-md gap-1.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>{loading ? "Registrando..." : `Confirmar Vale (R$ ${numAmount.toFixed(2)})`}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
