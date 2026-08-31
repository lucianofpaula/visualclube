"use client"

import * as React from "react"
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Smartphone, 
  Receipt, 
  Calendar, 
  TrendingUp, 
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InteractivePreview } from "@/components/landing/interactive-preview"

interface HeroProps {
  onOpenAuth: (mode?: "login" | "register") => void
}

export function Hero({ onOpenAuth }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background Decorative Gradients & Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 blur-[120px] -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 blur-[90px] -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-md animate-in fade-in-50 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Tudo-em-Um para Barbearias, Salões & Estética</span>
            <span className="hidden sm:inline-block text-muted-foreground">•</span>
            <span className="hidden sm:inline-flex items-center text-primary font-bold">
              Versão 2.0 com Comanda Digital
            </span>
          </div>
        </div>

        {/* Main Headline & Pitch */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Chega de planilhas e no-show.{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
              Automatize seu espaço
            </span>{" "}
            em minutos.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Agendamento online 24/7 integrado ao <strong>WhatsApp</strong>, comandas digitais com bar/produtos, divisão automática de comissões e controle financeiro completo.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              onClick={() => onOpenAuth("register")}
              className="w-full sm:w-auto h-12 px-8 text-base font-bold rounded-2xl bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Criar Conta Grátis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => onOpenAuth("login")}
              className="w-full sm:w-auto h-12 px-6 text-sm font-semibold rounded-2xl border-border/80 hover:bg-muted/80 backdrop-blur-sm"
            >
              Acessar Painel (Login)
            </Button>
          </div>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 text-xs sm:text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>7 dias grátis sem cartão</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Login rápido por WhatsApp ou Email</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-foreground">4.9/5</span>
              <span>(+2.400 espaços)</span>
            </div>
          </div>
        </div>

        {/* Interactive Dashboard Preview Showpiece */}
        <div className="mt-14 sm:mt-18">
          <InteractivePreview />
        </div>
      </div>
    </section>
  )
}
