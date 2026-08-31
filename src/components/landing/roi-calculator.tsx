"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RoiCalculatorProps {
  onOpenAuth: (mode?: "login" | "register") => void
}

export function RoiCalculator({ onOpenAuth }: RoiCalculatorProps) {
  const [professionals, setProfessionals] = useState(4)
  const [avgTicket, setAvgTicket] = useState(55)

  // Calculations
  const appointmentsPerMonth = professionals * 120 // ~120 atends per month per prof
  const currentMonthlyRevenue = appointmentsPerMonth * avgTicket
  
  // Gains with VisualClube:
  // - 15% reduction in no-show
  // - 20% increase in product/bar sales via digital comanda
  // - ~30 hours saved per month in manual agenda/commissions
  const extraRevenueNoShow = currentMonthlyRevenue * 0.12
  const extraProductSales = (professionals * 600) // extra products
  const totalExtraGain = extraRevenueNoShow + extraProductSales
  const hoursSaved = professionals * 8 // 8h saved per professional per month in calculations

  return (
    <section id="calculadora" className="py-20 sm:py-28 bg-muted/20 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="gold" className="px-3 py-1 text-xs font-semibold">
            <Calculator className="h-3.5 w-3.5 mr-1" />
            Calculadora de Retorno (ROI)
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Veja quanto seu espaço vai lucrar a mais todo mês
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Ajuste a quantidade de profissionais da sua equipe e o ticket médio dos seus serviços para calcular a economia real.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Input Left */}
            <div className="lg:col-span-6 space-y-6">
              {/* Slider 1: Professionals */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-foreground">
                    Profissionais / Cadeiras na Equipe:
                  </label>
                  <span className="text-base font-black px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    {professionals} {professionals === 1 ? "profissional" : "profissionais"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={professionals}
                  onChange={(e) => setProfessionals(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>1 (Individual)</span>
                  <span>10 (Médio)</span>
                  <span>20+ (Grande)</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-foreground">
                    Ticket Médio por Atendimento (R$):
                  </label>
                  <span className="text-base font-black px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    R$ {avgTicket},00
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="250"
                  step="5"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>R$ 25</span>
                  <span>R$ 100</span>
                  <span>R$ 250+</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-muted-foreground space-y-1">
                <p>💡 Estimativa baseada em média real de clientes do VisualClube:</p>
                <p>• Recuperação de horários ociosos com robô de confirmação WhatsApp.</p>
                <p>• Aumento de faturamento com venda de produtos e bar na comanda digital.</p>
              </div>
            </div>

            {/* Results Pill Right */}
            <div className="lg:col-span-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-emerald-500/5 p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Ganho Adicional Estimado / Mês
                </span>
                <div className="text-3xl sm:text-4xl font-black text-foreground mt-1">
                  + R$ {totalExtraGain.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dinheiro que hoje é perdido em faltas, esquecimentos e desorganização.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/60">
                <div className="p-3 rounded-xl bg-card border border-border/60">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Tempo Poupado</span>
                  </div>
                  <div className="text-lg font-bold text-foreground mt-1">
                    ~{hoursSaved}h / mês
                  </div>
                  <div className="text-[10px] text-muted-foreground">Zero cálculo manual</div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border/60">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Redução de No-Show</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    -85% faltas
                  </div>
                  <div className="text-[10px] text-muted-foreground">Com robô WhatsApp</div>
                </div>
              </div>

              <Button
                onClick={() => onOpenAuth("register")}
                className="w-full h-11 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-md"
              >
                Garantir Esse Resultado no Meu Espaço
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
