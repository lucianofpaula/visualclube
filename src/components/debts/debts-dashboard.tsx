"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  DollarSign,
  User,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getBusinessDebtsDashboardAction, generateDebtWhatsAppReminderAction } from "@/actions/debt-actions"
import { PayDebtModal } from "@/components/crm/pay-debt-modal"
import { Client360Drawer } from "@/components/crm/client-360-drawer"

export function DebtsDashboard() {
  const [debts, setDebts] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "OVERDUE" | "PAID">("PENDING")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Modais
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedDebtToPay, setSelectedDebtToPay] = useState<any | null>(null)
  const [selectedClientIdFor360, setSelectedClientIdFor360] = useState<string | null>(null)
  const [loadingWhatsAppId, setLoadingWhatsAppId] = useState<string | null>(null)

  const loadDebts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBusinessDebtsDashboardAction({
        status: statusFilter,
        search,
        page,
        limit: 15,
      })

      if (res.success && res.debts) {
        setDebts(res.debts)
        setKpis(res.kpis)
        setTotalPages(res.totalPages || 1)
        setTotalCount(res.totalCount || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page])

  useEffect(() => {
    loadDebts()
  }, [loadDebts])

  const handleSendWhatsApp = async (debtId: string) => {
    setLoadingWhatsAppId(debtId)
    try {
      const res = await generateDebtWhatsAppReminderAction(debtId)
      if (res.success && res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank")
      }
    } finally {
      setLoadingWhatsAppId(null)
    }
  }

  const now = new Date()

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              Contas a Receber & Conta Cliente
            </h1>
            <p className="text-xs text-muted-foreground">
              Controle de consumo a prazo, pendências de conta cliente, promessas de pagamento e cobranças via WhatsApp
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadDebts}
          disabled={loading}
          className="text-xs font-bold rounded-xl gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Cards de Métricas e Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total a Receber
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 pt-1">
            R$ {(kpis?.totalPendingAmount || 0).toFixed(2).replace(".", ",")}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {kpis?.pendingCount || 0} lançamentos em aberto
          </p>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Contas Vencidas
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 pt-1">
            R$ {(kpis?.totalOverdueAmount || 0).toFixed(2).replace(".", ",")}
          </div>
          <p className="text-[11px] text-rose-600/80 font-bold">
            {kpis?.overdueCount || 0} contas com prazo expirado
          </p>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Quitado / Recuperado
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 pt-1">
            R$ {(kpis?.totalPaidAmount || 0).toFixed(2).replace(".", ",")}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Valores já recebidos no caixa
          </p>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Taxa de Recuperação
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground pt-1">
            {((kpis?.totalPaidAmount || 0) + (kpis?.totalPendingAmount || 0)) > 0
              ? `${Math.round(((kpis?.totalPaidAmount || 0) / ((kpis?.totalPaidAmount || 0) + (kpis?.totalPendingAmount || 0))) * 100)}%`
              : "100%"}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Eficiência de recebimento
          </p>
        </Card>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="p-3 sm:p-4 rounded-3xl border-border/80 bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60 shadow-inner w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => {
              setStatusFilter("PENDING")
              setPage(1)
            }}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Em Aberto ({kpis?.pendingCount || 0})
          </button>

          <button
            onClick={() => {
              setStatusFilter("OVERDUE")
              setPage(1)
            }}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              statusFilter === "OVERDUE"
                ? "bg-rose-600 text-white shadow-xs font-black"
                : "text-rose-600/80 hover:text-rose-600 hover:bg-rose-500/10"
            )}
          >
            Vencidos ({kpis?.overdueCount || 0})
          </button>

          <button
            onClick={() => {
              setStatusFilter("PAID")
              setPage(1)
            }}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              statusFilter === "PAID"
                ? "bg-emerald-600 text-white shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Quitados
          </button>

          <button
            onClick={() => {
              setStatusFilter("ALL")
              setPage(1)
            }}
            className={cn(
              "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              statusFilter === "ALL"
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, comanda ou telefone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 h-9 rounded-2xl text-xs bg-card"
          />
        </div>
      </Card>

      {/* Listagem Principal de Débitos */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="text-xs font-bold">Carregando lançamentos a receber...</span>
          </div>
        ) : debts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 mb-1">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Nenhum lançamento a receber encontrado</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Não existem registros de contas a receber com os filtros selecionados no momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Descrição / Origem</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Saldo Devedor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {debts.map((debt) => {
                  const isPaid = debt.status === "PAID"
                  const isPartial = debt.status === "PARTIAL"
                  const remaining = Number(debt.remainingAmount || 0)
                  const total = Number(debt.totalAmount || 0)
                  const isOverdue = debt.dueDate && new Date(debt.dueDate) < now && !isPaid

                  return (
                    <tr key={debt.id} className="hover:bg-muted/30 transition-colors">
                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {(debt.client?.name || "C")[0].toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedClientIdFor360(debt.clientId)}
                              className="font-bold text-foreground hover:underline text-left block"
                            >
                              {debt.client?.name || "Cliente sem nome"}
                            </button>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {debt.client?.phone || "Sem telefone"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Descrição */}
                      <td className="py-3.5 px-4">
                        <span className="text-foreground font-semibold block">{debt.description}</span>
                        {debt.order?.code && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Comanda: #{debt.order.code}
                          </span>
                        )}
                      </td>

                      {/* Vencimento */}
                      <td className="py-3.5 px-4">
                        {debt.dueDate ? (
                          <div className="space-y-0.5">
                            <span className={cn("font-bold block", isOverdue && "text-rose-600 dark:text-rose-400 font-extrabold")}>
                              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(debt.dueDate))}
                            </span>
                            {isOverdue && (
                              <span className="text-[10px] text-rose-600 font-black flex items-center gap-0.5">
                                <AlertTriangle className="h-3 w-3" />
                                Vencido
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Sem prazo fixado</span>
                        )}
                      </td>

                      {/* Total Original */}
                      <td className="py-3.5 px-4 text-right font-semibold text-foreground">
                        R$ {total.toFixed(2).replace(".", ",")}
                      </td>

                      {/* Saldo Restante */}
                      <td className="py-3.5 px-4 text-right">
                        <span className={cn(
                          "font-black text-sm block",
                          isPaid ? "text-muted-foreground line-through" : "text-amber-600 dark:text-amber-400"
                        )}>
                          R$ {remaining.toFixed(2).replace(".", ",")}
                        </span>
                        {isPartial && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            Pago: R$ {Number(debt.paidAmount || 0).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <Badge variant="success" className="text-[10px] px-2 py-0.5">
                            Quitado
                          </Badge>
                        ) : isPartial ? (
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">
                            Amortizado
                          </Badge>
                        ) : isOverdue ? (
                          <Badge variant="destructive" className="text-[10px] px-2 py-0.5 animate-pulse">
                            Vencido
                          </Badge>
                        ) : (
                          <Badge variant="gold" className="text-[10px] px-2 py-0.5">
                            Em Aberto
                          </Badge>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={loadingWhatsAppId === debt.id}
                                onClick={() => handleSendWhatsApp(debt.id)}
                                className="h-8 px-2.5 rounded-xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 cursor-pointer"
                                title="Enviar lembrete amigável no WhatsApp"
                              >
                                <Send className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedDebtToPay(debt)
                                  setPayModalOpen(true)
                                }}
                                className="h-8 px-3 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-xs cursor-pointer"
                              >
                                <DollarSign className="h-3 w-3" />
                                <span>Receber</span>
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedClientIdFor360(debt.clientId)}
                            className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground"
                            title="Ver Ficha do Cliente"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Total de <b>{totalCount}</b> lançamentos (Página {page} de {totalPages})
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2.5 rounded-xl"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Anterior</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2.5 rounded-xl"
              >
                <span>Próxima</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Quitação */}
      <PayDebtModal
        isOpen={payModalOpen}
        onClose={() => {
          setPayModalOpen(false)
          setSelectedDebtToPay(null)
        }}
        onSuccess={() => {
          loadDebts()
        }}
        debt={selectedDebtToPay}
      />

      {/* Ficha 360 do Cliente */}
      <Client360Drawer
        clientId={selectedClientIdFor360}
        isOpen={!!selectedClientIdFor360}
        onClose={() => setSelectedClientIdFor360(null)}
      />
    </div>
  )
}
