"use client"

import * as React from "react"
import Link from "next/link"
import { Appointment, Barber } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Crown,
  Scissors,
  User,
  CheckCircle2,
  Play,
  XCircle,
  FileText,
  ClipboardList,
  CalendarSync,
  Phone,
  X,
  MessageSquare,
} from "lucide-react"
import { updateAppointmentStatusAction } from "@/actions/agenda-actions"

interface AgendaDetailsModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  barbers: Barber[]
  onStatusUpdated?: () => void
  onOpenReschedule?: (appointment: Appointment) => void
}

const STATUS_STYLES: Record<string, { label: string; bg: string; border: string; text: string; dot: string }> = {
  SCHEDULED: {
    label: "Agendado",
    bg: "bg-blue-500/10 dark:bg-blue-950/40",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  CONFIRMED: {
    label: "Confirmado",
    bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
    border: "border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  IN_PROGRESS: {
    label: "Em Atendimento",
    bg: "bg-amber-500/15 dark:bg-amber-950/40",
    border: "border-amber-500/40",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500 animate-pulse",
  },
  COMPLETED: {
    label: "Concluído",
    bg: "bg-purple-500/10 dark:bg-purple-950/40",
    border: "border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  CANCELED: {
    label: "Cancelado",
    bg: "bg-zinc-500/10 dark:bg-zinc-950/40",
    border: "border-zinc-500/30",
    text: "text-zinc-500",
    dot: "bg-zinc-400",
  },
  NO_SHOW: {
    label: "Não Compareceu",
    bg: "bg-rose-500/10 dark:bg-rose-950/40",
    border: "border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
}

export function AgendaDetailsModal({
  appointment,
  isOpen,
  onClose,
  barbers,
  onStatusUpdated,
  onOpenReschedule,
}: AgendaDetailsModalProps) {
  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  if (!isOpen || !appointment) return null

  const barber = barbers.find((b) => b.id === appointment.barberId)
  const statusStyle = STATUS_STYLES[appointment.status] || STATUS_STYLES.SCHEDULED

  const cleanPhone = appointment.customer.phone.replace(/\D/g, "")
  const whatsappMessage = encodeURIComponent(
    `Olá ${appointment.customer.name}! Passando para confirmar seu horário no dia ${appointment.date} às ${appointment.startTime} com ${barber?.name || "o profissional"}. Qualquer dúvida estamos à disposição!`
  )
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${whatsappMessage}`

  const handleUpdateStatus = (newStatus: any) => {
    setError(null)
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        appointmentId: appointment.id,
        status: newStatus,
      })

      if (!result.success) {
        setError(result.error || "Erro ao atualizar status.")
      } else {
        onClose()
        if (onStatusUpdated) onStatusUpdated()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-3xl bg-background border border-border/80 p-0 shadow-2xl overflow-hidden my-8">
        {/* Top Header com Status */}
        <div className={cn("p-5 border-b border-border/60", statusStyle.bg)}>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide border shadow-2xs",
                statusStyle.bg,
                statusStyle.text,
                statusStyle.border
              )}
            >
              <span className={cn("size-2 rounded-full", statusStyle.dot)} />
              {statusStyle.label}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:bg-background/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3">
            <h3 className="text-xl font-black text-foreground">{appointment.customer.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mt-1">
              <Calendar className="size-3.5" />
              <span>{appointment.date}</span>
              <span>•</span>
              <Clock className="size-3.5" />
              <span className="font-mono">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-2xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive font-bold">
            {error}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Card do Cliente & WhatsApp */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 font-bold border border-indigo-500/20">
                <User className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-foreground">
                    {appointment.customer.name}
                  </span>
                  {appointment.customer.isClubMember && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      <Crown className="size-3 text-amber-500" />
                      Clube VIP
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {appointment.customer.phone || "Sem telefone informado"}
                </p>
              </div>
            </div>

            {cleanPhone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold"
                title="Conversar no WhatsApp"
              >
                <MessageSquare className="size-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          {/* Profissional Responsável & Comanda Vinculada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-border bg-muted/20 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="relative size-9 overflow-hidden rounded-xl border flex items-center justify-center font-black text-white text-xs shrink-0"
                  style={{ backgroundColor: barber?.colorHex || "#10b981" }}
                >
                  {barber?.avatar || barber?.avatarUrl ? (
                    <img
                      src={barber.avatar || barber.avatarUrl || ""}
                      alt={barber.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    barber?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground truncate">
                    Profissional
                  </p>
                  <p className="text-xs font-black text-foreground truncate">
                    {barber?.name || "Não atribuído"}
                  </p>
                </div>
              </div>
            </div>

            {appointment.comandaId ? (
              <Link
                href={`/app/comandas`}
                className="group flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-3 text-xs transition-all hover:bg-indigo-500/10"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ClipboardList className="size-4 text-indigo-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
                      Ver Comanda
                    </p>
                    <p className="text-[10px] text-muted-foreground">Adicionar produtos / fechar</p>
                  </div>
                </div>
                <span className="font-black text-xs text-foreground group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ClipboardList className="size-4 opacity-50" />
                <span className="text-[11px]">Sem comanda aberta</span>
              </div>
            )}
          </div>

          {/* Serviços Selecionados */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Serviços do Atendimento
            </span>
            <div className="mt-2 divide-y divide-border/60 rounded-2xl border border-border bg-card overflow-hidden">
              {appointment.services.map((srv) => (
                <div key={srv.id} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Scissors className="size-3.5 text-indigo-500" />
                    <span className="font-bold text-foreground">{srv.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      ({srv.durationMinutes} min)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    R$ {srv.price.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-muted/30 p-3 text-xs font-black">
                <span>Total Estimado</span>
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                  R$ {appointment.totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {appointment.notes && (
            <div className="rounded-2xl border border-border/80 bg-accent/20 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <FileText className="size-3.5 text-indigo-500" />
                <span>Observações do Agendamento:</span>
              </div>
              <p className="mt-1 text-xs text-foreground italic">
                &ldquo;{appointment.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Ações de Transição de Status */}
          <div className="pt-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Ações Rápidas do Atendimento
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {appointment.status !== "COMPLETED" && appointment.status !== "CANCELED" && onOpenReschedule && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  className="border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 cursor-pointer rounded-xl font-bold text-xs"
                  onClick={() => {
                    onClose()
                    onOpenReschedule(appointment)
                  }}
                >
                  <CalendarSync className="size-3.5 mr-1" />
                  Remarcar
                </Button>
              )}

              {appointment.status !== "IN_PROGRESS" && appointment.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 cursor-pointer rounded-xl font-bold text-xs"
                  onClick={() => handleUpdateStatus("IN_PROGRESS")}
                >
                  <Play className="size-3.5 mr-1" />
                  Iniciar
                </Button>
              )}

              {appointment.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs"
                  onClick={() => handleUpdateStatus("COMPLETED")}
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  Concluir
                </Button>
              )}

              {appointment.status !== "CONFIRMED" && appointment.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 rounded-xl font-bold text-xs"
                  onClick={() => handleUpdateStatus("CONFIRMED")}
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  Confirmar
                </Button>
              )}

              {appointment.status !== "CANCELED" && appointment.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 rounded-xl font-bold text-xs"
                  onClick={() => handleUpdateStatus("CANCELED")}
                >
                  <XCircle className="size-3.5 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
