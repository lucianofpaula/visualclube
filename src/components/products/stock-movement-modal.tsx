"use client"

import * as React from "react"
import { useState } from "react"
import { X, ArrowDownRight, ArrowUpRight, AlertTriangle, RefreshCw, Layers, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { registerStockMovementAction } from "@/actions/product-actions"

interface StockMovementModalProps {
  isOpen: boolean
  onClose: () => void
  products: any[]
  selectedProduct?: any | null
  onSuccess: () => void
}

export function StockMovementModal({
  isOpen,
  onClose,
  products,
  selectedProduct,
  onSuccess,
}: StockMovementModalProps) {
  const [productId, setProductId] = useState(selectedProduct?.id || (products[0]?.id || ""))
  const [type, setType] = useState<"IN_PURCHASE" | "OUT_LOSS" | "INTERNAL_USE" | "ADJUSTMENT">("IN_PURCHASE")
  const [quantity, setQuantity] = useState("1")
  const [costPrice, setCostPrice] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (selectedProduct) {
      setProductId(selectedProduct.id)
      setCostPrice(selectedProduct.costPrice ? String(selectedProduct.costPrice) : "")
    } else if (products.length > 0 && !productId) {
      setProductId(products[0].id)
      setCostPrice(products[0].costPrice ? String(products[0].costPrice) : "")
    }
  }, [selectedProduct, products, productId])

  if (!isOpen) return null

  const currentProduct = products.find((p) => p.id === productId) || selectedProduct
  const prevStock = currentProduct?.stock || 0
  const qty = parseInt(quantity) || 0

  let projectedStock = prevStock
  if (type === "IN_PURCHASE") projectedStock = prevStock + qty
  else if (type === "OUT_LOSS" || type === "INTERNAL_USE") projectedStock = Math.max(0, prevStock - qty)
  else if (type === "ADJUSTMENT") projectedStock = qty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!productId) {
      setError("Selecione um produto.")
      return
    }

    if (qty <= 0 && type !== "ADJUSTMENT") {
      setError("A quantidade deve ser maior que zero.")
      return
    }

    if ((type === "OUT_LOSS" || type === "INTERNAL_USE") && prevStock < qty) {
      setError(`Estoque insuficiente. Saldo atual: ${prevStock} ${currentProduct?.unit || "UN"}.`)
      return
    }

    setLoading(true)

    try {
      const res = await registerStockMovementAction({
        productId,
        type,
        quantity: qty,
        costPrice: costPrice ? parseFloat(costPrice.replace(",", ".")) : undefined,
        notes: notes.trim() || undefined,
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || "Falha ao registrar movimentação.")
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Movimentação de Estoque</h2>
              <p className="text-[11px] text-muted-foreground">Entrada de compras, perdas ou ajustes com auditoria.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Seleção do Produto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Produto *</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value)
                const p = products.find((x) => x.id === e.target.value)
                if (p?.costPrice) setCostPrice(String(p.costPrice))
              }}
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Saldo: {p.stock} {p.unit || "UN"})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Movimentação */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Tipo de Operação</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("IN_PURCHASE")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  type === "IN_PURCHASE"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span>Entrada / Compra</span>
              </button>

              <button
                type="button"
                onClick={() => setType("INTERNAL_USE")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  type === "INTERNAL_USE"
                    ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <RefreshCw className="h-4 w-4 text-indigo-500" />
                <span>Uso Bancada</span>
              </button>

              <button
                type="button"
                onClick={() => setType("OUT_LOSS")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  type === "OUT_LOSS"
                    ? "bg-rose-500/15 border-rose-500/50 text-rose-600 dark:text-rose-400"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>Perda / Avaria</span>
              </button>

              <button
                type="button"
                onClick={() => setType("ADJUSTMENT")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  type === "ADJUSTMENT"
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-4 w-4 text-amber-500" />
                <span>Ajuste Balanço</span>
              </button>
            </div>
          </div>

          {/* Quantidade & Novo Custo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {type === "ADJUSTMENT" ? "Novo Saldo Real" : "Quantidade"}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {type === "IN_PURCHASE" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Preço Custo Unit. (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 15,00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Saldo Projetado</label>
                <div className="px-3.5 py-2 rounded-xl border border-border/40 bg-muted/20 text-xs font-black text-foreground">
                  {projectedStock} {currentProduct?.unit || "UN"}
                </div>
              </div>
            )}
          </div>

          {/* Justificativa / Nota */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Motivo / Observação (Auditoria)</label>
            <input
              type="text"
              placeholder="Ex: NF 1040 Fornecedor Beleza Distribuidora"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Prévia de Estoque */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Saldo Anterior: <strong>{prevStock} {currentProduct?.unit || "UN"}</strong></span>
            <span className="text-foreground">Novo Saldo: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{projectedStock} {currentProduct?.unit || "UN"}</strong></span>
          </div>

          {/* Botões */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9 rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs"
            >
              {loading ? "Registrando..." : "Confirmar Movimentação"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
