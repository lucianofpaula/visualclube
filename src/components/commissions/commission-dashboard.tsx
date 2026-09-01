"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  DollarSign,
  Calendar,
  Users,
  Plus,
  RefreshCw,
  Scissors,
  Package,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  TrendingUp,
  FileText,
  Building2,
  QrCode,
  Check
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCommissionReportAction } from "@/actions/commission-actions"
import { AdvanceModal } from "./advance-modal"
import { SettleCommissionModal } from "./settle-commission-modal"
import { SettlementReceiptModal } from "./settlement-receipt-modal"
import { SettlementHistoryTab } from "./settlement-history-tab"

type PeriodPreset = "THIS_WEEK" | "THIS_FORTNIGHT" | "THIS_MONTH" | "LAST_MONTH" | "CUSTOM"

export function CommissionDashboard() {
  const [activeTab, setActiveTab] = useState<"LIVE_REPORT" | "HISTORY">("LIVE_REPORT")
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("THIS_MONTH")
  const [selectedProfId, setSelectedProfId] = useState<string>("ALL")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const [loading, setLoading] = useState(true)
  const [reportList, setReportList] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)

  // Modais
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false)
  const [advanceDefaultProfId, setAdvanceDefaultProfId] = useState<string | undefined>(undefined)

  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [selectedReportEntryToSettle, setSelectedReportEntryToSettle] = useState<any | null>(null)

  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [receiptSettlementId, setReceiptSettlementId] = useState<string | null>(null)

  // Calcular datas pelo Preset
  const applyPreset = useCallback((preset: PeriodPreset) => {
    const now = new Date()
    let s = new Date()
    let e = new Date()

    if (preset === "THIS_WEEK") {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Segunda-feira
      s = new Date(now.setDate(diff))
      e = new Date(s)
      e.setDate(e.getDate() + 6)
    } else if (preset === "THIS_FORTNIGHT") {
      if (now.getDate() <= 15) {
        s = new Date(now.getFullYear(), now.getMonth(), 1)
        e = new Date(now.getFullYear(), now.getMonth(), 15)
      } else {
        s = new Date(now.getFullYear(), now.getMonth(), 16)
        e = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    } else if (preset === "THIS_MONTH") {
      s = new Date(now.getFullYear(), now.getMonth(), 1)
      e = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (preset === "LAST_MONTH") {
      s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      e = new Date(now.getFullYear(), now.getMonth(), 0)
    }

    if (preset !== "CUSTOM") {
      setStartDate(s.toISOString().split("T")[0])
      setEndDate(e.toISOString().split("T")[0])
    }
  }, [])

  useEffect(() => {
    applyPreset("THIS_MONTH")
  }, [applyPreset])

  const loadReport = useCallback(async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const res = await getCommissionReportAction({
        professionalId: selectedProfId,
        startDate,
        endDate,
        onlyUnsettled: true,
      })

      if (res.success && res.reportList) {
        setReportList(res.reportList)
        setProfessionals(res.professionals || [])
        setKpis(res.kpis)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedProfId, startDate, endDate])

  useEffect(() => {
    if (startDate && endDate) {
      loadReport()
    }
  }, [loadReport, startDate, endDate])

  const handleOpenAdvanceModal = (profId?: string) => {
    setAdvanceDefaultProfId(profId)
    setAdvanceModalOpen(true)
  }

  const handleOpenSettleModal = (entry: any) => {
    setSelectedReportEntryToSettle(entry)
    setSettleModalOpen(true)
  }

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header com Título e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              Comissões & Repasses da Equipe
            </h1>
            <p className="text-xs text-muted-foreground">
              Apuração de produção por colaborador, abatimento de vales, fechamento e recibos via WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={() => handleOpenAdvanceModal()}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Lançar Vale</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadReport}
            disabled={loading}
            className="text-xs font-bold rounded-xl gap-1.5 h-9 cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Abas Principais: Apuração x Histórico */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-2xl border border-border/60 shadow-inner w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("LIVE_REPORT")}
          className={cn(
            "cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2",
            activeTab === "LIVE_REPORT"
              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-md font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <Scissors className="h-3.5 w-3.5" />
          <span>Apuração & Fechamento ({reportList.length} ativos)</span>
        </button>

        <button
          onClick={() => setActiveTab("HISTORY")}
          className={cn(
            "cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2",
            activeTab === "HISTORY"
              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-md font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Histórico de Repasses</span>
        </button>
      </div>

      {activeTab === "LIVE_REPORT" ? (
        <div className="space-y-6">
          {/* Barra de Filtro de Período e Profissional */}
          <Card className="p-4 rounded-3xl border-border/80 bg-card shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Presets de Período */}
              <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-2xl border border-border/60 overflow-x-auto">
                <button
                  onClick={() => {
                    setPeriodPreset("THIS_WEEK")
                    applyPreset("THIS_WEEK")
                  }}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    periodPreset === "THIS_WEEK" ? "bg-card text-foreground shadow-xs font-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Esta Semana
                </button>
                <button
                  onClick={() => {
                    setPeriodPreset("THIS_FORTNIGHT")
                    applyPreset("THIS_FORTNIGHT")
                  }}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    periodPreset === "THIS_FORTNIGHT" ? "bg-card text-foreground shadow-xs font-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Esta Quinzena
                </button>
                <button
                  onClick={() => {
                    setPeriodPreset("THIS_MONTH")
                    applyPreset("THIS_MONTH")
                  }}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    periodPreset === "THIS_MONTH" ? "bg-card text-foreground shadow-xs font-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Este Mês
                </button>
                <button
                  onClick={() => {
                    setPeriodPreset("LAST_MONTH")
                    applyPreset("LAST_MONTH")
                  }}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    periodPreset === "LAST_MONTH" ? "bg-card text-foreground shadow-xs font-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mês Passado
                </button>
              </div>

              {/* Intervalo de Datas e Seletor de Colaborador */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setPeriodPreset("CUSTOM")
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground"
                  />
                  <span className="text-muted-foreground">até</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setPeriodPreset("CUSTOM")
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground"
                  />
                </div>

                <select
                  value={selectedProfId}
                  onChange={(e) => setSelectedProfId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="ALL">Todos os Colaboradores</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.specialty || "Geral"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Cards de Métricas Globais do Período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Faturamento da Equipe
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground pt-1">
                R$ {(kpis?.globalGrossSales || 0).toFixed(2).replace(".", ",")}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Total bruto gerado no período
              </p>
            </Card>

            <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Comissões Brutas
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Scissors className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 pt-1">
                R$ {(kpis?.globalTotalCommission || 0).toFixed(2).replace(".", ",")}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Serviços e produtos apurados
              </p>
            </Card>

            <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Vales a Abater
                </span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 pt-1">
                - R$ {(kpis?.globalAdvancesTotal || 0).toFixed(2).replace(".", ",")}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Adiantamentos pendentes de desconto
              </p>
            </Card>

            <Card className="p-4 sm:p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Líquido a Repassar
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 pt-1">
                R$ {(kpis?.globalNetPayout || 0).toFixed(2).replace(".", ",")}
              </div>
              <p className="text-[11px] text-emerald-600/80 font-bold">
                Valor líquido final a pagar
              </p>
            </Card>
          </div>

          {/* Lista de Cards de Produção por Colaborador */}
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="text-xs font-bold">Calculando comissões da equipe...</span>
            </div>
          ) : reportList.length === 0 ? (
            <Card className="p-12 text-center flex flex-col items-center justify-center space-y-2 rounded-3xl border-dashed">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20 mb-1">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Nenhuma produção pendente de fechamento</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Todos os serviços e produtos do período selecionado já foram quitados ou ainda não há vendas registradas.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportList.map((entry) => {
                const p = entry.professional
                return (
                  <Card
                    key={p.id}
                    className="p-5 rounded-3xl border-border/80 bg-card shadow-xs space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    {/* Topo do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg border border-indigo-500/20 shrink-0">
                          {p.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-foreground">{p.name}</h3>
                          <span className="text-xs text-muted-foreground block">{p.specialty || "Geral"}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Comissão: {p.commissionPercent}% Serv. • {p.productCommission}% Prod.
                          </span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[10px] bg-muted/40 font-bold shrink-0">
                        {entry.servicesCount} serv / {entry.productsCount} prod
                      </Badge>
                    </div>

                    {/* Extrato Financeiro Rápido */}
                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Faturamento Gerado:</span>
                        <span className="font-bold text-foreground">
                          R$ {entry.grossSales.toFixed(2).replace(".", ",")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                        <span>Comissão Bruta:</span>
                        <span className="font-bold">
                          R$ {entry.totalCommission.toFixed(2).replace(".", ",")}
                        </span>
                      </div>

                      {entry.advancesTotal > 0 && (
                        <div className="flex justify-between items-center text-rose-600">
                          <span>(-) Vales / Adiantamentos:</span>
                          <span className="font-bold">
                            - R$ {entry.advancesTotal.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border/60 flex justify-between items-center text-sm font-black">
                        <span className="text-foreground">LÍQUIDO A PAGAR:</span>
                        <span className="text-base text-emerald-600 dark:text-emerald-400">
                          R$ {entry.netPayout.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>

                    {/* Ações do Card */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAdvanceModal(p.id)}
                        className="h-9 px-3 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1 cursor-pointer"
                        title="Lançar vale para este colaborador"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Vale</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleOpenSettleModal(entry)}
                        disabled={entry.grossSales === 0 && entry.advancesTotal === 0}
                        className="h-9 flex-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Fechar Repasse</span>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* ABA 2: HISTÓRICO DE REPASSES */
        <SettlementHistoryTab professionals={professionals} />
      )}

      {/* Modal de Lançamento de Vale */}
      <AdvanceModal
        isOpen={advanceModalOpen}
        onClose={() => setAdvanceModalOpen(false)}
        onSuccess={() => {
          loadReport()
        }}
        professionals={professionals}
        defaultProfessionalId={advanceDefaultProfId}
      />

      {/* Modal de Fechamento de Repasse */}
      <SettleCommissionModal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        onSuccess={(newSettlementId) => {
          loadReport()
          setReceiptSettlementId(newSettlementId)
          setReceiptModalOpen(true)
        }}
        reportEntry={selectedReportEntryToSettle}
        periodStart={startDate}
        periodEnd={endDate}
      />

      {/* Modal de Recibo e Comprovante Térmico / WhatsApp */}
      <SettlementReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false)
          setReceiptSettlementId(null)
        }}
        settlementId={receiptSettlementId}
      />
    </div>
  )
}
