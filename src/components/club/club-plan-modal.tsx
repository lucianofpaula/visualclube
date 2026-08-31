"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Info, 
  ShieldCheck, 
  Percent, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  Tag,
  X
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  createClubPlan, 
  updateClubPlan, 
  SubscriptionPlanInput, 
  ReferralRateItem,
  ServiceRuleItem 
} from "@/actions/club-actions"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ServiceOption {
  id: string
  name: string
  price: number
  category?: string | null
  durationMinutes?: number
}

interface ClubPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planToEdit?: any | null
  services: ServiceOption[]
  clubSettings: {
    clubEnabled?: boolean
    clubReferralEnabled?: boolean
    clubDirectReferral?: boolean
    clubIndirectReferral?: boolean
    clubReferralTerms?: string | null
  } | null
  onSuccess?: (savedPlan?: any, isEdit?: boolean) => void
}

export function ClubPlanModal({
  open,
  onOpenChange,
  planToEdit,
  services = [],
  clubSettings,
  onSuccess,
}: ClubPlanModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "services" | "referral">("basic")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priceMonthly, setPriceMonthly] = useState<number | string>(99.9)
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "QUARTERLY" | "YEARLY">("MONTHLY")
  const [badge, setBadge] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [productDiscountPercent, setProductDiscountPercent] = useState<number | string>(0)

  // Serviços Inclusos e Regras
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [serviceRules, setServiceRules] = useState<Record<string, { limitType: "UNLIMITED" | "FIXED"; monthlyLimit: number }>>({})

  // Indicação & Níveis Multinível
  const [referralEnabled, setReferralEnabled] = useState(false)
  const [referralRates, setReferralRates] = useState<ReferralRateItem[]>([
    { level: 1, percentage: 15, label: "Indicação Direta (Nível 1)" },
    { level: 2, percentage: 5, label: "Nível 2 (Indireta)" },
    { level: 3, percentage: 2.5, label: "Nível 3 (Indireta)" },
  ])

  const isEditing = !!planToEdit

  // Carrega os dados para edição ou reseta para criação
  useEffect(() => {
    if (open) {
      setErrorMessage(null)
      setActiveTab("basic")

      if (planToEdit) {
        setName(planToEdit.name || "")
        setDescription(planToEdit.description || "")
        setPriceMonthly(planToEdit.priceMonthly || 0)
        setBillingCycle(planToEdit.billingCycle || "MONTHLY")
        setBadge(planToEdit.badge || "")
        setIsActive(planToEdit.isActive ?? true)
        setProductDiscountPercent(planToEdit.productDiscountPercent || 0)

        const includedIds: string[] = planToEdit.includedServiceIds || []
        setSelectedServiceIds(includedIds)

        const rulesMap: Record<string, { limitType: "UNLIMITED" | "FIXED"; monthlyLimit: number }> = {}
        if (Array.isArray(planToEdit.servicesRules)) {
          planToEdit.servicesRules.forEach((rule: any) => {
            if (rule.serviceId) {
              rulesMap[rule.serviceId] = {
                limitType: rule.limitType || "UNLIMITED",
                monthlyLimit: rule.monthlyLimit || 4,
              }
            }
          })
        }
        setServiceRules(rulesMap)

        setReferralEnabled(!!planToEdit.referralEnabled)
        if (Array.isArray(planToEdit.referralRates) && planToEdit.referralRates.length > 0) {
          setReferralRates(planToEdit.referralRates)
        } else {
          setReferralRates([
            { level: 1, percentage: 15, label: "Indicação Direta (Nível 1)" },
            { level: 2, percentage: 5, label: "Nível 2 (Indireta)" },
          ])
        }
      } else {
        // Defaults para novo plano
        setName("")
        setDescription("Assinatura mensal com serviços inclusos e descontos exclusivos.")
        setPriceMonthly(99.9)
        setBillingCycle("MONTHLY")
        setBadge("")
        setIsActive(true)
        setProductDiscountPercent(10)
        setSelectedServiceIds([])
        setServiceRules({})
        setReferralEnabled(!!clubSettings?.clubReferralEnabled)
        setReferralRates([
          { level: 1, percentage: 15, label: "Indicação Direta (Nível 1)" },
          { level: 2, percentage: 5, label: "Nível 2 (Indireta)" },
          { level: 3, percentage: 2.5, label: "Nível 3 (Indireta)" },
        ])
      }
    }
  }, [open, planToEdit, clubSettings])

  if (!open) return null

  // Alternar serviço selecionado
  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const exists = prev.includes(serviceId)
      if (exists) {
        const next = prev.filter((id) => id !== serviceId)
        const updatedRules = { ...serviceRules }
        delete updatedRules[serviceId]
        setServiceRules(updatedRules)
        return next
      } else {
        setServiceRules((r) => ({
          ...r,
          [serviceId]: { limitType: "UNLIMITED", monthlyLimit: 4 },
        }))
        return [...prev, serviceId]
      }
    })
  }

  // Atualizar regra do serviço
  const updateServiceRule = (
    serviceId: string,
    field: "limitType" | "monthlyLimit",
    value: any
  ) => {
    setServiceRules((prev) => ({
      ...prev,
      [serviceId]: {
        limitType: field === "limitType" ? value : prev[serviceId]?.limitType || "UNLIMITED",
        monthlyLimit: field === "monthlyLimit" ? Number(value) : prev[serviceId]?.monthlyLimit || 4,
      },
    }))
  }

  // Adicionar Nível de Indicação Multinível
  const addReferralLevel = () => {
    setReferralRates((prev) => {
      const nextLevel = prev.length + 1
      const suggestedPercentage = Math.max(1, Math.round((prev[prev.length - 1]?.percentage || 5) / 2))
      return [
        ...prev,
        {
          level: nextLevel,
          percentage: suggestedPercentage,
          label: nextLevel === 1 ? "Indicação Direta (Nível 1)" : `Nível ${nextLevel} (Indireta)`,
        },
      ]
    })
  }

  // Remover Nível de Indicação
  const removeReferralLevel = (levelToRemove: number) => {
    setReferralRates((prev) => {
      const filtered = prev.filter((item) => item.level !== levelToRemove)
      return filtered.map((item, index) => ({
        ...item,
        level: index + 1,
        label: index === 0 ? "Indicação Direta (Nível 1)" : `Nível ${index + 1} (Indireta)`,
      }))
    })
  }

  // Atualizar percentual de um nível
  const updateReferralRate = (level: number, percentage: number) => {
    setReferralRates((prev) =>
      prev.map((item) => (item.level === level ? { ...item, percentage: Math.max(0, Math.min(100, percentage)) } : item))
    )
  }

  // Cálculos de Margem e Simulação
  const totalCommissionPercentage = referralEnabled
    ? referralRates.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0)
    : 0
  const netRetentionPercentage = Math.max(0, 100 - totalCommissionPercentage)
  const priceNum = Number(priceMonthly) || 0
  const totalDistributedAmount = (priceNum * totalCommissionPercentage) / 100
  const netRetentionAmount = priceNum - totalDistributedAmount

  const isReferralAllowedGlobally = !!clubSettings?.clubReferralEnabled
  const isIndirectAllowedGlobally = !!clubSettings?.clubIndirectReferral

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage("Informe o nome do plano de assinatura.")
      setActiveTab("basic")
      return
    }

    if (Number(priceMonthly) < 0 || isNaN(Number(priceMonthly))) {
      setErrorMessage("Informe um valor mensal válido.")
      setActiveTab("basic")
      return
    }

    if (totalCommissionPercentage > 100) {
      setErrorMessage("A soma das comissões dos níveis não pode ultrapassar 100%.")
      setActiveTab("referral")
      return
    }

    const compiledRules: ServiceRuleItem[] = selectedServiceIds.map((serviceId) => {
      const rule = serviceRules[serviceId]
      const service = services.find((s) => s.id === serviceId)
      return {
        serviceId,
        serviceName: service?.name || "Serviço",
        limitType: rule?.limitType || "UNLIMITED",
        monthlyLimit: rule?.limitType === "FIXED" ? Number(rule.monthlyLimit) || 4 : undefined,
      }
    })

    const payload: SubscriptionPlanInput = {
      name: name.trim(),
      description: description.trim() || null,
      priceMonthly: Number(priceMonthly),
      billingCycle,
      badge: badge.trim() || null,
      includedServiceIds: selectedServiceIds,
      servicesRules: compiledRules,
      productDiscountPercent: Number(productDiscountPercent) || 0,
      referralEnabled: isReferralAllowedGlobally && referralEnabled,
      referralRates: isReferralAllowedGlobally && referralEnabled ? referralRates : [],
      isActive,
    }

    setLoading(true)
    try {
      let res
      if (isEditing && planToEdit.id) {
        res = await updateClubPlan(planToEdit.id, payload)
      } else {
        res = await createClubPlan(payload)
      }

      if (!res.success) {
        setErrorMessage(res.error || "Ocorreu um erro ao salvar o plano.")
        return
      }

      onOpenChange(false)
      if (onSuccess) onSuccess(res.plan, isEditing)
    } catch (err: any) {
      setErrorMessage(err?.message || "Falha na comunicação com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
      <div className="bg-card w-full max-w-3xl rounded-3xl border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground">
                {isEditing ? "Editar Plano de Assinatura" : "Novo Plano de Assinatura"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Configure valores, serviços inclusos e regras de comissionamento multinível por indicação.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground hidden sm:inline">
                {isActive ? "Ativo" : "Pausado"}
              </span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-border/60 bg-card">
          <div className="grid grid-cols-3 gap-1.5 w-full bg-muted/60 p-1.5 rounded-2xl border border-border/60 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={cn(
                "cursor-pointer text-xs font-bold gap-2 rounded-xl py-2 flex items-center justify-center transition-all duration-200 active:scale-95",
                activeTab === "basic"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <DollarSign className={cn("h-3.5 w-3.5", activeTab === "basic" ? "text-white" : "text-muted-foreground")} />
              <span>Dados & Valores</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={cn(
                "cursor-pointer text-xs font-bold gap-2 rounded-xl py-2 flex items-center justify-center transition-all duration-200 active:scale-95",
                activeTab === "services"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <Layers className={cn("h-3.5 w-3.5", activeTab === "services" ? "text-white" : "text-muted-foreground")} />
              <span>Serviços Inclusos ({selectedServiceIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("referral")}
              className={cn(
                "cursor-pointer text-xs font-bold gap-2 rounded-xl py-2 flex items-center justify-center transition-all duration-200 active:scale-95",
                activeTab === "referral"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <TrendingUp className={cn("h-3.5 w-3.5", activeTab === "referral" ? "text-white" : "text-muted-foreground")} />
              <span>Indicações & Níveis</span>
              {referralEnabled && isReferralAllowedGlobally && (
                <span className={cn(
                  "ml-1 h-4 px-1.5 rounded-full text-[9px] font-black flex items-center justify-center",
                  activeTab === "referral" ? "bg-white/25 text-white" : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                )}>
                  {referralRates.length}N
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conteúdo do Formulário */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ABA 1: DADOS BÁSICOS & VALORES */}
          {activeTab === "basic" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Nome do Plano <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Ex: Clube VIP Barba & Cabelo Sem Limites"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Destaque / Selo Visual
                  </label>
                  <Input
                    placeholder="Ex: Mais Popular, VIP"
                    value={badge}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBadge(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Valor da Mensalidade (R$) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-bold text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="99,90"
                      value={priceMonthly}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceMonthly(e.target.value)}
                      className="pl-9 h-10 text-xs font-bold rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Ciclo de Cobrança
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBillingCycle(e.target.value as any)}
                    className="w-full h-10 text-xs font-semibold rounded-xl border border-input bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="MONTHLY">Mensal (Cobrança a cada 30 dias)</option>
                    <option value="QUARTERLY">Trimestral (A cada 3 meses)</option>
                    <option value="YEARLY">Anual (Plano de 12 meses)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Desconto em Produtos (%)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      value={productDiscountPercent}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductDiscountPercent(e.target.value)}
                      className="pr-8 h-10 text-xs rounded-xl"
                    />
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Descrição & Proposta de Valor
                </label>
                <Textarea
                  rows={3}
                  placeholder="Descreva o que o assinante ganha, prioridade na agenda, bebidas liberadas, etc."
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  className="text-xs resize-none rounded-xl"
                />
              </div>
            </div>
          )}

          {/* ABA 2: SERVIÇOS INCLUSOS */}
          {activeTab === "services" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Selecione os serviços que fazem parte desta assinatura
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Defina se cada serviço tem uso ilimitado no mês ou um limite pré-determinado de atendimentos.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  {selectedServiceIds.length} selecionado(s)
                </Badge>
              </div>

              {services.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    Nenhum serviço cadastrado no estabelecimento. Cadastre seus serviços na aba "Serviços & Catálogo" primeiro.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {services.map((service) => {
                    const isSelected = selectedServiceIds.includes(service.id)
                    const rule = serviceRules[service.id] || { limitType: "UNLIMITED", monthlyLimit: 4 }

                    return (
                      <div
                        key={service.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-purple-500/50 bg-purple-500/5 shadow-xs"
                            : "border-border/60 bg-card hover:border-border"
                        }`}
                      >
                        <div
                          className="flex items-start gap-2.5 cursor-pointer"
                          onClick={() => toggleService(service.id)}
                        >
                          <div
                            className={`h-5 w-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                              isSelected
                                ? "bg-purple-500 border-purple-500 text-white"
                                : "border-muted-foreground/40 bg-background"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground leading-tight">
                              {service.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Preço avulso: R$ {service.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-3 pt-2.5 border-t border-purple-500/20 flex items-center gap-2">
                            <select
                              value={rule.limitType}
                              onChange={(e) => updateServiceRule(service.id, "limitType", e.target.value)}
                              className="h-8 text-[11px] font-semibold rounded-lg border border-input bg-background px-2"
                            >
                              <option value="UNLIMITED">Sem Limite (Ilimitado)</option>
                              <option value="FIXED">Limite Mensal</option>
                            </select>

                            {rule.limitType === "FIXED" && (
                              <div className="flex items-center gap-1.5 flex-1">
                                <Input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={rule.monthlyLimit}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateServiceRule(service.id, "monthlyLimit", e.target.value)}
                                  className="h-8 text-[11px] text-center w-16 bg-background font-bold rounded-lg"
                                />
                                <span className="text-[10px] text-muted-foreground">vezes/mês</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: INDICAÇÃO MULTINÍVEL */}
          {activeTab === "referral" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              {!isReferralAllowedGlobally ? (
                <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-foreground space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Programa de Indicação Desativado nas Configurações do Clube</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O sistema de indicação está desligado para o seu estabelecimento. Para poder bonificar clientes por indicações diretas ou indiretas neste plano, ative o recurso nas <strong>Configurações do Clube</strong>.
                  </p>
                  <Link
                    href="/app/clube/configuracoes"
                    target="_blank"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs font-bold bg-background text-foreground border-amber-500/30 rounded-xl inline-flex items-center")}
                  >
                    Abrir Configuração do Clube
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Toggle de Ativação no Plano */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-card flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5 pr-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Ativar Comissionamento por Indicação neste Plano
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        Quando ativo, os clientes que indicarem novos membros para este plano receberão comissões recorrentes a cada mensalidade paga.
                      </p>
                    </div>
                    <Switch
                      checked={referralEnabled}
                      onCheckedChange={setReferralEnabled}
                    />
                  </div>

                  {referralEnabled && (
                    <div className="space-y-4 animate-in fade-in-50 duration-200">
                      {/* Termômetro de Margem & Rateio */}
                      <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            Distribuição de Receita por Assinatura
                          </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {totalCommissionPercentage.toFixed(1)}% distribuído
                          </span>
                        </div>

                        {/* Barra de Progresso Visual */}
                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, totalCommissionPercentage)}%` }}
                            title={`Comissão da Rede: ${totalCommissionPercentage}%`}
                          />
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${netRetentionPercentage}%` }}
                            title={`Retenção do Estabelecimento: ${netRetentionPercentage}%`}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className="bg-background/80 p-2 rounded-xl border border-border/50 text-center">
                            <p className="text-[10px] text-muted-foreground font-semibold">Valor do Plano</p>
                            <p className="text-xs font-black text-foreground">R$ {priceNum.toFixed(2)}</p>
                          </div>
                          <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 text-center">
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Total Comissões</p>
                            <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                              R$ {totalDistributedAmount.toFixed(2)} ({totalCommissionPercentage.toFixed(1)}%)
                            </p>
                          </div>
                          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-center">
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Retenção Líquida</p>
                            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              R$ {netRetentionAmount.toFixed(2)} ({netRetentionPercentage.toFixed(1)}%)
                            </p>
                          </div>
                          <div className="bg-background/80 p-2 rounded-xl border border-border/50 text-center">
                            <p className="text-[10px] text-muted-foreground font-semibold">Profundidade</p>
                            <p className="text-xs font-black text-foreground">{referralRates.length} Níveis</p>
                          </div>
                        </div>
                      </div>

                      {/* Lista Dinâmica de Níveis Multinível */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Matriz de Níveis & Percentuais (Configuração Específica deste Plano)
                          </label>
                          {isIndirectAllowedGlobally && (
                            <button
                              type="button"
                              onClick={addReferralLevel}
                              className="h-7 px-2.5 text-[11px] font-bold text-purple-600 border border-purple-500/30 hover:bg-purple-500/10 rounded-lg inline-flex items-center transition-colors"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar Nível {referralRates.length + 1}
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {referralRates.map((rate, index) => {
                            const isFirstLevel = rate.level === 1
                            const levelAmount = (priceNum * (rate.percentage || 0)) / 100

                            return (
                              <div
                                key={rate.level}
                                className="p-3 rounded-2xl border border-border/60 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                      isFirstLevel
                                        ? "bg-purple-500/10 text-purple-600 border border-purple-500/30"
                                        : "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                                    }`}
                                  >
                                    {rate.level}º
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-foreground">
                                      {rate.label || (isFirstLevel ? "Indicação Direta (Nível 1)" : `Nível ${rate.level} (Indireta)`)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {isFirstLevel
                                        ? "Quem indicou diretamente o novo assinante"
                                        : `Upline ${rate.level - 1} níveis acima do indicador`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  <div className="flex items-center gap-1.5">
                                    <div className="relative w-24">
                                      <Input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="100"
                                        value={rate.percentage}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateReferralRate(rate.level, Number(e.target.value))}
                                        className="h-8 text-xs font-bold text-right pr-6 rounded-lg"
                                      />
                                      <span className="absolute right-2 top-2 text-xs font-bold text-muted-foreground pointer-events-none">
                                        %
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-muted-foreground w-20 text-right">
                                      = R$ {levelAmount.toFixed(2)}
                                    </span>
                                  </div>

                                  {!isFirstLevel && (
                                    <button
                                      type="button"
                                      onClick={() => removeReferralLevel(rate.level)}
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg flex items-center justify-center transition-colors"
                                      title="Remover nível"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {!isIndirectAllowedGlobally && (
                          <p className="text-[11px] text-muted-foreground italic mt-1">
                            * Indicação indireta (multinível) está desabilitada na Configuração do Clube. Apenas o Nível 1 (Direto) está ativo.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rodapé com Ações */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs h-9 font-semibold rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="text-xs h-9 font-bold bg-primary text-primary-foreground shadow-xs rounded-xl"
            >
              {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Plano de Assinatura"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
