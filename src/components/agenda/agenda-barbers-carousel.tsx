"use client"

import * as React from "react"
import { Barber, Appointment } from "./types"
import { cn } from "@/lib/utils"
import { Users, Scissors, CheckCircle2 } from "lucide-react"

interface AgendaBarbersCarouselProps {
  barbers: Barber[]
  selectedBarberId: string // "ALL" ou id do profissional
  onSelectBarber: (barberId: string) => void
  appointments: Appointment[]
  selectedDate: string // YYYY-MM-DD
}

export function AgendaBarbersCarousel({
  barbers,
  selectedBarberId,
  onSelectBarber,
  appointments,
  selectedDate,
}: AgendaBarbersCarouselProps) {
  // Contar agendamentos por profissional na data selecionada
  const dateAppointments = appointments.filter((apt) => apt.date === selectedDate)
  const totalCount = dateAppointments.length

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Scissors className="size-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Filtrar por Profissional
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {barbers.length} profissionais na equipe
        </span>
      </div>

      {/* Overflow horizontal suave com scrollbar oculta */}
      <div className="no-scrollbar -mx-1 flex items-stretch gap-3 overflow-x-auto px-1 py-1">
        {/* Card 'Todos' */}
        <button
          type="button"
          onClick={() => onSelectBarber("ALL")}
          className={cn(
            "group relative flex min-w-[170px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200",
            selectedBarberId === "ALL"
              ? "border-indigo-500 bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/30 dark:bg-indigo-500/15"
              : "border-border bg-card hover:border-indigo-300 hover:bg-accent/40 hover:shadow-xs"
          )}
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                selectedBarberId === "ALL"
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Users className="size-5.5" />
            </div>

            {selectedBarberId === "ALL" && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                <CheckCircle2 className="size-3" />
                Ativo
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm leading-tight text-foreground">
                Toda a Equipe
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground font-medium">
              Visão geral unificada
            </p>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
            <span className="text-muted-foreground">Agendamentos hoje:</span>
            <span className="font-bold text-foreground">{totalCount}</span>
          </div>
        </button>

        {/* Cards dos Profissionais individuais */}
        {barbers.map((barber) => {
          const barberApts = dateAppointments.filter(
            (apt) => apt.barberId === barber.id && apt.status !== "CANCELED"
          )
          const isSelected = selectedBarberId === barber.id

          return (
            <button
              key={barber.id}
              type="button"
              onClick={() => onSelectBarber(barber.id)}
              className={cn(
                "group relative flex min-w-[190px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200",
                isSelected
                  ? "border-indigo-500 bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/30 dark:bg-indigo-500/15"
                  : "border-border bg-card hover:border-indigo-300 hover:bg-accent/40 hover:shadow-xs"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="relative">
                  <div className="relative size-11 overflow-hidden rounded-xl border border-border shadow-xs">
                    {barber.avatar || barber.avatarUrl ? (
                      <img
                        src={barber.avatar || barber.avatarUrl || ""}
                        alt={barber.name}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex size-full items-center justify-center font-black text-sm text-white"
                        style={{ backgroundColor: barber.colorHex || "#10b981" }}
                      >
                        {barber.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Status badge online / offline */}
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-card",
                      barber.isAvailable !== false ? "bg-emerald-500" : "bg-zinc-400"
                    )}
                    title={barber.isAvailable !== false ? "Disponível" : "Indisponível hoje"}
                  />
                </div>

                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {barberApts.length} {barberApts.length === 1 ? "horário" : "horários"}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="font-extrabold text-sm leading-tight text-foreground truncate">
                  {barber.name}
                </h4>
                <p className="mt-0.5 text-xs text-muted-foreground truncate font-medium">
                  {barber.specialty || "Profissional"}
                </p>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={cn(
                    "font-bold text-[10px]",
                    barber.isAvailable !== false
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500"
                  )}
                >
                  {barber.isAvailable !== false ? "Ativo na Grade" : "Folga"}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
