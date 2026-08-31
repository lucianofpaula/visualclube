"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Lock,
  CheckCircle2,
  Layers,
  ChevronRight
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSubscription } from "@/components/app/app-shell"
import { SubscriptionBanner } from "@/components/app/subscription-banner"
import { NoBusinessBanner } from "@/components/app/no-business-banner"
import { getFeatureIcon, getFeatureColors } from "@/components/app/dynamic-icon"
import { cn } from "@/lib/utils"

export default function AppDashboardPage() {
  const { 
    subscription, 
    featuresCatalog = [], 
    openPlansModal, 
    isLocked, 
    hasFeature, 
    hasBusiness, 
    currentUser 
  } = useSubscription()

  const handleCardAction = (e: React.MouseEvent, featureCode: string, href: string) => {
    if (isLocked || !hasFeature(featureCode)) {
      e.preventDefault()
      openPlansModal()
    }
  }

  // Fallback se featuresCatalog ainda não foi carregado
  const modules = featuresCatalog.length > 0 ? featuresCatalog : [
    {
      id: "agenda",
      code: "agenda",
      name: "Agenda & Horários",
      description: "Agendamentos online, controle de profissionais e grade diária.",
      icon: "calendar",
      menuPath: "/app/agenda",
      order: 1,
      children: [
        { id: "1", code: "agenda.grade", name: "Grade Diária", description: null, icon: null, menuPath: null },
        { id: "2", code: "agenda.online", name: "Link da Bio", description: null, icon: null, menuPath: null },
      ]
    },
    {
      id: "comandas",
      code: "comandas",
      name: "Comandas Digitais",
      description: "Abertura de comandas, barbearia/salão, itens de consumo e fechamento.",
      icon: "receipt",
      menuPath: "/app/comandas",
      order: 2,
      children: [
        { id: "3", code: "comandas.split", name: "Split de Pagamentos", description: null, icon: null, menuPath: null }
      ]
    },
    {
      id: "servicos",
      code: "servicos",
      name: "Serviços & Catálogo",
      description: "Cadastro de serviços, preços, duração e comissões dos profissionais.",
      icon: "scissors",
      menuPath: "/app/servicos",
      order: 3,
      children: []
    },
    {
      id: "equipe",
      code: "equipe",
      name: "Equipe & Comissões",
      description: "Profissionais cadastrados, divisão de comissão e controle de repasse.",
      icon: "users",
      menuPath: "/app/equipe",
      order: 4,
      children: []
    },
    {
      id: "financeiro",
      code: "financeiro",
      name: "Financeiro & Caixa",
      description: "Fluxo de caixa diário, entradas, saídas e relatórios consolidados.",
      icon: "wallet",
      menuPath: "/app/financeiro",
      order: 5,
      children: []
    },
    {
      id: "clube_vip",
      code: "clube_vip",
      name: "Clube VIP & Recorrência",
      description: "Planos de assinatura mensal para clientes recorrentes.",
      icon: "sparkles",
      menuPath: "/app/clube",
      order: 6,
      children: []
    }
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Banner Notificador de Planos / Trial */}
      <SubscriptionBanner
        subscription={subscription}
        onOpenPlans={openPlansModal}
      />

      {/* Banner de Onboarding: Criar Espaço */}
      {!hasBusiness && (
        <NoBusinessBanner userName={currentUser?.name} />
      )}

      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            Painel Principal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestão completa do seu espaço. Todos os módulos cadastrados no sistema estão disponíveis abaixo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/painel-teste">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Ver Protótipo (painel-teste)
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Módulos Dinâmicos da Plataforma */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const Icon = getFeatureIcon(mod.icon || mod.code)
          const colors = getFeatureColors(mod.code)
          const href = mod.menuPath || `/app/${mod.code.replace(/_/g, "-")}`
          const isPermitted = hasFeature(mod.code)
          const itemLocked = isLocked || !isPermitted
          const subFeatures = mod.children || []

          return (
            <Card
              key={mod.id}
              className={cn(
                "transition-all group flex flex-col justify-between relative overflow-hidden",
                itemLocked
                  ? "border-border/60 hover:border-amber-500/40 bg-card/60"
                  : "border-border/80 hover:border-primary/50 bg-card hover:shadow-md"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${colors.bgClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {itemLocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Lock className="h-3 w-3" />
                      Bloqueado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Habilitado
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span>{mod.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs min-h-[32px] mt-1">
                    {mod.description || "Automatize e gerencie este módulo no seu estabelecimento."}
                  </CardDescription>
                </div>

                {/* Sub-recursos cadastrados */}
                {subFeatures.length > 0 && (
                  <div className="pt-2 border-t border-border/40 mt-2">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <span>{subFeatures.length} {subFeatures.length === 1 ? "Sub-recurso" : "Sub-recursos"}:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {subFeatures.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/40 truncate max-w-[150px]"
                          title={sub.name}
                        >
                          {sub.name}
                        </span>
                      ))}
                      {subFeatures.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{subFeatures.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <Link
                  href={href}
                  onClick={(e) => handleCardAction(e, mod.code, href)}
                  className="block w-full"
                >
                  <Button
                    variant={itemLocked ? "outline" : "secondary"}
                    size="sm"
                    className={cn(
                      "w-full text-xs font-semibold transition-all",
                      itemLocked
                        ? "border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                        : "group-hover:bg-primary group-hover:text-primary-foreground"
                    )}
                  >
                    {itemLocked ? (
                      <>
                        Liberar com Upgrade
                        <Lock className="h-3.5 w-3.5 ml-1.5 text-amber-500" />
                      </>
                    ) : (
                      <>
                        Acessar Módulo
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
