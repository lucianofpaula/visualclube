"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { BusinessHours } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  Settings,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarDays,
  Sun,
  Moon,
  Ban,
  ArrowRight,
  Sliders,
  Check,
} from "lucide-react"
import {
  updateAgendaSettingsAction,
  createSpecialScheduleAction,
  deleteSpecialScheduleAction,
} from "@/actions/agenda-actions"

interface SpecialScheduleItem {
  id: string
  date: string
  isOpen: boolean
  openTime?: string | null
  closeTime?: string | null
  slotIntervalMinutes: number
  reason: string
}

interface AgendaSettingsViewProps {
  initialBusinessHours: BusinessHours[]
  initialSpecialSchedules: SpecialScheduleItem[]
}

const DAY_NAMES = [
  { dayOfWeek: 1, label: "Segunda-feira", short: "SEG" },
  { dayOfWeek: 2, label: "Terça-feira", short: "TER" },
  { dayOfWeek: 3, label: "Quarta-feira", short: "QUA" },
  { dayOfWeek: 4, label: "Quinta-feira", short: "QUI" },
  { dayOfWeek: 5, label: "Sexta-feira", short: "SEX" },
  { dayOfWeek: 6, label: "Sábado", short: "SÁB" },
  { dayOfWeek: 0, label: "Domingo", short: "DOM" },
]

export function AgendaSettingsView({
  initialBusinessHours,
  initialSpecialSchedules,
}: AgendaSettingsViewProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(initialBusinessHours)
  const [specialSchedules, setSpecialSchedules] = useState<SpecialScheduleItem[]>(initialSpecialSchedules)

  const [isPendingHours, startTransitionHours] = useTransition()
  const [isPendingSpecial, startTransitionSpecial] = useTransition()

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Formulário de Novo Dia Especial
  const [specialDate, setSpecialDate] = useState("")
  const [specialReason, setSpecialReason] = useState("")
  const [specialIsOpen, setSpecialIsOpen] = useState(true)
  const [specialOpenTime, setSpecialOpenTime] = useState("08:00")
  const [specialCloseTime, setSpecialCloseTime] = useState("20:00")
  const [specialInterval, setSpecialInterval] = useState(30)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Atualizar campo de um dia específico da semana
  const handleUpdateDay = (dayOfWeek: number, field: keyof BusinessHours, value: any) => {
    setBusinessHours((prev) =>
      prev.map((item) => (item.dayOfWeek === dayOfWeek ? { ...item, [field]: value } : item))
    )
  }

  // Copiar horário da segunda para terça a sexta
  const handleApplyToWeekdays = () => {
    const monday = businessHours.find((h) => h.dayOfWeek === 1)
    if (!monday) return

    setBusinessHours((prev) =>
      prev.map((item) => {
        if ([1, 2, 3, 4, 5].includes(item.dayOfWeek)) {
          return {
            ...item,
            isOpen: monday.isOpen,
            openTime: monday.openTime,
            closeTime: monday.closeTime,
            slotIntervalMinutes: monday.slotIntervalMinutes,
          }
        }
        return item
      })
    )
    setFeedbackMsg({
      type: "success",
      text: "Horário de Segunda aplicado para Terça a Sexta-feira!",
    })
  }

  // Salvar Grade Semanal Padrão
  const handleSaveBusinessHours = () => {
    setFeedbackMsg(null)
    startTransitionHours(async () => {
      const res = await updateAgendaSettingsAction({ businessHours })
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "Grade de horários semanais salva com sucesso!" })
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Erro ao salvar horários." })
      }
    })
  }

  // Criar Dia Especial / Feriado
  const handleCreateSpecial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!specialDate || !specialReason.trim()) {
      alert("Preencha a data e o motivo do dia especial.")
      return
    }

    startTransitionSpecial(async () => {
      const res = await createSpecialScheduleAction({
        date: specialDate,
        reason: specialReason,
        isOpen: specialIsOpen,
        openTime: specialIsOpen ? specialOpenTime : undefined,
        closeTime: specialIsOpen ? specialCloseTime : undefined,
        slotIntervalMinutes: Number(specialInterval) || 30,
      })

      if (res.success && res.specialSchedule) {
        setSpecialSchedules((prev) => {
          const filtered = prev.filter((s) => s.date !== specialDate)
          return [...filtered, res.specialSchedule].sort((a, b) => a.date.localeCompare(b.date))
        })
        setIsModalOpen(false)
        setSpecialDate("")
        setSpecialReason("")
        setFeedbackMsg({ type: "success", text: "Dia especial cadastrado com sucesso!" })
      } else {
        alert(res.error || "Erro ao criar dia especial.")
      }
    })
  }

  // Excluir Dia Especial
  const handleDeleteSpecial = (id: string) => {
    if (!confirm("Deseja remover este dia especial?")) return

    startTransitionSpecial(async () => {
      const res = await deleteSpecialScheduleAction({ id })
      if (res.success) {
        setSpecialSchedules((prev) => prev.filter((s) => s.id !== id))
        setFeedbackMsg({ type: "success", text: "Dia especial removido!" })
      }
    })
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Settings className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Configurações da Agenda
              </h1>
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                Horários & Feriados
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
              Defina os horários de funcionamento padrão por dia da semana e dias especiais / feriados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleSaveBusinessHours}
            disabled={isPendingHours}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-11 px-6 text-xs font-black shadow-md gap-2 cursor-pointer"
          >
            {isPendingHours ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            <span>Salvar Horários da Grade</span>
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={cn(
            "p-4 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in",
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40"
              : "bg-destructive/10 text-destructive border-destructive/30"
          )}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. GRADE PADRÃO POR DIA DA SEMANA
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Clock className="size-5 text-indigo-500" />
              <span>Grade Semanal de Funcionamento</span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Os horários definidos aqui estabelecem os slots apresentados na Agenda e no agendamento online.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApplyToWeekdays}
            className="rounded-xl text-xs font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 gap-1.5"
          >
            <Sliders className="size-3.5" />
            <span>Replicar Segunda (Seg a Sex)</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {DAY_NAMES.map(({ dayOfWeek, label, short }) => {
            const config = businessHours.find((h) => h.dayOfWeek === dayOfWeek) || {
              dayOfWeek,
              isOpen: true,
              openTime: "08:00",
              closeTime: "20:00",
              slotIntervalMinutes: 30,
            }

            return (
              <div
                key={dayOfWeek}
                className={cn(
                  "rounded-3xl border p-4 transition-all duration-200 space-y-3.5",
                  config.isOpen
                    ? "bg-card border-border/80 shadow-xs"
                    : "bg-muted/20 border-border/40 opacity-70"
                )}
              >
                {/* Cabeçalho do Card do Dia */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black">
                      {short}
                    </span>
                    <span className="font-extrabold text-sm text-foreground">{label}</span>
                  </div>

                  {/* Toggle Aberto / Fechado */}
                  <button
                    type="button"
                    onClick={() => handleUpdateDay(dayOfWeek, "isOpen", !config.isOpen)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      config.isOpen ? "bg-indigo-600" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        config.isOpen ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {config.isOpen ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Sun className="size-3 text-amber-500" />
                          <span>Abertura</span>
                        </label>
                        <input
                          type="time"
                          value={config.openTime || "08:00"}
                          onChange={(e) => handleUpdateDay(dayOfWeek, "openTime", e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-bold text-foreground focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Moon className="size-3 text-indigo-400" />
                          <span>Fechamento</span>
                        </label>
                        <input
                          type="time"
                          value={config.closeTime || "20:00"}
                          onChange={(e) => handleUpdateDay(dayOfWeek, "closeTime", e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-bold text-foreground focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-border/40">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Intervalo de Slots
                      </label>
                      <select
                        value={config.slotIntervalMinutes || 30}
                        onChange={(e) =>
                          handleUpdateDay(dayOfWeek, "slotIntervalMinutes", Number(e.target.value))
                        }
                        className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value={15}>A cada 15 minutos</option>
                        <option value={30}>A cada 30 minutos (Padrão)</option>
                        <option value={45}>A cada 45 minutos</option>
                        <option value={60}>A cada 1 hora (60 min)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="py-5 text-center flex flex-col items-center justify-center gap-1 text-muted-foreground">
                    <Ban className="size-5 opacity-40" />
                    <span className="text-xs font-bold">Fechado o dia todo</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DIAS ESPECIAIS & FERIADOS (HORÁRIO DIFERENCIADO)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-6 border-t border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CalendarDays className="size-5 text-indigo-500" />
                <span>Dias Especiais & Exceções de Calendário</span>
              </h2>
              <Badge variant="outline" className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                {specialSchedules.length} cadastrados
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Cadastre feriados, folgas coletivas ou datas com expediente diferenciado (ex: 07/09 das 07:00 às 21:00).
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-10 px-5 text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Adicionar Dia Especial</span>
          </Button>
        </div>

        {specialSchedules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 p-12 text-center flex flex-col items-center justify-center gap-2 bg-muted/10">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-1">
              <Calendar className="size-6 text-muted-foreground/60" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Nenhum dia especial cadastrado</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Use esta seção para definir horários específicos em feriados ou eventos especiais sem alterar sua grade padrão.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-2 rounded-xl text-xs font-bold"
            >
              + Cadastrar Primeiro Feriado
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {specialSchedules.map((item) => {
              const [y, m, d] = item.date.split("-")
              const formattedDate = `${d}/${m}/${y}`

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-xl bg-indigo-500/10 px-2.5 py-0.5 text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                          {formattedDate}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.2 text-[10px] font-bold",
                            item.isOpen
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {item.isOpen ? "Horário Especial" : "Fechado"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-foreground leading-tight pt-1">
                        {item.reason}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSpecial(item.id)}
                      disabled={isPendingSpecial}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Excluir dia especial"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl bg-muted/30 p-2.5 text-xs font-mono font-bold text-muted-foreground flex items-center justify-between border border-border/40">
                    <span className="text-[11px] text-muted-foreground font-sans">Expediente:</span>
                    {item.isOpen ? (
                      <span className="text-foreground">
                        {item.openTime || "08:00"} às {item.closeTime || "20:00"}
                      </span>
                    ) : (
                      <span className="text-rose-500">Sem atendimentos</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADICIONAR DIA ESPECIAL
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50">
          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <CalendarDays className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Novo Dia Especial</h3>
                  <p className="text-xs text-muted-foreground">Feriado ou horário customizado</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSpecial} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Data Específica *</label>
                <input
                  type="date"
                  required
                  value={specialDate}
                  onChange={(e) => setSpecialDate(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold text-foreground focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Motivo / Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Feriado 7 de Setembro, Horário Estendido..."
                  value={specialReason}
                  onChange={(e) => setSpecialReason(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Status Aberto ou Fechado */}
              <div className="flex items-center justify-between rounded-2xl bg-muted/20 p-3 border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground">Estabelecimento Aberto?</p>
                  <p className="text-[10px] text-muted-foreground">
                    {specialIsOpen ? "Haverá atendimento com horários especiais" : "Espaço fechado o dia todo"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSpecialIsOpen(!specialIsOpen)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    specialIsOpen ? "bg-indigo-600" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                      specialIsOpen ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {specialIsOpen && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Abertura</label>
                    <input
                      type="time"
                      value={specialOpenTime}
                      onChange={(e) => setSpecialOpenTime(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs font-mono font-bold text-foreground focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Fechamento</label>
                    <input
                      type="time"
                      value={specialCloseTime}
                      onChange={(e) => setSpecialCloseTime(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs font-mono font-bold text-foreground focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPendingSpecial}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black px-5 shadow-sm"
                >
                  {isPendingSpecial ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span>Salvar Dia Especial</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
