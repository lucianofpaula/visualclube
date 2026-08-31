"use client"

import * as React from "react"
import { useState, useTransition, useMemo } from "react"
import { 
  Plus, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  FolderPlus,
  Search,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Eye,
  EyeOff,
  Power
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  FeatureTreeNode, 
  createPlatformFeature, 
  updatePlatformFeature, 
  deletePlatformFeature,
  togglePlatformFeatureStatus 
} from "@/actions/admin-actions"
import { cn } from "@/lib/utils"

interface FeaturesManagerProps {
  initialFeatures: FeatureTreeNode[]
}

export function FeaturesManager({ initialFeatures }: FeaturesManagerProps) {
  const [features, setFeatures] = useState<FeatureTreeNode[]>(initialFeatures)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    agenda: true,
    financeiro: true,
    comandas: true,
  })
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<FeatureTreeNode | null>(null)
  const [parentIdForNewSub, setParentIdForNewSub] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Form State
  const [formData, setFormData] = useState<{
    code: string
    name: string
    description: string
    icon: string
    menuPath: string
    order: number
    isActive: boolean
  }>({
    code: "",
    name: "",
    description: "",
    icon: "Layers",
    menuPath: "",
    order: 1,
    isActive: true,
  })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Filter features
  const filteredFeatures = useMemo(() => {
    let result = features

    if (statusFilter === "active") {
      result = result.filter((p) => p.isActive)
    } else if (statusFilter === "inactive") {
      result = result.filter((p) => !p.isActive)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.map((parent) => {
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
    }

    return result
  }, [features, searchQuery, statusFilter])

  const handleOpenCreateParent = () => {
    setEditingFeature(null)
    setParentIdForNewSub(null)
    setFormData({
      code: "",
      name: "",
      description: "",
      icon: "Layers",
      menuPath: "/app/",
      order: features.length + 1,
      isActive: true,
    })
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleOpenCreateSub = (parent: FeatureTreeNode) => {
    setEditingFeature(null)
    setParentIdForNewSub(parent.id)
    setFormData({
      code: `${parent.code}.`,
      name: "",
      description: "",
      icon: parent.icon || "Layers",
      menuPath: parent.menuPath || "",
      order: (parent.children?.length || 0) + 1,
      isActive: true,
    })
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (feat: FeatureTreeNode) => {
    setEditingFeature(feat)
    setParentIdForNewSub(feat.parentId)
    setFormData({
      code: feat.code,
      name: feat.name,
      description: feat.description || "",
      icon: feat.icon || "Layers",
      menuPath: feat.menuPath || "",
      order: feat.order,
      isActive: feat.isActive,
    })
    setErrorMsg(null)
    setModalOpen(true)
  }

  const handleToggleStatus = (id: string, name: string) => {
    startTransition(async () => {
      const res = await togglePlatformFeatureStatus(id)
      if (res.success) {
        showToast(`Status do recurso "${name}" atualizado para ${res.isActive ? "Ativo" : "Pausado"}.`)
        window.location.reload()
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMsg("Nome e código são obrigatórios.")
      return
    }

    startTransition(async () => {
      if (editingFeature) {
        const res = await updatePlatformFeature(editingFeature.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          menuPath: formData.menuPath,
          order: formData.order,
          isActive: formData.isActive,
        })
        if (!res.success) {
          setErrorMsg(res.error || "Erro ao atualizar recurso.")
          return
        }
      } else {
        const res = await createPlatformFeature({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          menuPath: formData.menuPath,
          parentId: parentIdForNewSub,
          order: formData.order,
          isActive: formData.isActive,
        })
        if (!res.success) {
          setErrorMsg(res.error || "Erro ao criar recurso.")
          return
        }
      }

      setModalOpen(false)
      showToast(editingFeature ? "Recurso atualizado com sucesso!" : "Recurso criado com sucesso!")
      window.location.reload()
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o recurso "${name}" e todos os seus sub-recursos?`)) {
      return
    }

    startTransition(async () => {
      await deletePlatformFeature(id)
      showToast(`Recurso "${name}" removido.`)
      window.location.reload()
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-7 w-7 text-indigo-500" />
            Catálogo de Recursos & Módulos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cadastre os recursos do sistema, pause módulos em desenvolvimento e gerencie o que aparece no app e nos planos.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateParent}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Recurso Principal
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Filtrar por nome ou código (ex: agenda, comissões)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-xl border border-border/60 bg-muted/20 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1 rounded-lg font-semibold transition-all",
              statusFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos ({features.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={cn(
              "px-3 py-1 rounded-lg font-semibold transition-all",
              statusFilter === "active" ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Ativos ({features.filter((f) => f.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={cn(
              "px-3 py-1 rounded-lg font-semibold transition-all",
              statusFilter === "inactive" ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pausados ({features.filter((f) => !f.isActive).length})
          </button>
        </div>
      </div>

      {/* Feature Tree List */}
      <div className="space-y-3">
        {filteredFeatures.map((parent) => {
          const isExpanded = !!expandedIds[parent.id]
          const childrenCount = parent.children?.length || 0

          return (
            <Card key={parent.id} className={cn(
              "border-border/70 overflow-hidden bg-card/80 transition-all",
              !parent.isActive && "opacity-60 bg-muted/20 border-dashed"
            )}>
              {/* Parent Row */}
              <div className="p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleExpand(parent.id)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <div className={cn(
                    "p-2 rounded-xl border",
                    parent.isActive
                      ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    <Layers className="h-4 w-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{parent.name}</span>
                      <code className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground font-mono">
                        {parent.code}
                      </code>

                      {/* Status Badge */}
                      {parent.isActive ? (
                        <Badge variant="success" className="text-[9px] px-1.5 py-0">
                          Ativo no App
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                          Pausado
                        </Badge>
                      )}

                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {childrenCount} {childrenCount === 1 ? "sub-recurso" : "sub-recursos"}
                      </Badge>
                    </div>
                    {parent.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{parent.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleStatus(parent.id, parent.name)}
                    title={parent.isActive ? "Pausar Recurso (Ocultar do App)" : "Ativar Recurso (Exibir no App)"}
                    className={cn(
                      "h-8 px-2 text-xs font-semibold rounded-lg",
                      parent.isActive
                        ? "text-emerald-600 hover:bg-emerald-500/10"
                        : "text-amber-600 hover:bg-amber-500/10"
                    )}
                  >
                    <Power className="h-3.5 w-3.5 mr-1" />
                    {parent.isActive ? "Ativo" : "Pausado"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenCreateSub(parent)}
                    title="Adicionar Sub-recurso"
                    className="h-8 px-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <FolderPlus className="h-3.5 w-3.5 mr-1" />
                    Sub-recurso
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(parent)}
                    title="Editar Recurso"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(parent.id, parent.name)}
                    title="Excluir"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Children List */}
              {isExpanded && childrenCount > 0 && (
                <div className="border-t border-border/50 bg-muted/20 divide-y divide-border/40 pl-10">
                  {parent.children.map((sub) => (
                    <div
                      key={sub.id}
                      className={cn(
                        "p-3 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors pr-4",
                        !sub.isActive && "opacity-60 bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          sub.isActive ? "bg-indigo-500" : "bg-muted-foreground"
                        )} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">{sub.name}</span>
                            <code className="text-[10px] bg-background px-1 py-0.2 rounded text-muted-foreground font-mono border border-border/60">
                              {sub.code}
                            </code>
                            {sub.isActive ? (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                                Ativo
                              </span>
                            ) : (
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
                                Pausado
                              </span>
                            )}
                          </div>
                          {sub.description && (
                            <p className="text-[11px] text-muted-foreground">{sub.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(sub.id, sub.name)}
                          className={cn(
                            "h-7 px-2 text-[10px] font-bold rounded-md",
                            sub.isActive ? "text-emerald-600 hover:bg-emerald-500/10" : "text-amber-600 hover:bg-amber-500/10"
                          )}
                        >
                          {sub.isActive ? "Ativo" : "Pausado"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(sub)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(sub.id, sub.name)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}

        {filteredFeatures.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8 italic">
            Nenhum recurso encontrado com os filtros aplicados.
          </p>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR RECURSO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-background border border-border/80 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                {editingFeature
                  ? `Editar Recurso`
                  : parentIdForNewSub
                  ? `Novo Sub-recurso`
                  : `Novo Recurso Principal`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Status Toggle */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Status do Recurso:
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formData.isActive
                      ? "Ativo (Visível no painel /app e selecionável nos planos)"
                      : "Pausado (Oculto dos usuários e do app)"}
                  </span>
                </div>

                <div className="flex gap-1 bg-background p-1 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                      formData.isActive
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Ativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: false })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                      !formData.isActive
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Pausado
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nome do Recurso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Relatório de Comissões, CRM de Clientes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Código Único (Slug do Sistema) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingFeature}
                  placeholder="Ex: financeiro.comissoes, agenda.online"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                <p className="text-[10px] text-muted-foreground">
                  Usado no código para validação de permissões (ex: hasFeature("financeiro.comissoes")).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Explicação do que esse recurso faz..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Rota do Menu</label>
                  <input
                    type="text"
                    placeholder="Ex: /app/financeiro"
                    value={formData.menuPath}
                    onChange={(e) => setFormData({ ...formData, menuPath: e.target.value })}
                    className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Ordem</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingFeature ? (
                    "Salvar Alterações"
                  ) : (
                    "Criar Recurso"
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
