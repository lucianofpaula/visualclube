"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { Appointment, Barber, ServiceItem } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarSync, Calendar, Clock, Loader2, X, Check, Scissors, AlertTriangle } from "lucide-react"
import { rescheduleAppointmentAction } from "@/actions/agenda-actions"

interface AgendaRescheduleModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  barbers: Barber[]
  services: ServiceItem[]
  onSuccess?: () => void
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00"
]

export function AgendaRescheduleModal({
  appointment,
  isOpen,
  onClose,
  barbers,
  services,
  onSuccess,
}: AgendaRescheduleModalProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [date, setDate] = useState(appointment?.date || new Date().toISOString().split("T")[0])
  const [startTime, setStartTime] = useState(appointment?.startTime || "09:00")
  const [barberId, setBarberId] = useState(appointment?.barberId || "")

  useEffect(() => {
    if (isOpen && appointment) {
      setDate(appointment.date)
      setStartTime(appointment.startTime)
      setBarberId(appointment.barberId)
      setErrorMsg(null)
    }
  }, [isOpen, appointment])

  const isPastTime = React.useMemo(() => {
    if (!date || !startTime) return false
    try {
      const [y, m, d] = date.split("-").map(Number)
      const [h, min] = startTime.split(":").map(Number)
      const selectedDateObj = new Date(y, m - 1, d, h, min, 0, 0)
      return selectedDateObj.getTime() < Date.now()
    } catch {
      return false
    }
  }, [date, startTime])

  if (!isOpen || !appointment) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    startTransition(async () => {
      const res = await rescheduleAppointmentAction({
        appointmentId: appointment.id,
        newDate: date,
        newTime: startTime,
        professionalId: barberId,
      })

      if (!res.success) {
        setErrorMsg(res.error || "Erro ao remarcar agendamento.")
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
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <CalendarSync className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Remarcar Horário</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Cliente: <strong className="text-foreground">{appointment.customer.name}</strong>
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
          {/* Card Resumo do Agendamento Atual */}
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 text-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">
              Horário Atual
            </span>
            <div className="flex items-center justify-between font-bold">
              <span>{appointment.date}</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {appointment.services.map((s) => s.name).join(" + ")}
            </p>
          </div>

          {/* Novo Profissional */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Novo Profissional</label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.specialty || "Profissional"})
                </option>
              ))}
            </select>
          </div>

          {/* Nova Data */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Nova Data *</span>
            </label>
            <Input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-xl text-xs bg-muted/20 font-bold"
            />
          </div>

          {/* Novo Horário */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Novo Horário de Início *</span>
            </label>
            <select
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-xs font-bold font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Alerta de Horário no Passado */}
          {isPastTime && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300 animate-in fade-in">
              <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-extrabold text-foreground">
                  Atenção: Remarcação no Passado
                </p>
                <p className="text-[11px] text-muted-foreground">
                  O novo horário selecionado (<strong className="text-foreground">{date.split("-").reverse().join("/")} às {startTime}</strong>) já transcorreu.
                </p>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 pt-0.5">
                  Deseja salvar a remarcação como retroativa?
                </p>
              </div>
            </div>
          )}

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
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Remarcando...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Salvar Novo Horário</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
