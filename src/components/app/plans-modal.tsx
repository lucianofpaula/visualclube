"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  Loader2,
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { activateTrialOrSubscribe, createMercadoPagoCheckoutSession, PlatformPlanDTO } from "@/actions/subscription-actions"

interface PlansModalProps {
  isOpen: boolean
  onClose: () => void
  plans: PlatformPlanDTO[]
  currentPlanSlug?: string | null
  onPlanActivated?: () => void
}

export function PlansModal({
  isOpen,
  onClose,
  plans,
  currentPlanSlug,
  onPlanActivated,
}: PlansModalProps) {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY")
  const [activeMobileTab, setActiveMobileTab] = useState<string>("pro")
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>("pro")
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [activeAction, setActiveAction] = useState<"trial" | "checkout" | null>(null)

  if (!isOpen) return null

  const handleActivatePlan = (slug: string) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setSelectedPlanSlug(slug)
    setActiveAction("trial")

    startTransition(async () => {
      const res = await activateTrialOrSubscribe({
        planSlug: slug,
        billingCycle,
      })

      if (res.success) {
        setSuccessMsg(res.message || "Plano ativado com sucesso!")
        if (onPlanActivated) {
          onPlanActivated()
        }
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1200)
      } else {
        setErrorMsg(res.error || "Ocorreu um erro ao ativar o plano.")
      }
    })
  }

  const handleMercadoPagoCheckout = (slug: string) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setSelectedPlanSlug(slug)
    setActiveAction("checkout")

    startTransition(async () => {
      const res = await createMercadoPagoCheckoutSession({
        planSlug: slug,
        billingCycle,
      })

      if (res.success && res.checkoutUrl) {
        setSuccessMsg("Redirecionando para o Mercado Pago...")
        window.location.href = res.checkoutUrl
      } else {
        setErrorMsg(res.error || "Não foi possível iniciar o pagamento com Mercado Pago.")
      }
    })
  }

  const renderPlanCard = (plan: PlatformPlanDTO, isMobileView: boolean = false) => {
    const price = billingCycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly
    const isPopular = plan.slug === "pro"
    const isCurrent = currentPlanSlug === plan.slug
    const isSelectingThisTrial = isPending && selectedPlanSlug === plan.slug && activeAction === "trial"
    const isSelectingThisCheckout = isPending && selectedPlanSlug === plan.slug && activeAction === "checkout"

    return (
      <Card
        key={plan.id}
        className={cn(
          "relative flex flex-col justify-between transition-all duration-200 rounded-2xl border",
          isPopular
            ? "border-2 border-emerald-500 shadow-xl bg-card"
            : "border-border/70 bg-card/60",
          isMobileView ? "w-full shadow-lg" : ""
        )}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap z-10">
            ⭐ Mais Escolhido
          </div>
        )}

        <div>
          <CardHeader className="space-y-2 pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl font-bold">{plan.name}</CardTitle>
              {plan.badge && (
                <Badge variant={isPopular ? "gold" : "outline"} className="text-[10px] px-2">
                  {plan.badge}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs min-h-[32px] leading-relaxed">
              {plan.description}
            </CardDescription>

            <div className="pt-2 flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground font-semibold">R$</span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {price.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs text-muted-foreground">/ mês</span>
            </div>
            {billingCycle === "YEARLY" && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Faturado anualmente (R$ {(price * 12).toFixed(2).replace(".", ",")} / ano)
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-2.5 pt-0">
            <div className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Recursos inclusos:
            </div>

            <div className="space-y-2">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-[11px] leading-snug">{feature}</span>
                </div>
              ))}

              {plan.notIncluded.map((notInc, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground/50 line-through">
                  <div className="h-4 w-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5 text-[9px]">
                    ✕
                  </div>
                  <span className="text-xs sm:text-[11px] leading-snug">{notInc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </div>

        <CardFooter className="pt-4 pb-4 flex flex-col gap-2">
          {/* Botão Principal: Assinar com Mercado Pago */}
          <Button
            onClick={() => handleMercadoPagoCheckout(plan.slug)}
            disabled={isPending || isCurrent}
            className={cn(
              "w-full h-11 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5",
              isPopular
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
          >
            {isSelectingThisCheckout ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCurrent ? (
              "Plano Atual"
            ) : (
              <>
                <CreditCard className="h-3.5 w-3.5" />
                Assinar via Mercado Pago
              </>
            )}
          </Button>

          {/* Botão Secundário: Testar 7 Dias Grátis */}
          {!isCurrent && (
            <Button
              variant="ghost"
              onClick={() => handleActivatePlan(plan.slug)}
              disabled={isPending}
              className="w-full h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground rounded-lg"
            >
              {isSelectingThisTrial ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <>
                  Ou testar 7 dias grátis sem cartão
                  <ArrowRight className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-t-3xl sm:rounded-3xl bg-background border border-border/80 p-4 sm:p-8 shadow-2xl max-h-[94vh] sm:max-h-[92vh] flex flex-col my-0 sm:my-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors z-20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto no-scrollbar pr-0.5 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto pt-2 sm:pt-0">
            <Badge variant="outline" className="px-3 py-0.5 font-semibold text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              ✨ Escolha Seu Plano VisualClube
            </Badge>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-foreground">
              Desbloqueie todo o potencial do seu espaço
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Comece agora com <span className="font-bold text-foreground">7 dias de teste grátis</span>. Sem necessidade de cartão de crédito.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={cn(
                    "px-4 py-1.5 rounded-xl transition-all",
                    billingCycle === "MONTHLY"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("YEARLY")}
                  className={cn(
                    "px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
                    billingCycle === "YEARLY"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Anual
                  <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                    -25% OFF
                  </span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-pulse">
                🎉 {successMsg}
              </div>
            )}
          </div>

          {/* MOBILE VIEW: Segmented Tab Selector (< md) */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between p-1 bg-muted/70 rounded-2xl border border-border/60 mb-4">
              {plans.map((p) => {
                const isActive = activeMobileTab === p.slug
                const isPop = p.slug === "pro"
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setActiveMobileTab(p.slug)}
                    className={cn(
                      "flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1",
                      isActive
                        ? "bg-background text-foreground shadow-sm border border-border/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isPop && <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />}
                    <span className="truncate">{p.name.split(" ")[0]}</span>
                    {isPop && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1 rounded font-black">
                        TOP
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected Plan Card on Mobile */}
            {plans
              .filter((p) => p.slug === activeMobileTab)
              .map((p) => renderPlanCard(p, true))}
          </div>

          {/* DESKTOP VIEW: 3 Columns Grid (md and up) */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 pb-2">
            {plans.map((p) => renderPlanCard(p, false))}
          </div>

          {/* Footer Guarantees */}
          <div className="pt-3 border-t border-border/40 text-center text-[11px] text-muted-foreground flex flex-wrap items-center justify-center gap-4 sm:gap-6 pb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>7 dias sem compromisso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Liberação imediata</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
