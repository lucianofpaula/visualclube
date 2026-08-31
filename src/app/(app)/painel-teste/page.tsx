"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Receipt, 
  Sparkles, 
  Users, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  Scissors, 
  MessageSquare,
  QrCode,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AppDashboardPage() {
  const [activeTab, setActiveTab] = useState<"hoje" | "semana" | "mes">("hoje")

  const stats = [
    {
      title: "Faturamento do Dia",
      value: "R$ 2.840,00",
      trend: "+18% vs ontem",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Agendamentos Hoje",
      value: "38 atendimentos",
      trend: "95% taxa de ocupação",
      icon: Calendar,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    },
    {
      title: "Comandas Abertas",
      value: "6 ativas (R$ 810)",
      trend: "2 no balcão / bar",
      icon: Receipt,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      title: "Clube VIP / Recorrência",
      value: "124 assinantes",
      trend: "R$ 14.880/mês garantidos",
      icon: Sparkles,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
  ]

  const nextAppointments = [
    {
      time: "14:30",
      client: "Rodrigo Almeida",
      phone: "(11) 98765-4321",
      service: "Corte Degradê + Barboterapia",
      professional: "Lucas Mendes (Barbeiro Master)",
      value: "R$ 100,00",
      status: "Em Atendimento",
      statusColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      time: "15:00",
      client: "Camila Fernandes",
      phone: "(11) 97654-3210",
      service: "Manicure Gel + Spa dos Pés",
      professional: "Juliana Costa (Nail Designer)",
      value: "R$ 135,00",
      status: "Confirmado WhatsApp",
      statusColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
    {
      time: "15:45",
      client: "Gabriel Siqueira",
      phone: "(11) 96543-2109",
      service: "Corte Social + Lavagem Especial",
      professional: "Matheus Silveira",
      value: "R$ 65,00",
      status: "Confirmado WhatsApp",
      statusColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
    {
      time: "16:30",
      client: "André Luiz",
      phone: "(11) 95432-1098",
      service: "Barba Terapia + Hidratação",
      professional: "Lucas Mendes",
      value: "R$ 60,00",
      status: "Aguardando",
      statusColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
  ]

  const activeComandas = [
    { id: "CMD-104", client: "Marcelo Viana", items: 4, total: 154.0, chair: "Cadeira 01" },
    { id: "CMD-105", client: "Felipe Duarte", items: 2, total: 85.0, chair: "Cadeira 03" },
    { id: "CMD-106", client: "Bruno Rocha", items: 3, total: 110.0, chair: "Bar / Espera" },
    { id: "CMD-107", client: "Lucas Fontes", items: 1, total: 55.0, chair: "Cadeira 02" },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Painel de Gestão • Barbearia Imperial
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Acompanhe em tempo real o fluxo de atendimentos, comandas e faturamento do seu espaço.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/comandas">
            <Button className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Abrir Comanda
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border-border/60 bg-card/80 backdrop-blur-md rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                <div className={cn("p-2 rounded-xl", stat.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid: Agenda + Comandas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agenda ao Vivo */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Agenda de Atendimentos</h3>
                  <p className="text-xs text-muted-foreground">Sincronizada automaticamente com o Robô WhatsApp</p>
                </div>
              </div>

              <Badge variant="success" className="text-[10px]">
                Auto-confirmado 24h
              </Badge>
            </div>

            {/* List */}
            <div className="space-y-3">
              {nextAppointments.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors border border-border/40 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center font-bold text-xs bg-card px-3 py-2 rounded-xl border border-border/60 shadow-xs">
                      {item.time}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground flex items-center gap-2">
                        {item.client}
                        <span className="text-[10px] text-muted-foreground font-normal">{item.phone}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{item.service}</div>
                      <div className="text-[10px] text-primary font-medium mt-0.5">Profissional: {item.professional}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <span className="text-xs font-black text-foreground">{item.value}</span>
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full", item.statusColor)}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comandas Abertas & Split */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm text-foreground">Comandas em Aberto</h3>
              </div>
              <Link href="/app/comandas" className="text-xs font-semibold text-primary hover:underline">
                Ver todas
              </Link>
            </div>

            <div className="space-y-2.5">
              {activeComandas.map((cmd) => (
                <div
                  key={cmd.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors text-xs"
                >
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      {cmd.id}
                      <span className="text-[10px] text-muted-foreground font-normal">• {cmd.chair}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{cmd.client} ({cmd.items} itens)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">R$ {cmd.total.toFixed(2).replace(".", ",")}</div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Em consumo</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border/50">
              <Link href="/app/comandas">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs">
                  <QrCode className="h-3.5 w-3.5 mr-1.5" />
                  Cobrar com PIX Instantâneo
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Team Commission Split */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Comissões de Hoje (Split)
              </h3>
              <span className="text-[10px] text-muted-foreground">Automático</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-foreground font-medium">Lucas Mendes (Barbeiro)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ 480,00</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-foreground font-medium">Juliana Costa (Manicure)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ 340,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-medium">Matheus Silveira</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ 290,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
