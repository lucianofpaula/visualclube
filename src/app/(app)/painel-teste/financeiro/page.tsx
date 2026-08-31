"use client"

import * as React from "react"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Download, Filter, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function FinanceiroPage() {
  const transactions = [
    { id: 1, desc: "Comanda #CMD-104 (Marcelo Viana)", type: "INCOME", cat: "Venda / Serviços", val: "+ R$ 154,00", method: "PIX", date: "Hoje, 14:55" },
    { id: 2, desc: "Comissão Barbeiro (Lucas Mendes)", type: "EXPENSE", cat: "Repasse Comissão", val: "- R$ 54,00", method: "PIX", date: "Hoje, 14:55" },
    { id: 3, desc: "Comanda #CMD-103 (Gustavo Nogueira)", type: "INCOME", cat: "Venda / Serviços", val: "+ R$ 95,00", method: "Cartão Débito", date: "Hoje, 13:40" },
    { id: 4, desc: "Compra Bebidas Estoque (Distribuidora)", type: "EXPENSE", cat: "Insumos Bar", val: "- R$ 380,00", method: "PIX", date: "Hoje, 11:20" },
    { id: 5, desc: "Assinatura Clube VIP (André Silva)", type: "INCOME", cat: "Recorrência", val: "+ R$ 119,00", method: "Cartão Crédito", date: "Hoje, 09:10" },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-7 w-7 text-emerald-600" />
            Financeiro & Fluxo de Caixa
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            DRE simples, extrato de entradas/saídas e previsão de faturamento.
          </p>
        </div>

        <Button className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Lançar Despesa / Entrada
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/80 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-muted-foreground block">Faturamento Bruto (Mês):</span>
          <span className="text-2xl font-black text-foreground block mt-1">R$ 28.450,00</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +22% vs mês anterior
          </span>
        </Card>

        <Card className="border-border/60 bg-card/80 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-muted-foreground block">Comissões Repassadas:</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">R$ 13.210,00</span>
          <span className="text-[11px] text-muted-foreground mt-1 block">46,4% do faturamento</span>
        </Card>

        <Card className="border-border/60 bg-card/80 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-muted-foreground block">Lucro Líquido da Casa:</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">R$ 11.480,00</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Margem de 40,3%</span>
        </Card>
      </div>

      {/* Extrato Recente */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <h3 className="font-extrabold text-sm text-foreground">Extrato de Transações Recentes</h3>
          <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg">
            <Download className="h-3.5 w-3.5 mr-1" />
            Exportar Relatório
          </Button>
        </div>

        <div className="divide-y divide-border/40">
          {transactions.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                  {t.type === "INCOME" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div>
                  <div className="font-bold text-foreground">{t.desc}</div>
                  <div className="text-[11px] text-muted-foreground">{t.cat} • {t.method} • {t.date}</div>
                </div>
              </div>
              <span className={`font-black text-sm ${t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {t.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
