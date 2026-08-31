"use client"

import * as React from "react"
import { Appointment, Barber, BusinessHours, TimeBlock } from "./types"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  Crown,
  Ban,
  Plus,
  Trash2,
  Scissors,
} from "lucide-react"

interface AgendaWeekViewProps {
  currentDate: string // YYYY-MM-DD
  barbers: Barber[]
  selectedBarberId: string // "ALL" ou id do profissional
  appointments: Appointment[]
  timeBlocks?: TimeBlock[]
  businessHours: BusinessHours[]
  onSelectAppointment: (appointment: Appointment) => void
  onSelectDay: (date: string) => void
  onNewAppointmentSlot: (time: string, barberId?: string, date?: string) => void
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

// Gera os 7 dias da semana (Segunda a Domingo)
function getWeekDays(referenceDateStr: string) {
  const [y, m, d] = referenceDateStr.split("-").map(Number)
  const ref = new Date(y, m - 1, d, 12, 0, 0)
  const currentDayOfWeek = ref.getDay() // 0 = Dom, 1 = Seg...
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek

  const monday = new Date(ref)
  monday.setDate(ref.getDate() + mondayOffset)

  const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
  const dayShortNames = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  const days = []
  for (let i = 0; i < 7; i++) {
    const dObj = new Date(monday)
    dObj.setDate(monday.getDate() + i)
    const dateStr = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, "0")}-${String(dObj.getDate()).padStart(2, "0")}`
    const dayOfWeek = dObj.getDay()

    days.push({
      dateStr,
      dayName: dayNames[i],
      dayShortName: dayShortNames[i],
      dayNumber: dObj.getDate(),
      isToday: dateStr === todayStr,
      dayOfWeek,
    })
  }

  return days
}

// Gera os slots de tempo cobrindo todos os dias da semana e agendamentos existentes
function generateWeeklyTimeSlots(
  businessHours: BusinessHours[],
  appointments: Appointment[],
  timeBlocks: TimeBlock[]
): string[] {
  let minOpenMinutes = 8 * 60 // fallback 08:00
  let maxCloseMinutes = 20 * 60 // fallback 20:00
  let interval = 30

  const openDays = businessHours.filter((h) => h.isOpen)
  if (openDays.length > 0) {
    let foundMin = 24 * 60
    let foundMax = 0
    for (const d of openDays) {
      if (d.openTime) {
        const [h, m] = d.openTime.split(":").map(Number)
        foundMin = Math.min(foundMin, h * 60 + m)
      }
      if (d.closeTime) {
        const [h, m] = d.closeTime.split(":").map(Number)
        foundMax = Math.max(foundMax, h * 60 + m)
      }
      if (d.slotIntervalMinutes) {
        interval = d.slotIntervalMinutes
      }
    }
    if (foundMin < 24 * 60) minOpenMinutes = foundMin
    if (foundMax > 0) maxCloseMinutes = foundMax
  }

  for (const apt of appointments) {
    if (apt.startTime) {
      const [h, m] = apt.startTime.split(":").map(Number)
      minOpenMinutes = Math.min(minOpenMinutes, h * 60 + m)
      maxCloseMinutes = Math.max(maxCloseMinutes, h * 60 + m)
    }
    if (apt.endTime) {
      const [h, m] = apt.endTime.split(":").map(Number)
      maxCloseMinutes = Math.max(maxCloseMinutes, h * 60 + m)
    }
  }

  for (const tb of timeBlocks) {
    if (tb.startTime) {
      const [h, m] = tb.startTime.split(":").map(Number)
      minOpenMinutes = Math.min(minOpenMinutes, h * 60 + m)
      maxCloseMinutes = Math.max(maxCloseMinutes, h * 60 + m)
    }
    if (tb.endTime) {
      const [h, m] = tb.endTime.split(":").map(Number)
      maxCloseMinutes = Math.max(maxCloseMinutes, h * 60 + m)
    }
  }

  const set = new Set<string>()
  let currentMinutes = minOpenMinutes
  while (currentMinutes <= maxCloseMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    set.add(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    currentMinutes += interval
  }

  for (const apt of appointments) {
    if (apt.startTime) set.add(apt.startTime)
    if (apt.endTime) set.add(apt.endTime)
  }

  for (const tb of timeBlocks) {
    if (tb.startTime) set.add(tb.startTime)
    if (tb.endTime) set.add(tb.endTime)
  }

  return Array.from(set).sort()
}

export function AgendaWeekView({
  currentDate,
  barbers,
  selectedBarberId,
  appointments,
  timeBlocks = [],
  businessHours,
  onSelectAppointment,
  onSelectDay,
  onNewAppointmentSlot,
  onDeleteTimeBlock,
}: AgendaWeekViewProps) {
  const weekDays = React.useMemo(() => getWeekDays(currentDate), [currentDate])

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

  const filteredAppointments = React.useMemo(() => {
    if (selectedBarberId === "ALL") {
      return appointments
    }
    return appointments.filter((apt) => apt.barberId === selectedBarberId)
  }, [appointments, selectedBarberId])

  const filteredTimeBlocks = React.useMemo(() => {
    if (selectedBarberId === "ALL") {
      return timeBlocks
    }
    return timeBlocks.filter(
      (tb) => tb.barberId === selectedBarberId || tb.barberId === null || tb.barberId === ""
    )
  }, [timeBlocks, selectedBarberId])

  const timeSlots = React.useMemo(() => {
    return generateWeeklyTimeSlots(businessHours, filteredAppointments, filteredTimeBlocks)
  }, [businessHours, filteredAppointments, filteredTimeBlocks])

  const activeSlotForToday = React.useMemo(() => {
    if (timeSlots.length === 0) return null
    let active = timeSlots[0]
    for (const slot of timeSlots) {
      const [h, m] = slot.split(":").map(Number)
      const slotMinutes = h * 60 + m
      if (slotMinutes <= currentTotalMinutes) {
        active = slot
      } else {
        break
      }
    }
    return active
  }, [timeSlots, currentTotalMinutes])

  const targetSlotRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const hasToday = weekDays.some((d) => d.isToday)
    if (hasToday && targetSlotRef.current) {
      const timer = setTimeout(() => {
        targetSlotRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentDate, weekDays])

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId)
  const headerScrollRef = React.useRef<HTMLDivElement | null>(null)
  const bodyScrollRef = React.useRef<HTMLDivElement | null>(null)

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  return (
    <div className="w-full rounded-3xl border border-border/70 bg-card shadow-xs transition-all relative">
      {/* ─────────────────────────────────────────────────────────────
          BLOCO SUPERIOR STICKY: CABEÇALHO + DIAS DA SEMANA COM SOMBRA
      ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-25 bg-card/95 backdrop-blur-md rounded-t-3xl border-b border-border shadow-md transition-shadow">
        {/* 1. Cabeçalho Geral da Semana */}
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground">
                {selectedBarberId === "ALL" ? "Grade Semanal da Equipe" : `Semana de ${selectedBarber?.name}`}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? "agendamento marcado" : "agendamentos marcados"} no total da semana
              </p>
            </div>
          </div>

          {/* Legenda rápida */}
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
              Bloqueio / Pausa
            </span>
          </div>
        </div>

        {/* 2. Header das Colunas (Horário + 7 Dias da Semana) */}
        <div ref={headerScrollRef} className="overflow-x-hidden">
          <div
            className="grid min-w-[1020px] bg-muted/20 text-xs font-bold"
            style={{
              gridTemplateColumns: "75px repeat(7, minmax(135px, 1fr))",
            }}
          >
            {/* Coluna fixa do Horário */}
            <div className="flex flex-col items-center justify-center p-3 text-muted-foreground border-r border-border/70 font-extrabold uppercase text-[11px]">
              <Clock className="size-4 mb-0.5 text-muted-foreground/70" />
              <span>Horário</span>
            </div>

            {/* Cabeçalhos dos 7 Dias da Semana */}
            {weekDays.map((day) => {
              const dayApts = filteredAppointments.filter(
                (a) => a.date === day.dateStr && a.status !== "CANCELED"
              )
              const totalRevenue = dayApts.reduce((acc, curr) => acc + curr.totalPrice, 0)
              const dayConfig = businessHours.find((h) => h.dayOfWeek === day.dayOfWeek)
              const isClosed = dayConfig && !dayConfig.isOpen

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => onSelectDay(day.dateStr)}
                  className={cn(
                    "group flex flex-col items-center justify-between border-r border-border/70 p-2.5 last:border-r-0 transition-colors hover:bg-accent/60 cursor-pointer text-left",
                    day.isToday && "bg-indigo-500/10 dark:bg-indigo-500/15"
                  )}
                  title={`Abrir grade diária de ${day.dayName}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "text-[11px] font-black uppercase tracking-wider",
                        day.isToday
                          ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {day.dayShortName}
                    </span>

                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-black transition-transform group-hover:scale-110",
                        day.isToday
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xs"
                          : "text-foreground"
                      )}
                    >
                      {day.dayNumber}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between w-full text-[10px]">
                    <span className="text-muted-foreground font-semibold truncate">
                      {isClosed ? "Fechado" : `${dayApts.length} agend.`}
                    </span>
                    {totalRevenue > 0 && (
                      <span className="font-bold text-foreground truncate font-mono">
                        R$ {totalRevenue.toFixed(0)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          GRADE SEMANAL COM LINHAS DE HORÁRIOS
      ───────────────────────────────────────────────────────────── */}
      <div ref={bodyScrollRef} onScroll={handleBodyScroll} className="overflow-x-auto">
        <div className="min-w-[1020px]">
          <div className="divide-y divide-border/50">
            {timeSlots.map((slot, index) => {
              const isCurrentActiveSlot = slot === activeSlotForToday

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
                    isCurrentActiveSlot && "bg-indigo-500/5 dark:bg-indigo-500/10"
                  )}
                  style={{
                    gridTemplateColumns: "75px repeat(7, minmax(135px, 1fr))",
                  }}
                >
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[8.5px] font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                          <span className="size-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                          {currentTimeFormatted}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 7 Células para os dias da semana naquele horário */}
                  {weekDays.map((day) => {
                    const dayConfig = businessHours.find((h) => h.dayOfWeek === day.dayOfWeek)
                    const isClosed = dayConfig && !dayConfig.isOpen

                    const startingApt = filteredAppointments.find(
                      (a) => a.date === day.dateStr && a.startTime === slot && a.status !== "CANCELED"
                    )

                    const isMidAppointment = filteredAppointments.some(
                      (a) => a.date === day.dateStr && slot > a.startTime && slot < a.endTime && a.status !== "CANCELED"
                    )

                    const startingTimeBlock = filteredTimeBlocks.find(
                      (tb) => tb.date === day.dateStr && tb.startTime === slot
                    )

                    const isMidTimeBlock = filteredTimeBlocks.some(
                      (tb) => tb.date === day.dateStr && slot > tb.startTime && slot < tb.endTime
                    )

                    const statusStyle = startingApt ? STATUS_STYLES[startingApt.status] || STATUS_STYLES.SCHEDULED : null
                    const barber = startingApt ? barbers.find((b) => b.id === startingApt.barberId) : null

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
                        key={day.dateStr}
                        className={cn(
                          "group relative border-r border-border/70 p-1 last:border-r-0",
                          day.isToday && "bg-indigo-500/5 dark:bg-indigo-500/10",
                          isClosed && "bg-muted/30"
                        )}
                      >
                        {/* Linha Viva do Horário Atual apenas na coluna de Hoje */}
                        {day.isToday && isCurrentActiveSlot && (
                          <div
                            className="pointer-events-none absolute left-0 right-0 z-30 flex items-center transition-all duration-300 ease-linear"
                            style={{ top: `${progressPercentage}%` }}
                          >
                            <div className="h-[2px] w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400/40 dark:from-indigo-500 dark:via-indigo-400 dark:to-indigo-400/30 shadow-xs flex items-center">
                              <div className="size-1.5 rounded-full bg-indigo-600 dark:bg-indigo-500 ring-2 ring-background -ml-0.5 shrink-0" />
                            </div>
                          </div>
                        )}

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
                              height: `calc(${aptSlotsSpan * 100}% + ${(aptSlotsSpan - 1) * 1}px - 8px)`,
                              minHeight: `${aptSlotsSpan * 76 - 8}px`,
                            }}
                            className={cn(
                              "absolute inset-x-1 top-1 z-20 flex cursor-pointer flex-col justify-between rounded-xl border p-2 shadow-xs transition-all duration-150 hover:scale-[1.01] hover:shadow-lg hover:z-30 overflow-hidden text-left",
                              statusStyle?.bg,
                              statusStyle?.border
                            )}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span className={cn("size-1.5 shrink-0 rounded-full", statusStyle?.dot)} />
                                  <span className="truncate text-xs font-bold text-foreground">
                                    {startingApt.customer.name}
                                  </span>
                                </div>

                                <span className="shrink-0 rounded bg-background/80 px-1 py-0.2 text-[9.5px] font-bold font-mono text-foreground border border-border/40">
                                  {startingApt.startTime}
                                </span>
                              </div>

                              {/* Serviço & VIP */}
                              <div className="my-1 flex flex-wrap items-center gap-1">
                                {startingApt.customer.isClubMember && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                                    <Crown className="size-2 text-amber-500" />
                                    VIP
                                  </span>
                                )}
                                <span className="text-[10.5px] text-muted-foreground line-clamp-1 font-medium">
                                  {startingApt.services.map((s) => s.name).join(" + ")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/40 pt-1 text-[10px]">
                              {selectedBarberId === "ALL" && barber ? (
                                <div className="flex items-center gap-1 truncate max-w-[65px]">
                                  <div
                                    className="relative size-3.5 shrink-0 overflow-hidden rounded-full border flex items-center justify-center font-bold text-[7px] text-white"
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
                                  <span className="truncate text-[9.5px] font-medium text-muted-foreground">
                                    {barber.name.split(" ")[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold text-foreground font-mono">
                                  R$ {startingApt.totalPrice.toFixed(2).replace(".", ",")}
                                </span>
                              )}

                              <span
                                className={cn(
                                  "rounded px-1 py-0.2 text-[8.5px] font-bold uppercase tracking-tight",
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
                              height: `calc(${blockSlotsSpan * 100}% + ${(blockSlotsSpan - 1) * 1}px - 8px)`,
                              minHeight: `${blockSlotsSpan * 76 - 8}px`,
                            }}
                            className="absolute inset-x-1 top-1 z-15 flex flex-col justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-1.5 text-xs dark:bg-rose-950/30 overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 text-rose-700 dark:text-rose-300 font-bold min-w-0">
                                <Ban className="size-3 shrink-0 text-rose-500" />
                                <span className="truncate text-[10px]">
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
                                  <Trash2 className="size-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono font-bold mt-0.5">
                              {startingTimeBlock.startTime} às {startingTimeBlock.endTime}
                            </span>
                          </div>
                        ) : isMidTimeBlock ? (
                          <div className="h-full w-full pointer-events-none" />
                        ) : isClosed ? (
                          <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border/20 bg-muted/10 text-[9.5px] text-muted-foreground/30 select-none">
                            <span>—</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onNewAppointmentSlot(
                                slot,
                                selectedBarberId !== "ALL" ? selectedBarberId : undefined,
                                day.dateStr
                              )
                            }
                            className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-transparent text-muted-foreground/40 opacity-0 transition-all duration-150 group-hover:border-border/80 group-hover:bg-accent/40 group-hover:opacity-100 hover:border-indigo-400 hover:text-indigo-500 hover:shadow-xs cursor-pointer"
                          >
                            <span className="flex items-center gap-1 text-[11px] font-bold">
                              <Plus className="size-3" />
                              Agendar
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
