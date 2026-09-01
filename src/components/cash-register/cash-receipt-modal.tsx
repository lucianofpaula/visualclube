"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  Printer, 
  X, 
  Receipt, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Wallet,
  Building2,
  Calendar,
  Clock,
  User,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCashSessionDetailsAction } from "@/actions/cash-register-actions"

interface CashReceiptModalProps {
  open: boolean
  onClose: () => void
  sessionId: string
  fallbackSession?: any
}

export function CashReceiptModal({
  open,
  onClose,
  sessionId,
  fallbackSession,
}: CashReceiptModalProps) {
  const [data, setData] = useState<any>(fallbackSession || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionId && open) {
      setLoading(true)
      getCashSessionDetailsAction(sessionId).then((res) => {
        if (res.success && res.data) {
          setData(res.data)
        }
        setLoading(false)
      })
    }
  }, [sessionId, open])

  if (!open) return null

  const handlePrint = () => {
    window.print()
  }

  const s = data || fallbackSession
  const business = s?.business || {}
  const isClosed = s?.status === "CLOSED"
  const diff = Number(s?.differenceAmount || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Comprovante de Turno / Fechamento</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </Button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Cupom Térmico (Estilo 80mm) */}
        <div className="p-6 overflow-y-auto flex-1 bg-white text-black font-mono text-[12px] leading-tight space-y-3">
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Carregando detalhes do turno...</span>
            </div>
          ) : (
            <>
              {/* Cabeçalho do Estabelecimento */}
              <div className="text-center pb-3 border-b border-dashed border-zinc-400 space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-black">
                  {business?.name || "ESTABELECIMENTO"}
                </h3>
                {business?.document && <p className="text-[10px] text-zinc-600">CNPJ: {business.document}</p>}
                {business?.phone && <p className="text-[10px] text-zinc-600">Tel: {business.phone}</p>}
                <p className="text-[11px] font-bold text-zinc-800 pt-1">
                  *** {isClosed ? "FECHAMENTO DE CAIXA (REDUÇÃO)" : "LEITURA PARCIAL DE CAIXA (X)"} ***
                </p>
              </div>

              {/* Informações da Sessão */}
              <div className="space-y-1 py-1 border-b border-dashed border-zinc-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Abertura:</span>
                  <span>{s?.openedAt ? new Date(s.openedAt).toLocaleString("pt-BR") : "--"}</span>
                </div>
                {s?.closedAt && (
                  <div className="flex justify-between">
                    <span>Encerramento:</span>
                    <span>{new Date(s.closedAt).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Operador:</span>
                  <span className="font-bold">{s?.openedByName || "--"}</span>
                </div>
                {s?.closedByName && (
                  <div className="flex justify-between">
                    <span>Fechado por:</span>
                    <span className="font-bold">{s.closedByName}</span>
                  </div>
                )}
              </div>

              {/* Resumo Financeiro em Dinheiro */}
              <div className="space-y-1 py-1 border-b border-dashed border-zinc-400 text-[11px]">
                <p className="font-bold uppercase text-[11px]">1. FLUXO EM DINHEIRO VIVO (GAVETA)</p>
                <div className="flex justify-between">
                  <span>(+) Fundo Inicial (Troco):</span>
                  <span>R$ {Number(s?.initialBalance || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) Vendas em Dinheiro:</span>
                  <span>R$ {Number(s?.liveMetrics?.salesCash || s?.calculatedCash - (s?.initialBalance || 0) || 0).toFixed(2)}</span>
                </div>
                {s?.liveMetrics?.totalSupplies > 0 && (
                  <div className="flex justify-between">
                    <span>(+) Suprimentos de Troco:</span>
                    <span>R$ {Number(s.liveMetrics.totalSupplies).toFixed(2)}</span>
                  </div>
                )}
                {s?.liveMetrics?.totalBleedings > 0 && (
                  <div className="flex justify-between text-zinc-700">
                    <span>(-) Sangrias Realizadas:</span>
                    <span>R$ {Number(s.liveMetrics.totalBleedings).toFixed(2)}</span>
                  </div>
                )}
                {s?.liveMetrics?.totalExpenses > 0 && (
                  <div className="flex justify-between text-zinc-700">
                    <span>(-) Despesas Balcão:</span>
                    <span>R$ {Number(s.liveMetrics.totalExpenses).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1 border-t border-dotted border-zinc-300">
                  <span>(=) SALDO TEÓRICO GAVETA:</span>
                  <span>R$ {Number(s?.calculatedCash || s?.liveMetrics?.currentDrawerCash || 0).toFixed(2)}</span>
                </div>
                {isClosed && (
                  <>
                    <div className="flex justify-between font-bold">
                      <span>(=) VALOR INFORMADO FÍSICO:</span>
                      <span>R$ {Number(s?.reportedCash || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black pt-1">
                      <span>DIFERENÇA (QUEBRA/SOBRA):</span>
                      <span className={diff === 0 ? "text-zinc-800" : diff > 0 ? "text-emerald-700" : "text-rose-700"}>
                        {diff === 0 ? "R$ 0,00 (EXATO)" : `${diff > 0 ? "+ Sobra: " : "- Quebra: "} R$ ${Math.abs(diff).toFixed(2)}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Resumo por Meios Digitais */}
              <div className="space-y-1 py-1 border-b border-dashed border-zinc-400 text-[11px]">
                <p className="font-bold uppercase text-[11px]">2. VENDAS EM OUTROS MEIOS</p>
                <div className="flex justify-between">
                  <span>PIX:</span>
                  <span>R$ {Number(s?.calculatedPix || s?.liveMetrics?.salesPix || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartões (Débito/Crédito):</span>
                  <span>R$ {Number(s?.calculatedCard || s?.liveMetrics?.salesCard || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outros / Convênios:</span>
                  <span>R$ {Number(s?.calculatedOther || s?.liveMetrics?.salesOther || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold pt-1 border-t border-dotted border-zinc-300">
                  <span>TOTAL GERAL FATURADO:</span>
                  <span>R$ {Number(s?.calculatedTotal || s?.liveMetrics?.totalSales || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Movimentações Avulsas / Sangrias Listadas */}
              {s?.movements && s.movements.length > 0 && (
                <div className="space-y-1 py-1 border-b border-dashed border-zinc-400 text-[10px]">
                  <p className="font-bold uppercase text-[10px]">3. MOVIMENTAÇÕES DE TURNO</p>
                  {s.movements.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{m.reason || m.type}</span>
                      <span className="font-semibold">R$ {Number(m.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Observações e Assinaturas */}
              {s?.closingNotes && (
                <div className="py-1 text-[10px] italic text-zinc-700">
                  Obs: {s.closingNotes}
                </div>
              )}

              <div className="pt-6 pb-2 space-y-6 text-center text-[10px]">
                <div className="space-y-1">
                  <div className="w-3/4 mx-auto border-b border-zinc-500" />
                  <p>Assinatura do Operador ({s?.openedByName || "Operador"})</p>
                </div>
                <div className="space-y-1">
                  <div className="w-3/4 mx-auto border-b border-zinc-500" />
                  <p>Assinatura do Gerente / Supervisor</p>
                </div>
                <p className="text-[9px] text-zinc-400 pt-2">
                  Sistema de Gestão & CRM Avançado • VisualClube
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
