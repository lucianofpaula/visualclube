"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Sparkles, 
  Plus, 
  Settings, 
  TrendingUp, 
  Check, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Scissors, 
  Tag, 
  Power,
  X
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ClubStatsCards } from "@/components/club/club-stats-cards"
import { ClubPlanModal } from "@/components/club/club-plan-modal"
import { DeletePlanModal } from "@/components/club/delete-plan-modal"
import { toggleClubPlanStatus } from "@/actions/club-actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ClubPlansViewProps {
  initialPlans: any[]
  services: any[]
  clubSettings: any
}

export function ClubPlansView({
  initialPlans = [],
  services = [],
  clubSettings,
}: ClubPlansViewProps) {
  const router = useRouter()
  const [plans, setPlans] = useState<any[]>(initialPlans)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<any | null>(null)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  React.useEffect(() => {
    setPlans(initialPlans)
  }, [initialPlans])

  const handleOpenCreate = () => {
    setSelectedPlan(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (plan: any) => {
    setSelectedPlan(plan)
    setModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleSaveSuccess = (savedPlan?: any, isEdit?: boolean) => {
    if (savedPlan) {
      if (isEdit) {
        setPlans((prev) => prev.map((p) => (p.id === savedPlan.id ? savedPlan : p)))
      } else {
        setPlans((prev) => [savedPlan, ...prev.filter((p) => p.id !== savedPlan.id)])
      }
    }
    router.refresh()
  }

  const handleOpenDelete = (plan: any) => {
    setPlanToDelete(plan)
    setDeleteModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
    setLoadingActionId(planId)
    try {
      const res = await toggleClubPlanStatus(planId, !currentStatus)
      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, isActive: !currentStatus } : p))
        )
      }
    } finally {
      setLoadingActionId(null)
    }
  }

  const handlePlanDeleted = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId))
  }

  const activePlansCount = plans.filter((p) => p.isActive).length
  const referralPlansCount = plans.filter((p) => p.referralEnabled).length

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-purple-500" />
              Planos do Clube de Assinaturas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Crie planos de assinatura mensal com serviços inclusos e bônus de indicação direta e multinível.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/app/clube/configuracoes"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 text-xs font-bold rounded-xl border-border/70 shadow-2xs inline-flex items-center")}
          >
            <Settings className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Configuração do Clube
          </Link>

          <Button
            onClick={handleOpenCreate}
            className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Plano de Assinatura
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <ClubStatsCards
        totalPlans={plans.length}
        activePlans={activePlansCount}
        referralPlansCount={referralPlansCount}
        totalServicesCount={services.length}
        clubEnabled={clubSettings?.clubEnabled ?? true}
        referralEnabled={clubSettings?.clubReferralEnabled ?? false}
      />

      {/* Alerta se o programa de indicação estiver ativo globalmente */}
      {clubSettings?.clubReferralEnabled && (
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Sistema de Indicação Multinível Ativo no Estabelecimento
              </p>
              <p className="text-[11px] text-muted-foreground">
                Modalidades ativas:{" "}
                {clubSettings.clubDirectReferral && (
                  <span className="font-semibold text-foreground">Indicação Direta (Nível 1)</span>
                )}
                {clubSettings.clubDirectReferral && clubSettings.clubIndirectReferral && " + "}
                {clubSettings.clubIndirectReferral && (
                  <span className="font-semibold text-foreground">Multinível Ilimitado (Níveis 2+)</span>
                )}
              </p>
            </div>
          </div>

          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold shrink-0">
            Bonificação Ativa
          </Badge>
        </div>
      )}

      {/* Grid de Planos */}
      {plans.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed rounded-3xl bg-muted/10">
          <div className="h-16 w-16 rounded-3xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Nenhum plano de assinatura cadastrado</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1.5 mb-5 leading-relaxed">
            Transforme clientes eventuais em receita previsível recorrente criando seus planos de clube (ex: Barba & Cabelo Ilimitado).
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Criar Meu Primeiro Plano
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const hasReferral = plan.referralEnabled && Array.isArray(plan.referralRates) && plan.referralRates.length > 0
            const includedRules = Array.isArray(plan.servicesRules) ? plan.servicesRules : []
            const totalCommissionPercent = hasReferral
              ? plan.referralRates.reduce((acc: number, curr: any) => acc + (Number(curr.percentage) || 0), 0)
              : 0
            const isDropdownOpen = openDropdownId === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between border transition-all duration-200 rounded-3xl shadow-xs overflow-hidden ${
                  plan.isActive
                    ? "border-border/80 bg-card hover:border-purple-500/40 hover:shadow-md"
                    : "border-border/40 bg-muted/20 opacity-75"
                }`}
              >
                {/* Topo do Card */}
                <div>
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {plan.badge && (
                          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                            {plan.badge}
                          </Badge>
                        )}
                        <h3 className="text-lg font-black text-foreground tracking-tight line-clamp-1">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : plan.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-border/80 bg-card shadow-lg p-1 animate-in fade-in-50">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(plan)}
                              className="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-muted flex items-center gap-2 text-foreground"
                            >
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                              Editar Plano
                            </button>
                            <div className="h-px bg-border/60 my-1" />
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(plan)}
                              className="w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-destructive/10 flex items-center gap-2 text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              Excluir Plano
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
                      {plan.description || "Sem descrição informada."}
                    </p>

                    {/* Preço */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-muted-foreground">R$</span>
                      <span className="text-3xl font-black text-foreground tracking-tight">
                        {plan.priceMonthly.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        /{plan.billingCycle === "YEARLY" ? "ano" : plan.billingCycle === "QUARTERLY" ? "trimestre" : "mês"}
                      </span>
                    </div>

                    {plan.productDiscountPercent > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <Tag className="h-3.5 w-3.5" />
                        <span>+{plan.productDiscountPercent}% de desconto em produtos</span>
                      </div>
                    )}
                  </div>

                  {/* Comparativo de Todos os Serviços do Espaço */}
                  <div className="px-5 py-3.5 bg-muted/30 border-y border-border/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Scissors className="h-3.5 w-3.5 text-purple-500" />
                        Serviços do Espaço
                      </p>
                      <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 bg-background/80 text-muted-foreground border-border/60">
                        {includedRules.length} de {services.length} inclusos
                      </Badge>
                    </div>

                    {services.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Nenhum serviço cadastrado no catálogo.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                        {services.map((service) => {
                          const isIncluded =
                            plan.includedServiceIds?.includes(service.id) ||
                            includedRules.some((r: any) => r.serviceId === service.id)
                          const rule = includedRules.find((r: any) => r.serviceId === service.id)

                          if (isIncluded) {
                            return (
                              <div
                                key={service.id}
                                className="flex items-center justify-between text-xs font-medium text-foreground py-0.5"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className="h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  </span>
                                  <span className="truncate font-semibold text-foreground">{service.name}</span>
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-bold px-1.5 py-0 shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                >
                                  {rule?.limitType === "FIXED" ? `${rule.monthlyLimit}x/mês` : "Ilimitado"}
                                </Badge>
                              </div>
                            )
                          } else {
                            return (
                              <div
                                key={service.id}
                                className="flex items-center justify-between text-xs text-muted-foreground/60 py-0.5"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className="h-4 w-4 rounded-full bg-muted text-muted-foreground/50 flex items-center justify-center shrink-0">
                                    <X className="h-2.5 w-2.5 stroke-[2.5]" />
                                  </span>
                                  <span className="truncate line-through text-muted-foreground/60">{service.name}</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground/50 italic shrink-0">
                                  Não incluso
                                </span>
                              </div>
                            )
                          }
                        })}
                      </div>
                    )}
                  </div>

                  {/* Matriz de Indicação */}
                  <div className="p-5 pt-3 space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                      Comissões por Indicação
                    </p>

                    {hasReferral ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {plan.referralRates.length} Níveis de Bonificação
                          </span>
                          <span className="text-[11px] font-bold text-muted-foreground">
                            Total: {totalCommissionPercent.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {plan.referralRates.map((rate: any) => (
                            <Badge
                              key={rate.level}
                              className={`text-[10px] font-bold px-2 py-0.5 ${
                                rate.level === 1
                                  ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              }`}
                            >
                              {rate.level}º: {rate.percentage}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                        Sem comissionamento de indicação
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Rodapé com Switch de Ativação */}
                <CardFooter className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)}
                      disabled={loadingActionId === plan.id}
                    />
                    <span className="text-xs font-bold text-foreground">
                      {plan.isActive ? "Plano Ativo" : "Pausado"}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(plan)}
                    className="h-8 text-xs font-bold rounded-xl"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <ClubPlanModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        planToEdit={selectedPlan}
        services={services}
        clubSettings={clubSettings}
        onSuccess={handleSaveSuccess}
      />

      {/* Modal de Confirmação de Exclusão (Soft Delete) */}
      <DeletePlanModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        plan={planToDelete}
        onDeleted={handlePlanDeleted}
      />
    </div>
  )
}
