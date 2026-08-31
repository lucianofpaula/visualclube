"use client"

import * as React from "react"
import { Sparkles, Plus, Users, DollarSign, Check, Star } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ClubePage() {
  const planos = [
    {
      id: 1,
      name: "Clube Cabelo VIP Ilimitado",
      price: 119.90,
      members: 78,
      revenue: "R$ 9.352,20/mês",
      benefits: ["Cortes de cabelo ilimitados no mês", "1 Cerveja Heineken por visita", "10% de desconto em pomadas e produtos"],
    },
    {
      id: 2,
      name: "Clube Barba & Cabelo Master",
      price: 189.90,
      members: 46,
      revenue: "R$ 8.735,40/mês",
      benefits: ["Cabelo + Barba ilimitados", "2 Cervejas por visita", "15% de desconto em produtos", "Atendimento prioritário"],
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-purple-600" />
            Clube VIP & Assinaturas Recorrentes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Crie planos mensais no cartão de crédito recorrente e garanta faturamento fixo todo dia 1º.
          </p>
        </div>

        <Button className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Plano de Assinatura
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {planos.map((plano) => (
          <Card key={plano.id} className="border-border/60 bg-card/80 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-border/50">
              <div>
                <h3 className="font-extrabold text-lg text-foreground">{plano.name}</h3>
                <span className="text-2xl font-black text-foreground block mt-1">
                  R$ {plano.price.toFixed(2).replace(".", ",")}
                  <span className="text-xs text-muted-foreground font-normal"> / mês</span>
                </span>
              </div>
              <Badge variant="gold">Ativo</Badge>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground block">Assinantes Ativos:</span>
                <span className="font-bold text-foreground text-sm">{plano.members} clientes</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block">Receita Recorrente:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{plano.revenue}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">Benefícios Inclusos:</span>
              <ul className="space-y-1.5 text-xs text-foreground">
                {plano.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
