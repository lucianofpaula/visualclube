"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Check, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PricingProps {
  onOpenAuth: (mode?: "login" | "register") => void
}

export function PricingSection({ onOpenAuth }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual")

  const plans = [
    {
      slug: "start",
      name: "Start",
      description: "Ideal para profissionais autônomos ou espaços com até 2 profissionais.",
      priceMonthly: 69.90,
      priceAnnual: 49.90,
      badge: "Iniciante",
      badgeVariant: "outline" as const,
      popular: false,
      features: [
        "Até 2 profissionais na equipe",
        "Agendamentos online ilimitados",
        "Link personalizado para Instagram",
        "Controle de comandas básico",
        "Relatório financeiro mensal",
        "Suporte por e-mail e WhatsApp",
      ],
      notIncluded: [
        "Robô de confirmação automática WhatsApp",
        "Clube de Assinaturas & Recorrência",
        "Split de pagamento e comissão avançada",
      ],
    },
    {
      slug: "pro",
      name: "Profissional Pro",
      description: "O mais escolhido. Perfeito para barbearias, salões e estéticas que querem crescer.",
      priceMonthly: 129.90,
      priceAnnual: 97.90,
      badge: "Mais Popular",
      badgeVariant: "gold" as const,
      popular: true,
      features: [
        "Até 8 profissionais inclusos",
        "Agendamentos online 24/7 sem limites",
        "Robô WhatsApp com confirmação de presença",
        "Comandas Digitais completas com Bar/Produtos",
        "Split automático de comissões por profissional",
        "Módulo de Clube VIP / Assinaturas Recorrentes",
        "Controle de estoque de produtos e bebidas",
        "PIX com baixa automática no sistema",
        "Suporte prioritário via WhatsApp",
      ],
      notIncluded: [],
    },
    {
      slug: "elite",
      name: "Multi-Unidades / Elite",
      description: "Para redes de salões, barbearias grandes ou franquias que necessitam de suporte dedicado.",
      priceMonthly: 249.90,
      priceAnnual: 189.90,
      badge: "Empresarial",
      badgeVariant: "purple" as const,
      popular: false,
      features: [
        "Profissionais ilimitados",
        "Gestão multi-unidades / filiais",
        "Todas as funções do plano Pro inclusas",
        "Múltiplos robôs de WhatsApp por filial",
        "API aberta para integração contábil e ERP",
        "Gerente de conta dedicado",
        "Migração gratuita dos seus dados antigos",
      ],
      notIncluded: [],
    },
  ]

  return (
    <section id="planos" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-primary/30 text-primary">
            Investimento Transparente
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Planos simples que cabem no seu bolso
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Comece grátis por 7 dias. Sem pegadinhas, sem taxas escondidas por agendamento.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center pt-4">
            <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all",
                  billingCycle === "monthly"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all flex items-center gap-1.5",
                  billingCycle === "annual"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Anual
                <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                  Economize 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly
            return (
              <Card
                key={idx}
                className={cn(
                  "relative flex flex-col justify-between transition-all duration-300 rounded-3xl",
                  plan.popular
                    ? "border-2 border-emerald-500/80 shadow-2xl bg-card/90 ring-4 ring-emerald-500/10 md:-translate-y-2"
                    : "border-border/60 bg-card/60 hover:border-border"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                    ⭐ Escolha Mais Recomendada
                  </div>
                )}

                <div>
                  <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <Badge variant={plan.badgeVariant} className="text-xs">
                        {plan.badge}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs leading-relaxed min-h-[36px]">
                      {plan.description}
                    </CardDescription>

                    <div className="pt-4 flex items-baseline gap-1">
                      <span className="text-xs text-muted-foreground font-semibold">R$</span>
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                        {price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-muted-foreground">/ mês</span>
                    </div>
                    {billingCycle === "annual" && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Faturado anualmente (R$ {(price * 12).toFixed(2).replace(".", ",")} / ano)
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                      O que está incluso:
                    </div>

                    <div className="space-y-2.5">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                          <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}

                      {plan.notIncluded.map((notInc, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground/60 line-through">
                          <div className="h-4 w-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                            ✕
                          </div>
                          <span>{notInc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-6">
                  <Button
                    onClick={() => onOpenAuth("register")}
                    className={cn(
                      "w-full h-11 text-sm font-bold rounded-xl transition-all shadow-md",
                      plan.popular
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    )}
                  >
                    Testar 7 Dias Grátis
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Security / Guarantee Callout */}
        <div className="mt-12 text-center text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Garantia de 7 dias sem risco</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Cancelamento com 1 clique a qualquer momento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Seus dados 100% seguros na nuvem</span>
          </div>
        </div>
      </div>
    </section>
  )
}
