"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AgendaViewMode,
  Appointment,
  Barber,
  BusinessHours,
  CustomerInfo,
  ServiceItem,
  TimeBlock,
} from "./types"
import { AgendaBarbersCarousel } from "./agenda-barbers-carousel"
import { AgendaDayView } from "./agenda-day-view"
import { AgendaWeekView } from "./agenda-week-view"
import { AgendaDetailsModal } from "./agenda-details-modal"
import { AgendaNewModal } from "./agenda-new-modal"
import { AgendaBlockModal } from "./agenda-block-modal"
import { AgendaRescheduleModal } from "./agenda-reschedule-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Ban,
  RefreshCw,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteTimeBlockAction } from "@/actions/agenda-actions"

interface AgendaViewProps {
  initialData?: {
    barbershop: {
      id: string
      name: string
      openingHours?: any
    }
    barbers: Barber[]
    services: ServiceItem[]
    customers: CustomerInfo[]
    appointments: Appointment[]
    timeBlocks?: TimeBlock[]
    businessHours?: BusinessHours[]
    metrics?: {
      total: number
      active: number
      confirmed: number
      inProgress: number
      completed: number
      revenue: number
      occupancyRate: number
    }
  }
  onRefresh?: () => void
  loading?: boolean
}

export function AgendaView({ initialData, onRefresh, loading = false }: AgendaViewProps) {
  const router = useRouter()

  const barbers = initialData?.barbers ?? []
  const services = initialData?.services ?? []
  const customers = initialData?.customers ?? []
  const appointments = initialData?.appointments ?? []
  const timeBlocks = initialData?.timeBlocks ?? []
  const businessHours = initialData?.businessHours ?? []

  const [viewMode, setViewMode] = React.useState<AgendaViewMode>("day")
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [selectedBarberId, setSelectedBarberId] = React.useState<string>("ALL")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")

  // Modais
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState<boolean>(false)
  const [isNewModalOpen, setIsNewModalOpen] = React.useState<boolean>(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = React.useState<boolean>(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = React.useState<boolean>(false)
  const [rescheduleTarget, setRescheduleTarget] = React.useState<Appointment | null>(null)

  const [newModalDefaults, setNewModalDefaults] = React.useState<{
    time?: string
    barberId?: string
    date?: string
  }>({})

  // Formatação de data por extenso
  const formattedDateTitle = React.useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const dateObj = new Date(y, m - 1, d, 12, 0, 0)
    if (viewMode === "day") {
      return dateObj.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } else {
      const dayOfWeek = dateObj.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(dateObj)
      monday.setDate(dateObj.getDate() + mondayOffset)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const monStr = monday.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
      const sunStr = sunday.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      return `Semana de ${monStr} até ${sunStr}`
    }
  }, [selectedDate, viewMode])

  // Navegação de datas
  const handlePrev = () => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const dateObj = new Date(y, m - 1, d, 12, 0, 0)
    dateObj.setDate(dateObj.getDate() - (viewMode === "day" ? 1 : 7))
    setSelectedDate(dateObj.toISOString().split("T")[0])
  }

  const handleNext = () => {
    const [y, m, d] = selectedDate.split("-").map(Number)
    const dateObj = new Date(y, m - 1, d, 12, 0, 0)
    dateObj.setDate(dateObj.getDate() + (viewMode === "day" ? 1 : 7))
    setSelectedDate(dateObj.toISOString().split("T")[0])
  }

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  // Filtragem dos agendamentos
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedBarberId !== "ALL" && apt.barberId !== selectedBarberId) {
        return false
      }
      if (statusFilter !== "ALL" && apt.status !== statusFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesCustomer = apt.customer.name.toLowerCase().includes(query)
        const matchesService = apt.services.some((s) => s.name.toLowerCase().includes(query))
        const matchesPhone = apt.customer.phone.includes(query)
        if (!matchesCustomer && !matchesService && !matchesPhone) {
          return false
        }
      }
      return true
    })
  }, [appointments, selectedBarberId, statusFilter, searchQuery])

  // Métricas do dia selecionado
  const dayMetrics = React.useMemo(() => {
    const dayApts = appointments.filter(
      (a) =>
        a.date === selectedDate &&
        (selectedBarberId === "ALL" || a.barberId === selectedBarberId)
    )
    const activeApts = dayApts.filter((a) => a.status !== "CANCELED")
    const completedApts = dayApts.filter((a) => a.status === "COMPLETED")
    const vipApts = dayApts.filter((a) => a.customer.isClubMember)
    const totalEstimated = activeApts.reduce((acc, curr) => acc + curr.totalPrice, 0)

    return {
      total: dayApts.length,
      active: activeApts.length,
      completed: completedApts.length,
      vip: vipApts.length,
      revenue: totalEstimated,
    }
  }, [appointments, selectedDate, selectedBarberId])

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setIsDetailsOpen(true)
  }

  const handleOpenReschedule = (apt: Appointment) => {
    setRescheduleTarget(apt)
    setIsRescheduleModalOpen(true)
  }

  const handleNewAppointmentSlot = (time: string, barberId?: string, date?: string) => {
    setNewModalDefaults({
      time,
      barberId: barberId || (selectedBarberId !== "ALL" ? selectedBarberId : undefined),
      date: date || selectedDate,
    })
    setIsNewModalOpen(true)
  }

  const handleRefreshData = () => {
    if (onRefresh) onRefresh()
    else router.refresh()
  }

  const handleDeleteTimeBlock = async (id: string) => {
    if (!confirm("Deseja remover este bloqueio de horário?")) return
    await deleteTimeBlockAction({ timeBlockId: id })
    handleRefreshData()
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header com Título e Ações Principais */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <CalendarDays className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Agenda & Horários
              </h1>
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                Operacional
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground capitalize font-medium">
              {formattedDateTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={loading}
            className="text-xs font-bold h-9 rounded-xl gap-1.5"
            title="Atualizar Agenda"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          <Link
            href="/app/agenda/configuracoes"
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-border/70 bg-card hover:bg-accent/60 text-foreground text-xs font-bold transition-all shadow-2xs"
            title="Configurar Horários & Feriados"
          >
            <Settings className="size-3.5 text-muted-foreground" />
            <span className="hidden md:inline">Configurações</span>
          </Link>

          <Button
            variant="outline"
            onClick={() => setIsBlockModalOpen(true)}
            className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 cursor-pointer text-xs font-bold h-9 rounded-xl"
          >
            <Ban className="size-4 mr-1 text-rose-500" />
            Bloquear / Pausa
          </Button>

          <Button
            onClick={() => {
              setNewModalDefaults({
                time: "09:00",
                barberId: selectedBarberId !== "ALL" ? selectedBarberId : undefined,
              })
              setIsNewModalOpen(true)
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 cursor-pointer font-bold text-xs h-9 rounded-xl gap-1.5"
          >
            <Plus className="size-4" />
            <span>Novo Agendamento</span>
          </Button>
        </div>
      </div>

      {/* 2. Cards de Métricas do Período */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground">
              Agendamentos
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-black text-foreground">{dayMetrics.total}</p>
          <p className="text-[11px] text-muted-foreground font-medium">
            {dayMetrics.completed} finalizados
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground">
              Faturamento Previsto
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="size-4" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            R$ {dayMetrics.revenue.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">Procedimentos ativos hoje</p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground">
              Membros do Clube
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
              <Crown className="size-4 text-amber-500" />
            </div>
          </div>
          <p className="mt-1 text-2xl font-black text-foreground">{dayMetrics.vip}</p>
          <p className="text-[11px] text-muted-foreground font-medium">Assinantes do Clube VIP</p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground">Expediente</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="mt-1 text-lg font-black text-foreground">
            {(() => {
              const [y, m, d] = selectedDate.split("-").map(Number)
              const dateObj = new Date(y, m - 1, d, 12, 0, 0)
              const dayOfWeek = dateObj.getDay()
              const dayConfig = businessHours.find((h) => h.dayOfWeek === dayOfWeek)
              if (!dayConfig || !dayConfig.isOpen) return "Fechado"
              return `${dayConfig.openTime} às ${dayConfig.closeTime}`
            })()}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">Horário oficial do dia</p>
        </div>
      </div>

      {/* 3. Carrossel de Profissionais com Card "Todos" */}
      <AgendaBarbersCarousel
        barbers={barbers}
        selectedBarberId={selectedBarberId}
        onSelectBarber={setSelectedBarberId}
        appointments={appointments}
        selectedDate={selectedDate}
      />

      {/* 4. Barra de Ferramentas: Toggle Hoje / Semana, Navegação de Datas e Busca */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Hoje / Semana (Tabs Enfatizadas com Gradiente Verde do Sistema) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 border border-border/60 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={cn(
                "cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs transition-all duration-200 active:scale-95",
                viewMode === "day"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80 font-bold"
              )}
            >
              <Calendar className={cn("size-3.5 shrink-0", viewMode === "day" ? "text-white" : "text-muted-foreground")} />
              <span>Hoje (Diário)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn(
                "cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs transition-all duration-200 active:scale-95",
                viewMode === "week"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80 font-bold"
              )}
            >
              <CalendarDays className={cn("size-3.5 shrink-0", viewMode === "week" ? "text-white" : "text-muted-foreground")} />
              <span>Semana (7 Dias)</span>
            </button>
          </div>
        </div>

        {/* Navegador de Datas */}
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            className="cursor-pointer h-9 w-9 p-0 rounded-xl"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSetToday}
            className="text-xs font-bold h-9 px-3 rounded-xl"
          >
            Hoje
          </Button>

          <div className="flex items-center gap-2 px-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="cursor-pointer rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="cursor-pointer h-9 w-9 p-0 rounded-xl"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente, serviço ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 rounded-xl bg-background"
          />
        </div>
      </div>

      {/* 5. Área de Conteúdo da Agenda: Visão Diária vs Visão Semanal */}
      {viewMode === "day" ? (
        <AgendaDayView
          date={selectedDate}
          barbers={barbers}
          selectedBarberId={selectedBarberId}
          appointments={filteredAppointments}
          timeBlocks={timeBlocks}
          businessHours={businessHours}
          onSelectAppointment={handleSelectAppointment}
          onNewAppointmentSlot={handleNewAppointmentSlot}
          onDeleteTimeBlock={handleDeleteTimeBlock}
        />
      ) : (
        <AgendaWeekView
          currentDate={selectedDate}
          barbers={barbers}
          selectedBarberId={selectedBarberId}
          appointments={filteredAppointments}
          timeBlocks={timeBlocks}
          businessHours={businessHours}
          onSelectAppointment={handleSelectAppointment}
          onSelectDay={(dateStr) => {
            setSelectedDate(dateStr)
            setViewMode("day")
          }}
          onNewAppointmentSlot={handleNewAppointmentSlot}
          onDeleteTimeBlock={handleDeleteTimeBlock}
        />
      )}

      {/* 6. Modais */}
      <AgendaDetailsModal
        appointment={selectedAppointment}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedAppointment(null)
        }}
        barbers={barbers}
        onStatusUpdated={handleRefreshData}
        onOpenReschedule={handleOpenReschedule}
      />

      <AgendaNewModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        barbers={barbers}
        services={services}
        customers={customers}
        defaultDate={newModalDefaults.date || selectedDate}
        defaultTime={newModalDefaults.time || "09:00"}
        defaultBarberId={newModalDefaults.barberId}
        onSuccess={handleRefreshData}
      />

      <AgendaBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        barbers={barbers}
        defaultDate={selectedDate}
        defaultBarberId={selectedBarberId}
        onSuccess={handleRefreshData}
      />

      <AgendaRescheduleModal
        appointment={rescheduleTarget}
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false)
          setRescheduleTarget(null)
        }}
        barbers={barbers}
        services={services}
        onSuccess={handleRefreshData}
      />
    </div>
  )
}
