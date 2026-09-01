"use client"

import * as React from "react"
import { useState } from "react"
import {
  X,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  Scissors,
  Package,
  Check,
  CreditCard,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowLeft,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import {
  openOrderAction,
  addItemToOrderAction,
  removeItemFromOrderAction,
  cancelOrderAction
} from "@/actions/pos-actions"

export interface DrawerItem {
  id: string
  itemType: "SERVICE" | "PRODUCT"
  serviceId?: string
  productId?: string
  name: string
  quantity: number
  unitPrice: number
  costPrice?: number
  totalPrice: number
  professionalId?: string
  commissionRate?: number
  commissionValue?: number
}

interface PosOrderDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: "NEW" | "EDIT"
  targetOrder?: any | null
  professionals: any[]
  queuedItems: DrawerItem[]
  onUpdateQueuedItems: (items: DrawerItem[]) => void
  onOrderCreated: (newOrder: any) => void
  onOpenCheckout: (order: any) => void
  onRefreshOrders: () => Promise<void>
}

export function PosOrderDrawer({
  isOpen,
  onClose,
  mode,
  targetOrder,
  professionals = [],
  queuedItems,
  onUpdateQueuedItems,
  onOrderCreated,
  onOpenCheckout,
  onRefreshOrders,
}: PosOrderDrawerProps) {
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [chairOrTable, setChairOrTable] = useState("Cadeira 01")
  const [selectedProfId, setSelectedProfId] = useState<string>(professionals[0]?.id || "")
  const [loading, setLoading] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const isEditMode = mode === "EDIT" && targetOrder
  const existingItems = targetOrder?.items || []

  // Cálculos de novos itens na fila
  const queuedSubtotal = queuedItems.reduce((acc, i) => acc + i.totalPrice, 0)
  const queuedCost = queuedItems.reduce((acc, i) => acc + (i.costPrice || 0) * i.quantity, 0)
  const queuedCommission = queuedItems.reduce(
    (acc, i) => acc + (i.commissionValue || (i.totalPrice * (i.commissionRate || 0)) / 100),
    0
  )

  // Totais combinados se for edição de comanda existente
  const existingSubtotal = Number(targetOrder?.subtotal || 0)
  const existingDiscount = Number(targetOrder?.discount || 0)
  const grandTotal = isEditMode
    ? Math.max(0, existingSubtotal + queuedSubtotal - existingDiscount)
    : queuedSubtotal

  const totalCommission = isEditMode
    ? Number(targetOrder?.totalCommission || 0) + queuedCommission
    : queuedCommission

  const totalCost = isEditMode
    ? Number(targetOrder?.costTotal || 0) + queuedCost
    : queuedCost

  const netProfit = grandTotal - totalCost - totalCommission

  // Modificar quantidade de item na fila
  const handleQuantityChange = (index: number, delta: number) => {
    const updated = [...queuedItems]
    const current = updated[index]
    const newQty = current.quantity + delta

    if (newQty <= 0) {
      updated.splice(index, 1)
    } else {
      current.quantity = newQty
      current.totalPrice = newQty * current.unitPrice
      current.commissionValue = (current.totalPrice * (current.commissionRate || 0)) / 100
    }
    onUpdateQueuedItems(updated)
  }

  // Remover item da fila
  const handleRemoveQueuedItem = (index: number) => {
    const updated = queuedItems.filter((_, i) => i !== index)
    onUpdateQueuedItems(updated)
  }

  // Remover item já existente no banco de dados
  const handleRemoveExistingItem = async (itemId: string) => {
    if (!targetOrder) return
    setRemovingItemId(itemId)
    setErrorMessage(null)
    try {
      const res = await removeItemFromOrderAction(targetOrder.id, itemId)
      if (res.success) {
        await onRefreshOrders()
      } else {
        setErrorMessage(res.error || "Erro ao remover item.")
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Falha ao remover item.")
    } finally {
      setRemovingItemId(null)
    }
  }

  // Executar cancelamento da comanda aberta
  const executeCancelOrder = async () => {
    if (!targetOrder) return
    setLoading(true)
    try {
      const res = await cancelOrderAction(targetOrder.id, "Cancelada no PDV")
      if (res.success) {
        await onRefreshOrders()
        setCancelModalOpen(false)
        onClose()
      } else {
        setErrorMessage(res.error || "Erro ao cancelar comanda.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Salvar / Abrir Nova Comanda
  const handleSaveNewOrder = async (directCheckout = false) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await openOrderAction({
        type: "ORDER",
        clientName: clientName.trim() || "Cliente em Atendimento",
        clientPhone: clientPhone.trim() || undefined,
        chairOrTable: chairOrTable.trim() || "Cadeira Principal",
        professionalId: selectedProfId || undefined,
        initialItems: queuedItems.map((i) => ({
          itemType: i.itemType,
          serviceId: i.serviceId,
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          costPrice: i.costPrice || 0,
          professionalId: i.professionalId || selectedProfId || undefined,
          commissionRate: i.commissionRate || 0,
        })),
      })

      if (res.success && res.order) {
        await onRefreshOrders()
        onUpdateQueuedItems([])
        setClientName("")
        setClientPhone("")

        if (directCheckout) {
          onClose()
          onOpenCheckout(res.order)
        } else {
          onOrderCreated(res.order)
          onClose()
        }
      } else {
        setErrorMessage(res.error || "Falha ao criar comanda.")
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro inesperado ao criar comanda.")
    } finally {
      setLoading(false)
    }
  }

  // Lançar itens diretamente na comanda existente aberta
  const handleSaveItemsToExistingOrder = async (directCheckout = false) => {
    if (!targetOrder) return
    setLoading(true)
    setErrorMessage(null)

    try {
      for (const item of queuedItems) {
        await addItemToOrderAction({
          orderId: targetOrder.id,
          itemType: item.itemType,
          serviceId: item.serviceId,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice || 0,
          professionalId: item.professionalId || targetOrder.professionalId || selectedProfId || undefined,
          commissionRate: item.commissionRate || 0,
        })
      }

      await onRefreshOrders()
      onUpdateQueuedItems([])

      if (directCheckout) {
        onClose()
        onOpenCheckout(targetOrder)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao adicionar itens na comanda.")
    } finally {
      setLoading(false)
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
    <div className="w-full h-full animate-in slide-in-from-right duration-250">
      <Card className="rounded-3xl border-border/80 bg-card p-4 sm:p-5 shadow-2xl space-y-3.5 flex flex-col h-full max-h-[calc(100vh-140px)]">
        {/* Cabeçalho do Drawer */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-0.5"
              title="Voltar para a listagem de comandas"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Receipt className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-foreground">
                  {isEditMode ? targetOrder.code : "Nova Comanda"}
                </h3>
                <Badge variant={isEditMode ? "gold" : "success"} className="text-[9px] px-1.5 py-0">
                  {isEditMode ? "Em Aberto" : "Criando"}
                </Badge>
                {isEditMode && targetOrder.openedAt && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {formatTime(targetOrder.openedAt)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                {isEditMode
                  ? `${targetOrder.clientName || "Cliente"} • ${targetOrder.chairOrTable || "Balcão"}`
                  : "Selecione produtos ou serviços no catálogo à esquerda"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Fechar / Recolher Painel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dica visual de que o catálogo à esquerda está ativo */}
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-2 shrink-0">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>
            {isEditMode
              ? "Clique em qualquer produto ou serviço à esquerda para lançar nesta comanda."
              : "Clique nos itens do catálogo à esquerda para montar a nova comanda."}
          </span>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Container de Itens e Formulário */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {/* Formulário de Identificação da Comanda (quando criando nova) */}
          {!isEditMode && (
            <div className="space-y-2.5 p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva ou Cliente Balcão"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">
                    Cadeira / Mesa
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cadeira 01"
                    value={chairOrTable}
                    onChange={(e) => setChairOrTable(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">
                    Profissional
                  </label>
                  <select
                    value={selectedProfId}
                    onChange={(e) => setSelectedProfId(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="">(Geral / Caixa)</option>
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* LISTA 1: ITENS JÁ SALVOS NA COMANDA (Modo EDIT) */}
          {isEditMode && existingItems.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                Itens Já Lançados ({existingItems.length})
              </span>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {existingItems.map((item: any) => {
                  const isService = item.itemType === "SERVICE"
                  const isDeleting = removingItemId === item.id

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl border border-border/60 bg-card flex items-center justify-between text-xs gap-2 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-muted/60 border border-border/50 shrink-0">
                          {isService ? (
                            <Scissors className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Package className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-foreground truncate text-xs">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {item.quantity}x R$ {Number(item.unitPrice || 0).toFixed(2).replace(".", ",")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-xs text-foreground">
                          R$ {Number(item.totalPrice || 0).toFixed(2).replace(".", ",")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingItem(item.id)}
                          disabled={isDeleting}
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Remover item da comanda"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* LISTA 2: NOVOS ITENS SENDO ADICIONADOS EM TEMPO REAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {isEditMode ? `Novos Itens a Incluir (${queuedItems.length})` : `Itens da Comanda (${queuedItems.length})`}
              </span>
              {queuedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateQueuedItems([])}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer font-bold"
                >
                  Limpar novos
                </button>
              )}
            </div>

            {queuedItems.length === 0 && !isEditMode ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl p-4 space-y-1 bg-muted/5">
                <Sparkles className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1 animate-pulse" />
                <p className="font-bold text-foreground">Comanda vazia</p>
                <p className="text-[11px] text-muted-foreground">
                  Clique nos produtos e serviços à esquerda para adicioná-los.
                </p>
              </div>
            ) : queuedItems.length === 0 && isEditMode && existingItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-2xl p-4">
                Nenhum item lançado ainda. Clique no catálogo ao lado para adicionar.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {queuedItems.map((item, idx) => {
                  const isService = item.itemType === "SERVICE"

                  return (
                    <div
                      key={`${item.itemType}-${item.serviceId || item.productId || idx}`}
                      className="p-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-between text-xs gap-2 hover:bg-emerald-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-card border border-border/50 shrink-0">
                          {isService ? (
                            <Scissors className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Package className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-foreground truncate text-xs">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            R$ {item.unitPrice.toFixed(2).replace(".", ",")} un
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Controles de Quantidade */}
                        <div className="flex items-center gap-1 bg-card rounded-xl p-0.5 border border-border/50">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, -1)}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title="Diminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-black text-xs px-1 min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(idx, 1)}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title="Aumentar"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="font-black text-xs text-foreground min-w-[65px] text-right">
                          R$ {item.totalPrice.toFixed(2).replace(".", ",")}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveQueuedItem(idx)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resumo Financeiro da Comanda */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Total da Comanda:</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                R$ {grandTotal.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/40 text-[10px]">
              <div>
                <span className="text-muted-foreground block">Repasse Equipe:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  R$ {totalCommission.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block">Líquido da Casa:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {netProfit.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações do Rodapé */}
        <div className="pt-3 border-t border-border/50 space-y-2 shrink-0">
          {isEditMode ? (
            <div className="space-y-2">
              {queuedItems.length > 0 && (
                <Button
                  onClick={() => handleSaveItemsToExistingOrder(false)}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-10 rounded-2xl shadow-md gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {loading
                      ? "Salvando lançamentos..."
                      : `Confirmar ${queuedItems.length} novos itens (+ R$ ${queuedSubtotal.toFixed(2)})`}
                  </span>
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCancelModalOpen(true)}
                  disabled={loading}
                  className="text-xs h-10 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive px-3 cursor-pointer"
                  title="Cancelar Comanda"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>

                <Button
                  onClick={async () => {
                    if (queuedItems.length > 0) {
                      await handleSaveItemsToExistingOrder(false)
                    }
                    onClose()
                    onOpenCheckout(targetOrder)
                  }}
                  disabled={loading || (existingItems.length === 0 && queuedItems.length === 0)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-10 rounded-2xl shadow-md gap-1.5 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Cobrar Comanda (R$ {grandTotal.toFixed(2)})</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => handleSaveNewOrder(false)}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-10 rounded-2xl shadow-md gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {loading
                    ? "Abrindo comanda..."
                    : `Abrir Comanda (${queuedItems.length} ${queuedItems.length === 1 ? "item" : "itens"})`}
                </span>
              </Button>

              {queuedItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleSaveNewOrder(true)}
                  disabled={loading}
                  className="w-full text-xs h-9 rounded-xl font-bold gap-1.5 cursor-pointer"
                >
                  <CreditCard className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Abrir e Cobrar Imediatamente</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Confirmação de Cancelamento de Comanda */}
      {isEditMode && (
        <ConfirmModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={executeCancelOrder}
          title={`Cancelar Comanda ${targetOrder?.code}?`}
          description="Tem certeza que deseja cancelar esta comanda? Todos os produtos lançados serão devolvidos automaticamente ao estoque e o atendimento será encerrado."
          confirmText="Sim, Cancelar Comanda"
          cancelText="Não, Voltar"
          variant="destructive"
          isLoading={loading}
        />
      )}
    </div>
  )
}
