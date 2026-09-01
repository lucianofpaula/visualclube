"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Scissors,
  Package,
  DollarSign,
  Loader2,
  Send,
  Building2,
  Calendar,
  User,
  QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSettlementDetailsAction, generateSettlementWhatsAppProofAction } from "@/actions/commission-actions"

interface SettlementReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  settlementId: string | null
}

export function SettlementReceiptModal({
  isOpen,
  onClose,
  settlementId,
}: SettlementReceiptModalProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)

  useEffect(() => {
    if (isOpen && settlementId) {
      setLoading(true)
      getSettlementDetailsAction(settlementId)
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setData(null)
    }
  }, [isOpen, settlementId])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = async () => {
    if (!settlementId) return
    setSendingWhatsApp(true)
    try {
      const res = await generateSettlementWhatsAppProofAction(settlementId)
      if (res.success && res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank")
      }
    } finally {
      setSendingWhatsApp(false)
    }
  }

  const formatCurrency = (val?: number) => {
    return `R$ ${(Number(val) || 0).toFixed(2).replace(".", ",")}`
  }

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return ""
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dateStr))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-h-full print:p-0">
        {/* Header (Oculto na impressão) */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Recibo de Repasse de Comissão
              </h2>
              <p className="text-xs text-muted-foreground">
                Comprovante oficial de fechamento e quitação
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span className="text-xs font-bold">Carregando recibo...</span>
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-mono text-xs">
            {/* Cupom Térmico / Voucher A5 */}
            <div className="p-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white text-zinc-900 shadow-inner space-y-4">
              {/* Topo do Cupom */}
              <div className="text-center pb-3 border-b border-dashed border-zinc-400 space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {data.business?.name || "ESTABELECIMENTO"}
                </h3>
                <p className="text-[11px] text-zinc-600">
                  {data.business?.address ? `${data.business.address} - ` : ""}{data.business?.city || ""} {data.business?.state || ""}
                </p>
                {data.business?.phone && (
                  <p className="text-[11px] text-zinc-600">Tel/WhatsApp: {data.business.phone}</p>
                )}
                <div className="pt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  RECIBO DE REPASSE DE COMISSÃO
                </div>
              </div>

              {/* Informações do Profissional e Período */}
              <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-600">COLABORADOR:</span>
                  <span className="font-black">{data.professional?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">FUNÇÃO:</span>
                  <span>{data.professional?.specialty || "Geral"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">PERÍODO:</span>
                  <span className="font-bold">{formatDate(data.periodStart)} a {formatDate(data.periodEnd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">DATA FECHAMENTO:</span>
                  <span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(data.paidAt || data.createdAt))}</span>
                </div>
                {data.professional?.pixKey && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">CHAVE PIX:</span>
                    <span className="font-bold">{data.professional.pixKey}</span>
                  </div>
                )}
              </div>

              {/* Resumo Financeiro da Produção */}
              <div className="space-y-1.5 pb-3 border-b border-dashed border-zinc-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Faturamento Bruto Gerado:</span>
                  <span className="font-bold">{formatCurrency(data.grossSales)}</span>
                </div>
                <div className="flex justify-between text-zinc-700">
                  <span>• Comissão sobre Serviços ({data.orderItems?.filter((i: any) => i.itemType === "SERVICE").length || 0} itens):</span>
                  <span>{formatCurrency(data.serviceCommission)}</span>
                </div>
                {Number(data.productCommission) > 0 && (
                  <div className="flex justify-between text-zinc-700">
                    <span>• Comissão sobre Produtos ({data.orderItems?.filter((i: any) => i.itemType === "PRODUCT").length || 0} itens):</span>
                    <span>{formatCurrency(data.productCommission)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1 border-t border-zinc-300">
                  <span>Total Comissão Bruta:</span>
                  <span>{formatCurrency(data.totalCommission)}</span>
                </div>

                {Number(data.advanceDeductions) > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>(-) Vales / Adiantamentos Abatidos:</span>
                    <span>- {formatCurrency(data.advanceDeductions)}</span>
                  </div>
                )}
              </div>

              {/* Total Líquido Pago */}
              <div className="p-3 bg-zinc-100 rounded-xl flex justify-between items-center text-sm font-black">
                <span>VALOR LÍQUIDO PAGO:</span>
                <span className="text-base text-emerald-700">{formatCurrency(data.netPaymentAmount)}</span>
              </div>

              {/* Forma de Pagamento */}
              <div className="text-[11px] text-zinc-600 flex justify-between">
                <span>FORMA DE PAGAMENTO:</span>
                <span className="font-bold text-zinc-900">{data.paidMethod || "PIX"}</span>
              </div>

              {/* Linhas de Assinatura */}
              <div className="pt-8 grid grid-cols-2 gap-4 text-center text-[10px] text-zinc-600">
                <div className="border-t border-zinc-400 pt-1">
                  <p className="font-bold">{data.business?.name || "A Empresa"}</p>
                  <p>Administração</p>
                </div>
                <div className="border-t border-zinc-400 pt-1">
                  <p className="font-bold">{data.professional?.name}</p>
                  <p>Colaborador(a)</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Rodapé de Ações (Oculto na impressão) */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 shrink-0 print:hidden">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs h-10 rounded-xl">
            Fechar
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={sendingWhatsApp}
              onClick={handleWhatsApp}
              className="text-xs h-10 px-4 rounded-xl font-bold gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
            >
              {sendingWhatsApp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Enviar WhatsApp</span>
            </Button>

            <Button
              type="button"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir Recibo</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
