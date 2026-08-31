"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  History, 
  Layers, 
  Barcode, 
  DollarSign, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  Filter
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductModal } from "@/components/products/product-modal"
import { StockMovementModal } from "@/components/products/stock-movement-modal"
import { StockHistoryDrawer } from "@/components/products/stock-history-drawer"
import { deleteProductAction } from "@/actions/product-actions"

interface ProductListProps {
  initialProducts: any[]
  initialStats: any
  categories: string[]
  onRefresh: () => void
}

export function ProductList({
  initialProducts,
  initialStats,
  categories,
  onRefresh,
}: ProductListProps) {
  const [products, setProducts] = useState(initialProducts)
  const [stats, setStats] = useState(initialStats)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [lowStockFilter, setLowStockFilter] = useState(false)

  // Modais
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<any | null>(null)

  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<any | null>(null)

  const [isPending, startTransition] = useTransition()

  // Atualizar estado quando props mudam
  React.useEffect(() => {
    setProducts(initialProducts)
    setStats(initialStats)
  }, [initialProducts, initialStats])

  // Filtragem local instantânea
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))

    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory

    const matchesLowStock = !lowStockFilter || p.isLowStock

    return matchesSearch && matchesCategory && matchesLowStock
  })

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover ou desativar o produto "${name}"?`)) {
      startTransition(async () => {
        const res = await deleteProductAction(id)
        if (res.success) {
          onRefresh()
        } else {
          alert(res.error || "Erro ao excluir produto.")
        }
      })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header com Botões de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-7 w-7 text-emerald-500" />
            Produtos & Controle de Estoque
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cadastro com preço de custo, preço de venda, margem de lucro real e histórico de movimentações auditadas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            onClick={() => {
              setSelectedProductForMovement(null)
              setMovementModalOpen(true)
            }}
            variant="outline"
            className="text-xs h-9 rounded-xl font-bold gap-1.5"
          >
            <Layers className="h-4 w-4 text-indigo-500" />
            <span>Movimentar Estoque</span>
          </Button>

          <Button
            onClick={() => {
              setEditingProduct(null)
              setProductModalOpen(true)
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Produto</span>
          </Button>
        </div>
      </div>

      {/* Cards de Métricas & Lucratividade */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 rounded-2xl border-border/60 bg-card/60 backdrop-blur-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total de Produtos</span>
              <Package className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{stats.totalItems}</div>
            <span className="text-[10px] text-muted-foreground block">Cadastrados no catálogo</span>
          </Card>

          <Card
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
              lowStockFilter
                ? "bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20"
                : "border-border/60 bg-card/60 hover:bg-card"
            }`}
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Alerta Estoque Baixo
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.lowStockCount}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {lowStockFilter ? "Filtrando estoque crítico (clique para limpar)" : "Produtos precisando de reposição"}
            </span>
          </Card>

          <Card className="p-4 rounded-2xl border-border/60 bg-card/60 backdrop-blur-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Custo do Estoque</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-foreground">
              R$ {(stats.totalStockValue || 0).toFixed(2).replace(".", ",")}
            </div>
            <span className="text-[10px] text-muted-foreground block">Capital investido a preço de custo</span>
          </Card>

          <Card className="p-4 rounded-2xl border-border/60 bg-card/60 backdrop-blur-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Potencial de Venda</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              R$ {(stats.totalPotentialRevenue || 0).toFixed(2).replace(".", ",")}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Lucro projetado: R$ {(stats.potentialProfit || 0).toFixed(2).replace(".", ",")}
            </span>
          </Card>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card/40 p-3 rounded-2xl border border-border/60">
        {/* Input de Busca */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, código SKU, código de barras ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/50 bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Categorias Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Todas ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabela de Produtos Moderna */}
      <Card className="rounded-3xl border-border/60 bg-card overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center p-6 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Nenhum produto encontrado</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {search || selectedCategory !== "all" || lowStockFilter
                ? "Nenhum produto corresponde aos filtros aplicados."
                : "Comece cadastrando os produtos que seu estabelecimento vende (bebidas, cosméticos, acessórios)."}
            </p>
            {!search && selectedCategory === "all" && (
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setProductModalOpen(true)
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Cadastrar Primeiro Produto
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3 px-4">Produto & SKU</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço Custo</th>
                  <th className="py-3 px-4">Preço Venda</th>
                  <th className="py-3 px-4">Margem Real</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredProducts.map((p) => {
                  const isCritical = p.trackStock && p.stock <= p.minStockAlert
                  const isZero = p.trackStock && p.stock === 0
                  const margin = p.calculatedMargin || 0

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Produto & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-foreground text-xs flex items-center gap-1.5">
                              {p.name}
                              {p.customCommission ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" title={`Comissão de ${p.customCommission}% para equipe`}>
                                  {p.customCommission}% Comiss.
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                              {p.sku && <span>SKU: <strong className="font-mono text-foreground">{p.sku}</strong></span>}
                              {p.barcode && <span>EAN: <strong className="font-mono text-foreground">{p.barcode}</strong></span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {p.category || "Geral"}
                        </Badge>
                      </td>

                      {/* Preço de Custo */}
                      <td className="py-3 px-4 font-semibold text-muted-foreground">
                        R$ {(p.costPrice || 0).toFixed(2).replace(".", ",")}
                      </td>

                      {/* Preço de Venda */}
                      <td className="py-3 px-4 font-black text-foreground">
                        R$ {p.price.toFixed(2).replace(".", ",")}
                      </td>

                      {/* Margem Real */}
                      <td className="py-3 px-4">
                        <Badge variant={margin >= 50 ? "success" : margin >= 20 ? "gold" : "destructive"} className="text-[10px] font-black">
                          {margin}%
                        </Badge>
                      </td>

                      {/* Estoque */}
                      <td className="py-3 px-4 text-center">
                        {p.trackStock ? (
                          <div className="inline-flex flex-col items-center">
                            <Badge
                              variant={isZero ? "destructive" : isCritical ? "gold" : "success"}
                              className="text-[11px] font-black px-2 py-0.5"
                            >
                              {p.stock} {p.unit || "UN"}
                            </Badge>
                            {isCritical && (
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                                {isZero ? "Esgotado" : `Mín: ${p.minStockAlert}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-semibold">Ilimitado</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedProductForMovement(p)
                              setMovementModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                            title="Entrada / Saída de Estoque"
                          >
                            <Layers className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedProductForHistory(p)
                              setHistoryDrawerOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="Histórico de Auditoria"
                          >
                            <History className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingProduct(p)
                              setProductModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Editar Produto"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Excluir / Desativar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modais Integrados */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={editingProduct}
        existingCategories={categories}
        onSuccess={onRefresh}
      />

      <StockMovementModal
        isOpen={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        products={products}
        selectedProduct={selectedProductForMovement}
        onSuccess={onRefresh}
      />

      <StockHistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        product={selectedProductForHistory}
      />
    </div>
  )
}
