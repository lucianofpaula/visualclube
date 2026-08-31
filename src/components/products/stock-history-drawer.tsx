"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { X, History, ArrowDownRight, ArrowUpRight, AlertTriangle, RefreshCw, Layers, Clock, User, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getProductStockHistoryAction } from "@/actions/product-actions"

interface StockHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  product: any | null
}

export function StockHistoryDrawer({ isOpen, onClose, product }: StockHistoryDrawerProps) {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && product?.id) {
      setLoading(true)
      getProductStockHistoryAction(product.id)
        .then((res) => {
          if (res.success) {
            setMovements(res.movements || [])
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, product])

  if (!isOpen || !product) return null

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "IN_PURCHASE":
        return <Badge variant="success" className="gap-1"><ArrowUpRight className="h-3 w-3" /> Entrada / Compra</Badge>
      case "OUT_SALE":
        return <Badge variant="default" className="gap-1"><ArrowDownRight className="h-3 w-3" /> Venda no PDV</Badge>
      case "OUT_LOSS":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Perda / Avaria</Badge>
      case "INTERNAL_USE":
        return <Badge variant="purple" className="gap-1"><RefreshCw className="h-3 w-3" /> Uso Lavatório</Badge>
      case "ADJUSTMENT":
        return <Badge variant="gold" className="gap-1"><Layers className="h-3 w-3" /> Ajuste Inventário</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-card border-l border-border/80 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Histórico de Estoque</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">{product.name}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Saldo Atual */}
        <div className="my-4 p-3.5 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] text-muted-foreground block">Saldo Atual em Estoque</span>
            <span className="text-lg font-black text-foreground">
              {product.stock} {product.unit || "UN"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Preço de Custo</span>
            <span className="text-sm font-bold text-muted-foreground">
              R$ {(product.costPrice || 0).toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>

        {/* Lista com Scroll */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">Carregando histórico...</div>
          ) : movements.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl p-6">
              Nenhuma movimentação registrada para este produto.
            </div>
          ) : (
            movements.map((mov) => {
              const dateStr = new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(mov.createdAt))

              const isPositive = mov.quantity > 0

              return (
                <div
                  key={mov.id}
                  className="p-3 rounded-2xl border border-border/50 bg-muted/10 space-y-2 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {getMovementBadge(mov.type)}
                    <span className={`text-xs font-black ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                      {isPositive ? `+${mov.quantity}` : mov.quantity} {product.unit || "UN"}
                    </span>
                  </div>

                  {mov.notes && (
                    <p className="text-[11px] text-muted-foreground leading-snug flex items-start gap-1">
                      <FileText className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{mov.notes}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {mov.creatorName || "Sistema"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dateStr}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
