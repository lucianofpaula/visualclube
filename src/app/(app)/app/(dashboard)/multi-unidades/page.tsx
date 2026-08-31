"use client"

import * as React from "react"
import { Building2, Plus, Store, Layers, Users, TrendingUp, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"

export default function MultiUnidadesPage() {
  return (
    <LockedFeatureGuard featureName="Multi-Unidades / Filiais" requiredFeature="multi_unidades">
      <div className="space-y-6 max-w-5xl">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 font-bold">
                <Layers className="h-3 w-3 mr-1" />
                Gestão de Franquias & Filiais
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-7 w-7 text-indigo-500" />
              Multi-Unidades & Filiais
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Cadastre e gerencie múltiplas filiais ou unidades da sua rede com relatórios consolidados.
            </p>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Nova Unidade / Filial</span>
          </Button>
        </div>

        {/* Grade de Unidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-border/60 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Unidade Matriz (Principal)</h3>
                  <p className="text-xs text-muted-foreground">Sua unidade padrão em operação</p>
                </div>
              </div>
              <Badge variant="success" className="text-[10px] font-bold">Matriz</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Profissionais Ativos:</span>
                <strong className="text-foreground">Cadastrados</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fluxo Financeiro:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Integrado</strong>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-dashed border-2 border-border/70 bg-muted/10 p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-foreground">Cadastrar Próxima Filial</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Expanda sua rede conectando novas unidades com login e relatórios unificados.
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl">
              Adicionar Filial
            </Button>
          </Card>
        </div>
      </div>
    </LockedFeatureGuard>
  )
}
