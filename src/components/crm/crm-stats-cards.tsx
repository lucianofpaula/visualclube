"use client"

import * as React from "react"
import { Users, UserPlus, Sparkles, AlertTriangle, ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui/card"

interface CRMStatsProps {
  stats: {
    total: number
    newThisMonth: number
    recurrent: number
    atRisk: number
  } | null
  activeFilter: string
  onFilterChange: (status: "all" | "new" | "recurrent" | "club" | "at_risk") => void
}

export function CRMStatsCards({ stats, activeFilter, onFilterChange }: CRMStatsProps) {
  const total = stats?.total || 0
  const newThisMonth = stats?.newThisMonth || 0
  const recurrent = stats?.recurrent || 0
  const atRisk = stats?.atRisk || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total de Clientes */}
      <Card
        onClick={() => onFilterChange("all")}
        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          activeFilter === "all"
            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
            : "border-border/60 hover:border-border bg-card/50 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total na Base
          </span>
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground">{total}</span>
          <span className="text-[11px] text-muted-foreground">clientes</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Todos os clientes cadastrados</p>
      </Card>

      {/* 2. Novos este Mês */}
      <Card
        onClick={() => onFilterChange("new")}
        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          activeFilter === "new"
            ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20"
            : "border-border/60 hover:border-border bg-card/50 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Novos (30 dias)
          </span>
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
            <UserPlus className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground">{newThisMonth}</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">cadastros recentes</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Primeiro atendimento recente</p>
      </Card>

      {/* 3. Frequentes / Recorrentes */}
      <Card
        onClick={() => onFilterChange("recurrent")}
        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          activeFilter === "recurrent"
            ? "border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20"
            : "border-border/60 hover:border-border bg-card/50 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Frequentes / VIP
          </span>
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-110">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground">{recurrent}</span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">clientes fiéis</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">3+ visitas ou membros ativos</p>
      </Card>

      {/* 4. Em Risco de Churn */}
      <Card
        onClick={() => onFilterChange("at_risk")}
        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          activeFilter === "at_risk"
            ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
            : "border-border/60 hover:border-border bg-card/50 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Em Risco (+30 dias)
          </span>
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground">{atRisk}</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">sem retorno recente</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Oportunidade de reconquista</p>
      </Card>
    </div>
  )
}
