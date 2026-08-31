"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Scissors, 
  Plus, 
  Search, 
  Sparkles, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  Store, 
  ArrowRight, 
  Loader2, 
  Wand2, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Layers, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  RefreshCw,
  SlidersHorizontal,
  CheckSquare,
  Square
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useSubscription } from "@/components/app/app-shell"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { 
  getBusinessServices, 
  createService, 
  createManyServices, 
  updateService, 
  deleteService, 
  toggleServiceStatus,
  ServiceInput 
} from "@/actions/service-actions"
import { 
  generateAiServiceShortDescriptionAction, 
  generateAiServiceCatalogAction 
} from "@/actions/ai-actions"
import { 
  getCategoriesForBusinessType, 
  COMMON_DURATIONS, 
  SEGMENTS_CONFIG 
} from "@/lib/service-categories"
import { cn } from "@/lib/utils"

export default function ServicosPage() {
  const { hasBusiness, business } = useSubscription()

  // State principal
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")

  // Modal Manual (Criar / Editar)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form Fields
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [price, setPrice] = useState<number | string>("")
  const [durationMinutes, setDurationMinutes] = useState<number>(30)
  const [description, setDescription] = useState("")
  const [customCommission, setCustomCommission] = useState<number | string>("")
  const [isActive, setIsActive] = useState(true)

  // IA Descrição Curta
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false)

  // Modal Gerador de Catálogo IA
  const [catalogModalOpen, setCatalogModalOpen] = useState(false)
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<number, boolean>>({})
  const [isImportingBatch, setIsImportingBatch] = useState(false)

  // Modal Confirmação de Exclusão
  const [deletingService, setDeletingService] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Categorias padrão recomendadas para o segmento
  const segmentKey = (business?.type || "BARBERSHOP").toUpperCase()
  const segmentConfig = SEGMENTS_CONFIG[segmentKey] || SEGMENTS_CONFIG.BARBERSHOP
  const predefinedCategories = getCategoriesForBusinessType(business?.type)

  // Carrega serviços do banco
  const loadServices = async () => {
    setLoading(true)
    try {
      const data = await getBusinessServices()
      setServices(data || [])
    } catch (err) {
      console.error("Erro ao carregar serviços:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasBusiness) {
      loadServices()
    } else {
      setLoading(false)
    }
  }, [hasBusiness])

  // Abre Modal de Novo Serviço
  const handleOpenNewModal = () => {
    setEditingService(null)
    setName("")
    setCategory(predefinedCategories[0] || "Geral")
    setCustomCategory("")
    setPrice("")
    setDurationMinutes(30)
    setDescription("")
    setCustomCommission("")
    setIsActive(true)
    setFeedbackMsg(null)
    setModalOpen(true)
  }

  // Abre Modal de Edição
  const handleOpenEditModal = (srv: any) => {
    setEditingService(srv)
    setName(srv.name || "")
    
    const isPredefined = predefinedCategories.includes(srv.category)
    if (isPredefined) {
      setCategory(srv.category)
      setCustomCategory("")
    } else {
      setCategory("OUTRO")
      setCustomCategory(srv.category || "")
    }

    setPrice(srv.price !== undefined ? srv.price : "")
    setDurationMinutes(srv.durationMinutes || 30)
    setDescription(srv.description || "")
    setCustomCommission(srv.customCommission !== null && srv.customCommission !== undefined ? srv.customCommission : "")
    setIsActive(srv.isActive !== undefined ? srv.isActive : true)
    setFeedbackMsg(null)
    setModalOpen(true)
  }

  // Gera descrição curta com Gemini IA (máximo 3 linhas)
  const handleGenerateShortDescriptionWithAi = async () => {
    if (!name.trim()) {
      alert("Por favor, preencha o nome do serviço primeiro para a IA gerar a descrição.")
      return
    }

    setIsGeneratingDesc(true)
    const finalCategory = category === "OUTRO" ? customCategory.trim() : category

    try {
      const res = await generateAiServiceShortDescriptionAction({
        serviceName: name.trim(),
        category: finalCategory,
        businessType: segmentConfig.label,
        price: price ? Number(price) : undefined,
      })

      if (res.success && res.data) {
        if (res.data.description) {
          setDescription(res.data.description)
        }
        if (!price && res.data.suggestedPrice) {
          setPrice(res.data.suggestedPrice)
        }
        if (res.data.suggestedDuration && !durationMinutes) {
          setDurationMinutes(res.data.suggestedDuration)
        }
      } else {
        alert(res.error || "Falha ao gerar descrição com IA.")
      }
    } catch (err) {
      console.error("Erro na IA de descrição:", err)
    } finally {
      setIsGeneratingDesc(false)
    }
  }

  // Abre Modal do Catálogo IA e dispara a geração
  const handleOpenAiCatalogGenerator = async () => {
    setCatalogModalOpen(true)
    await triggerGenerateAiCatalog()
  }

  // Executa geração com IA
  const triggerGenerateAiCatalog = async () => {
    setIsGeneratingCatalog(true)
    try {
      const existingNames = services.map((s) => s.name)
      const res = await generateAiServiceCatalogAction({
        businessType: business?.type || "BARBERSHOP",
        businessName: business?.name,
        existingServices: existingNames,
      })

      if (res.success && res.data && Array.isArray(res.data)) {
        setAiSuggestions(res.data)
        // Seleciona todos por padrão
        const initialSelected: Record<number, boolean> = {}
        res.data.forEach((_, idx) => {
          initialSelected[idx] = true
        })
        setSelectedSuggestions(initialSelected)
      } else {
        alert(res.error || "Falha ao obter sugestões de catálogo com IA.")
      }
    } catch (err) {
      console.error("Erro ao gerar catálogo com IA:", err)
    } finally {
      setIsGeneratingCatalog(false)
    }
  }

  // Toggle de seleção individual no modal de catálogo
  const handleToggleSuggestionSelect = (index: number) => {
    setSelectedSuggestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Selecionar / Desmarcar todos
  const handleToggleSelectAll = (selectAll: boolean) => {
    const next: Record<number, boolean> = {}
    aiSuggestions.forEach((_, idx) => {
      next[idx] = selectAll
    })
    setSelectedSuggestions(next)
  }

  // Importar serviços selecionados em lote
  const handleImportSelectedServices = async () => {
    const selectedList = aiSuggestions.filter((_, idx) => !!selectedSuggestions[idx])
    if (selectedList.length === 0) {
      alert("Selecione pelo menos 1 serviço para importar.")
      return
    }

    setIsImportingBatch(true)
    try {
      const payload: ServiceInput[] = selectedList.map((item) => ({
        name: item.name,
        category: item.category || "Geral",
        price: Number(item.price) || 0,
        durationMinutes: Number(item.durationMinutes) || 30,
        description: item.description || null,
        customCommission: null,
        isActive: true,
      }))

      const res = await createManyServices(payload)
      if (res.success) {
        setCatalogModalOpen(false)
        await loadServices()
      } else {
        alert(res.error || "Falha ao importar serviços.")
      }
    } catch (err: any) {
      console.error("Erro ao importar em lote:", err)
      alert("Ocorreu um erro ao importar os serviços.")
    } finally {
      setIsImportingBatch(false)
    }
  }

  // Salvar serviço (Criar ou Atualizar)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setFormSubmitting(true)
    setFeedbackMsg(null)

    const finalCategory = category === "OUTRO" ? (customCategory.trim() || "Geral") : category

    const payload: ServiceInput = {
      name: name.trim(),
      category: finalCategory,
      price: Number(price) || 0,
      durationMinutes: Number(durationMinutes) || 30,
      description: description.trim() || "",
      customCommission: customCommission !== "" ? Number(customCommission) : null,
      isActive,
    }

    try {
      let res: any
      if (editingService) {
        res = await updateService(editingService.id, payload)
      } else {
        res = await createService(payload)
      }

      if (res.success) {
        setModalOpen(false)
        await loadServices()
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Falha ao salvar serviço." })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Ocorreu um erro ao salvar." })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Toggle de Status Ativo / Pausado
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    const res = await toggleServiceStatus(id, !currentActive)
    if (res.success) {
      await loadServices()
    }
  }

  // Confirmar Exclusão
  const handleConfirmDelete = async () => {
    if (!deletingService) return
    setIsDeleting(true)
    try {
      const res = await deleteService(deletingService.id)
      if (res.success) {
        setDeletingService(null)
        await loadServices()
      } else {
        alert(res.error || "Falha ao remover serviço.")
      }
    } catch (err) {
      console.error("Erro ao deletar:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Lista única de categorias presentes nos serviços
  const existingCategories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  )

  // Filtros aplicados
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "ALL" || s.category === selectedCategory

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
        ? s.isActive
        : !s.isActive

    return matchesSearch && matchesCategory && matchesStatus
  })

  // KPIs
  const activeCount = services.filter((s) => s.isActive).length
  const avgPrice = services.length > 0
    ? (services.reduce((acc, curr) => acc + (curr.price || 0), 0) / services.length).toFixed(2)
    : "0.00"
  const avgDuration = services.length > 0
    ? Math.round(services.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / services.length)
    : 0

  // Se não tem negócio criado
  if (!hasBusiness) {
    return (
      <div className="space-y-6 max-w-4xl py-6">
        <div className="border-b border-border/50 pb-5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Scissors className="h-7 w-7 text-primary" />
            Serviços & Catálogo
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cadastre seu estabelecimento primeiro para gerenciar seus serviços e catálogo online.
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
            Para cadastrar seus cortes, procedimentos, tabelas de preços e permitir agendamentos online, configure seu espaço agora.
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

  const selectedCount = Object.values(selectedSuggestions).filter(Boolean).length

  return (
    <LockedFeatureGuard featureName="Serviços & Catálogo" requiredFeature="servicos">
      <div className="space-y-6 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5 font-bold">
                <Briefcase className="h-3 w-3 mr-1" />
                {business?.name || "Meu Espaço"}
              </Badge>
              <span className="text-xs text-muted-foreground">• Segmento: <strong className="text-foreground">{segmentConfig.label}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Scissors className="h-7 w-7 text-primary" />
              Serviços & Catálogo
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Cadastre procedimentos, valores em R$, durações, descrições persuasivas e comissões da equipe.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={handleOpenAiCatalogGenerator}
              className="h-10 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs gap-2 shadow-md shadow-emerald-600/25 hover:scale-[1.03] transition-all"
            >
              <Sparkles className="h-4 w-4 animate-spin-slow text-yellow-300" />
              <span>Gerar Catálogo com IA</span>
            </Button>

            <Button
              onClick={handleOpenNewModal}
              className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Serviço</span>
            </Button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total de Serviços</p>
              <p className="text-2xl font-black text-foreground">{services.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Scissors className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Serviços Ativos</p>
              <p className="text-2xl font-black text-emerald-500">{activeCount} / {services.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Preço Médio (Ticket)</p>
              <p className="text-2xl font-black text-foreground">R$ {avgPrice}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <DollarSign className="h-5 w-5" />
            </div>
          </Card>

          <Card className="rounded-2xl border-border/70 bg-card/80 p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Duração Média</p>
              <p className="text-2xl font-black text-foreground">{avgDuration} min</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por serviço, categoria ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl text-xs bg-card"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-lg transition-all",
                  statusFilter === "ALL" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Todos ({services.length})
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
                Pausados ({services.length - activeCount})
              </button>
            </div>
          </div>

          {/* Categorias Pills */}
          {existingCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-muted-foreground text-[11px] font-bold mr-1 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Categorias:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                  selectedCategory === "ALL"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                )}
              >
                Todas
              </button>
              {existingCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista / Grid de Serviços */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-semibold">Carregando catálogo de serviços...</p>
          </div>
        ) : services.length === 0 ? (
          /* Empty State com Super Destaque para o Gerador com IA */
          <Card className="rounded-3xl border-2 border-dashed border-border/80 bg-gradient-to-b from-card/80 to-card/40 p-8 sm:p-12 text-center shadow-xl space-y-6">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <Badge variant="outline" className="px-3 py-1 text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                Catálogo Inteligente com IA
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                Nenhum serviço cadastrado ainda
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Você pode criar seus serviços um a um ou clicar no botão abaixo para a Inteligência Artificial gerar o catálogo completo e ideal para o seu segmento de <strong className="text-foreground">{segmentConfig.label}</strong> com preços, durações e descrições prontas!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={handleOpenAiCatalogGenerator}
                size="lg"
                className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm gap-2 shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all"
              >
                <Wand2 className="h-5 w-5 text-yellow-300 animate-spin-slow" />
                <span>Gerar Catálogo com IA em 1 Clique</span>
              </Button>

              <Button
                onClick={handleOpenNewModal}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-6 rounded-2xl font-bold text-xs border-border hover:bg-muted"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Cadastrar Manualmente</span>
              </Button>
            </div>
          </Card>
        ) : filteredServices.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-border/80 bg-card/50 p-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">Nenhum serviço encontrado</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tente ajustar os filtros de categoria ou os termos digitados na busca.
              </p>
            </div>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("ALL")
                setStatusFilter("ALL")
              }}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold"
            >
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          /* Grid de Cards de Serviços */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((srv) => {
              return (
                <Card
                  key={srv.id}
                  className={cn(
                    "rounded-3xl border-border/70 bg-card/90 overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:border-primary/40",
                    !srv.isActive && "opacity-60 bg-muted/20 border-dashed"
                  )}
                >
                  <div className="p-5 space-y-3.5">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold px-2 py-0.5 border-primary/30 text-primary bg-primary/5 uppercase tracking-wider mb-1.5"
                        >
                          {srv.category || "Geral"}
                        </Badge>
                        <h4 className="font-black text-base text-foreground leading-snug">
                          {srv.name}
                        </h4>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5",
                          srv.isActive
                            ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                            : "border-muted-foreground/30 text-muted-foreground bg-muted/30"
                        )}
                      >
                        {srv.isActive ? "Ativo" : "Pausado"}
                      </Badge>
                    </div>

                    {/* Descrição curta */}
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed min-h-[3.2rem]">
                      {srv.description || "Nenhuma descrição informada. Edite para gerar uma descrição atraente com a IA."}
                    </p>

                    {/* Preço e Duração Badges */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Valor</span>
                        <span className="text-lg font-black text-foreground">
                          R$ {srv.price?.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Duração</span>
                        <span className="text-xs font-bold text-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3.5 w-3.5 text-sky-500" />
                          {srv.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    {/* Comissão Customizada se houver */}
                    {srv.customCommission !== null && srv.customCommission !== undefined && (
                      <div className="text-[11px] bg-primary/5 text-primary border border-primary/20 px-2.5 py-1 rounded-xl flex items-center justify-between font-bold">
                        <span>Comissão Especial:</span>
                        <span>{srv.customCommission}%</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Ações */}
                  <div className="px-5 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(srv.id, srv.isActive)}
                      className={cn(
                        "text-[11px] font-bold flex items-center gap-1.5 transition-colors",
                        srv.isActive ? "text-muted-foreground hover:text-amber-500" : "text-emerald-600 hover:text-emerald-500"
                      )}
                      title={srv.isActive ? "Pausar serviço" : "Ativar serviço"}
                    >
                      {srv.isActive ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ativar</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(srv)}
                        className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1"
                      >
                        <Edit className="h-3.5 w-3.5 text-primary" />
                        <span>Editar</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingService({ id: srv.id, name: srv.name })}
                        className="h-8 px-2 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-bold"
                        title="Remover serviço"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* MODAL: CRIAR / EDITAR SERVIÇO COM IA */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">
                      {editingService ? "Editar Serviço" : "Novo Serviço"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Preencha os detalhes e use a IA para redigir uma descrição irresistível.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-xl text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {feedbackMsg && (
                <div
                  className={cn(
                    "p-3 rounded-2xl text-xs font-bold flex items-center gap-2",
                    feedbackMsg.type === "error"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  )}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveService} className="space-y-4">
                {/* Nome do Serviço */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Nome do Serviço *</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Ex: Corte Degradê, Barboterapia</span>
                  </label>
                  <Input
                    required
                    placeholder="Digite o nome do serviço..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Categoria</label>
                  <div className="flex flex-wrap gap-1.5">
                    {predefinedCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat)
                          setCustomCategory("")
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all",
                          category === cat
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCategory("OUTRO")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all",
                        category === "OUTRO"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                      )}
                    >
                      Outra...
                    </button>
                  </div>

                  {category === "OUTRO" && (
                    <Input
                      placeholder="Digite a categoria personalizada..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="h-9 rounded-xl text-xs mt-1.5"
                    />
                  )}
                </div>

                {/* Preço e Duração */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Preço (R$) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                      <Input
                        required
                        type="number"
                        step="0.50"
                        min="0"
                        placeholder="45.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-9 h-10 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Duração Estimada</label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {COMMON_DURATIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Descrição com Botão da IA */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span>Descrição Curta (Máx. 3 linhas)</span>
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleGenerateShortDescriptionWithAi}
                      disabled={isGeneratingDesc || !name.trim()}
                      className="h-7 px-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-extrabold gap-1 shadow-xs"
                      title="Gera uma descrição persuasiva em até 3 linhas com IA"
                    >
                      {isGeneratingDesc ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 text-yellow-300" />
                          <span>Gerar com IA</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Descrição atrativa de até 3 linhas para o catálogo e agendamento online..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Comissão Customizada & Status */}
                <div className="grid grid-cols-2 gap-3 items-center pt-1 border-t border-border/50">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Comissão Específica (%)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Padrão equipe"
                        value={customCommission}
                        onChange={(e) => setCustomCommission(e.target.value)}
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="serviceActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded text-primary focus:ring-primary border-input cursor-pointer"
                    />
                    <label htmlFor="serviceActive" className="text-xs font-bold text-foreground cursor-pointer">
                      Serviço Ativo no Catálogo
                    </label>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="h-10 rounded-xl text-xs font-bold"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={formSubmitting}
                    className="h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs px-5 shadow-xs"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>{editingService ? "Salvar Alterações" : "Cadastrar Serviço"}</span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: GERADOR DE CATÁLOGO COMPLETO COM IA */}
        {catalogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl space-y-5 my-8">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border/50 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[10px] px-2.5 py-0.5">
                      <Sparkles className="h-3 w-3 mr-1 text-yellow-300" />
                      Assistente Gemini IA
                    </Badge>
                    <span className="text-xs text-muted-foreground font-bold">Nicho: {segmentConfig.label}</span>
                  </div>
                  <h3 className="font-black text-xl text-foreground">
                    Catálogo de Serviços Recomendado pela IA
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {services.length === 0
                      ? `Geramos o cardápio essencial e mais rentável para ${segmentConfig.label}, com preços médios e descrições curtas.`
                      : `A IA analisou seus ${services.length} serviços atuais e gerou sugestões complementares para expandir seu cardápio.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCatalogModalOpen(false)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Conteúdo: Loading ou Lista de Sugestões */}
              {isGeneratingCatalog ? (
                <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                    <Wand2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-foreground">Consultando Inteligência Artificial...</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Mapeando os serviços mais lucrativos, descrições persuasivas e preços médios para {segmentConfig.label}.
                    </p>
                  </div>
                  <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
                </div>
              ) : aiSuggestions.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-xs text-muted-foreground">Nenhuma sugestão encontrada.</p>
                  <Button
                    onClick={triggerGenerateAiCatalog}
                    size="sm"
                    className="rounded-xl font-bold text-xs"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Top Toolbar de Seleção */}
                  <div className="flex items-center justify-between bg-muted/40 p-3 rounded-2xl border border-border/50 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectAll(true)}
                        className="font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Selecionar Todos ({aiSuggestions.length})</span>
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSelectAll(false)}
                        className="font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Square className="h-3.5 w-3.5" />
                        <span>Desmarcar Todos</span>
                      </button>
                    </div>

                    <div className="font-extrabold text-foreground">
                      <span className="text-emerald-600 dark:text-emerald-400">{selectedCount}</span> de {aiSuggestions.length} selecionados
                    </div>
                  </div>

                  {/* Lista de Cards Sugeridos com Checkbox */}
                  <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-3">
                    {aiSuggestions.map((item, idx) => {
                      const isSelected = !!selectedSuggestions[idx]

                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleSuggestionSelect(idx)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5",
                            isSelected
                              ? "border-emerald-500/60 bg-emerald-500/5 shadow-xs"
                              : "border-border/60 bg-card/60 opacity-60 hover:opacity-100"
                          )}
                        >
                          <div className="pt-0.5">
                            <div
                              className={cn(
                                "h-5 w-5 rounded-lg flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-emerald-600 text-white"
                                  : "border-2 border-muted-foreground/40 bg-card"
                              )}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-sm text-foreground">{item.name}</h4>
                                <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/30 text-primary bg-primary/5 font-bold">
                                  {item.category || "Geral"}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 text-xs">
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                  R$ {Number(item.price)?.toFixed(2)}
                                </span>
                                <span className="text-muted-foreground flex items-center gap-1 font-bold text-[11px]">
                                  <Clock className="h-3 w-3 text-sky-500" />
                                  {item.durationMinutes} min
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Footer Modal Catálogo */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={triggerGenerateAiCatalog}
                      disabled={isGeneratingCatalog}
                      className="w-full sm:w-auto h-10 rounded-xl text-xs font-bold gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Gerar Novas Sugestões</span>
                    </Button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCatalogModalOpen(false)}
                        className="h-10 rounded-xl text-xs font-bold"
                      >
                        Cancelar
                      </Button>

                      <Button
                        type="button"
                        onClick={handleImportSelectedServices}
                        disabled={isImportingBatch || selectedCount === 0}
                        className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs gap-2 shadow-md shadow-emerald-600/20"
                      >
                        {isImportingBatch ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Importando...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Importar {selectedCount} Serviços</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO */}
        {deletingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-black text-lg text-foreground">Remover Serviço?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tem certeza que deseja remover <strong className="text-foreground">{deletingService.name}</strong>? Se ele já tiver histórico em comandas ou agendamentos, o sistema irá pausá-lo para preservar a integridade dos relatórios financeiros.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingService(null)}
                  className="h-10 rounded-xl text-xs font-bold flex-1"
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="h-10 rounded-xl text-xs font-bold flex-1 gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Removendo...</span>
                    </>
                  ) : (
                    <span>Confirmar Remoção</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LockedFeatureGuard>
  )
}
