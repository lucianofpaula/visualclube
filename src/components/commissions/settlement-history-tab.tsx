"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  FileText,
  Search,
  Calendar,
  DollarSign,
  User,
  Eye,
  Send,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Printer
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSettlementHistoryAction, generateSettlementWhatsAppProofAction } from "@/actions/commission-actions"
import { SettlementReceiptModal } from "./settlement-receipt-modal"

interface SettlementHistoryTabProps {
  professionals: any[]
}

export function SettlementHistoryTab({ professionals }: SettlementHistoryTabProps) {
  const [settlements, setSettlements] = useState<any[]>([])
  const [selectedProfId, setSelectedProfId] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Modais
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null)
  const [loadingWhatsAppId, setLoadingWhatsAppId] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSettlementHistoryAction({
        professionalId: selectedProfId,
        page,
        limit: 15,
      })

      if (res.success && res.settlements) {
        setSettlements(res.settlements)
        setTotalPages(res.totalPages || 1)
        setTotalCount(res.totalCount || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [selectedProfId, page])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleSendWhatsApp = async (settlementId: string) => {
    setLoadingWhatsAppId(settlementId)
    try {
      const res = await generateSettlementWhatsAppProofAction(settlementId)
      if (res.success && res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank")
      }
    } finally {
      setLoadingWhatsAppId(null)
    }
  }

  const formatDate = (dateStr: string | Date) => {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dateStr))
  }

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <Card className="p-3 sm:p-4 rounded-3xl border-border/80 bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-muted-foreground shrink-0">Filtrar por Colaborador:</label>
          <select
            value={selectedProfId}
            onChange={(e) => {
              setSelectedProfId(e.target.value)
              setPage(1)
            }}
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

        <Button
          variant="outline"
          size="sm"
          onClick={loadHistory}
          disabled={loading}
          className="text-xs font-bold rounded-xl gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Atualizar</span>
        </Button>
      </Card>

      {/* Tabela de Histórico */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span className="text-xs font-bold">Carregando histórico de repasses...</span>
          </div>
        ) : settlements.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 mb-1">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Nenhum fechamento registrado</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Quando você efetuar o fechamento quinzenal ou mensal de um profissional, o comprovante aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Período Apurado</th>
                  <th className="py-3 px-4">Data Fechamento</th>
                  <th className="py-3 px-4 text-right">Faturamento</th>
                  <th className="py-3 px-4 text-right">Comissão Bruta</th>
                  <th className="py-3 px-4 text-right">Vales</th>
                  <th className="py-3 px-4 text-right">Líquido Pago</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    {/* Colaborador */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {(s.professional?.name || "P")[0].toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-foreground block">{s.professional?.name}</strong>
                          <span className="text-[11px] text-muted-foreground">{s.professional?.specialty || "Geral"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Período */}
                    <td className="py-3.5 px-4">
                      <span className="text-foreground font-semibold block">
                        {formatDate(s.periodStart)} a {formatDate(s.periodEnd)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {s._count?.orderItems || 0} serviços/produtos
                      </span>
                    </td>

                    {/* Data Fechamento */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {formatDate(s.paidAt || s.createdAt)}
                    </td>

                    {/* Faturamento */}
                    <td className="py-3.5 px-4 text-right font-semibold text-foreground">
                      R$ {Number(s.grossSales || 0).toFixed(2).replace(".", ",")}
                    </td>

                    {/* Comissão Bruta */}
                    <td className="py-3.5 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                      R$ {Number(s.totalCommission || 0).toFixed(2).replace(".", ",")}
                    </td>

                    {/* Vales */}
                    <td className="py-3.5 px-4 text-right text-rose-600 font-semibold">
                      {Number(s.advanceDeductions || 0) > 0 ? `- R$ ${Number(s.advanceDeductions).toFixed(2)}` : "—"}
                    </td>

                    {/* Líquido Pago */}
                    <td className="py-3.5 px-4 text-right">
                      <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                        R$ {Number(s.netPaymentAmount || 0).toFixed(2).replace(".", ",")}
                      </strong>
                      <span className="text-[10px] text-muted-foreground">
                        Via {s.paidMethod || "PIX"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="success" className="text-[10px] px-2 py-0.5">
                        Pago
                      </Badge>
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingWhatsAppId === s.id}
                          onClick={() => handleSendWhatsApp(s.id)}
                          className="h-8 px-2.5 rounded-xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 cursor-pointer"
                          title="Enviar comprovante via WhatsApp"
                        >
                          <Send className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedSettlementId(s.id)
                            setReceiptModalOpen(true)
                          }}
                          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground"
                          title="Imprimir / Ver Recibo"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Total de <b>{totalCount}</b> fechamentos (Página {page} de {totalPages})
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

      {/* Modal de Recibo */}
      <SettlementReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false)
          setSelectedSettlementId(null)
        }}
        settlementId={selectedSettlementId}
      />
    </div>
  )
}
