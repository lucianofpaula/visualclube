"use client"

import * as React from "react"
import { useState } from "react"
import {
  X,
  Receipt,
  Scissors,
  Package,
  Trash2,
  Check,
  Plus,
  Clock,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { removeItemFromOrderAction } from "@/actions/pos-actions"

interface PosOrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  order: any | null
  onAddMoreItems: (order: any) => void
  onCheckout: (order: any) => void
  onCancelOrder: (orderId: string) => void
  onOrderUpdated?: () => void
}

export function PosOrderDetailsModal({
  isOpen,
  onClose,
  order,
  onAddMoreItems,
  onCheckout,
  onCancelOrder,
  onOrderUpdated,
}: PosOrderDetailsModalProps) {
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen || !order) return null

  const items = order.items || []
  const subtotal = order.subtotal || 0
  const discount = order.discount || 0
  const total = order.total || Math.max(0, subtotal - discount)
  const totalCommission = order.totalCommission || 0
  const netProfit = order.netProfit || (total - (order.costTotal || 0) - totalCommission)

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItemId(itemId)
    setErrorMessage(null)
    try {
      const res = await removeItemFromOrderAction(order.id, itemId)
      if (res.success) {
        if (onOrderUpdated) {
          onOrderUpdated()
        }
      } else {
        setErrorMessage(res.error || "Erro ao remover item.")
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Falha ao remover item.")
    } finally {
      setRemovingItemId(null)
    }
  }

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-foreground tracking-tight">
                  {order.code}
                </h2>
                <Badge variant="gold" className="text-[10px] font-black uppercase px-2 py-0.5">
                  Atendimento Aberto
                </Badge>
                {order.openedAt && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Aberta às {formatTime(order.openedAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Cliente: <strong className="text-foreground">{order.clientName || "Cliente em Atendimento"}</strong>
                {order.chairOrTable ? ` • Local: ${order.chairOrTable}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Fechar Detalhes"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Informações Complementares */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Cadeira / Posição
              </span>
              <span className="font-bold text-foreground mt-0.5 block truncate">
                {order.chairOrTable || "Balcão"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Atendente / Operador
              </span>
              <span className="font-bold text-foreground mt-0.5 block truncate">
                {order.openedByName || "Operador do Caixa"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total de Lançamentos
              </span>
              <span className="font-bold text-foreground mt-0.5 block">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </span>
            </div>
          </div>

          {/* Lista de Itens Lançados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Itens & Serviços Lançados ({items.length})
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose()
                  onAddMoreItems(order)
                }}
                className="text-xs h-7 rounded-xl font-bold gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Lançar mais produtos/serviços</span>
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground border border-dashed rounded-2xl p-6">
                Nenhum item adicionado ainda nesta comanda.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {items.map((item: any) => {
                  const isService = item.itemType === "SERVICE"
                  const isDeleting = removingItemId === item.id

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-muted/60 border border-border/50 shrink-0">
                          {isService ? (
                            <Scissors className="h-4 w-4 text-primary" />
                          ) : (
                            <Package className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-foreground truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                              {isService ? "Serviço" : "Produto"}
                            </Badge>
                            <span>
                              {item.quantity}x R$ {Number(item.unitPrice || 0).toFixed(2).replace(".", ",")}
                            </span>
                            {item.commissionValue > 0 && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                • Comiss: R$ {Number(item.commissionValue || 0).toFixed(2).replace(".", ",")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-black text-sm text-foreground">
                          R$ {Number(item.totalPrice || 0).toFixed(2).replace(".", ",")}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Remover item da comanda"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resumo Financeiro da Comanda */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Subtotal dos Itens:</span>
              <span className="font-bold text-foreground">
                R$ {Number(subtotal).toFixed(2).replace(".", ",")}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Desconto Concedido:</span>
                <span>- R$ {Number(discount).toFixed(2).replace(".", ",")}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-border/60">
              <span className="text-foreground">TOTAL A PAGAR:</span>
              <span className="text-xl text-emerald-600 dark:text-emerald-400">
                R$ {Number(total).toFixed(2).replace(".", ",")}
              </span>
            </div>

            {/* DRE Estimado */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[10px]">
              <div>
                <span className="text-muted-foreground block font-medium">Repasse da Equipe (Comissões):</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  R$ {Number(totalCommission).toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block font-medium">Líquido Estimado da Casa:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {Number(netProfit).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações Principais */}
        <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onCancelOrder(order.id)}
            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-10 rounded-xl px-3 w-full sm:w-auto cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Cancelar Comanda</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose()
                onAddMoreItems(order)
              }}
              className="text-xs h-10 rounded-xl font-bold flex-1 sm:flex-initial cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>+ Adicionar Itens</span>
            </Button>

            <Button
              onClick={() => {
                onClose()
                onCheckout(order)
              }}
              disabled={items.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-10 px-5 rounded-xl shadow-md gap-1.5 flex-1 sm:flex-initial cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Cobrar Comanda (R$ {Number(total).toFixed(2).replace(".", ",")})</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
