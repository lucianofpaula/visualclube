"use client"

import * as React from "react"
import { useState } from "react"
import { Users, Plus, Phone, Star, DollarSign, QrCode, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function EquipePage() {
  const equipe = [
    {
      id: 1,
      name: "Lucas Mendes",
      role: "Barbeiro Master",
      phone: "(11) 98765-4321",
      commissionRate: "50%",
      productRate: "10%",
      todayRevenue: "R$ 480,00",
      monthRevenue: "R$ 6.420,00",
      pix: "lucas.mendes@pix.me",
      active: true,
    },
    {
      id: 2,
      name: "Gabriel Santos",
      role: "Especialista em Degradê",
      phone: "(11) 97654-3210",
      commissionRate: "50%",
      productRate: "10%",
      todayRevenue: "R$ 310,00",
      monthRevenue: "R$ 4.890,00",
      pix: "11976543210",
      active: true,
    },
    {
      id: 3,
      name: "Juliana Costa",
      role: "Nail Designer / Manicure",
      phone: "(11) 96543-2109",
      commissionRate: "50%",
      productRate: "15%",
      todayRevenue: "R$ 340,00",
      monthRevenue: "R$ 5.200,00",
      pix: "juliana.costa@pix.me",
      active: true,
    },
    {
      id: 4,
      name: "Matheus Silveira",
      role: "Barbeiro",
      phone: "(11) 95432-1098",
      commissionRate: "45%",
      productRate: "10%",
      todayRevenue: "R$ 290,00",
      monthRevenue: "R$ 3.750,00",
      pix: "matheus@pix.me",
      active: true,
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Equipe & Comissões
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie barbeiros, cabeleireiros e manicures com cálculo de comissão automático.
          </p>
        </div>

        <Button className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Convidar Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipe.map((prof) => (
          <Card key={prof.id} className="border-border/60 bg-card/80 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div>
                <h3 className="font-extrabold text-base text-foreground">{prof.name}</h3>
                <p className="text-xs text-muted-foreground">{prof.role} • {prof.phone}</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                <span className="text-[11px] text-muted-foreground block">Comissão Hoje:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {prof.todayRevenue}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                <span className="text-[11px] text-muted-foreground block">Comissão no Mês:</span>
                <span className="text-base font-black text-foreground">
                  {prof.monthRevenue}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <div className="text-[11px] text-muted-foreground">
                Serviços: <b>{prof.commissionRate}</b> | Produtos: <b>{prof.productRate}</b>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-8 rounded-lg">
                <QrCode className="h-3.5 w-3.5 mr-1" />
                Pagar PIX
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
