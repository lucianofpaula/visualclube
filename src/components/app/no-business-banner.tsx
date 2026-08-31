"use client"

import * as React from "react"
import Link from "next/link"
import { Building2, Sparkles, ArrowRight, CheckCircle2, Store, Globe, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NoBusinessBannerProps {
  userName?: string | null
}

export function NoBusinessBanner({ userName }: NoBusinessBannerProps) {
  const firstName = userName ? userName.split(" ")[0] : "Parceiro"

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-card to-background p-6 sm:p-8 shadow-xl backdrop-blur-xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Primeiro Passo Obrigatório
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              Configure seu espaço em menos de 1 minuto
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
            Olá, {firstName}! Vamos criar o seu estabelecimento?
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Seu plano do <strong className="text-foreground">VisualClube</strong> está ativo com 7 dias grátis. Para começar a usar a agenda, comandas, equipe e gerar seu <strong className="text-foreground">Website Premium na Bio</strong>, cadastre os dados básicos do seu espaço.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Link da Bio exclusivo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Agenda online 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Mini-site gerado com IA</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <Link href="/app/meu-negocio/criar">
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-12 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 gap-2 transition-all hover:scale-[1.02]"
            >
              <Store className="h-4 w-4" />
              <span>Criar Meu Espaço Agora</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <p className="text-[11px] text-center text-muted-foreground">
            Leva apenas 30 segundos
          </p>
        </div>
      </div>
    </div>
  )
}
