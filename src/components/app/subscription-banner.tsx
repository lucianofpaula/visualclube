"use client"

import * as React from "react"
import { Sparkles, ShieldAlert, ArrowRight, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SubscriptionBannerProps {
  subscription: {
    status: "TRIALING" | "ACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELED" | "INCOMPLETE"
    trialEndsAt?: Date | null
    plan: {
      name: string
      badge?: string | null
    }
  } | null
  onOpenPlans: () => void
}

export function SubscriptionBanner({ subscription, onOpenPlans }: SubscriptionBannerProps) {
  // Caso 1: Usuário NÃO escolheu nenhum plano ainda
  if (!subscription) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-background p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  Experimente Grátis
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">7 dias de teste</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                Conheça os Planos do VisualClube e libere todos os recursos
              </h3>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Você ainda não selecionou um plano. Escolha o plano ideal para seu espaço e comece seu período de teste de 7 dias gratuitos sem compromisso nem cartão de crédito.
              </p>
            </div>
          </div>

          <Button
            onClick={onOpenPlans}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shrink-0"
          >
            Conhecer Planos
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    )
  }

  // Caso 2: Usuário está em período de Trial
  if (subscription.status === "TRIALING") {
    const daysLeft = subscription.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 7

    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Plano {subscription.plan.name} Ativo
              </span>
              <Badge variant="success" className="text-[9px] px-1.5 py-0">
                Período de Teste
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 text-amber-500" />
              Você possui <strong className="text-foreground">{daysLeft} dias restantes</strong> no seu teste grátis de todos os recursos.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPlans}
          className="text-xs font-semibold h-8 rounded-xl shrink-0"
        >
          Trocar Plano
        </Button>
      </div>
    )
  }

  // Caso 3: Trial Expirado
  if (subscription.status === "EXPIRED") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-destructive/40 bg-destructive/10 p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-destructive/20 text-destructive shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-destructive">
              Seu período de teste expirou
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Escolha uma forma de pagamento para continuar utilizando todos os recursos e automações.
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenPlans}
          className="bg-destructive hover:bg-destructive/90 text-white font-bold text-xs h-8 px-4 rounded-xl shrink-0 shadow-xs"
        >
          Reativar Assinatura
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
    )
  }

  return null
}
