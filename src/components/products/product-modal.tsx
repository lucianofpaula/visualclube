"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { X, Sparkles, AlertCircle, Barcode, Percent, Package, DollarSign, TrendingUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createProductAction, updateProductAction, ProductInput } from "@/actions/product-actions"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  productToEdit?: any | null
  existingCategories?: string[]
  onSuccess: () => void
}

export function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  existingCategories = [],
  onSuccess,
}: ProductModalProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Cosméticos")
  const [customCategory, setCustomCategory] = useState("")
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [description, setDescription] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [unit, setUnit] = useState("UN")
  const [price, setPrice] = useState<string>("")
  const [costPrice, setCostPrice] = useState<string>("")
  const [stock, setStock] = useState<string>("0")
  const [minStockAlert, setMinStockAlert] = useState<string>("5")
  const [trackStock, setTrackStock] = useState(true)
  const [customCommission, setCustomCommission] = useState<string>("")
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!productToEdit

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "")
      const cat = productToEdit.category || "Geral"
      if (existingCategories.includes(cat)) {
        setCategory(cat)
        setIsNewCategory(false)
      } else {
        setCategory("__custom__")
        setCustomCategory(cat)
        setIsNewCategory(true)
      }
      setDescription(productToEdit.description || "")
      setSku(productToEdit.sku || "")
      setBarcode(productToEdit.barcode || "")
      setUnit(productToEdit.unit || "UN")
      setPrice(productToEdit.price !== undefined ? String(productToEdit.price) : "")
      setCostPrice(productToEdit.costPrice !== undefined ? String(productToEdit.costPrice) : "")
      setStock(productToEdit.stock !== undefined ? String(productToEdit.stock) : "0")
      setMinStockAlert(productToEdit.minStockAlert !== undefined ? String(productToEdit.minStockAlert) : "5")
      setTrackStock(productToEdit.trackStock !== undefined ? productToEdit.trackStock : true)
      setCustomCommission(
        productToEdit.customCommission !== undefined && productToEdit.customCommission !== null
          ? String(productToEdit.customCommission)
          : ""
      )
      setIsActive(productToEdit.isActive !== undefined ? productToEdit.isActive : true)
    } else {
      setName("")
      setCategory(existingCategories[0] || "Cosméticos")
      setCustomCategory("")
      setIsNewCategory(false)
      setDescription("")
      setSku(`PRD-${Math.floor(1000 + Math.random() * 9000)}`)
      setBarcode("")
      setUnit("UN")
      setPrice("")
      setCostPrice("")
      setStock("10")
      setMinStockAlert("5")
      setTrackStock(true)
      setCustomCommission("")
      setIsActive(true)
    }
    setError(null)
  }, [productToEdit, isOpen, existingCategories])

  if (!isOpen) return null

  // Cálculos dinâmicos de Margem e Lucro em tempo real
  const numPrice = parseFloat(price.replace(",", ".")) || 0
  const numCost = parseFloat(costPrice.replace(",", ".")) || 0
  const unitProfit = numPrice - numCost
  const marginPercent = numPrice > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100 * 10) / 10 : 0
  const markupPercent = numCost > 0 ? Math.round(((numPrice - numCost) / numCost) * 100 * 10) / 10 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Por favor, preencha o nome do produto.")
      return
    }

    if (numPrice <= 0) {
      setError("O preço de venda deve ser maior que zero.")
      return
    }

    setLoading(true)

    const finalCategory = isNewCategory ? customCategory.trim() : (category === "__custom__" ? customCategory.trim() : category)

    const payload: ProductInput = {
      name: name.trim(),
      category: finalCategory || "Geral",
      description: description.trim() || undefined,
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      unit: unit.trim() || "UN",
      price: numPrice,
      costPrice: numCost,
      stock: trackStock ? parseInt(stock) || 0 : 0,
      minStockAlert: trackStock ? parseInt(minStockAlert) || 5 : 0,
      trackStock,
      customCommission: customCommission ? parseFloat(customCommission.replace(",", ".")) : null,
      isActive,
    }

    try {
      if (isEditing) {
        const res = await updateProductAction(productToEdit.id, payload)
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.error || "Erro ao salvar alterações do produto.")
        }
      } else {
        const res = await createProductAction(payload)
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.error || "Erro ao cadastrar produto.")
        }
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao salvar produto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                {isEditing ? "Editar Produto & Estoque" : "Novo Produto para Venda"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Cadastre custos, preço de venda, código de barras e controle de estoque.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Nome do Produto *</label>
              <input
                type="text"
                placeholder="Ex: Pomada Efeito Matte 80g"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Unidade</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="UN">Unidade (UN)</option>
                <option value="CX">Caixa (CX)</option>
                <option value="ML">Mililitros (ML)</option>
                <option value="G">Gramas (G)</option>
                <option value="KG">Quilogramas (KG)</option>
                <option value="PCT">Pacote (PCT)</option>
              </select>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Categoria</label>
              <button
                type="button"
                onClick={() => setIsNewCategory(!isNewCategory)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isNewCategory ? "Selecionar Existente" : "+ Nova Categoria"}
              </button>
            </div>

            {isNewCategory ? (
              <input
                type="text"
                placeholder="Digite o nome da nova categoria..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsNewCategory(true)
                  } else {
                    setCategory(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="Cosméticos">Cosméticos & Cabelo</option>
                <option value="Bar & Bebidas">Bar & Bebidas</option>
                <option value="Barbearia & Barba">Barbearia & Barba</option>
                <option value="Acessórios">Acessórios & Cutelaria</option>
                <option value="Uso Interno / Lavatório">Uso Interno / Lavatório</option>
                {existingCategories
                  .filter((c) => !["Cosméticos", "Bar & Bebidas", "Barbearia & Barba", "Acessórios", "Uso Interno / Lavatório"].includes(c))
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                <option value="__custom__">+ Outra Categoria...</option>
              </select>
            )}
          </div>

          {/* Código de Barras & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
                Código de Barras (EAN-13)
              </label>
              <input
                type="text"
                placeholder="Ex: 7891234567890 (opcional)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Código SKU Interno</label>
              <input
                type="text"
                placeholder="Ex: POM-MATTE-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono uppercase"
              />
            </div>
          </div>

          {/* Precificação & Margem Real */}
          <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-foreground">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Custos, Preço de Venda & Lucratividade
              </span>
              <Badge variant={marginPercent >= 50 ? "success" : marginPercent >= 20 ? "gold" : "destructive"}>
                Margem: {marginPercent}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Preço de Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-card text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Preço de Venda Final (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-500/50 bg-card text-xs text-foreground font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {/* Widget de Cálculo de Margem Instantânea */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
              <div className="p-2 rounded-xl bg-card border border-border/40 text-center">
                <span className="text-muted-foreground block text-[10px]">Lucro Unitário</span>
                <span className="font-bold text-foreground">
                  R$ {unitProfit.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/40 text-center">
                <span className="text-muted-foreground block text-[10px]">Markup (%)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {markupPercent}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/40 text-center">
                <span className="text-muted-foreground block text-[10px]">Margem Bruta</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {marginPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Controle de Estoque */}
          <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trackStock"
                  checked={trackStock}
                  onChange={(e) => setTrackStock(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary/40"
                />
                <label htmlFor="trackStock" className="text-xs font-bold text-foreground cursor-pointer">
                  Controlar Estoque Físico deste Produto
                </label>
              </div>
            </div>

            {trackStock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    {isEditing ? "Estoque Atual (Saldo)" : "Estoque Inicial"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-card text-xs text-foreground font-bold focus:outline-none disabled:opacity-75"
                  />
                  {isEditing && (
                    <span className="text-[10px] text-muted-foreground block">
                      Use a opção &quot;Movimentação de Estoque&quot; para registrar entradas ou baixas.
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Alerta de Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-card text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Comissão do Profissional sobre a Venda */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Comissão da Equipe na Venda deste Produto (%)</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Opcional - se vazio, usa a taxa padrão do colaborador)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ex: 10 (para 10% de comissão)"
                value={customCommission}
                onChange={(e) => setCustomCommission(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Percent className="h-3.5 w-3.5 text-muted-foreground absolute right-3 top-2.5" />
            </div>
          </div>
        </form>

        {/* Rodapé com Ações e Auditoria */}
        <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-muted-foreground">
            {productToEdit?.createdByName && (
              <span>Cadastrado por: <strong className="text-foreground">{productToEdit.createdByName}</strong></span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-xs h-9 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
            >
              {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
