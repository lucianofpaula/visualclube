"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { Barber } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Ban, Calendar, Clock, Loader2, X, Check } from "lucide-react"
import { createTimeBlockAction } from "@/actions/agenda-actions"

interface AgendaBlockModalProps {
  isOpen: boolean
  onClose: () => void
  barbers: Barber[]
  defaultDate?: string
  defaultBarberId?: string
  onSuccess?: () => void
}

const COMMON_REASONS = [
  "Almoço / Refeição",
  "Pausa / Intervalo",
  "Folga Programada",
  "Consulta / Médico",
  "Reunião de Equipe",
  "Manutenção do Espaço",
]

export function AgendaBlockModal({
  isOpen,
  onClose,
  barbers,
  defaultDate,
  defaultBarberId,
  onSuccess,
}: AgendaBlockModalProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0])
  const [startTime, setStartTime] = useState("12:00")
  const [endTime, setEndTime] = useState("13:00")
  const [barberId, setBarberId] = useState(defaultBarberId || "")
  const [reason, setReason] = useState("Almoço / Refeição")

  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate || new Date().toISOString().split("T")[0])
      setStartTime("12:00")
      setEndTime("13:00")
      setBarberId(defaultBarberId !== "ALL" && defaultBarberId ? defaultBarberId : "")
      setReason("Almoço / Refeição")
      setErrorMsg(null)
    }
  }, [isOpen, defaultDate, defaultBarberId])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (startTime >= endTime) {
      setErrorMsg("O horário de término deve ser posterior ao horário de início.")
      return
    }

    startTransition(async () => {
      const res = await createTimeBlockAction({
        professionalId: barberId || null,
        date,
        startTime,
        endTime,
        reason,
      })

      if (!res.success) {
        setErrorMsg(res.error || "Erro ao salvar bloqueio.")
        return
      }

      if (onSuccess) onSuccess()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-md rounded-3xl bg-background border border-border/80 p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Bloquear Horário / Pausa</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Reserve intervalos ou folgas na grade da equipe.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profissional */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Profissional Afetado</label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Toda a Equipe (Bloqueio Geral do Espaço)</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.specialty || "Profissional"})
                </option>
              ))}
            </select>
          </div>

          {/* Motivo do Bloqueio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Motivo do Bloqueio *</label>
            <Input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 rounded-xl text-xs bg-muted/20 font-medium"
              placeholder="Ex: Almoço, Folga, Médico..."
            />
            {/* Sugestões rápidas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="px-2 py-0.5 rounded-lg bg-muted/40 hover:bg-rose-500/10 hover:text-rose-600 border border-border/50 text-[10px] font-bold text-muted-foreground transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Data do Bloqueio *</span>
            </label>
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-xl text-xs bg-muted/20 font-bold"
            />
          </div>

          {/* Horário Início & Fim */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Horário Início *</span>
              </label>
              <Input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 rounded-xl text-xs font-mono font-bold bg-muted/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Horário Término *</span>
              </label>
              <Input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 rounded-xl text-xs font-mono font-bold bg-muted/20"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="text-xs font-bold h-10 px-4 rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Bloquear Horário</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
