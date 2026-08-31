"use client"

import * as React from "react"
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CtaProps {
  onOpenAuth: (mode?: "login" | "register") => void
}

export function CtaSection({ onOpenAuth }: CtaProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl border border-border/80 bg-gradient-to-tr from-emerald-950/40 via-card to-indigo-950/40 p-8 sm:p-16 shadow-2xl backdrop-blur-xl text-center">
          {/* Decorative Glows */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Experimente grátis hoje mesmo</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Pronto para transformar a gestão do seu espaço de beleza?
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Junte-se a milhares de estabelecimentos que organizaram a agenda, aumentaram o faturamento com comandas e simplificaram o financeiro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Button
                size="lg"
                onClick={() => onOpenAuth("register")}
                className="w-full sm:w-auto h-12 px-8 text-base font-bold rounded-2xl bg-primary text-primary-foreground hover:opacity-90 shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Criar Minha Conta Grátis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenAuth("login")}
                className="w-full sm:w-auto h-12 px-6 text-sm font-semibold rounded-2xl border-border/80 hover:bg-muted/80 backdrop-blur-sm"
              >
                Fazer Login (Email/WhatsApp)
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                7 dias gratuitos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Sem fidelidade ou multas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Configuração guiada em 5 minutos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
