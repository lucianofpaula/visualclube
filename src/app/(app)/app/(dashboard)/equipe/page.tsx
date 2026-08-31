"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Sparkles, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  MessageSquare, 
  Percent, 
  CreditCard, 
  QrCode, 
  Store, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Wand2, 
  Calendar, 
  Briefcase, 
  Star, 
  Scissors, 
  ArrowRight, 
  ShieldCheck, 
  Power, 
  RotateCcw, 
  Archive, 
  UserCheck,
  Send,
  Link as LinkIcon,
  Copy,
  Clock,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useSubscription } from "@/components/app/app-shell"
import { 
  getBusinessProfessionals, 
  createProfessional, 
  updateProfessional, 
  deleteProfessional, 
  toggleProfessionalStatus,
  reactivateProfessional
} from "@/actions/professional-actions"
import { 
  createTeamInviteAction, 
  getBusinessPendingInvitesAction, 
  cancelTeamInviteAction 
} from "@/actions/invite-actions"
import { generateAiProfessionalBioAction } from "@/actions/ai-actions"
import { getRolesForBusinessType, SCHEDULE_COLORS } from "@/lib/professional-roles"
import { AvatarUploader } from "@/components/ui/avatar-uploader"
import { cn } from "@/lib/utils"

export default function EquipePage() {
  const { hasBusiness, business, subscription, openPlansModal } = useSubscription()

  const [professionals, setProfessionals] = useState<any[]>([])
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "ARCHIVED" | "INVITES">("ALL")

  // Limites do Plano
  const nonArchivedProfs = professionals.filter((p) => !p.deletedAt)
  const maxProfessionals = subscription?.plan?.maxProfessionals !== undefined ? subscription.plan.maxProfessionals : 2
  const isUnlimited = maxProfessionals === -1
  const isLimitReached = !isUnlimited && nonArchivedProfs.length >= maxProfessionals

  // Modal Manual Profissional
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProf, setEditingProf] = useState<any | null>(null)
  const [deletingProf, setDeletingProf] = useState<{ id: string; name: string; specialty?: string; hasHistory?: boolean } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReactivating, setIsReactivating] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form Fields Manual
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [customSpecialty, setCustomSpecialty] = useState("")
  const [bio, setBio] = useState("")
  const [colorHex, setColorHex] = useState("#10b981")
  const [commissionPercent, setCommissionPercent] = useState(50)
  const [productCommission, setProductCommission] = useState(10)
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState("CHAVE_ALEATORIA")
  const [isActive, setIsActive] = useState(true)
  const [showInCalendar, setShowInCalendar] = useState(true)

  // Modal de Convite Inteligente
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [invitePhone, setInvitePhone] = useState("")
  const [inviteSpecialty, setInviteSpecialty] = useState("")
  const [inviteCustomSpecialty, setInviteCustomSpecialty] = useState("")
  const [inviteDurationHours, setInviteDurationHours] = useState(1) // Padrão: 1 hora
  const [inviteCommissionPercent, setInviteCommissionPercent] = useState(50)
  const [inviteProductCommission, setInviteProductCommission] = useState(10)
  const [inviteColorHex, setInviteColorHex] = useState("#10b981")
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [generatedInvite, setGeneratedInvite] = useState<{
    inviteUrl: string
    whatsappUrl: string
    whatsappMessage: string
    expiresAt: any
  } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // IA Generation State
  const [isGeneratingBio, setIsGeneratingBio] = useState(false)

  // Funções pré-determinadas para o segmento do espaço
  const predefinedRoles = getRolesForBusinessType(business?.type)

  // Carrega profissionais e convites
  const loadData = async () => {
    setLoading(true)
    try {
      const [profs, invites] = await Promise.all([
        getBusinessProfessionals(true),
        getBusinessPendingInvitesAction(),
      ])
      setProfessionals(profs || [])
      setPendingInvites(invites || [])
    } catch (err) {
      console.error("Erro ao carregar equipe e convites:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasBusiness) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [hasBusiness])

  // Abre modal de Convite
  const handleOpenInviteModal = () => {
    if (isLimitReached) {
      if (confirm(`Seu plano atual (${subscription?.plan?.name || "Inicial"}) permite até ${maxProfessionals} profissionais. Deseja fazer um upgrade para convidar mais integrantes?`)) {
        openPlansModal()
      }
      return
    }

    setInvitePhone("")
    setInviteSpecialty(predefinedRoles[0]?.label || "Especialista")
    setInviteCustomSpecialty("")
    setInviteDurationHours(1) // Padrão de 1 hora
    setInviteCommissionPercent(50)
    setInviteProductCommission(10)
    setInviteColorHex(SCHEDULE_COLORS[professionals.length % SCHEDULE_COLORS.length]?.hex || "#10b981")
    setGeneratedInvite(null)
    setCopiedLink(false)
    setInviteModalOpen(true)
  }

  // Gera Convite
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitePhone.trim()) return

    setInviteSubmitting(true)
    const finalSpecialty = inviteSpecialty === "OUTRO" ? (inviteCustomSpecialty.trim() || "Especialista") : inviteSpecialty

    try {
      const res = await createTeamInviteAction({
        phone: invitePhone,
        specialty: finalSpecialty,
        durationHours: Number(inviteDurationHours),
        commissionPercent: Number(inviteCommissionPercent),
        productCommission: Number(inviteProductCommission),
        colorHex: inviteColorHex,
      })

      if (res.success && res.inviteUrl && res.whatsappUrl) {
        setGeneratedInvite({
          inviteUrl: res.inviteUrl,
          whatsappUrl: res.whatsappUrl,
          whatsappMessage: res.whatsappMessage || "",
          expiresAt: res.invite.expiresAt,
        })
        const invites = await getBusinessPendingInvitesAction()
        setPendingInvites(invites || [])
      } else {
        alert(res.error || "Falha ao gerar convite.")
      }
    } catch (err: any) {
      console.error("Erro ao criar convite:", err)
      alert("Ocorreu um erro ao gerar o convite.")
    } finally {
      setInviteSubmitting(false)
    }
  }

  // Copia link do convite
  const handleCopyInviteLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Cancela convite pendente
  const handleCancelInvite = async (inviteId: string) => {
    if (confirm("Deseja realmente cancelar este link de convite?")) {
      const res = await cancelTeamInviteAction(inviteId)
      if (res.success) {
        const invites = await getBusinessPendingInvitesAction()
        setPendingInvites(invites || [])
      }
    }
  }

  // Abre modal manual
  const handleOpenNewModal = () => {
    if (isLimitReached) {
      if (confirm(`Seu plano atual (${subscription?.plan?.name || "Inicial"}) permite até ${maxProfessionals} profissionais. Deseja fazer um upgrade para cadastrar mais integrantes?`)) {
        openPlansModal()
      }
      return
    }

    setEditingProf(null)
    setName("")
    setEmail("")
    setPhone("")
    setAvatarUrl("")
    setSpecialty(predefinedRoles[0]?.label || "Especialista")
    setCustomSpecialty("")
    setBio("")
    setColorHex(SCHEDULE_COLORS[professionals.length % SCHEDULE_COLORS.length]?.hex || "#10b981")
    setCommissionPercent(50)
    setProductCommission(10)
    setPixKey("")
    setPixKeyType("CHAVE_ALEATORIA")
    setIsActive(true)
    setShowInCalendar(true)
    setFeedbackMsg(null)
    setModalOpen(true)
  }

  // Abre modal para editar manual
  const handleOpenEditModal = (prof: any) => {
    setEditingProf(prof)
    setName(prof.name || "")
    setEmail(prof.email || "")
    setPhone(prof.phone || "")
    setAvatarUrl(prof.avatarUrl || "")
    
    const isPredefined = predefinedRoles.some((r) => r.label === prof.specialty)
    if (isPredefined) {
      setSpecialty(prof.specialty)
      setCustomSpecialty("")
    } else {
      setSpecialty("OUTRO")
      setCustomSpecialty(prof.specialty || "")
    }

    setBio(prof.bio || "")
    setColorHex(prof.colorHex || "#10b981")
    setCommissionPercent(prof.commissionPercent !== undefined ? prof.commissionPercent : 50)
    setProductCommission(prof.productCommission !== undefined ? prof.productCommission : 10)
    setPixKey(prof.pixKey || "")
    setPixKeyType(prof.pixKeyType || "CHAVE_ALEATORIA")
    setIsActive(prof.isActive !== undefined ? prof.isActive : true)
    setShowInCalendar(prof.showInCalendar !== undefined ? prof.showInCalendar : true)
    setFeedbackMsg(null)
    setModalOpen(true)
  }

  // Geração de Bio com Gemini IA
  const handleGenerateBioWithAi = async () => {
    if (!name.trim()) {
      alert("Por favor, preencha o nome do profissional primeiro.")
      return
    }

    const currentSpecialty = specialty === "OUTRO" ? customSpecialty : specialty
    setIsGeneratingBio(true)

    try {
      const res = await generateAiProfessionalBioAction({
        name,
        specialty: currentSpecialty || "Especialista em atendimento de excelência",
        businessType: business?.type || "BARBERSHOP",
      })

      if (res.success && res.data?.bio) {
        setBio(res.data.bio)
      } else {
        alert(res.error || "Falha ao gerar com IA.")
      }
    } catch (err) {
      console.error("Erro na IA:", err)
    } finally {
      setIsGeneratingBio(false)
    }
  }

  // Salva profissional manual
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setFormSubmitting(true)
    setFeedbackMsg(null)

    const finalSpecialty = specialty === "OUTRO" ? (customSpecialty.trim() || "Especialista") : specialty

    const payload = {
      name,
      email,
      phone,
      avatarUrl,
      specialty: finalSpecialty,
      bio,
      colorHex,
      commissionPercent: Number(commissionPercent),
      productCommission: Number(productCommission),
      pixKey,
      pixKeyType,
      isActive,
      showInCalendar,
    }

    try {
      let res: any
      if (editingProf) {
        res = await updateProfessional(editingProf.id, payload)
      } else {
        res = await createProfessional(payload)
      }

      if (res.success) {
        setModalOpen(false)
        await loadData()
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Falha ao salvar." })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Ocorreu um erro ao salvar." })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Confirmação de exclusão pelo modal (Smart Soft Delete)
  const handleConfirmDelete = async () => {
    if (!deletingProf) return
    setIsDeleting(true)
    try {
      const res = await deleteProfessional(deletingProf.id)
      if (res.success) {
        setDeletingProf(null)
        await loadData()
      } else {
        alert(res.error || "Falha ao remover.")
      }
    } catch (err: any) {
      console.error("Erro ao deletar:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Reativa profissional
  const handleReactivate = async (id: string) => {
    setIsReactivating(id)
    try {
      const res = await reactivateProfessional(id)
      if (res.success) {
        await loadData()
      } else {
        alert(res.error || "Falha ao reativar.")
      }
    } catch (err: any) {
      console.error("Erro ao reativar:", err)
    } finally {
      setIsReactivating(null)
    }
  }

  // Ativa/Desativa
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    const res = await toggleProfessionalStatus(id, !currentActive)
    if (res.success) {
      await loadData()
    }
  }

  // Contagens para filtros e KPIs
  const activeList = professionals.filter((p) => !p.deletedAt && p.isActive)
  const pausedList = professionals.filter((p) => !p.deletedAt && !p.isActive)
  const archivedList = professionals.filter((p) => !!p.deletedAt)

  // Filtros aplicados
  const filteredProfessionals = professionals.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.specialty && p.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.phone && p.phone.includes(searchQuery))

    if (statusFilter === "ACTIVE") return matchesSearch && !p.deletedAt && p.isActive
    if (statusFilter === "INACTIVE") return matchesSearch && !p.deletedAt && !p.isActive
    if (statusFilter === "ARCHIVED") return matchesSearch && !!p.deletedAt
    return matchesSearch
  })

  // Se não tem negócio criado
  if (!hasBusiness) {
    return (
      <div className="space-y-6 max-w-4xl py-6">
        <div className="border-b border-border/50 pb-5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Equipe & Profissionais
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cadastre seu estabelecimento primeiro para gerenciar integrantes da equipe e comissões.
          </p>
        </div>

        <Card className="rounded-3xl border-border/80 bg-card/80 p-8 sm:p-12 text-center shadow-xl backdrop-blur-md">
          <div className="h-16 w-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Store className="h-8 w-8" />
          </div>

          <Badge variant="outline" className="px-3 py-0.5 text-xs font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 mb-2">
            Configuração Pendente
          </Badge>

          <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">
            Você ainda não cadastrou seu estabelecimento
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            Para adicionar barbeiros, manicures, cabeleireiros e esteticistas à sua equipe, crie seu espaço agora.
          </p>

          <Link href="/app/meu-negocio/criar">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-12 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 gap-2 hover:scale-[1.02] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Meu Espaço Agora</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Cálculos dos KPIs
  const activeCount = activeList.length
  const avgCommission = nonArchivedProfs.length > 0 
    ? (nonArchivedProfs.reduce((acc, curr) => acc + (curr.commissionPercent || 0), 0) / nonArchivedProfs.length).toFixed(0)
    : "50"
  const pixConfiguredCount = nonArchivedProfs.filter((p) => p.pixKey).length

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5 font-bold">
              <Briefcase className="h-3 w-3 mr-1" />
              {business?.name || "Meu Estabelecimento"}
            </Badge>
            <span className="text-xs text-muted-foreground">• {business?.type || "BARBERSHOP"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Equipe & Profissionais
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Convide integrantes pelo WhatsApp, defina comissões, chave PIX e apresentação no Website.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenInviteModal}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs gap-1.5 shadow-md shadow-emerald-600/20 hover:scale-105 transition-all"
          >
            <Send className="h-4 w-4" />
            <span>Convidar via WhatsApp</span>
          </Button>

          <Button
            onClick={handleOpenNewModal}
            variant="outline"
            size="sm"
            className="h-10 rounded-xl font-bold text-xs gap-1.5 border-border hover:bg-muted"
          >
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span>Cadastro Manual</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Profissionais Ativos</p>
            <p className="text-2xl font-black text-foreground">{activeCount} / {nonArchivedProfs.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Limite do Plano</p>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary bg-primary/5 font-semibold">
                {subscription?.plan?.name || "Plano Inicial"}
              </Badge>
            </div>
            <p className={cn("text-2xl font-black", isLimitReached ? "text-amber-500" : "text-foreground")}>
              {nonArchivedProfs.length} / {isUnlimited ? "∞" : maxProfessionals}
            </p>
            {isLimitReached && (
              <button
                onClick={openPlansModal}
                className="text-[10px] font-bold text-primary hover:underline block pt-0.5"
              >
                Fazer Upgrade de Plano →
              </button>
            )}
          </div>
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center font-bold",
            isLimitReached ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
          )}>
            <Briefcase className="h-5 w-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Comissão Média</p>
            <p className="text-2xl font-black text-primary">{avgCommission}%</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Percent className="h-5 w-5" />
          </div>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Convites Pendentes</p>
            <p className="text-2xl font-black text-amber-500">{pendingInvites.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, função ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl text-xs bg-card"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 rounded-lg transition-all",
              statusFilter === "ALL" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos ({professionals.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 rounded-lg transition-all",
              statusFilter === "ACTIVE" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Ativos ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 rounded-lg transition-all",
              statusFilter === "INACTIVE" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pausados ({pausedList.length})
          </button>
          {pendingInvites.length > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("INVITES")}
              className={cn(
                "whitespace-nowrap px-3 py-1.5 rounded-lg transition-all text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1",
                statusFilter === "INVITES" ? "bg-card shadow-xs" : "hover:text-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Convites Pendentes ({pendingInvites.length})</span>
            </button>
          )}
          {archivedList.length > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("ARCHIVED")}
              className={cn(
                "whitespace-nowrap px-3 py-1.5 rounded-lg transition-all",
                statusFilter === "ARCHIVED" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Arquivados ({archivedList.length})
            </button>
          )}
        </div>
      </div>

      {/* Se o filtro for Convites Pendentes */}
      {statusFilter === "INVITES" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Convites Aguardando Conclusão do Profissional
            </h3>
            <Button
              onClick={handleOpenInviteModal}
              size="sm"
              className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Convite</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvites.map((inv) => {
              const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
              const fullUrl = `${baseUrl}/convite/equipe?token=${inv.token}`
              const expiresDate = new Date(inv.expiresAt)
              const diffMin = Math.round((expiresDate.getTime() - Date.now()) / (1000 * 60))
              const timeLeftText = diffMin > 60 ? `${Math.round(diffMin / 60)}h restantes` : `${diffMin} min restantes`

              return (
                <Card key={inv.id} className="rounded-3xl border-amber-500/30 bg-card/90 p-5 space-y-4 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">
                        Convite Aberto
                      </span>
                      <h4 className="font-extrabold text-base text-foreground mt-0.5">{inv.specialty}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{inv.phone}</span>
                      </p>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-600 bg-amber-500/10">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeLeftText}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 text-xs space-y-1.5 border border-border/50">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Comissão Serviços:</span>
                      <strong className="text-foreground">{inv.commissionPercent}%</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Expira em:</span>
                      <strong className="text-foreground">{expiresDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyInviteLink(fullUrl)}
                      className="flex-1 h-9 rounded-xl text-xs font-bold gap-1"
                    >
                      <Copy className="h-3.5 w-3.5 text-primary" />
                      <span>Copiar Link</span>
                    </Button>

                    <a
                      href={`https://wa.me/55${inv.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Reenvio seu link de convite para a equipe da ${business?.name}:\n👉 ${fullUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1 shadow-xs"
                      title="Reenviar no WhatsApp"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </a>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(inv.id)}
                      className="h-9 px-2.5 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-bold"
                      title="Cancelar convite"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        /* Grid de Profissionais */
        loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-semibold">Carregando equipe...</p>
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-border/80 bg-card/50 p-12 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Users className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">Nenhum profissional encontrado</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery ? "Nenhum integrante corresponde aos termos da busca." : "Envie um convite no WhatsApp para que o profissional crie sua senha e complete o cadastro."}
              </p>
            </div>
            {!searchQuery && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleOpenInviteModal}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10 px-5 gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Send className="h-4 w-4" />
                  <span>Convidar via WhatsApp</span>
                </Button>
                <Button
                  onClick={handleOpenNewModal}
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs rounded-xl h-10 px-4"
                >
                  <span>Cadastro Manual</span>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProfessionals.map((prof) => {
              const isArchived = !!prof.deletedAt
              const historyCount = (prof._count?.appointments || 0) + (prof._count?.orderItems || 0)

              return (
                <Card
                  key={prof.id}
                  className={cn(
                    "rounded-3xl border-border/70 bg-card/90 overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:border-primary/40",
                    isArchived ? "opacity-60 bg-muted/40 border-dashed" : !prof.isActive && "opacity-75 bg-muted/20"
                  )}
                >
                  <div className="p-6 space-y-4">
                    {/* Header Card: Avatar, Cor, Nome e Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        {/* Avatar com badge da cor da agenda */}
                        <div className="relative">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white font-black text-lg flex items-center justify-center shadow-md border border-white/10 overflow-hidden">
                            {prof.avatarUrl ? (
                              <img src={prof.avatarUrl} alt={prof.name} className="w-full h-full object-cover" />
                            ) : (
                              prof.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span
                            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card shadow-xs"
                            style={{ backgroundColor: prof.colorHex || "#10b981" }}
                            title="Cor identificadora na agenda"
                          />
                        </div>

                        <div>
                          <h3 className="font-extrabold text-base text-foreground leading-tight">{prof.name}</h3>
                          <span className="text-xs font-bold text-primary block mt-0.5">{prof.specialty || "Especialista"}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isArchived ? (
                        <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border-amber-500/30 text-amber-600 bg-amber-500/10">
                          <Archive className="h-3 w-3 mr-1" />
                          Arquivado
                        </Badge>
                      ) : (
                        <Badge
                          variant={prof.isActive ? "success" : "outline"}
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                            prof.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "text-muted-foreground"
                          )}
                        >
                          {prof.isActive ? "Ativo" : "Pausado"}
                        </Badge>
                      )}
                    </div>

                    {/* Minibiografia */}
                    {prof.bio && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic bg-muted/30 p-2.5 rounded-xl border border-border/40">
                        "{prof.bio}"
                      </p>
                    )}

                    {/* Contatos */}
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                      {prof.phone && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Phone className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{prof.phone}</span>
                          </span>
                          <a
                            href={`https://wa.me/55${prof.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <MessageSquare className="h-3 w-3" />
                            WhatsApp
                          </a>
                        </div>
                      )}

                      {prof.email && (
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="truncate">{prof.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Comissões & PIX */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/40 text-center">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Comissão Serviços</span>
                        <span className="text-sm font-black text-foreground">{prof.commissionPercent}%</span>
                      </div>

                      <div className="p-2 rounded-xl bg-muted/40 border border-border/40 text-center">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Comissão Produtos</span>
                        <span className="text-sm font-black text-foreground">{prof.productCommission}%</span>
                      </div>
                    </div>

                    {prof.pixKey && (
                      <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] flex items-center justify-between">
                        <div className="truncate">
                          <span className="text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Chave PIX:</span>
                          <span className="font-semibold text-foreground truncate block">{prof.pixKey}</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 shrink-0">
                          {prof.pixKeyType?.replace(/_/g, " ") || "PIX"}
                        </Badge>
                      </div>
                    )}

                    {/* Informação de Histórico Registrado */}
                    {historyCount > 0 && (
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>{historyCount} atendimentos/comandas no histórico</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-muted/40 border-t border-border/50 flex items-center justify-between">
                    {isArchived ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isReactivating === prof.id}
                        onClick={() => handleReactivate(prof.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-8 gap-1.5 shadow-xs"
                      >
                        {isReactivating === prof.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        <span>Reativar na Equipe</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(prof.id, prof.isActive)}
                          className="h-8 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <Power className={cn("h-3.5 w-3.5", prof.isActive ? "text-emerald-500" : "text-neutral-400")} />
                          <span>{prof.isActive ? "Pausar" : "Ativar"}</span>
                        </Button>

                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(prof)}
                            className="h-8 text-xs font-bold gap-1 rounded-xl"
                          >
                            <Edit className="h-3.5 w-3.5 text-primary" />
                            <span>Editar</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingProf({ 
                              id: prof.id, 
                              name: prof.name, 
                              specialty: prof.specialty,
                              hasHistory: historyCount > 0
                            })}
                            className="h-8 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-2"
                            title="Remover ou desligar profissional"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CONVIDAR INTEGRANTE VIA WHATSAPP (Token Expirável)
      ───────────────────────────────────────────────────────────── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl p-6 sm:p-7 space-y-6">
            
            {/* Header Modal Convite */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">Convidar Integrante da Equipe</h2>
                  <p className="text-xs text-muted-foreground">
                    Gera um link seguro para o profissional criar sua própria senha.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!generatedInvite ? (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                {/* WhatsApp Obrigatório */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">WhatsApp do Profissional *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <Input
                      required
                      placeholder="(22) 99999-8888"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      className="h-11 pl-10 rounded-xl text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    O link será direcionado para este WhatsApp com mensagem pronta.
                  </p>
                </div>

                {/* Função Definida pelo Dono */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Função / Cargo no Estabelecimento *</label>
                  <select
                    value={inviteSpecialty}
                    onChange={(e) => setInviteSpecialty(e.target.value)}
                    className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    {predefinedRoles.map((role) => (
                      <option key={role.id} value={role.label}>
                        {role.label} — ({role.description})
                      </option>
                    ))}
                    <option value="OUTRO">+ Digitar outra função...</option>
                  </select>
                </div>

                {inviteSpecialty === "OUTRO" && (
                  <div className="space-y-1.5 animate-in fade-in-50">
                    <label className="text-xs font-bold text-foreground">Digite a função personalizada:</label>
                    <Input
                      placeholder="Ex: Especialista em Visagismo"
                      value={inviteCustomSpecialty}
                      onChange={(e) => setInviteCustomSpecialty(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                )}

                {/* Tempo de Expiração (Padrão: 1 hora) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Tempo de Validade do Link de Convite:</span>
                  </label>
                  <select
                    value={inviteDurationHours}
                    onChange={(e) => setInviteDurationHours(Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value={1}>⏱️ 1 hora (Recomendado - Mais Seguro)</option>
                    <option value={6}>⏱️ 6 horas</option>
                    <option value={24}>📅 24 horas (1 dia)</option>
                    <option value={48}>📅 48 horas (2 dias)</option>
                    <option value={168}>📅 7 dias</option>
                  </select>
                </div>

                {/* Comissões Pré-definidas */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Comissão Serviços (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={inviteCommissionPercent}
                      onChange={(e) => setInviteCommissionPercent(Number(e.target.value))}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Comissão Produtos (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={inviteProductCommission}
                      onChange={(e) => setInviteProductCommission(Number(e.target.value))}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Botão de Envio */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteModalOpen(false)}
                    className="rounded-xl h-11 px-4 text-xs font-bold"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={inviteSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-11 px-5 text-xs font-black shadow-md shadow-emerald-600/20 gap-1.5"
                  >
                    {inviteSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Gerando Link...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Gerar Convite Seguro</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Convite Gerado com Sucesso! */
              <div className="space-y-5 animate-in zoom-in-95">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <h3 className="font-extrabold text-sm text-foreground">Link de Convite Gerado com Sucesso!</h3>
                  <p className="text-xs text-muted-foreground">
                    Válido até <strong>{new Date(generatedInvite.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({inviteDurationHours}h).
                  </p>
                </div>

                {/* Copiar Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Link Direto de Auto-Onboarding:</label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={generatedInvite.inviteUrl}
                      className="h-11 rounded-xl text-xs bg-muted font-mono truncate"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCopyInviteLink(generatedInvite.inviteUrl)}
                      className="h-11 px-3.5 rounded-xl shrink-0 gap-1.5 font-bold text-xs"
                    >
                      {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedLink ? "Copiado!" : "Copiar"}</span>
                    </Button>
                  </div>
                </div>

                {/* Botão de Disparo WhatsApp */}
                <div className="space-y-2 pt-2">
                  <a
                    href={generatedInvite.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>Enviar Convite no WhatsApp do Profissional</span>
                  </a>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setInviteModalOpen(false)
                      setStatusFilter("INVITES")
                    }}
                    className="w-full text-xs text-muted-foreground font-semibold h-9"
                  >
                    Fechar e Ver Convites Pendentes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CADASTRO MANUAL & EDIÇÃO DO PROFISSIONAL
      ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-foreground">
                    {editingProf ? "Editar Profissional" : "Cadastro Manual de Profissional"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Preencha os dados do integrante da equipe para agendamentos e repasses.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div className={cn(
                "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                feedbackMsg.type === "error" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-emerald-500/10 text-emerald-600"
              )}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
              {/* Seção 1: Dados Pessoais & Contato */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span>1. Dados Pessoais & Contato</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Nome Completo *</label>
                    <Input
                      required
                      placeholder="Ex: Lucas Mendes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">WhatsApp Oficial *</label>
                    <Input
                      required
                      placeholder="(22) 98888-7777"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">E-mail (Opcional)</label>
                    <Input
                      type="email"
                      placeholder="lucas@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-foreground">Foto / Avatar do Integrante</label>
                    <div className="flex items-center gap-4">
                      <AvatarUploader
                        currentImageUrl={avatarUrl}
                        name={name || "Profissional"}
                        size="md"
                        onUploadSuccess={(url) => setAvatarUrl(url)}
                        onRemove={() => setAvatarUrl("")}
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="Ou cole a URL direta: https://..."
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="h-10 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Função & Especialidade no Segmento */}
              <div className="space-y-4 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>2. Função & Especialidade</span>
                  </h4>
                  <span className="text-[11px] text-primary font-bold">
                    Segmento: {business?.type || "BARBERSHOP"}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Selecione o Cargo / Função do Integrante:</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    {predefinedRoles.map((role) => (
                      <option key={role.id} value={role.label}>
                        {role.label} — ({role.description})
                      </option>
                    ))}
                    <option value="OUTRO">+ Digitar outra especialidade personalizada...</option>
                  </select>
                </div>

                {specialty === "OUTRO" && (
                  <div className="space-y-1.5 animate-in fade-in-50">
                    <label className="text-xs font-bold text-foreground">Digite a função personalizada:</label>
                    <Input
                      placeholder="Ex: Especialista em Visagismo & Barboterapia"
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Seção 3: Minibiografia com IA */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>3. Minibiografia para o Website</span>
                  </h4>

                  <Button
                    type="button"
                    onClick={handleGenerateBioWithAi}
                    disabled={isGeneratingBio}
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-xl text-xs font-bold border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 gap-1.5"
                  >
                    {isGeneratingBio ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Criando com IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Gerar Bio com Gemini IA</span>
                      </>
                    )}
                  </Button>
                </div>

                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Minibiografia destacando anos de experiência, especialidades e diferencial de atendimento..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              {/* Seção 4: Comissões & Repasse Financeiro (PIX) */}
              <div className="space-y-4 pt-3 border-t border-border/50">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span>4. Comissões & Dados Financeiros (PIX)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Comissão sobre Serviços (%)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={commissionPercent}
                        onChange={(e) => setCommissionPercent(Number(e.target.value))}
                        className="h-11 rounded-xl text-sm pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Comissão sobre Produtos (%)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={productCommission}
                        onChange={(e) => setProductCommission(Number(e.target.value))}
                        className="h-11 rounded-xl text-sm pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Tipo de Chave PIX</label>
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="PHONE">Telefone / WhatsApp</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="CHAVE_ALEATORIA">Chave Aleatória (EVP)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Chave PIX para Repasses</label>
                    <Input
                      placeholder="Insira a chave PIX do profissional"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 5: Cor na Grade da Agenda */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  5. Cor Identificadora na Agenda
                </h4>
                <p className="text-xs text-muted-foreground">
                  Escolha uma cor para diferenciar visualmente os agendamentos deste profissional no calendário.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {SCHEDULE_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColorHex(c.hex)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center shadow-xs hover:scale-110",
                        colorHex === c.hex ? "border-foreground ring-2 ring-primary scale-110" : "border-white/20"
                      )}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {colorHex === c.hex && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aparece na Agenda? */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/20 border border-border/50">
                <div className="space-y-0.5 pr-2">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5 cursor-pointer">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Aparece na Agenda de Horários?</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Desative para recepcionistas, administradores ou funções que não atendem na grade.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInCalendar(!showInCalendar)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    showInCalendar ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
                      showInCalendar ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Botões do Formulário */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl h-11 px-5 text-xs font-bold"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-primary text-primary-foreground rounded-xl h-11 px-6 text-xs font-extrabold shadow-md gap-1.5"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{editingProf ? "Salvar Alterações" : "Cadastrar Profissional"}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL DE CONFIRMAÇÃO COM PROTEÇÃO DE INTEGRIDADE (Smart Soft Delete)
      ───────────────────────────────────────────────────────────── */}
      {deletingProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in-50">
          <div className="relative w-full max-w-md bg-card rounded-3xl border border-destructive/30 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            
            {/* Header com ícone de alerta */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {deletingProf.hasHistory ? "Desligar / Arquivar Profissional?" : "Excluir Profissional?"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tem certeza que deseja remover <strong className="text-foreground">{deletingProf.name}</strong> ({deletingProf.specialty || "Profissional"})?
                </p>
              </div>
            </div>

            {/* Explicação de Integridade */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-1.5">
              <p className="flex items-center gap-1.5 text-foreground font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Proteção de Integridade Financeira:</span>
              </p>
              <p className="leading-relaxed">
                {deletingProf.hasHistory ? (
                  <>Este profissional possui histórico de atendimentos e comandas. O sistema o <strong>desligará com segurança</strong>, removendo-o da grade de agendamentos e do website, mas <strong>mantendo 100% dos relatórios financeiros e históricos passados intactos</strong>.</>
                ) : (
                  <>Este profissional não possui atendimentos no histórico e será removido completamente do sistema.</>
                )}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeletingProf(null)}
                className="rounded-xl h-10 px-4 text-xs font-bold"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl h-10 px-5 text-xs font-black shadow-md shadow-destructive/20 gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{deletingProf.hasHistory ? "Desligar Integrante" : "Sim, Excluir"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
