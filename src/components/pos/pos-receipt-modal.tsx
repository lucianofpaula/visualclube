"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  X, 
  Printer, 
  Send, 
  CheckCircle2, 
  Receipt, 
  Share2, 
  Sparkles, 
  Store,
  Phone,
  Copy,
  Check,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getDigitalReceiptAction } from "@/actions/pos-actions"

interface PosReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
}

function formatPhoneMask(value: string) {
  const clean = value.replace(/\D/g, "")
  if (clean.length <= 2) return clean.length ? `(${clean}` : ""
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`
}

export function PosReceiptModal({ isOpen, onClose, orderId }: PosReceiptModalProps) {
  const [receiptData, setReceiptData] = useState<any | null>(null)
  const [whatsappPhone, setWhatsappPhone] = useState<string>("")
  const [copiedText, setCopiedText] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true)
      getDigitalReceiptAction(orderId)
        .then((res) => {
          if (res.success && res.receipt) {
            setReceiptData(res.receipt)
            // Pré-carrega o telefone do cliente se houver
            const rawPhone = res.receipt.order?.clientPhone || ""
            if (rawPhone) {
              setWhatsappPhone(formatPhoneMask(rawPhone))
            } else {
              setWhatsappPhone("")
            }
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, orderId])

  if (!isOpen || !orderId) return null

  const order = receiptData?.order
  const items = order?.items || []
  const originalClientPhone = order?.clientPhone ? order.clientPhone.replace(/\D/g, "") : ""
  const currentDigits = whatsappPhone.replace(/\D/g, "")
  const isOriginalPhone = originalClientPhone && currentDigits === originalClientPhone

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsappPhone(formatPhoneMask(e.target.value))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSendWhatsApp = () => {
    if (!receiptData?.messageText) return

    const clean = whatsappPhone.replace(/\D/g, "")
    let url = ""

    if (clean && clean.length >= 10) {
      url = `https://wa.me/55${clean}?text=${encodeURIComponent(receiptData.messageText)}`
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(receiptData.messageText)}`
    }

    window.open(url, "_blank")
  }

  const handleCopyMessage = () => {
    if (receiptData?.messageText) {
      navigator.clipboard.writeText(receiptData.messageText)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 space-y-4 max-h-[94vh] flex flex-col">
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

        {/* Bloco de Envio via WhatsApp (Destacado e Editável) */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3 shrink-0 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">
                Enviar Recibo Digital via WhatsApp
              </span>
            </div>

            {originalClientPhone ? (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium">
                {isOriginalPhone ? "✓ Número do Cadastro" : "Número Alterado"}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground border-border">
                Sem telefone no cadastro
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={whatsappPhone}
                onChange={handlePhoneChange}
                placeholder="(DDD) 99999-9999"
                className="pl-10 text-xs h-10 font-bold bg-background"
                maxLength={16}
              />
            </div>

            <Button
              onClick={handleSendWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs gap-1.5 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Enviar WhatsApp</span>
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>Você pode confirmar ou alterar o número acima antes do envio.</span>
            <button
              onClick={handleCopyMessage}
              className="text-primary hover:underline font-semibold flex items-center gap-1 shrink-0 ml-2"
            >
              {copiedText ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copiedText ? "Copiado!" : "Copiar Texto"}
            </button>
          </div>
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
            {whatsappPhone && <div><strong>WhatsApp Destino:</strong> {whatsappPhone}</div>}
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
                  R$ {Number(i.totalPrice || 0).toFixed(2).replace(".", ",")}
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

        {/* Rodapé: Botões de Ação */}
        <div className="grid grid-cols-2 gap-2 pt-1 print:hidden shrink-0">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full font-bold text-xs h-10 rounded-xl gap-1.5"
          >
            <Printer className="h-4 w-4 text-primary" />
            <span>Imprimir Cupom</span>
          </Button>

          <Button
            onClick={onClose}
            variant="default"
            className="w-full font-bold text-xs h-10 rounded-xl"
          >
            Concluir & Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
