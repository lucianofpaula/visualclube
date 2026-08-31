"use client"

import * as React from "react"
import { Appointment, Barber, BusinessHours, TimeBlock } from "./types"
import { cn } from "@/lib/utils"
import {
  Clock,
  Crown,
  Plus,
  Ban,
  Trash2,
  Scissors,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

interface AgendaDayViewProps {
  date: string // YYYY-MM-DD
  barbers: Barber[]
  selectedBarberId: string // "ALL" ou id do profissional
  appointments: Appointment[]
  timeBlocks?: TimeBlock[]
  businessHours: BusinessHours[]
  onSelectAppointment: (appointment: Appointment) => void
  onNewAppointmentSlot: (time: string, barberId?: string) => void
  onDeleteTimeBlock?: (timeBlockId: string) => void
}

const STATUS_STYLES: Record<
  string,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
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
    bg: "bg-zinc-500/10 dark:bg-zinc-950/40 opacity-60",
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

function generateTimeSlots(businessHours: BusinessHours[], dateString: string): string[] {
  const [y, m, d] = dateString.split("-").map(Number)
  const dateObj = new Date(y, m - 1, d, 12, 0, 0)
  const dayOfWeek = dateObj.getDay()
  const dayConfig = businessHours.find((h) => h.dayOfWeek === dayOfWeek)

  if (!dayConfig || !dayConfig.isOpen) {
    return []
  }

  const [openH, openM] = dayConfig.openTime.split(":").map(Number)
  const [closeH, closeM] = dayConfig.closeTime.split(":").map(Number)
  const interval = dayConfig.slotIntervalMinutes || 30

  const slots: string[] = []
  let currentMinutes = openH * 60 + openM
  const endMinutes = closeH * 60 + closeM

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    currentMinutes += interval
  }

  return slots
}

export function AgendaDayView({
  date,
  barbers,
  selectedBarberId,
  appointments,
  timeBlocks = [],
  businessHours,
  onSelectAppointment,
  onNewAppointmentSlot,
  onDeleteTimeBlock,
}: AgendaDayViewProps) {
  const dayAppointments = React.useMemo(() => {
    return appointments.filter((apt) => apt.date === date)
  }, [appointments, date])

  const dayTimeBlocks = React.useMemo(() => {
    return timeBlocks.filter((tb) => tb.date === date)
  }, [timeBlocks, date])

  const timeSlots = React.useMemo(() => {
    const baseSlots = generateTimeSlots(businessHours, date)
    const set = new Set(baseSlots.length > 0 ? baseSlots : [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
      "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
    ])

    dayAppointments.forEach((apt) => {
      if (apt.startTime) set.add(apt.startTime)
      if (apt.endTime) set.add(apt.endTime)
    })
    dayTimeBlocks.forEach((tb) => {
      if (tb.startTime) set.add(tb.startTime)
      if (tb.endTime) set.add(tb.endTime)
    })

    return Array.from(set).sort()
  }, [businessHours, date, dayAppointments, dayTimeBlocks])

  const isSingleBarber = selectedBarberId !== "ALL"
  const currentBarber = barbers.find((b) => b.id === selectedBarberId)
  const displayedBarbers = isSingleBarber && currentBarber ? [currentBarber] : barbers

  const isToday = React.useMemo(() => {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    return date === todayStr
  }, [date])

  const [currentRealTime, setCurrentRealTime] = React.useState<Date>(() => new Date())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRealTime(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const currentTotalMinutes = React.useMemo(() => {
    return currentRealTime.getHours() * 60 + currentRealTime.getMinutes()
  }, [currentRealTime])

  const currentTimeFormatted = React.useMemo(() => {
    const h = String(currentRealTime.getHours()).padStart(2, "0")
    const m = String(currentRealTime.getMinutes()).padStart(2, "0")
    return `${h}:${m}`
  }, [currentRealTime])

  const dayTemporalStatus = React.useMemo(() => {
    if (!isToday || timeSlots.length === 0) {
      return { isPastCloseTime: false, isBeforeOpenTime: false, activeSlot: null }
    }

    const currentMinutes = currentTotalMinutes
    const lastSlot = timeSlots[timeSlots.length - 1]
    const [lH, lM] = lastSlot.split(":").map(Number)
    const closeMinutes = lH * 60 + lM + 30

    if (currentMinutes >= closeMinutes) {
      return { isPastCloseTime: true, isBeforeOpenTime: false, activeSlot: null }
    }

    const firstSlot = timeSlots[0]
    const [fH, fM] = firstSlot.split(":").map(Number)
    const openMinutes = fH * 60 + fM

    if (currentMinutes < openMinutes) {
      return { isPastCloseTime: false, isBeforeOpenTime: true, activeSlot: timeSlots[0] }
    }

    let activeSlot = timeSlots[0]
    for (const slot of timeSlots) {
      const [h, m] = slot.split(":").map(Number)
      const slotMinutes = h * 60 + m
      if (slotMinutes <= currentMinutes) {
        activeSlot = slot
      } else {
        break
      }
    }

    return { isPastCloseTime: false, isBeforeOpenTime: false, activeSlot }
  }, [isToday, timeSlots, currentTotalMinutes])

  const targetSlotRef = React.useRef<HTMLDivElement | null>(null)

  const headerScrollRef = React.useRef<HTMLDivElement | null>(null)
  const bodyScrollRef = React.useRef<HTMLDivElement | null>(null)

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  return (
    <div className="w-full rounded-3xl border border-border/70 bg-card shadow-xs transition-all relative">
      {/* Bloco Superior Sticky: Cabeçalho Diário + Linha de Profissionais com Sombra */}
      <div className="sticky top-16 z-25 bg-card/95 backdrop-blur-md rounded-t-3xl border-b border-border shadow-md transition-shadow">
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Clock className="size-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground">
                {isSingleBarber ? `Agenda de ${currentBarber?.name}` : "Visão Geral da Grade"}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {dayAppointments.length} {dayAppointments.length === 1 ? "agendamento marcado" : "agendamentos marcados"}
              </p>
            </div>
          </div>

          {/* Legenda rápida de status */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
              <span className="size-2 rounded-full bg-emerald-500" />
              Confirmado
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              Em atendimento
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/20">
              <span className="size-2 rounded-full bg-rose-500" />
              Pausa / Bloqueio
            </span>
          </div>
        </div>

        {/* Header das Colunas (Profissionais) */}
        <div ref={headerScrollRef} className="overflow-x-hidden">
          <div
            className={cn(
              "grid bg-muted/20 text-xs font-bold",
              isSingleBarber ? "w-full" : "min-w-[760px]"
            )}
            style={{
              gridTemplateColumns: isSingleBarber
                ? "75px 1fr"
                : `80px repeat(${displayedBarbers.length}, minmax(210px, 1fr))`,
            }}
          >
            <div className="flex items-center justify-center p-3 text-muted-foreground border-r border-border/70 font-extrabold uppercase text-[11px]">
              Horário
            </div>
            {displayedBarbers.map((barber) => {
              const barberDayCount = dayAppointments.filter(
                (a) => a.barberId === barber.id && a.status !== "CANCELED"
              ).length

              return (
                <div
                  key={barber.id}
                  className="flex items-center justify-between border-r border-border/70 p-3 last:border-r-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="relative size-8 shrink-0 overflow-hidden rounded-full border flex items-center justify-center font-black text-white text-xs"
                      style={{ backgroundColor: barber.colorHex || "#10b981" }}
                    >
                      {barber.avatar || barber.avatarUrl ? (
                        <img
                          src={barber.avatar || barber.avatarUrl || ""}
                          alt={barber.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        barber.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-extrabold text-foreground truncate">{barber.name}</p>
                      <p className="text-[10px] font-normal text-muted-foreground truncate">
                        {barber.specialty || "Profissional"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {barberDayCount}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grade de Horários por Barbeiro (Linhas) */}
      <div ref={bodyScrollRef} onScroll={handleBodyScroll} className="overflow-x-auto">
        <div className={isSingleBarber ? "w-full" : "min-w-[760px]"}>
          <div className="divide-y divide-border/50">
            {timeSlots.map((slot, index) => {
              const isCurrentActiveSlot =
                slot === dayTemporalStatus.activeSlot &&
                isToday &&
                !dayTemporalStatus.isPastCloseTime

              const [slotH, slotM] = slot.split(":").map(Number)
              const slotStartMinutes = slotH * 60 + slotM
              let slotDuration = 30
              if (index < timeSlots.length - 1) {
                const [nextH, nextM] = timeSlots[index + 1].split(":").map(Number)
                slotDuration = Math.max(15, nextH * 60 + nextM - slotStartMinutes)
              }
              const elapsedMinutes = currentTotalMinutes - slotStartMinutes
              const progressRatio = Math.min(1, Math.max(0, elapsedMinutes / slotDuration))
              const progressPercentage = Math.round(progressRatio * 100)

              return (
                <div
                  key={slot}
                  ref={isCurrentActiveSlot ? targetSlotRef : undefined}
                  className={cn(
                    "grid min-h-[76px] transition-colors hover:bg-muted/10 relative",
                    isCurrentActiveSlot && "bg-indigo-500/5 dark:bg-indigo-500/10 border-l-4 border-l-indigo-500"
                  )}
                  style={{
                    gridTemplateColumns: isSingleBarber
                      ? "75px 1fr"
                      : `80px repeat(${displayedBarbers.length}, minmax(210px, 1fr))`,
                  }}
                >
                  {/* Linha Indicadora do Horário Atual */}
                  {isCurrentActiveSlot && (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-30 flex items-center transition-all duration-300 ease-linear"
                      style={{ top: `${progressPercentage}%` }}
                    >
                      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400/30 dark:from-indigo-500 dark:via-indigo-400 dark:to-indigo-400/20 shadow-xs flex items-center">
                        <div className="size-2 rounded-full bg-indigo-600 dark:bg-indigo-500 ring-2 ring-background -ml-1 shrink-0" />
                      </div>
                    </div>
                  )}

                  {/* Coluna do Horário */}
                  <div className="relative flex flex-col items-center justify-start border-r border-border/70 p-2 text-xs font-mono font-bold text-muted-foreground overflow-hidden">
                    {isCurrentActiveSlot && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/20">
                        <div
                          className="w-full bg-indigo-500 transition-all duration-300 ease-linear rounded-r-full shadow-xs"
                          style={{ height: `${progressPercentage}%` }}
                        />
                      </div>
                    )}

                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 transition-colors z-10",
                        isCurrentActiveSlot
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {slot}
                    </span>

                    {isCurrentActiveSlot && (
                      <div className="mt-1 flex flex-col items-center gap-0.5 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                          <span className="size-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                          {currentTimeFormatted}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Células para cada barbeiro naquele horário */}
                  {displayedBarbers.map((barber) => {
                    const startingApt = dayAppointments.find(
                      (a) => a.barberId === barber.id && a.startTime === slot && a.status !== "CANCELED"
                    )

                    const isMidAppointment = dayAppointments.some(
                      (a) => a.barberId === barber.id && slot > a.startTime && slot < a.endTime && a.status !== "CANCELED"
                    )

                    const startingTimeBlock = dayTimeBlocks.find(
                      (tb) =>
                        (tb.barberId === barber.id || tb.barberId === null || tb.barberId === "") &&
                        tb.startTime === slot
                    )

                    const isMidTimeBlock = dayTimeBlocks.some(
                      (tb) =>
                        (tb.barberId === barber.id || tb.barberId === null || tb.barberId === "") &&
                        slot > tb.startTime &&
                        slot < tb.endTime
                    )

                    const statusStyle = startingApt ? STATUS_STYLES[startingApt.status] || STATUS_STYLES.SCHEDULED : null

                    const aptSlotsSpan = startingApt
                      ? Math.max(
                          1,
                          timeSlots.filter(
                            (s) => s >= startingApt.startTime && s < startingApt.endTime
                          ).length
                        )
                      : 1

                    const blockSlotsSpan = startingTimeBlock
                      ? Math.max(
                          1,
                          timeSlots.filter(
                            (s) => s >= startingTimeBlock.startTime && s < startingTimeBlock.endTime
                          ).length
                        )
                      : 1

                    return (
                      <div
                        key={barber.id}
                        className="group relative border-r border-border/70 p-1.5 last:border-r-0"
                      >
                        {startingApt ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectAppointment(startingApt)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                onSelectAppointment(startingApt)
                              }
                            }}
                            style={{
                              height: `calc(${aptSlotsSpan * 100}% + ${(aptSlotsSpan - 1) * 1}px - 12px)`,
                              minHeight: `${aptSlotsSpan * 76 - 12}px`,
                            }}
                            className={cn(
                              "absolute inset-x-1.5 top-1.5 z-20 flex cursor-pointer flex-col justify-between rounded-2xl border p-2.5 shadow-xs transition-all duration-150 hover:scale-[1.005] hover:shadow-lg hover:z-30 overflow-hidden",
                              statusStyle?.bg,
                              statusStyle?.border
                            )}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={cn("size-2 shrink-0 rounded-full", statusStyle?.dot)} />
                                  <span className="truncate text-xs font-black text-foreground">
                                    {startingApt.customer.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-bold font-mono text-foreground border border-border/40">
                                    {startingApt.startTime} - {startingApt.endTime}
                                  </span>
                                </div>
                              </div>

                              {/* Detalhes do Serviço */}
                              <div className="my-1.5 flex flex-wrap items-center gap-1">
                                {startingApt.customer.isClubMember && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                    <Crown className="size-2.5 text-amber-500" />
                                    Clube VIP
                                  </span>
                                )}
                                <span className="text-[11px] text-muted-foreground line-clamp-2 font-medium">
                                  {startingApt.services.map((s) => s.name).join(" + ")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/40 pt-1 text-[11px] font-mono">
                              <span className="font-bold text-foreground">
                                R$ {startingApt.totalPrice.toFixed(2).replace(".", ",")}
                              </span>
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-tight",
                                  statusStyle?.text
                                )}
                              >
                                {statusStyle?.label}
                              </span>
                            </div>
                          </div>
                        ) : isMidAppointment ? (
                          <div className="h-full w-full pointer-events-none" />
                        ) : startingTimeBlock ? (
                          <div
                            style={{
                              height: `calc(${blockSlotsSpan * 100}% + ${(blockSlotsSpan - 1) * 1}px - 12px)`,
                              minHeight: `${blockSlotsSpan * 76 - 12}px`,
                            }}
                            className="absolute inset-x-1.5 top-1.5 z-15 flex flex-col justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs dark:bg-rose-950/30 overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold min-w-0">
                                <Ban className="size-3.5 shrink-0 text-rose-500" />
                                <span className="truncate text-[11px]">
                                  {startingTimeBlock.reason}
                                </span>
                              </div>
                              {onDeleteTimeBlock && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteTimeBlock(startingTimeBlock.id)}
                                  className="text-muted-foreground hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                                  title="Remover bloqueio"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono font-bold mt-1">
                              {startingTimeBlock.startTime} às {startingTimeBlock.endTime}
                            </span>
                          </div>
                        ) : isMidTimeBlock ? (
                          <div className="h-full w-full pointer-events-none" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => onNewAppointmentSlot(slot, barber.id)}
                            className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-transparent text-muted-foreground/40 opacity-0 transition-all duration-150 group-hover:border-border/80 group-hover:bg-accent/40 group-hover:opacity-100 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-1 text-xs font-bold">
                              <Plus className="size-3.5" />
                              Agendar {slot}
                            </span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
