"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight, 
  Plus, 
  Calendar, 
  Search, 
  Building2, 
  CreditCard, 
  Filter, 
  RefreshCw, 
  Receipt, 
  Sparkles, 
  ChevronRight,
  PieChart,
  BarChart3,
  Download,
  Printer,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AccountTransactionModal } from "@/components/financial/account-transaction-modal"
import { FinancialFlowFilter } from "@/actions/financial-flow-actions"
import { cn } from "@/lib/utils"

interface FinancialFlowDashboardProps {
  data: any
  currentFilter: FinancialFlowFilter
  onFilterChange: (newFilter: FinancialFlowFilter) => void
  onRefresh: () => void
  loading?: boolean
}

export function FinancialFlowDashboard({
  data,
  currentFilter,
  onFilterChange,
  onRefresh,
  loading = false,
}: FinancialFlowDashboardProps) {
  // Modal de Transações (Despesa, Entrada, Transferência)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE")

  // Filtros locais do extrato
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE" | "TRANSFER">("ALL")
  const [selectedAccountId, setSelectedAccountId] = useState<string>(currentFilter.accountId || "")

  const kpis = data?.kpis || {
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    profitMargin: 0,
    totalTransactions: 0,
    salesCount: 0,
    averageTicket: 0,
    totalConsolidatedBalance: 0,
  }

  const accounts = data?.accounts || []
  const dailyTimeline = data?.dailyTimeline || []
  const paymentMethodsBreakdown = data?.paymentMethodsBreakdown || []
  const expenseCategoriesBreakdown = data?.expenseCategoriesBreakdown || []
  const allTransactions = data?.transactions || []

  // Filtro em memória das transações para agilidade
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t: any) => {
      // Filtro por tipo
      if (typeFilter !== "ALL" && t.type !== typeFilter) {
        return false
      }

      // Filtro por conta
      if (selectedAccountId && t.accountId !== selectedAccountId && t.toAccountId !== selectedAccountId) {
        return false
      }

      // Filtro de busca textual
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchDesc = t.description?.toLowerCase().includes(q)
        const matchCat = t.category?.toLowerCase().includes(q)
        const matchAcc = t.accountName?.toLowerCase().includes(q)
        const matchUser = t.createdByName?.toLowerCase().includes(q)
        return matchDesc || matchCat || matchAcc || matchUser
      }

      return true
    })
  }, [allTransactions, typeFilter, selectedAccountId, searchTerm])

  const handleOpenModal = (type: "EXPENSE" | "INCOME" | "TRANSFER") => {
    setTransactionType(type)
    setTransactionModalOpen(true)
  }

  const handlePeriodSelect = (period: FinancialFlowFilter["period"]) => {
    onFilterChange({
      ...currentFilter,
      period,
      startDate: undefined,
      endDate: undefined,
    })
  }

  const handleAccountFilterChange = (accId: string) => {
    setSelectedAccountId(accId)
    onFilterChange({
      ...currentFilter,
      accountId: accId || undefined,
    })
  }

  // Encontrar o valor máximo para a escala do gráfico diário
  const maxDayValue = useMemo(() => {
    let max = 100
    for (const d of dailyTimeline) {
      if (d.income > max) max = d.income
      if (d.expense > max) max = d.expense
    }
    return max
  }, [dailyTimeline])

  const isNetProfitPositive = kpis.netProfit >= 0

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & BARRA DE AÇÕES PRINCIPAIS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Wallet className="h-7 w-7 text-emerald-500" />
              Fluxo de Caixa & Extrato
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-bold">
              Tempo Real
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Acompanhe receitas, despesas, faturamento do PDV e lucratividade consolidada.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-xs font-bold h-9 rounded-xl gap-1.5"
            title="Atualizar dados"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          <Button
            onClick={() => handleOpenModal("TRANSFER")}
            variant="outline"
            size="sm"
            className="text-xs font-bold h-9 rounded-xl gap-1.5"
          >
            <ArrowLeftRight className="h-4 w-4 text-blue-500" />
            <span>Transferir</span>
          </Button>

          <Button
            onClick={() => handleOpenModal("EXPENSE")}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>+ Lançar Despesa</span>
          </Button>

          <Button
            onClick={() => handleOpenModal("INCOME")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>+ Lançar Entrada</span>
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTROS RÁPIDOS DE PERÍODO & CONTA BANCÁRIA
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-2xl bg-card border border-border/60 shadow-xs">
        {/* Seletor de Período */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60 shadow-inner overflow-x-auto max-w-full pb-1 sm:pb-1">
          {[
            { id: "today", label: "Hoje" },
            { id: "yesterday", label: "Ontem" },
            { id: "7days", label: "Últimos 7 dias" },
            { id: "month", label: "Este Mês" },
            { id: "last_month", label: "Mês Anterior" },
            { id: "year", label: "Este Ano" },
          ].map((tab) => {
            const isSelected = (currentFilter.period || "month") === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePeriodSelect(tab.id as any)}
                className={cn(
                  "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95",
                  isSelected
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Filtro de Conta Bancária */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          <select
            value={selectedAccountId}
            onChange={(e) => handleAccountFilterChange(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todas as Contas</option>
            {accounts.map((acc: any) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (R$ {acc.currentBalance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CARDS DE KPIS FINANCEIROS (RECEITAS, DESPESAS, LUCRO, SALDO)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entradas / Faturamento */}
        <Card className="p-5 rounded-3xl border-border/60 bg-gradient-to-br from-emerald-500/5 via-card to-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total de Entradas
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            R$ {kpis.totalIncome.toFixed(2).replace(".", ",")}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <span>{kpis.salesCount} vendas no PDV</span>
            <span className="font-bold text-foreground">
              Ticket Médio: R$ {kpis.averageTicket.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </Card>

        {/* Saídas / Despesas */}
        <Card className="p-5 rounded-3xl border-border/60 bg-gradient-to-br from-rose-500/5 via-card to-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Total de Saídas
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            R$ {kpis.totalExpense.toFixed(2).replace(".", ",")}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <span>Custos, insumos & repasses</span>
            <span className="font-bold text-foreground">
              {expenseCategoriesBreakdown.length} categorias
            </span>
          </div>
        </Card>

        {/* Lucro Líquido / Resultado */}
        <Card className="p-5 rounded-3xl border-border/60 bg-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Resultado Líquido
            </span>
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center border",
              isNetProfitPositive
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
            )}>
              {isNetProfitPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>

          <div className={cn(
            "text-2xl sm:text-3xl font-black tracking-tight",
            isNetProfitPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            R$ {kpis.netProfit.toFixed(2).replace(".", ",")}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <span>Margem Operacional</span>
            <Badge variant={isNetProfitPositive ? "success" : "destructive"} className="text-[10px] font-bold">
              {kpis.profitMargin.toFixed(1)}%
            </Badge>
          </div>
        </Card>

        {/* Saldo Total Consolidado */}
        <Card className="p-5 rounded-3xl border-border/60 bg-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Saldo em Carteiras
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Building2 className="h-4 w-4" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            R$ {kpis.totalConsolidatedBalance.toFixed(2).replace(".", ",")}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <span>{accounts.length} contas ativas</span>
            <Link
              href="/app/financeiro/contas"
              className="text-primary hover:underline font-bold flex items-center gap-0.5"
            >
              <span>Gerenciar</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. GRÁFICOS & DISTRIBUIÇÃO (TIMELINE DIÁRIA + MEIOS DE PAGAMENTO)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Evolução Diária */}
        <Card className="lg:col-span-2 p-6 rounded-3xl border-border/60 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span>Evolução Diária de Entradas vs Saídas</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Movimentações financeiras dia a dia no período selecionado.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-emerald-500" />
                <span className="text-muted-foreground">Entradas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-rose-500" />
                <span className="text-muted-foreground">Saídas</span>
              </div>
            </div>
          </div>

          {dailyTimeline.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Sem dados diários no período selecionado.
            </div>
          ) : (
            <div className="pt-4 space-y-2">
              {/* Barras Horizontais / Gráfico de Dias */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {dailyTimeline.map((d: any) => {
                  const incomePercent = maxDayValue > 0 ? (d.income / maxDayValue) * 100 : 0
                  const expensePercent = maxDayValue > 0 ? (d.expense / maxDayValue) * 100 : 0

                  return (
                    <div key={d.date} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-mono text-[11px] text-muted-foreground shrink-0">
                        {d.formattedDate}
                      </span>

                      <div className="flex-1 space-y-1">
                        {/* Barra de Entrada */}
                        {d.income > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted/40 h-3 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(4, incomePercent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 w-16 text-right">
                              R$ {d.income.toFixed(0)}
                            </span>
                          </div>
                        )}

                        {/* Barra de Saída */}
                        {d.expense > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted/40 h-3 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(4, expensePercent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 w-16 text-right">
                              R$ {d.expense.toFixed(0)}
                            </span>
                          </div>
                        )}

                        {d.income === 0 && d.expense === 0 && (
                          <div className="h-3 rounded-full bg-muted/20 w-full" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Distribuição por Meios de Pagamento & Categorias */}
        <Card className="p-6 rounded-3xl border-border/60 bg-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span>Receitas por Meio de Pagamento</span>
              </CardTitle>
              <Link
                href="/app/financeiro/meios-de-pagamento"
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Configurar
              </Link>
            </div>

            {paymentMethodsBreakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Nenhum recebimento registrado no período.
              </div>
            ) : (
              <div className="space-y-3 pt-3">
                {paymentMethodsBreakdown.map((pm: any) => (
                  <div key={pm.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">{pm.label}</span>
                      <span className="text-muted-foreground font-mono">
                        R$ {pm.total.toFixed(2).replace(".", ",")} ({pm.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${pm.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Categorias de Despesas */}
          <div className="pt-4 border-t border-border/50">
            <span className="text-xs font-extrabold text-foreground block mb-2">
              Principais Gastos / Despesas
            </span>
            {expenseCategoriesBreakdown.length === 0 ? (
              <div className="text-xs text-muted-foreground">Nenhuma despesa no período.</div>
            ) : (
              <div className="space-y-2">
                {expenseCategoriesBreakdown.slice(0, 3).map((cat: any) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[140px]">{cat.category}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                      R$ {cat.total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. EXTRATO DE MOVIMENTAÇÕES COMPLETO COM FILTROS
      ───────────────────────────────────────────────────────────── */}
      <Card className="rounded-3xl border-border/60 bg-card p-6 shadow-xs space-y-4">
        {/* Header do Extrato */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-500" />
              <span>Extrato Detalhado de Lançamentos</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Histórico cronológico de vendas, custos, retiradas e transferências com auditoria.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtros de Tipo */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 shadow-inner text-xs">
              {[
                { id: "ALL", label: "Todos" },
                { id: "INCOME", label: "Entradas (+)" },
                { id: "EXPENSE", label: "Saídas (-)" },
                { id: "TRANSFER", label: "Transferências" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id as any)}
                  className={cn(
                    "cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95",
                    typeFilter === tab.id
                      ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por descrição, categoria, conta bancária ou operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-2xl bg-muted/20 border-border/60 text-xs text-foreground font-medium"
          />
        </div>

        {/* Tabela de Transações */}
        {filteredTransactions.length === 0 ? (
          <div className="py-14 text-center space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Receipt className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">Nenhum lançamento encontrado</h4>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Ajuste os filtros de busca ou faça um novo lançamento usando os botões acima.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filteredTransactions.map((t: any) => {
              const isIncome = t.type === "INCOME"
              const isTransfer = t.type === "TRANSFER"

              return (
                <div
                  key={t.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/20 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2.5 rounded-2xl shrink-0 border",
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : isTransfer
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : isTransfer ? (
                        <ArrowLeftRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-extrabold text-foreground flex items-center gap-2">
                        <span>{t.description}</span>
                        {t.orderId && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                            PDV
                          </Badge>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground">{t.category}</span>
                        <span>•</span>
                        {isTransfer ? (
                          <span>
                            De: {t.accountName} $\rightarrow$ Para: {t.toAccountName || "Conta"}
                          </span>
                        ) : (
                          <span>Conta: {t.accountName}</span>
                        )}
                        <span>•</span>
                        <span>Por: {t.createdByName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pl-11 sm:pl-0">
                    <span
                      className={cn(
                        "font-black text-sm sm:text-base font-mono",
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isTransfer
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {isIncome ? "+" : isTransfer ? "⇄" : "-"} R${" "}
                      {t.amount.toFixed(2).replace(".", ",")}
                    </span>

                    <span className="text-[10px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Modal de Transações Rápidas */}
      <AccountTransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        accounts={accounts}
        initialType={transactionType}
        onSuccess={() => {
          onRefresh()
        }}
      />
    </div>
  )
}
