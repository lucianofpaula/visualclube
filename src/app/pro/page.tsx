"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, 
  Wallet, 
  Scissors, 
  User, 
  Users,
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  LogOut, 
  Sparkles, 
  Copy, 
  Check, 
  CreditCard, 
  Store, 
  MessageSquare, 
  Loader2, 
  ArrowUpRight, 
  Percent, 
  ShieldCheck, 
  RefreshCw, 
  TrendingUp,
  MapPin,
  Play,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Menu,
  X,
  Bell,
  ExternalLink,
  Briefcase,
  LayoutDashboard,
  DollarSign,
  Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemePicker } from "@/components/theme-picker"
import { ColorThemeId, normalizeThemeId } from "@/components/theme-manager"
import { 
  getProCurrentSessionAction, 
  updateProAppointmentStatusAction, 
  updateProProfileAction,
  logoutProfessionalAction 
} from "@/actions/pro-auth-actions"
import { generateAiProfessionalBioAction } from "@/actions/ai-actions"
import { AvatarUploader } from "@/components/ui/avatar-uploader"
import { cn } from "@/lib/utils"

export default function ProDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"HOJE" | "COMISSOES" | "SERVICOS" | "PERFIL">("HOJE")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Estado de ações rápidas
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)

  // Perfil Edit State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState("CHAVE_ALEATORIA")
  const [themeColor, setThemeColor] = useState<ColorThemeId>("emerald")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isGeneratingBio, setIsGeneratingBio] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Carrega dados da sessão do profissional
  const loadData = async () => {
    try {
      const res = await getProCurrentSessionAction()
      if (!res) {
        window.location.href = "/pro/login"
        return
      }
      setData(res)
      setName(res.professional.name || "")
      setEmail(res.professional.email || "")
      setPhone(res.professional.phone || "")
      setBio(res.professional.bio || "")
      setPixKey(res.professional.pixKey || "")
      setPixKeyType(res.professional.pixKeyType || "CHAVE_ALEATORIA")
      
      const savedTheme = typeof window !== "undefined" ? localStorage.getItem("cluberize_color_theme") : null
      const effectiveTheme = normalizeThemeId(savedTheme || (res.professional as any)?.themeColor || res.business?.themeColor)
      setThemeColor(effectiveTheme)
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", effectiveTheme)
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTheme = async (newTheme: ColorThemeId) => {
    setThemeColor(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("cluberize_color_theme", newTheme)
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme)
    }

    // Auto-salva no banco para o profissional
    try {
      await updateProProfileAction({ themeColor: newTheme })
    } catch (err) {
      console.error("Erro ao auto-salvar tema do profissional:", err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Atualizar Status do Agendamento
  const handleUpdateStatus = async (appId: string, status: string) => {
    setActionLoadingId(appId)
    try {
      const res = await updateProAppointmentStatusAction(appId, status)
      if (res.success) {
        await loadData()
      }
    } catch (err) {
      console.error("Erro ao atualizar agendamento:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Copiar Chave PIX
  const handleCopyPix = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedPix(true)
    setTimeout(() => setCopiedPix(false), 2500)
  }

  // Gerar Bio com IA
  const handleGenerateBioWithAi = async () => {
    if (!name.trim()) return
    setIsGeneratingBio(true)
    try {
      const res = await generateAiProfessionalBioAction({
        name,
        specialty: data?.professional?.specialty || "Especialista",
        businessType: data?.business?.type || "BARBERSHOP",
      })
      if (res.success && res.data?.bio) {
        setBio(res.data.bio)
      }
    } catch (err) {
      console.error("Erro na IA:", err)
    } finally {
      setIsGeneratingBio(false)
    }
  }

  // Salvar Alterações de Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg(null)

    if (newPassword && newPassword !== confirmPassword) {
      setProfileMsg({ type: "error", text: "As senhas digitadas não coincidem." })
      return
    }

    if (newPassword && newPassword.length < 6) {
      setProfileMsg({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." })
      return
    }

    setIsSavingProfile(true)
    try {
      const res = await updateProProfileAction({
        name,
        email,
        phone,
        bio,
        pixKey,
        pixKeyType,
        newPassword: newPassword || undefined,
        themeColor,
      })

      if (res.success) {
        setProfileMsg({ type: "success", text: "Perfil salvo com sucesso!" })
        setNewPassword("")
        setConfirmPassword("")
        await loadData()
      } else {
        setProfileMsg({ type: "error", text: res.error || "Falha ao salvar perfil." })
      }
    } catch (err: any) {
      setProfileMsg({ type: "error", text: "Erro ao salvar perfil." })
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            Carregando seu painel profissional...
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { professional, business, todayAppointments, metrics, services } = data

  const todayDateFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  const initials = professional.name
    ?.split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PR"

  const navMenuItems = [
    { id: "HOJE" as const, label: "Hoje & Agenda", icon: Calendar, badge: todayAppointments.length > 0 ? `${todayAppointments.length}` : null },
    { id: "COMISSOES" as const, label: "Comissões & Extrato", icon: Wallet, badge: `R$ ${metrics.totalCommission.toFixed(0)}` },
    { id: "SERVICOS" as const, label: "Catálogo de Serviços", icon: Scissors, badge: `${services.length}` },
    { id: "PERFIL" as const, label: "Meu Perfil & PIX", icon: User, badge: null },
  ]

  const tabTitles = {
    HOJE: "Hoje & Agenda de Atendimentos",
    COMISSOES: "Extrato de Comissões & Repasses",
    SERVICOS: "Catálogo de Serviços & Regras",
    PERFIL: "Meu Perfil Profissional & Dados PIX",
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      
      {/* ─────────────────────────────────────────────────────────────
          1. BACKDROP OVERLAY MOBILE
      ───────────────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SIDEBAR LATERAL (PADRÃO UNIFICADO COM /app)
      ───────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-card p-4 transition-transform duration-200 ease-in-out md:static md:translate-x-0 shrink-0",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-3">
          <Link href="/pro" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-md font-black">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-foreground">
                Visual<span className="text-primary">Clube</span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Portal da Equipe
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── CARD DO PROFISSIONAL (SUBSTITUI O ESPAÇO ATIVO DO DONO) ── */}
        <div className="my-2.5 rounded-2xl border border-border/70 bg-muted/40 p-3.5 space-y-3 shadow-xs">
          
          {/* Topo do Card: Avatar + Nome + Especialidade */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div 
                className="h-11 w-11 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-md border-2 overflow-hidden bg-neutral-800"
                style={{ borderColor: professional.colorHex || "#10b981" }}
              >
                {professional.avatarUrl ? (
                  <img src={professional.avatarUrl} alt={professional.name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span 
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" 
                title="Profissional Ativo" 
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-black truncate text-foreground leading-tight">
                {professional.name}
              </h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {professional.email || professional.phone || "Equipe"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  {professional.specialty || "Especialista"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Mini-Stats em Letras Pequenas no Rodapé do Card */}
          <div className="pt-2.5 border-t border-border/50 grid grid-cols-3 gap-1.5 text-center">
            
            {/* 1. Faturado no Mês */}
            <div className="rounded-xl bg-background/80 p-1.5 border border-border/40 space-y-0.5">
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">Faturado</span>
              <span className="text-[11px] font-black text-foreground block truncate">
                R$ {metrics.totalMonthBilled.toFixed(0)}
              </span>
            </div>

            {/* 2. Comissão */}
            <div className="rounded-xl bg-background/80 p-1.5 border border-border/40 space-y-0.5">
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">Comissão</span>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block truncate">
                R$ {metrics.totalCommission.toFixed(0)}
              </span>
            </div>

            {/* 3. Agendamentos */}
            <div className="rounded-xl bg-background/80 p-1.5 border border-border/40 space-y-0.5">
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">Atendimentos</span>
              <span className="text-[11px] font-black text-primary block truncate">
                {todayAppointments.length} hoje
              </span>
            </div>

          </div>

          {/* Nome do Estabelecimento Vinculado */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span className="truncate font-semibold flex items-center gap-1">
              <Store className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{business.name}</span>
            </span>
            {business.slug && (
              <Link
                href={`/b/${business.slug}`}
                target="_blank"
                className="text-primary hover:underline shrink-0 text-[10px] font-bold flex items-center gap-0.5"
              >
                <span>Bio</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            )}
          </div>
        </div>

        {/* ── NAVEGAÇÃO LATERAL (MESMO ESTILO DO /app) ── */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar py-2 min-h-0">
          {navMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-left",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* ── RODAPÉ DA SIDEBAR: BOTÃO DONO (SE APLICÁVEL) + LOGOUT ── */}
        <div className="mt-auto border-t border-border/60 pt-3 space-y-2 shrink-0">
          
          {/* Se for também o Dono do espaço */}
          {data.isOwner && (
            <Link
              href="/app"
              className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition-all"
            >
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-500" />
                <span>Painel do Gestor (Dono)</span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 font-black">
                Dono
              </span>
            </Link>
          )}

          {/* User Footer Pill */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-2 border border-border/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-xs font-bold overflow-hidden shadow-xs">
                {professional.avatarUrl ? (
                  <img src={professional.avatarUrl} alt={professional.name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate text-foreground">{professional.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{professional.specialty || "Profissional"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logoutProfessionalAction()
                window.location.href = "/pro/login"
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
              title="Sair do Portal"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          3. ÁREA PRINCIPAL DE CONTEÚDO (HEADER + TABS)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-8 backdrop-blur-md">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
              aria-label="Abrir Menu Lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Alinhado à Esquerda */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Portal da Equipe</span>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-xs font-bold text-foreground">
                  {tabTitles[activeTab]}
                </span>
              </div>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Atalho de Dono */}
            {data.isOwner && (
              <Link
                href="/app"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-black transition-all shadow-xs"
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Painel Gestor (/app)</span>
              </Link>
            )}

            {/* Atualizar Dados */}
            <Button
              size="sm"
              variant="outline"
              onClick={loadData}
              className="h-9 px-3 rounded-xl text-xs font-bold gap-1.5 border-border"
              title="Atualizar Agenda e Indicadores"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            <ThemeToggle />
          </div>
        </header>

        {/* ── CONTEÚDO PRINCIPAL ALINHADO À ESQUERDA ── */}
        <main className="flex-1 w-full p-4 sm:p-8 space-y-6">
          
          {/* ─────────────────────────────────────────────────────────
              ABA 1: HOJE & AGENDA DE ATENDIMENTOS
          ───────────────────────────────────────────────────────── */}
          {activeTab === "HOJE" && (
            <div className="space-y-4 animate-in fade-in-50">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2 capitalize">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{todayDateFormatted}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Acompanhe sua fila de clientes em tempo real, inicie e conclua atendimentos.
                  </p>
                </div>

                <Badge variant="outline" className="text-xs font-bold px-3 py-1 bg-muted/60 self-start sm:self-auto">
                  {todayAppointments.length} agendamento(s) hoje
                </Badge>
              </div>

              {todayAppointments.length === 0 ? (
                <Card className="rounded-3xl border-dashed border-2 border-border/70 bg-muted/20 p-12 text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">Nenhum agendamento para hoje</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Os novos agendamentos marcados pelos clientes ou pelo estabelecimento aparecerão aqui automaticamente.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayAppointments.map((app: any) => {
                    const startTime = new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    const endTime = new Date(app.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    const isCompleted = app.status === "COMPLETED"
                    const isInProgress = app.status === "IN_PROGRESS"
                    const isCanceled = app.status === "CANCELED"

                    return (
                      <Card
                        key={app.id}
                        className={cn(
                          "rounded-2xl border-border/70 bg-card p-5 space-y-4 shadow-xs transition-all",
                          isInProgress && "border-primary ring-1 ring-primary/40 bg-primary/5",
                          isCompleted && "opacity-80 bg-muted/30",
                          isCanceled && "opacity-50 line-through"
                        )}
                      >
                        {/* Topo do Card */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground bg-muted px-2.5 py-1 rounded-xl">
                              {startTime} - {endTime}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              R$ {(app.price || app.service?.price || 0).toFixed(2).replace(".", ",")}
                            </span>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5",
                              isCompleted && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
                              isInProgress && "border-primary/40 text-primary bg-primary/10 animate-pulse",
                              app.status === "SCHEDULED" && "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
                              isCanceled && "border-red-500/30 text-red-500 bg-red-500/10"
                            )}
                          >
                            {isCompleted ? "Concluído" : isInProgress ? "Em Atendimento" : isCanceled ? "Cancelado" : "Confirmado"}
                          </Badge>
                        </div>

                        {/* Nome do Cliente & Serviço */}
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-foreground">{app.clientName}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Scissors className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-semibold">{app.service?.name || "Serviço"}</span>
                            {app.service?.durationMinutes && <span>({app.service.durationMinutes} min)</span>}
                          </p>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/55${app.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${app.clientName}! Aqui é ${professional.name} da ${business.name}. Estou pronto para seu atendimento hoje às ${startTime}!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          {/* Alterar Status */}
                          {!isCompleted && !isCanceled && (
                            isInProgress ? (
                              <Button
                                size="sm"
                                disabled={actionLoadingId === app.id}
                                onClick={() => handleUpdateStatus(app.id, "COMPLETED")}
                                className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1 shadow-xs"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Concluir</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={actionLoadingId === app.id}
                                onClick={() => handleUpdateStatus(app.id, "IN_PROGRESS")}
                                className="h-9 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-1 shadow-xs"
                              >
                                <Play className="h-3.5 w-3.5" />
                                <span>Iniciar</span>
                              </Button>
                            )
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              ABA 2: COMISSÕES & EXTRATO
          ───────────────────────────────────────────────────────── */}
          {activeTab === "COMISSOES" && (
            <div className="space-y-5 animate-in fade-in-50">
              
              <div className="border-b border-border/50 pb-3">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Extrato de Comissões & Repasses</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Confira suas comissões acumuladas no mês sobre serviços executados e produtos vendidos.
                </p>
              </div>

              {/* Chave PIX Cadastrada */}
              <Card className="rounded-2xl border-border/70 bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">Chave PIX para Recebimento</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {professional.pixKeyType || "CHAVE_ALEATORIA"}
                  </Badge>
                </div>

                {professional.pixKey ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border/60">
                    <code className="text-xs font-mono font-bold text-foreground truncate">
                      {professional.pixKey}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyPix(professional.pixKey)}
                      className="h-8 px-2.5 text-xs font-bold gap-1 text-primary hover:bg-primary/10"
                    >
                      {copiedPix ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between">
                    <span>Você ainda não cadastrou sua chave PIX para repasse.</span>
                    <button
                      onClick={() => setActiveTab("PERFIL")}
                      className="font-bold underline hover:opacity-80 ml-2"
                    >
                      Cadastrar Agora
                    </button>
                  </div>
                )}
              </Card>

              {/* Divisão dos Valores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Serviços */}
                <Card className="rounded-2xl border-border/70 bg-card p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-bold uppercase tracking-wider">Comissão em Serviços</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-primary">
                      {professional.commissionPercent}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    R$ {(metrics.totalBilledServices * ((professional.commissionPercent || 50) / 100)).toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sobre R$ {metrics.totalBilledServices.toFixed(2).replace(".", ",")} faturados em procedimentos
                  </p>
                </Card>

                {/* Produtos */}
                <Card className="rounded-2xl border-border/70 bg-card p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-bold uppercase tracking-wider">Comissão em Produtos</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-primary">
                      {professional.productCommission || 10}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    R$ {(metrics.totalBilledProducts * ((professional.productCommission || 10) / 100)).toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sobre R$ {metrics.totalBilledProducts.toFixed(2).replace(".", ",")} faturados em vendas
                  </p>
                </Card>

              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              ABA 3: SERVIÇOS & REGRAS
          ───────────────────────────────────────────────────────── */}
          {activeTab === "SERVICOS" && (
            <div className="space-y-4 animate-in fade-in-50">
              
              <div className="border-b border-border/50 pb-3">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  <span>Catálogo de Serviços da {business.name}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Confira a tabela de preços do estabelecimento e sua comissão calculada por procedimento.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc: any) => {
                  const comm = (svc.price * ((professional.commissionPercent || 50) / 100)).toFixed(2).replace(".", ",")

                  return (
                    <Card key={svc.id} className="rounded-2xl border-border/70 bg-card p-4 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">{svc.name}</h4>
                        <span className="text-xs font-black text-primary">
                          R$ {svc.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>

                      {svc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {svc.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{svc.durationMinutes} min</span>
                        </span>

                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Sua Comissão: R$ {comm}
                        </span>
                      </div>
                    </Card>
                  )
                })}
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              ABA 4: MEU PERFIL & PIX
          ───────────────────────────────────────────────────────── */}
          {activeTab === "PERFIL" && (
            <div className="space-y-5 animate-in fade-in-50 max-w-3xl">
              
              <div className="border-b border-border/50 pb-3">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Editar Meu Perfil & Dados de Repasse</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Mantenha suas informações de apresentação e chave PIX sempre atualizadas.
                </p>
              </div>

              {profileMsg && (
                <div className={cn(
                  "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                  profileMsg.type === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-destructive/10 text-destructive border border-destructive/30"
                )}>
                  {profileMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Card de Foto de Perfil com Cloudinary */}
              <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>Sua Foto de Perfil</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Esta foto será exibida para os clientes na página pública de agendamento e no catálogo da equipe.
                  </p>
                </div>

                <div className="pt-2">
                  <AvatarUploader
                    currentImageUrl={professional.avatarUrl}
                    name={professional.name}
                    size="lg"
                    onUploadSuccess={async (url) => {
                      const { updateProAvatarAction } = await import("@/actions/upload-actions")
                      await updateProAvatarAction(url)
                      await loadData()
                    }}
                    onRemove={async () => {
                      const { updateProAvatarAction } = await import("@/actions/upload-actions")
                      await updateProAvatarAction("")
                      await loadData()
                    }}
                  />
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* Nome Completo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nome Completo</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* E-mail e WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">E-mail de Login</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">WhatsApp de Contato</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Bio Profissional + IA */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Biografia / Apresentação</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isGeneratingBio}
                      onClick={handleGenerateBioWithAi}
                      className="h-7 px-2 text-[11px] font-bold text-primary hover:bg-primary/10 gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{isGeneratingBio ? "Gerando..." : "Gerar com IA"}</span>
                    </Button>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Conte um pouco sobre sua trajetória e especialidades..."
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>

                {/* Chave PIX e Tipo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Chave PIX</label>
                    <Input
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="CPF, Telefone, E-mail ou Chave Aleatória"
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Tipo de Chave</label>
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="TELEFONE">Telefone</option>
                      <option value="CHAVE_ALEATORIA">Chave Aleatória</option>
                    </select>
                  </div>
                </div>

                {/* Tema Visual & Modo (60-30-10) */}
                <div className="p-5 rounded-2xl border border-border/70 bg-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        <span>Tema Visual do Painel PRO (Regra 60-30-10)</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Personalize as cores do seu painel e escolha entre Modo Claro ou Escuro.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs text-muted-foreground font-semibold">Modo:</span>
                      <ThemeToggle variant="pills" />
                    </div>
                  </div>

                  <ThemePicker
                    currentTheme={themeColor}
                    onSelectTheme={handleSelectTheme}
                  />
                </div>

                {/* Alterar Senha */}
                <div className="pt-2 border-t border-border/50 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    <span>Alterar Senha de Acesso (Opcional)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground">Nova Senha</label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground">Confirmar Senha</label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Repita a nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider shadow-md gap-1.5 mt-4"
                >
                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Salvar Alterações do Perfil</span>
                </Button>
              </form>

            </div>
          )}

        </main>
      </div>

    </div>
  )
}
