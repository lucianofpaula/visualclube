"use client"

import * as React from "react"
import { useState } from "react"
import { AlertTriangle, Trash2, X, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteClubPlan } from "@/actions/club-actions"

interface DeletePlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: any | null
  onDeleted: (planId: string) => void
}

export function DeletePlanModal({
  open,
  onOpenChange,
  plan,
  onDeleted,
}: DeletePlanModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!open || !plan) return null

  const handleConfirmDelete = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await deleteClubPlan(plan.id)
      if (res.success) {
        onDeleted(plan.id)
        onOpenChange(false)
      } else {
        setErrorMessage(res.error || "Falha ao excluir o plano.")
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro de conexão ao excluir plano.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-black text-foreground">
              Excluir Plano de Assinatura?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você está prestes a excluir o plano{" "}
              <strong className="text-foreground font-bold">{plan.name}</strong> (
              R$ {Number(plan.priceMonthly).toFixed(2)}/mês).
            </p>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Arquivamento Seguro (Soft Delete)</span>
            </div>
            <p className="leading-snug">
              O plano será ocultado do catálogo público, mas todo o histórico de assinantes anteriores, comissões pagas e registros financeiros continuarão 100% preservados no banco de dados.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-xs h-9 font-semibold rounded-xl"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={loading}
            className="text-xs h-9 font-bold bg-destructive text-destructive-foreground rounded-xl shadow-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            {loading ? "Excluindo..." : "Sim, Excluir Plano"}
          </Button>
        </div>
      </div>
    </div>
  )
}
