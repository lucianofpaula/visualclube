"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { X, Printer, Send, CheckCircle2, Receipt, Share2, Sparkles, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDigitalReceiptAction } from "@/actions/pos-actions"

interface PosReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
}

export function PosReceiptModal({ isOpen, onClose, orderId }: PosReceiptModalProps) {
  const [receiptData, setReceiptData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true)
      getDigitalReceiptAction(orderId)
        .then((res) => {
          if (res.success) {
            setReceiptData(res.receipt)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, orderId])

  if (!isOpen || !orderId) return null

  const handlePrint = () => {
    window.print()
  }

  const handleSendWhatsApp = () => {
    if (receiptData?.whatsappUrl) {
      window.open(receiptData.whatsappUrl, "_blank")
    }
  }

  const order = receiptData?.order
  const items = order?.items || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header (Não sai na impressão) */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Comprovante de Venda</h2>
              <p className="text-[11px] text-muted-foreground">Comanda #{order?.code || ""}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cupom Fiscal / Recibo Térmico Formatado */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white text-zinc-900 font-mono text-xs shadow-inner space-y-3 border border-zinc-200">
          <div className="text-center pb-2 border-b border-dashed border-zinc-400 space-y-0.5">
            <div className="font-black text-sm uppercase tracking-wider">
              {receiptData?.businessName || "VisualClube"}
            </div>
            <div className="text-[10px] text-zinc-600">COMPROVANTE NÃO FISCAL</div>
            <div className="text-[10px] text-zinc-500">{receiptData?.dateFormatted}</div>
          </div>

          {/* Dados do Cliente e Atendente */}
          <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-zinc-300">
            <div><strong>Comanda:</strong> #{order?.code}</div>
            <div><strong>Cliente:</strong> {order?.clientName || "Cliente Balcão"}</div>
            {order?.clientPhone && <div><strong>WhatsApp:</strong> {order.clientPhone}</div>}
            {order?.closedByName && <div><strong>Atendido por:</strong> {order.closedByName}</div>}
          </div>

          {/* Tabela de Itens */}
          <div className="space-y-1 pb-2 border-b border-dashed border-zinc-300">
            <div className="text-[10px] font-bold text-zinc-500 flex justify-between uppercase">
              <span>Qtd Item</span>
              <span>Total</span>
            </div>
            {items.map((i: any) => (
              <div key={i.id} className="flex justify-between items-start text-[11px]">
                <div className="pr-2">
                  <span>{i.quantity}x {i.name}</span>
                  {i.professional?.name && (
                    <span className="block text-[9px] text-zinc-500">Prof: {i.professional.name}</span>
                  )}
                </div>
                <span className="font-bold shrink-0">
                  R$ {i.totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>

          {/* Totais & Pagamento */}
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {(order?.subtotal || 0).toFixed(2).replace(".", ",")}</span>
            </div>

            {order?.discount && order.discount > 0 ? (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Desconto Aplicado:</span>
                <span>- R$ {order.discount.toFixed(2).replace(".", ",")}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-sm font-black pt-1 border-t border-zinc-800">
              <span>TOTAL PAGO:</span>
              <span>R$ {(order?.total || 0).toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="flex justify-between text-[10px] text-zinc-600 pt-1">
              <span>Forma de Pagamento:</span>
              <span className="font-bold">{order?.paymentMethod || "Não especificado"}</span>
            </div>

            {order?.cashChange && order.cashChange > 0 ? (
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>Troco Devolvido:</span>
                <span className="font-bold">R$ {order.cashChange.toFixed(2).replace(".", ",")}</span>
              </div>
            ) : null}
          </div>

          <div className="text-center pt-2 border-t border-dashed border-zinc-400 text-[10px] text-zinc-500">
            Agradecemos a sua preferência! Volte sempre! ✨
          </div>
        </div>

        {/* Ações Rápidas (WhatsApp + Impressão) */}
        <div className="grid grid-cols-2 gap-2 pt-2 print:hidden shrink-0">
          <Button
            onClick={handleSendWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl shadow-xs gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span>Enviar no WhatsApp</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full font-bold text-xs h-10 rounded-xl gap-1.5"
          >
            <Printer className="h-4 w-4 text-primary" />
            <span>Imprimir Cupom</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
