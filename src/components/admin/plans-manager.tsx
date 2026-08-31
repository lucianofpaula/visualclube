"use client"

import * as React from "react"
import { useState, useTransition, useMemo } from "react"
import { 
  Plus, 
  CreditCard, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  Users2,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Search,
  CheckCheck,
  RotateCcw,
  CheckCircle2,
  FolderPlus,
  Sliders,
  ListChecks,
  ListX,
  Wand2,
  Eye,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { 
  AdminPlanDTO, 
  FeatureTreeNode, 
  upsertAdminPlan, 
  deleteAdminPlan,
  createPlatformFeature
} from "@/actions/admin-actions"
import { cn } from "@/lib/utils"

interface PlansManagerProps {
  initialPlans: AdminPlanDTO[]
  featuresTree: FeatureTreeNode[]
}

export function PlansManager({ initialPlans, featuresTree: initialFeaturesTree }: PlansManagerProps) {
  const [plans, setPlans] = useState<AdminPlanDTO[]>(initialPlans)
  const [featuresTree, setFeaturesTree] = useState<FeatureTreeNode[]>(initialFeaturesTree)
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<AdminPlanDTO | null>(null)
  const [modalTab, setModalTab] = useState<"general" | "features" | "presentation">("general")
  const [featureSearch, setFeatureSearch] = useState("")

  // Quick feature creation modal inside plan editor
  const [quickFeatureModalOpen, setQuickFeatureModalOpen] = useState(false)
  const [quickParentId, setQuickParentId] = useState<string | null>(null)
  const [quickFeatureName, setQuickFeatureName] = useState("")
  const [quickFeatureCode, setQuickFeatureCode] = useState("")
  const [quickFeatureError, setQuickFeatureError] = useState<string | null>(null)

  // New bullet inputs
  const [newBulletText, setNewBulletText] = useState("")
  const [newNotIncludedText, setNewNotIncludedText] = useState("")

  // Form State
  const [formData, setFormData] = useState<{
    id?: string
    name: string
    slug: string
    description: string
    badge: string
    priceMonthly: number
    priceYearly: number
    trialDays: number
    maxProfessionals: number
    selectedFeatureIds: string[]
    referralRates: Array<{ level: number; percentage: number }>
    featuresText: string[]
    notIncludedText: string[]
    order: number
  }>({
    name: "",
    slug: "",
    description: "",
    badge: "",
    priceMonthly: 99.90,
    priceYearly: 79.90,
    trialDays: 7,
    maxProfessionals: 5,
    selectedFeatureIds: [],
    referralRates: [{ level: 1, percentage: 10.0 }],
    featuresText: [],
    notIncludedText: [],
    order: plans.length + 1,
  })

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // All feature IDs for quick select all
  const allFeatureIds = useMemo(() => {
    const ids: string[] = []
    for (const parent of featuresTree) {
      ids.push(parent.id)
      for (const child of parent.children || []) {
        ids.push(child.id)
      }
    }
    return ids
  }, [featuresTree])

  // Filtered features tree based on search query
  const filteredTree = useMemo(() => {
    if (!featureSearch.trim()) return featuresTree
    const q = featureSearch.toLowerCase()

    return featuresTree.map((parent) => {
      const parentMatches = parent.name.toLowerCase().includes(q) || parent.code.toLowerCase().includes(q)
      const matchingChildren = (parent.children || []).filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )

      if (parentMatches || matchingChildren.length > 0) {
        return {
          ...parent,
          children: matchingChildren.length > 0 ? matchingChildren : parent.children,
        }
      }
      return null
    }).filter(Boolean) as FeatureTreeNode[]
  }, [featuresTree, featureSearch])

  const handleOpenCreate = () => {
    setEditingPlan(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      badge: "Novo",
      priceMonthly: 99.90,
      priceYearly: 79.90,
      trialDays: 7,
      maxProfessionals: 5,
      selectedFeatureIds: [],
      referralRates: [{ level: 1, percentage: 15.0 }, { level: 2, percentage: 5.0 }],
      featuresText: [
        "Até 5 profissionais cadastrados",
        "Agendamento online 24/7",
        "Comandas digitais completas",
        "Controle de fluxo de caixa",
      ],
      notIncludedText: [
        "Robô de WhatsApp ilimitado",
        "Multi-unidades / Filiais",
      ],
      order: plans.length + 1,
    })
    setModalTab("general")
    setFeatureSearch("")
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (plan: AdminPlanDTO) => {
    setEditingPlan(plan)
    setFormData({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      badge: plan.badge || "",
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      trialDays: plan.trialDays,
      maxProfessionals: plan.maxProfessionals,
      selectedFeatureIds: plan.featureIds || [],
      referralRates: plan.referralRates || [],
      featuresText: plan.features || [],
      notIncludedText: plan.notIncluded || [],
      order: plan.order,
    })
    setModalTab("general")
    setFeatureSearch("")
    setErrorMsg(null)
    setModalOpen(true)
  }

  // Toggle Feature Checkbox
  const toggleFeature = (id: string, childrenIds: string[] = []) => {
    const isCurrentlySelected = formData.selectedFeatureIds.includes(id)
    let newIds = [...formData.selectedFeatureIds]

    if (isCurrentlySelected) {
      newIds = newIds.filter((fid) => fid !== id && !childrenIds.includes(fid))
    } else {
      newIds = Array.from(new Set([...newIds, id, ...childrenIds]))
    }

    setFormData({ ...formData, selectedFeatureIds: newIds })
  }

  const toggleSingleSubFeature = (id: string, parentId: string) => {
    const isSelected = formData.selectedFeatureIds.includes(id)
    let newIds = [...formData.selectedFeatureIds]

    if (isSelected) {
      newIds = newIds.filter((fid) => fid !== id)
    } else {
      newIds.push(id)
      if (!newIds.includes(parentId)) {
        newIds.push(parentId)
      }
    }

    setFormData({ ...formData, selectedFeatureIds: newIds })
  }

  // Batch selections
  const selectAllFeatures = () => {
    setFormData({ ...formData, selectedFeatureIds: allFeatureIds })
  }

  const unselectAllFeatures = () => {
    setFormData({ ...formData, selectedFeatureIds: [] })
  }

  // Presentation Bullets Manager
  const addFeatureBullet = () => {
    if (!newBulletText.trim()) return
    setFormData({
      ...formData,
      featuresText: [...formData.featuresText, newBulletText.trim()],
    })
    setNewBulletText("")
  }

  const removeFeatureBullet = (index: number) => {
    setFormData({
      ...formData,
      featuresText: formData.featuresText.filter((_, i) => i !== index),
    })
  }

  const addNotIncludedBullet = () => {
    if (!newNotIncludedText.trim()) return
    setFormData({
      ...formData,
      notIncludedText: [...formData.notIncludedText, newNotIncludedText.trim()],
    })
    setNewNotIncludedText("")
  }

  const removeNotIncludedBullet = (index: number) => {
    setFormData({
      ...formData,
      notIncludedText: formData.notIncludedText.filter((_, i) => i !== index),
    })
  }

  // Auto-generate presentation bullets from selected features
  const autoGenerateBullets = () => {
    const generated: string[] = []
    
    // Limits
    if (formData.maxProfessionals === -1) {
      generated.push("Profissionais ilimitados")
    } else {
      generated.push(`Até ${formData.maxProfessionals} profissionais cadastrados`)
    }

    // Selected parent features
    for (const parent of featuresTree) {
      if (formData.selectedFeatureIds.includes(parent.id)) {
        generated.push(parent.name)
      }
    }

    // Unselected items as notIncluded
    const notInc: string[] = []
    for (const parent of featuresTree) {
      if (!formData.selectedFeatureIds.includes(parent.id)) {
        notInc.push(parent.name)
      }
    }

    setFormData({
      ...formData,
      featuresText: generated,
      notIncludedText: notInc.slice(0, 3), // Top 3 not included
    })

    showToast("Bullets de apresentação gerados a partir dos recursos marcados!")
  }

  // Referral Rates Management
  const addReferralLevel = () => {
    const nextLevel = formData.referralRates.length + 1
    setFormData({
      ...formData,
      referralRates: [...formData.referralRates, { level: nextLevel, percentage: 5.0 }],
    })
  }

  const removeReferralLevel = (index: number) => {
    const updated = formData.referralRates
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, level: idx + 1 }))
    setFormData({ ...formData, referralRates: updated })
  }

  const updateReferralPercentage = (index: number, val: number) => {
    const updated = [...formData.referralRates]
    updated[index] = { ...updated[index], percentage: val }
    setFormData({ ...formData, referralRates: updated })
  }

  // Quick Feature Creation
  const handleQuickCreateFeature = (e: React.FormEvent) => {
    e.preventDefault()
    setQuickFeatureError(null)

    if (!quickFeatureName.trim() || !quickFeatureCode.trim()) {
      setQuickFeatureError("Nome e código são obrigatórios.")
      return
    }

    startTransition(async () => {
      const res = await createPlatformFeature({
        name: quickFeatureName,
        code: quickFeatureCode,
        parentId: quickParentId,
      })

      if (!res.success) {
        setQuickFeatureError(res.error)
        return
      }

      // Automatically check the new feature
      const newFeatureId = (res as any).feature.id
      setFormData((prev) => ({
        ...prev,
        selectedFeatureIds: [...prev.selectedFeatureIds, newFeatureId],
      }))

      setQuickFeatureModalOpen(false)
      setQuickFeatureName("")
      setQuickFeatureCode("")
      showToast("Novo recurso criado e vinculado!")
      window.location.reload()
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.name.trim() || !formData.slug.trim()) {
      setErrorMsg("Nome e slug do plano são obrigatórios.")
      return
    }

    startTransition(async () => {
      const res = await upsertAdminPlan({
        id: editingPlan?.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        badge: formData.badge,
        priceMonthly: formData.priceMonthly,
        priceYearly: formData.priceYearly,
        trialDays: formData.trialDays,
        maxProfessionals: formData.maxProfessionals,
        featureIds: formData.selectedFeatureIds,
        referralRates: formData.referralRates,
        featuresText: formData.featuresText,
        notIncludedText: formData.notIncludedText,
        order: formData.order,
      })

      if (!res.success) {
        setErrorMsg(res.error || "Erro ao salvar plano.")
        return
      }

      setModalOpen(false)
      showToast(editingPlan ? `Plano "${formData.name}" atualizado!` : `Plano "${formData.name}" criado com sucesso!`)
      window.location.reload()
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o plano "${name}"?`)) return

    startTransition(async () => {
      await deleteAdminPlan(id)
      window.location.reload()
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-emerald-500" />
            Gestão de Planos SaaS
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Crie novos planos, selecione quais recursos e sub-recursos estão inclusos e configure comissões multinível.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Plano SaaS
        </Button>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const planFeatureIds = plan.featureIds || []
          const enabledParents = featuresTree.filter((p) => planFeatureIds.includes(p.id))

          return (
            <Card key={plan.id} className="border-border/70 bg-card flex flex-col justify-between relative group hover:border-emerald-500/50 transition-all">
              <div>
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <div className="flex items-center gap-1.5">
                      {plan.badge && (
                        <Badge variant={plan.slug === "pro" ? "gold" : "outline"} className="text-[10px]">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs min-h-[32px]">
                    {plan.description}
                  </CardDescription>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground font-semibold">R$</span>
                    <span className="text-3xl font-black tracking-tight text-foreground">
                      {plan.priceMonthly.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-xs text-muted-foreground">/ mês</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    R$ {plan.priceYearly.toFixed(2).replace(".", ",")} no plano anual ({plan.trialDays} dias de teste)
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-xs space-y-2.5">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-indigo-500" />
                        Recursos Habilitados:
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {plan.featureIds.length} / {allFeatureIds.length} módulos
                      </Badge>
                    </div>

                    {/* Overview of enabled parent features */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {enabledParents.map((p) => (
                        <span key={p.id} className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-border/60 text-muted-foreground font-semibold">
                          {p.name}
                        </span>
                      ))}
                    </div>

                    {/* Visual Presentation Bullets Preview */}
                    {plan.features && plan.features.length > 0 && (
                      <div className="pt-2 border-t border-border/40 space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Destaques no Card ({plan.features.length}):
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-foreground">
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-center gap-1 text-muted-foreground truncate">
                              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-[10px] text-muted-foreground italic pl-4">
                              +{plan.features.length - 3} outros itens...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>Limite de Profissionais:</span>
                      <strong className="text-foreground">
                        {plan.maxProfessionals === -1 ? "Ilimitados" : `Até ${plan.maxProfessionals}`}
                      </strong>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <div className="font-bold text-[11px] text-foreground mb-1 flex items-center gap-1">
                        <Users2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Comissão de Indicação (Interna):</span>
                      </div>
                      {plan.referralRates && plan.referralRates.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {plan.referralRates.map((r, i) => (
                            <span key={i} className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border/60 font-semibold text-foreground">
                              N{r.level}: {r.percentage}%
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Sem comissão configurada</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(plan)}
                  className="text-xs font-bold h-8 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar Plano & Recursos
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(plan.id, plan.name)}
                  className="text-xs font-bold h-8 text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* MODAL CRIAR / EDITAR PLANO COM ABAS (TABS) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-background border border-border/80 p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {editingPlan ? `Editar Plano: ${editingPlan.name}` : `Novo Plano SaaS`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Gerencie dados gerais, recursos do sistema e apresentação visual do plano.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* TAB SELECTOR HEADER */}
            <div className="flex items-center gap-2 border-b border-border/60 pb-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  modalTab === "general"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Sliders className="h-3.5 w-3.5" />
                1. Dados Gerais & Preço
              </button>

              <button
                type="button"
                onClick={() => setModalTab("features")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  modalTab === "features"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                2. Recursos do Sistema ({formData.selectedFeatureIds.length})
              </button>

              <button
                type="button"
                onClick={() => setModalTab("presentation")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  modalTab === "presentation"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <ListChecks className="h-3.5 w-3.5" />
                3. Apresentação no Card ({formData.featuresText.length})
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  ABA 1: DADOS GERAIS DO PLANO & PREÇOS
              ───────────────────────────────────────────────────────────── */}
              {modalTab === "general" && (
                <div className="space-y-5 animate-in fade-in-50">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Nome do Plano *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Start, Profissional Pro, Platinum"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Slug Único *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: start, pro, elite"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Badge / Selo</label>
                      <input
                        type="text"
                        placeholder="Ex: Mais Popular, Exclusivo"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-xs font-bold text-foreground">Descrição do Plano</label>
                      <input
                        type="text"
                        placeholder="Breve resumo do público-alvo deste plano..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Preço Mensal (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.priceMonthly}
                        onChange={(e) => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Preço Anual (R$/mês) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.priceYearly}
                        onChange={(e) => setFormData({ ...formData, priceYearly: Number(e.target.value) })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Dias de Teste (Trial)</label>
                      <input
                        type="number"
                        value={formData.trialDays}
                        onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-foreground">Limite de Profissionais (-1 = Ilimitado)</label>
                      <input
                        type="number"
                        value={formData.maxProfessionals}
                        onChange={(e) => setFormData({ ...formData, maxProfessionals: Number(e.target.value) })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Ordem de Exibição</label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                        className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* CONFIGURAÇÃO DE COMISSÃO POR NÍVEL (JSON) */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <Users2 className="h-4 w-4 text-emerald-500" />
                          Comissões de Indicação Multinível (JSON Interno)
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Percentuais de repasse para a rede de afiliados deste plano.
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addReferralLevel}
                        className="h-7 text-xs font-bold rounded-lg text-emerald-600 dark:text-emerald-400"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar Nível
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.referralRates.map((rate, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/40">
                          <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 shrink-0">
                            Nível {rate.level}
                          </Badge>
                          <div className="flex items-center gap-1 flex-1">
                            <input
                              type="number"
                              step="0.1"
                              value={rate.percentage}
                              onChange={(e) => updateReferralPercentage(idx, Number(e.target.value))}
                              className="w-24 h-8 rounded-lg border border-border/60 bg-background px-2 text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <span className="text-xs font-bold text-muted-foreground">%</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeReferralLevel(idx)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  ABA 2: RECURSOS & MÓDULOS HABILITADOS NO SISTEMA
              ───────────────────────────────────────────────────────────── */}
              {modalTab === "features" && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/30 p-3 rounded-2xl border border-border/60">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-indigo-500" />
                        Controle de Acesso por Módulos
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Os módulos marcados abaixo serão desbloqueados automaticamente para o assinante.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllFeatures}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Marcar Todos
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        type="button"
                        onClick={unselectAllFeatures}
                        className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Desmarcar Todos
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <Badge variant="purple" className="text-xs font-bold">
                        {formData.selectedFeatureIds.length} selecionados
                      </Badge>
                    </div>
                  </div>

                  {/* Filtro de Busca de Recursos */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Filtrar recursos pelo nome ou código (ex: agenda, comissões, financeiro)..."
                      value={featureSearch}
                      onChange={(e) => setFeatureSearch(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border/60 bg-muted/20 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Árvore de Recursos */}
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 max-h-80 overflow-y-auto space-y-3">
                    {filteredTree.map((parent) => {
                      const childrenIds = (parent.children || []).map((c) => c.id)
                      const isParentChecked = formData.selectedFeatureIds.includes(parent.id)
                      const selectedChildrenCount = childrenIds.filter((cid) => formData.selectedFeatureIds.includes(cid)).length
                      const totalChildren = childrenIds.length

                      return (
                        <div key={parent.id} className="p-3 rounded-2xl bg-background border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isParentChecked}
                                onChange={() => toggleFeature(parent.id, childrenIds)}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                {parent.name}
                                <code className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-mono font-normal">
                                  {parent.code}
                                </code>
                              </span>
                            </label>

                            <div className="flex items-center gap-2">
                              {totalChildren > 0 && (
                                <span className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.2 rounded",
                                  selectedChildrenCount === totalChildren
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : selectedChildrenCount > 0
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    : "text-muted-foreground bg-muted"
                                )}>
                                  {selectedChildrenCount}/{totalChildren} sub-recursos
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickParentId(parent.id)
                                  setQuickFeatureCode(`${parent.code}.`)
                                  setQuickFeatureName("")
                                  setQuickFeatureModalOpen(true)
                                }}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                title="Adicionar sub-recurso rapidamente"
                              >
                                <Plus className="h-3 w-3" />
                                Sub-recurso
                              </button>
                            </div>
                          </div>

                          {/* Children Sub-features */}
                          {totalChildren > 0 && (
                            <div className="pl-6 pt-1 space-y-1.5 border-l-2 border-border/60 ml-2">
                              {parent.children.map((sub) => {
                                const isSubChecked = formData.selectedFeatureIds.includes(sub.id)
                                return (
                                  <label key={sub.id} className="flex items-center justify-between cursor-pointer select-none text-[11px] p-1 rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isSubChecked}
                                        onChange={() => toggleSingleSubFeature(sub.id, parent.id)}
                                        className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      />
                                      <span className={cn(isSubChecked ? "text-foreground font-semibold" : "text-muted-foreground")}>
                                        {sub.name}
                                      </span>
                                      <code className="text-[8px] text-muted-foreground/70 font-mono">
                                        ({sub.code})
                                      </code>
                                    </div>

                                    {isSubChecked ? (
                                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Habilitado</span>
                                    ) : (
                                      <span className="text-[9px] text-muted-foreground/60">Bloqueado</span>
                                    )}
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {filteredTree.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4 italic">
                        Nenhum recurso encontrado com o filtro "{featureSearch}".
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  ABA 3: APRESENTAÇÃO VISUAL NO CARD (BULLETS INCLUSOS E NÃO INCLUSOS)
              ───────────────────────────────────────────────────────────── */}
              {modalTab === "presentation" && (
                <div className="space-y-5 animate-in fade-in-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <div>
                      <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <ListChecks className="h-4 w-4" />
                        Textos de Apresentação no Card Público
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Estes itens aparecem com ícones de Check e X no modal e na página de contratação de planos.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={autoGenerateBullets}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-8 rounded-xl shadow-xs"
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                      Gerar Automaticamente
                    </Button>
                  </div>

                  {/* Recursos Inclusos (Bullets Verdes) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-500" />
                        Recursos Inclusos (Exibidos com Check):
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {formData.featuresText.length} itens cadastrados
                      </span>
                    </div>

                    {/* Input para adicionar novo bullet */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Robô de WhatsApp com confirmação automática..."
                        value={newBulletText}
                        onChange={(e) => setNewBulletText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addFeatureBullet()
                          }
                        }}
                        className="flex-1 h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addFeatureBullet}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>

                    {/* Lista de Bullets */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {formData.featuresText.map((bullet, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background border border-border/50 text-xs">
                          <div className="flex items-center gap-2 flex-1">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="font-medium text-foreground">{bullet}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeatureBullet(idx)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {formData.featuresText.length === 0 && (
                        <p className="text-xs text-muted-foreground italic py-2">
                          Nenhum bullet cadastrado. Clique no botão "Gerar Automaticamente" acima.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recursos NÃO Inclusos (Bullets com X cinza/tachado) */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <X className="h-4 w-4 text-muted-foreground" />
                        Recursos Não Inclusos (Exibidos com X no card):
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {formData.notIncludedText.length} itens
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Multi-unidades / Filiais..."
                        value={newNotIncludedText}
                        onChange={(e) => setNewNotIncludedText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addNotIncludedBullet()
                          }
                        }}
                        className="flex-1 h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addNotIncludedBullet}
                        className="text-xs font-bold h-9 rounded-xl"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {formData.notIncludedText.map((bullet, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-background border border-border/50 text-xs">
                          <div className="flex items-center gap-2 flex-1">
                            <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground line-through">{bullet}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNotIncludedBullet(idx)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação do Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {formData.selectedFeatureIds.length} módulos e {formData.featuresText.length} bullets configurados.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                    className="text-xs font-semibold rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs px-5"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingPlan ? (
                      "Salvar Alterações no Plano"
                    ) : (
                      "Criar Novo Plano"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR SUB-RECURSO RÁPIDO ON-THE-FLY */}
      {quickFeatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-background border border-border p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-indigo-500" />
                Adicionar Sub-recurso
              </h4>
              <button
                type="button"
                onClick={() => setQuickFeatureModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateFeature} className="space-y-4">
              {quickFeatureError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">
                  {quickFeatureError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nome do Sub-recurso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Emissão de Notas Fiscais"
                  value={quickFeatureName}
                  onChange={(e) => setQuickFeatureName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Código Único *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: financeiro.notas_fiscais"
                  value={quickFeatureCode}
                  onChange={(e) => setQuickFeatureCode(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickFeatureModalOpen(false)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar & Vincular"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
