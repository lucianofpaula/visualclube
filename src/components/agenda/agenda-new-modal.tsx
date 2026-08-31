"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { Barber, CustomerInfo, ServiceItem } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Check,
  X,
  Loader2,
  Phone,
  FileText,
  Search,
  UserPlus,
  UserCheck,
  Crown,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  Tag,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import { createAppointmentAction } from "@/actions/agenda-actions"

interface AgendaNewModalProps {
  isOpen: boolean
  onClose: () => void
  barbers: Barber[]
  services: ServiceItem[]
  customers: CustomerInfo[]
  defaultDate?: string // "YYYY-MM-DD"
  defaultTime?: string // "HH:mm"
  defaultBarberId?: string
  onSuccess?: () => void
}

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
]

function formatPhoneMask(value: string) {
  const clean = value.replace(/\D/g, "")
  if (clean.length <= 2) return clean.length ? `(${clean}` : ""
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
}

function checkIsPast(d: string, t: string): boolean {
  if (!d || !t) return false
  try {
    const [y, m, day] = d.split("-").map(Number)
    const [h, min] = t.split(":").map(Number)
    const selectedDateObj = new Date(y, m - 1, day, h, min, 0, 0)
    return selectedDateObj.getTime() < Date.now()
  } catch {
    return false
  }
}

export function AgendaNewModal({
  isOpen,
  onClose,
  barbers,
  services,
  customers,
  defaultDate,
  defaultTime,
  defaultBarberId,
  onSuccess,
}: AgendaNewModalProps) {
  // Stepper State: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Alerta prévio de Horário no Passado (OK antes de criar)
  const [showPastPrompt, setShowPastPrompt] = useState(false)
  const [hasConfirmedPast, setHasConfirmedPast] = useState(false)

  // Step 1: Cliente
  const [customerMode, setCustomerMode] = useState<"REGISTERED" | "GUEST">("REGISTERED")
  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null)

  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")

  // Step 2: Profissional, Data & Horário
  const [selectedBarberId, setSelectedBarberId] = useState("")
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0])
  const [startTime, setStartTime] = useState(defaultTime || "09:00")

  // Step 3: Serviços & Observações
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  const isPastTime = React.useMemo(() => {
    return checkIsPast(date, startTime)
  }, [date, startTime])

  useEffect(() => {
    if (isOpen) {
      const initialDate = defaultDate || new Date().toISOString().split("T")[0]
      const initialTime = defaultTime || "09:00"
      const isInitialPast = checkIsPast(initialDate, initialTime)

      setCurrentStep(1)
      setCustomerMode(customers.length > 0 ? "REGISTERED" : "GUEST")
      setCustomerSearch("")
      setSelectedCustomer(null)
      setClientName("")
      setClientPhone("")
      setClientEmail("")
      setSelectedBarberId(defaultBarberId || "")
      setSelectedServiceIds([])
      setDate(initialDate)
      setStartTime(initialTime)
      setNotes("")
      setErrorMsg(null)
      setHasConfirmedPast(false)
      setShowPastPrompt(isInitialPast)
    }
  }, [isOpen, defaultDate, defaultTime, defaultBarberId, barbers, services, customers])

  if (!isOpen) return null

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""))) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  })

  const handleSelectRegisteredCustomer = (customer: CustomerInfo) => {
    setSelectedCustomer(customer)
    setClientName(customer.name)
    setClientPhone(formatPhoneMask(customer.phone || ""))
    setClientEmail(customer.email || "")
    setErrorMsg(null)
    // Avança suavemente para o passo 2
    setCurrentStep(2)
  }

  const handleSwitchToGuest = () => {
    setCustomerMode("GUEST")
    setSelectedCustomer(null)
    setCustomerSearch("")
    setClientName("")
    setClientPhone("")
    setClientEmail("")
    setErrorMsg(null)
  }

  const handleSwitchToRegistered = () => {
    setCustomerMode("REGISTERED")
    setSelectedCustomer(null)
    setCustomerSearch("")
    setClientName("")
    setClientPhone("")
    setClientEmail("")
    setErrorMsg(null)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatPhoneMask(e.target.value)
    setClientPhone(masked)
  }

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id))
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0)
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMinutes, 0)

  const toggleService = (srvId: string) => {
    setErrorMsg(null)
    setSelectedServiceIds((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    )
  }

  // Validação para avançar do Passo 1 para o Passo 2
  const handleNextFromStep1 = () => {
    setErrorMsg(null)
    if (customerMode === "REGISTERED" && !selectedCustomer) {
      setErrorMsg("Selecione um cliente cadastrado ou alterne para Cliente Avulso.")
      return
    }
    if (customerMode === "GUEST") {
      if (!clientName.trim()) {
        setErrorMsg("Informe o nome do cliente avulso.")
        return
      }
      if (!clientPhone.trim() || clientPhone.replace(/\D/g, "").length < 10) {
        setErrorMsg("Informe um WhatsApp válido com DDD.")
        return
      }
    }
    setCurrentStep(2)
  }

  // Validação para avançar do Passo 2 para o Passo 3
  const handleNextFromStep2 = () => {
    setErrorMsg(null)
    if (!selectedBarberId) {
      setErrorMsg("Por favor, selecione um profissional de atendimento para avançar.")
      return
    }
    if (!date) {
      setErrorMsg("Selecione a data do agendamento.")
      return
    }
    if (!startTime) {
      setErrorMsg("Selecione o horário inicial.")
      return
    }
    if (isPastTime && !hasConfirmedPast) {
      setShowPastPrompt(true)
      return
    }
    setCurrentStep(3)
  }

  // Submissão Final
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (selectedServiceIds.length === 0) {
      setErrorMsg("Por favor, selecione pelo menos um serviço para finalizar o agendamento.")
      return
    }

    startTransition(async () => {
      const res = await createAppointmentAction({
        clientName,
        clientPhone: clientPhone.replace(/\D/g, ""),
        clientEmail: clientEmail || null,
        professionalId: selectedBarberId,
        serviceIds: selectedServiceIds,
        date,
        startTime,
        notes: notes
          ? `${customerMode === "GUEST" ? "[Cliente Avulso] " : ""}${notes}`
          : customerMode === "GUEST"
          ? "[Cliente Avulso]"
          : null,
      })

      if (!res.success) {
        setErrorMsg(res.error || "Erro ao salvar agendamento.")
        return
      }

      if (onSuccess) onSuccess()
      onClose()
    })
  }

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in-50">
      <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border/80 shadow-2xl space-y-5 my-6 p-6 sm:p-7 animate-in zoom-in-95">
        {/* ─────────────────────────────────────────────────────────────
            TELA DE AVISO PRÉVIO: HORÁRIO NO PASSADO (OK DO USUÁRIO)
        ───────────────────────────────────────────────────────────── */}
        {showPastPrompt ? (
          <div className="space-y-6 py-4 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <AlertTriangle className="size-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-black text-foreground">
                Horário no Passado Detectado
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você selecionou a data e horário{" "}
                <strong className="text-foreground font-mono">
                  {date.split("-").reverse().join("/")} às {startTime}
                </strong>
                , que é anterior ao momento atual.
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-500/20">
                <span>Este atendimento será registrado como agendamento retroativo.</span>
              </div>
            </div>

            <div className="pt-2 space-y-4">
              <p className="text-xs font-bold text-foreground">
                Deseja prosseguir com a criação deste agendamento retroativo?
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-2xl h-11 px-6 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setHasConfirmedPast(true)
                    setShowPastPrompt(false)
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white rounded-2xl h-11 px-6 text-xs font-black shadow-md gap-2 cursor-pointer"
                >
                  <Check className="size-4" />
                  <span>Sim, Prosseguir (OK)</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ─────────────────────────────────────────────────────────────
                HEADER COM PROGRESSO & ETAPAS (STEPPER)
            ───────────────────────────────────────────────────────────── */}
            <div className="space-y-3.5 border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">Novo Agendamento</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {currentStep === 1 && "Etapa 1 de 3: Identificação do Cliente"}
                      {currentStep === 2 && "Etapa 2 de 3: Profissional, Data & Horário"}
                      {currentStep === 3 && "Etapa 3 de 3: Serviços & Confirmação"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

          {/* Stepper Pills Navigation */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer",
                currentStep === 1
                  ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : currentStep > 1
                  ? "bg-muted/40 border-border/80 text-foreground"
                  : "bg-muted/20 border-border/40 text-muted-foreground opacity-60"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                  currentStep === 1
                    ? "bg-indigo-600 text-white"
                    : currentStep > 1
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > 1 ? <Check className="size-3" /> : "1"}
              </div>
              <span className="truncate">1. Cliente</span>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              disabled={!clientName}
              onClick={() => clientName && setCurrentStep(2)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-bold transition-all",
                currentStep === 2
                  ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs cursor-pointer"
                  : currentStep > 2
                  ? "bg-muted/40 border-border/80 text-foreground cursor-pointer"
                  : "bg-muted/20 border-border/40 text-muted-foreground opacity-60 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                  currentStep === 2
                    ? "bg-indigo-600 text-white"
                    : currentStep > 2
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > 2 ? <Check className="size-3" /> : "2"}
              </div>
              <span className="truncate">2. Horário</span>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              disabled={!selectedBarberId || !clientName}
              onClick={() => selectedBarberId && clientName && setCurrentStep(3)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-bold transition-all",
                currentStep === 3
                  ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs cursor-pointer"
                  : "bg-muted/20 border-border/40 text-muted-foreground opacity-60 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                  currentStep === 3
                    ? "bg-indigo-600 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                3
              </div>
              <span className="truncate">3. Serviços</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PASSO 1: IDENTIFICAÇÃO DO CLIENTE (CARDS RICOS & FOTOS)
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Toggle de Modo: Cadastrado vs Avulso */}
            <div className="flex items-center justify-between p-1.5 rounded-2xl bg-muted/40 border border-border/60">
              <button
                type="button"
                onClick={handleSwitchToRegistered}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  customerMode === "REGISTERED"
                    ? "bg-card text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserCheck className="size-4 text-indigo-500" />
                <span>Cliente da Casa (Cadastrado)</span>
              </button>

              <button
                type="button"
                onClick={handleSwitchToGuest}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  customerMode === "GUEST"
                    ? "bg-card text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserPlus className="size-4 text-amber-500" />
                <span>Cliente Avulso / Balcão</span>
              </button>
            </div>

            {/* MODO 1.1: CLIENTE CADASTRADO COM CARDS E FOTO */}
            {customerMode === "REGISTERED" ? (
              <div className="space-y-3">
                {/* Input de Busca com Lupa */}
                <div className="relative">
                  <Search className="size-4 text-muted-foreground absolute left-3.5 top-3" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Buscar cliente por nome, telefone ou e-mail..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-border bg-background text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-none"
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearch("")}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Lista de Cards de Clientes */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {filteredCustomers.length === 0 ? (
                    <div className="py-8 text-center border border-dashed rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
                      <p>Nenhum cliente encontrado para "{customerSearch}".</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSwitchToGuest}
                        className="rounded-xl text-xs font-bold"
                      >
                        + Cadastrar como Cliente Avulso
                      </Button>
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const isSelected = selectedCustomer?.id === customer.id
                      const initial = customer.name.charAt(0).toUpperCase()

                      return (
                        <div
                          key={customer.id}
                          onClick={() => handleSelectRegisteredCustomer(customer)}
                          className={cn(
                            "group flex items-center justify-between p-3 rounded-2xl border transition-all duration-150 cursor-pointer text-left",
                            isSelected
                              ? "bg-indigo-500/10 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30"
                              : "bg-muted/15 border-border/60 hover:bg-accent/50 hover:border-border"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar / Foto do Cliente */}
                            <div className="relative size-10 rounded-xl overflow-hidden border border-border/80 shrink-0 shadow-2xs">
                              {customer.image || customer.avatar ? (
                                <img
                                  src={customer.image || customer.avatar || ""}
                                  alt={customer.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 font-black text-sm">
                                  {initial}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-xs text-foreground truncate">
                                  {customer.name}
                                </h4>
                                {customer.isClubMember && (
                                  <span className="flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-700 dark:text-amber-300">
                                    <Crown className="size-2.5 text-amber-500" />
                                    VIP
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                {formatPhoneMask(customer.phone) || "Sem WhatsApp"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                              <span>Selecionar</span>
                              <ArrowRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ) : (
              /* MODO 1.2: CLIENTE AVULSO / BALCÃO (COM MÁSCARA WHATSAPP) */
              <div className="space-y-3.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                  <div className="flex items-center gap-2 font-bold">
                    <Sparkles className="size-4 text-amber-500 shrink-0" />
                    <span>Cadastro Rápido de Cliente Avulso</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded-full">
                    Balcão
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Nome Completo *</label>
                    <Input
                      autoFocus
                      required
                      placeholder="Ex: Pedro Henrique"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="h-10 rounded-xl text-xs bg-background font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">WhatsApp com DDD *</label>
                      <Input
                        required
                        placeholder="(22) 98832-0607"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        className="h-10 rounded-xl text-xs bg-background font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">E-mail (Opcional)</label>
                      <Input
                        type="email"
                        placeholder="cliente@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="h-10 rounded-xl text-xs bg-background font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rodapé do Passo 1 */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleNextFromStep1}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black px-5 shadow-sm gap-1.5 cursor-pointer"
              >
                <span>Avançar para Horário</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PASSO 2: PROFISSIONAL, DATA & HORÁRIO
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Card resumo do cliente escolhido */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-black">
                  {clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-extrabold text-foreground">{clientName}</span>
                  <span className="text-muted-foreground font-mono ml-2 text-[11px]">
                    {clientPhone}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Alterar
              </button>
            </div>

            {/* 1. Seleção do Profissional */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Scissors className="size-3.5 text-indigo-500" />
                <span>Escolha o Profissional de Atendimento *</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                {barbers.map((barber) => {
                  const isSelected = selectedBarberId === barber.id
                  return (
                    <button
                      key={barber.id}
                      type="button"
                      onClick={() => {
                        setSelectedBarberId(barber.id)
                        setErrorMsg(null)
                      }}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-indigo-500/15 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30"
                          : "bg-muted/15 border-border/60 hover:bg-muted/40"
                      )}
                    >
                      <div
                        className="relative size-8 rounded-xl overflow-hidden border flex items-center justify-center font-black text-white text-xs shrink-0"
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
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-foreground truncate">
                          {barber.name.split(" ")[0]}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {barber.specialty || "Profissional"}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Seleção de Data e Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-muted/20 border border-border/50">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Calendar className="size-3.5 text-indigo-500" />
                  <span>Data *</span>
                </label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9 rounded-xl text-xs bg-background font-bold"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Clock className="size-3.5 text-indigo-500" />
                  <span>Horário *</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
                  {TIME_SLOTS.map((t) => {
                    const isSelected = startTime === t
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setStartTime(t)}
                        className={cn(
                          "py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center",
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-background border border-border/60 hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Alerta de Horário no Passado (Passo 2) */}
            {isPastTime && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300 animate-in fade-in">
                <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-foreground">
                    Atenção: Horário no Passado (Atendimento Retroativo)
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    A data e horário selecionados (<strong className="text-foreground">{date.split("-").reverse().join("/")} às {startTime}</strong>) são anteriores ao momento atual.
                  </p>
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    Você está ciente e deseja prosseguir com este agendamento retroativo?
                  </p>
                </div>
              </div>
            )}

            {/* Rodapé do Passo 2 */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Voltar</span>
              </Button>

              <Button
                type="button"
                onClick={handleNextFromStep2}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black px-5 shadow-sm gap-1.5 cursor-pointer"
              >
                <span>Avançar para Serviços</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PASSO 3: CARDS DE SERVIÇOS, OBSERVAÇÕES & RESUMO FINAL
        ───────────────────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <form
            onSubmit={handleFinalSubmit}
            className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200"
          >
            {/* 1. Seleção de Serviços com Cards Ricos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                  <Scissors className="size-3.5 text-indigo-500" />
                  <span>Selecione os Serviços Solicitados *</span>
                </label>
                {selectedServices.length > 0 && (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedServices.length} selecionado(s) • ~{totalDuration} min
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {services.map((srv) => {
                  const isSelected = selectedServiceIds.includes(srv.id)

                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => toggleService(srv.id)}
                      className={cn(
                        "group relative flex flex-col justify-between p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer space-y-2",
                        isSelected
                          ? "bg-indigo-500/15 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30"
                          : "bg-muted/15 border-border/60 hover:bg-accent/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            {srv.category || "Procedimento"}
                          </span>
                          <h4 className="font-extrabold text-xs text-foreground truncate">
                            {srv.name}
                          </h4>
                        </div>

                        <div
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-lg border transition-colors",
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-muted-foreground/40 bg-background"
                          )}
                        >
                          {isSelected && <Check className="size-3" />}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{srv.durationMinutes} min</span>
                        </span>
                        <span className="font-mono font-black text-foreground">
                          R$ {srv.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Observações */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Observações / Preferências</label>
              <textarea
                rows={2}
                placeholder="Ex: Cliente prefere barba desenhada, corte na tesoura..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* 3. Card de Resumo Geral do Agendamento */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 space-y-2 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Resumo do Agendamento
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  <strong className="text-foreground">{clientName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Profissional:</span>{" "}
                  <strong className="text-foreground">{selectedBarber?.name || "—"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Data/Hora:</span>{" "}
                  <strong className="text-foreground font-mono">
                    {date.split("-").reverse().join("/")} às {startTime}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Estimado:</span>{" "}
                  <strong className="text-foreground font-mono text-xs">
                    R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </strong>
                </div>
              </div>

              {/* Alerta de Horário no Passado (Resumo Passo 3) */}
              {isPastTime && (
                <div className="mt-1 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                    <span>Horário no passado (Atendimento Retroativo)</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono bg-amber-500/20 px-2 py-0.5 rounded-md">
                    Ciente
                  </span>
                </div>
              )}
            </div>

            {/* Rodapé do Passo 3 */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Voltar</span>
              </Button>

              <Button
                type="submit"
                disabled={isPending || selectedServiceIds.length === 0}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-11 px-6 text-xs font-black shadow-md gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Confirmando Agendamento...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Confirmar & Agendar Horário</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
        </>
      )}
      </div>
    </div>
  )
}
