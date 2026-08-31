"use client"

import * as React from "react"
import { Sparkles, Users, Layers, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ClubStatsCardsProps {
  totalPlans: number
  activePlans: number
  referralPlansCount: number
  totalServicesCount: number
  clubEnabled: boolean
  referralEnabled: boolean
}

export function ClubStatsCards({
  totalPlans,
  activePlans,
  referralPlansCount,
  totalServicesCount,
  clubEnabled,
  referralEnabled,
}: ClubStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Status do Clube */}
      <Card className="border border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status do Clube
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xl sm:text-2xl font-black text-foreground">
                {clubEnabled ? "Ativo" : "Pausado"}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 font-bold ${
                  clubEnabled
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}
              >
                {clubEnabled ? "Operando" : "Inativo"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {clubEnabled ? "Disponível para clientes assinarem" : "Oculto para novos assinantes"}
            </p>
          </div>
          <div
            className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
              clubEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            }`}
          >
            <Sparkles className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Planos Ativos */}
      <Card className="border border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Planos Cadastrados
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-xl sm:text-2xl font-black text-foreground">
                {activePlans}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                de {totalPlans} total
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Opções de recorrência ativas
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Planos com Indicação */}
      <Card className="border border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Comissão por Indicação
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xl sm:text-2xl font-black text-foreground">
                {referralPlansCount}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 font-bold ${
                  referralEnabled
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {referralEnabled ? "Multinível Habilitado" : "Desativado Global"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Planos bonificando membros
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Serviços Disponíveis */}
      <Card className="border border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Catálogo de Serviços
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-xl sm:text-2xl font-black text-foreground">
                {totalServicesCount}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                serviços no espaço
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Prontos para inclusão em planos
            </p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
