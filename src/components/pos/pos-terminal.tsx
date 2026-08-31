"use client"

import * as React from "react"
import { useState, useTransition, useEffect, useRef } from "react"
import { 
  Receipt, 
  Plus, 
  Search, 
  Scissors, 
  Beer, 
  ShoppingBag, 
  QrCode, 
  CreditCard, 
  Check, 
  X, 
  Trash2, 
  Sparkles,
  ArrowRight,
  Clock,
  Barcode,
  Package,
  Layers,
  User,
  UserPlus,
  DollarSign,
  Share2,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  Store,
  ChevronRight,
  Printer
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PosCheckoutModal } from "@/components/pos/pos-checkout-modal"
import { PosReceiptModal } from "@/components/pos/pos-receipt-modal"
import { 
  openOrderAction, 
  addItemToOrderAction, 
  removeItemFromOrderAction, 
  cancelOrderAction,
  getPosActiveOrdersAction 
} from "@/actions/pos-actions"
import { getProductByBarcodeAction } from "@/actions/product-actions"

interface PosTerminalProps {
  catalogData: {
    business: any
    operator: { id: string; name: string }
    services: any[]
    products: any[]
    professionals: any[]
    categories: {
      products: string[]
      services: string[]
    }
    paymentMethods?: any[]
  }
  initialOrders: any[]
}

export function PosTerminal({ catalogData, initialOrders }: PosTerminalProps) {
  const [activeTab, setActiveTab] = useState<"LIVE_ORDERS" | "FAST_SALE">("LIVE_ORDERS")
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id || null)

  // Filtros do Catálogo
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogCategory, setCatalogCategory] = useState("all")
  const [catalogType, setCatalogType] = useState<"ALL" | "SERVICES" | "PRODUCTS">("ALL")

  // Leitor de Código de Barras
  const [barcodeInput, setBarcodeInput] = useState("")
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Carrinho de Venda Rápida (quando não está mexendo em comanda existente)
  const [fastSaleItems, setFastSaleItems] = useState<any[]>([])
  const [fastSaleClientName, setFastSaleClientName] = useState("")
  const [fastSaleClientPhone, setFastSaleClientPhone] = useState("")
  const [fastSaleProfId, setFastSaleProfId] = useState("")
  const [fastSaleChair, setFastSaleChair] = useState("Balcão")

  // Modais
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [orderToCheckout, setOrderToCheckout] = useState<any | null>(null)

  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState(false)

  const { business, operator, services, products, professionals } = catalogData

  // Comanda selecionada no modo LIVE_ORDERS
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null

  const refreshOrders = async () => {
    const res = await getPosActiveOrdersAction()
    if (res.success) {
      setOrders(res.orders || [])
      if (!res.orders?.find((o: any) => o.id === selectedOrderId) && res.orders && res.orders.length > 0) {
        setSelectedOrderId(res.orders[0].id)
      }
    }
  }

  // Barcode Scanner Listener
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = barcodeInput.trim()
    if (!code) return

    setLoadingAction(true)
    try {
      const res = await getProductByBarcodeAction(code)
      if (res.success && res.product) {
        const prod = res.product
        setBarcodeFeedback(`✓ "${prod.name}" adicionado!`)
        setTimeout(() => setBarcodeFeedback(null), 2500)
        setBarcodeInput("")

        if (activeTab === "LIVE_ORDERS" && selectedOrder) {
          await handleAddItemToLiveOrder(prod, "PRODUCT")
        } else {
          handleAddItemToFastSale(prod, "PRODUCT")
        }
      } else {
        setBarcodeFeedback("❌ Código de barras não encontrado.")
        setTimeout(() => setBarcodeFeedback(null), 3000)
      }
    } finally {
      setLoadingAction(false)
    }
  }

  // Adicionar item à comanda viva selecionada
  const handleAddItemToLiveOrder = async (item: any, itemType: "SERVICE" | "PRODUCT") => {
    if (!selectedOrder) {
      // Se não tem comanda aberta, abre uma nova automaticamente
      await handleOpenNewOrder({
        clientName: "Cliente em Atendimento",
        initialItems: [
          {
            itemType,
            serviceId: itemType === "SERVICE" ? item.id : undefined,
            productId: itemType === "PRODUCT" ? item.id : undefined,
            name: item.name,
            quantity: 1,
            unitPrice: item.price,
            costPrice: item.costPrice || 0,
            professionalId: selectedOrder?.professionalId || professionals[0]?.id || undefined,
            commissionRate: itemType === "SERVICE" 
              ? (item.customCommission || professionals[0]?.commissionPercent || 50)
              : (item.customCommission || professionals[0]?.productCommission || 10),
          },
        ],
      })
      return
    }

    setLoadingAction(true)
    try {
      const commissionRate = itemType === "SERVICE"
        ? (item.customCommission || professionals[0]?.commissionPercent || 50)
        : (item.customCommission || professionals[0]?.productCommission || 10)

      const res = await addItemToOrderAction({
        orderId: selectedOrder.id,
        itemType,
        serviceId: itemType === "SERVICE" ? item.id : undefined,
        productId: itemType === "PRODUCT" ? item.id : undefined,
        name: item.name,
        quantity: 1,
        unitPrice: item.price,
        costPrice: item.costPrice || 0,
        professionalId: selectedOrder.professionalId || professionals[0]?.id || undefined,
        commissionRate,
      })

      if (res.success) {
        await refreshOrders()
      } else {
        alert(res.error || "Erro ao adicionar item.")
      }
    } finally {
      setLoadingAction(false)
    }
  }

  // Adicionar item ao carrinho de Venda Rápida
  const handleAddItemToFastSale = (item: any, itemType: "SERVICE" | "PRODUCT") => {
    const existingIndex = fastSaleItems.findIndex(
      (i) => (itemType === "SERVICE" ? i.serviceId === item.id : i.productId === item.id)
    )

    const commissionRate = itemType === "SERVICE"
      ? (item.customCommission || professionals[0]?.commissionPercent || 50)
      : (item.customCommission || professionals[0]?.productCommission || 10)

    if (existingIndex >= 0) {
      const updated = [...fastSaleItems]
      updated[existingIndex].quantity += 1
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice
      setFastSaleItems(updated)
    } else {
      setFastSaleItems([
        ...fastSaleItems,
        {
          id: Date.now().toString(),
          itemType,
          serviceId: itemType === "SERVICE" ? item.id : undefined,
          productId: itemType === "PRODUCT" ? item.id : undefined,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          costPrice: item.costPrice || 0,
          totalPrice: item.price,
          professionalId: fastSaleProfId || professionals[0]?.id || undefined,
          commissionRate,
        },
      ])
    }
  }

  // Abrir nova comanda
  const handleOpenNewOrder = async (override?: any) => {
    setLoadingAction(true)
    try {
      const res = await openOrderAction({
        type: "ORDER",
        clientName: override?.clientName || "Cliente em Atendimento",
        chairOrTable: `Cadeira 0${orders.length + 1}`,
        professionalId: professionals[0]?.id || undefined,
        initialItems: override?.initialItems || undefined,
      })

      if (res.success && res.order) {
        await refreshOrders()
        setSelectedOrderId(res.order.id)
        setActiveTab("LIVE_ORDERS")
      }
    } finally {
      setLoadingAction(false)
    }
  }

  // Fechar / Cancelar Item da Comanda Viva
  const handleRemoveItem = async (itemId: string) => {
    if (!selectedOrder) return
    setLoadingAction(true)
    try {
      const res = await removeItemFromOrderAction(selectedOrder.id, itemId)
      if (res.success) {
        await refreshOrders()
      } else {
        alert(res.error || "Erro ao remover item.")
      }
    } finally {
      setLoadingAction(false)
    }
  }

  // Cancelar Comanda Inteira
  const handleCancelOrder = async (orderId: string) => {
    if (confirm("Tem certeza que deseja cancelar esta comanda e devolver os produtos ao estoque?")) {
      setLoadingAction(true)
      try {
        const res = await cancelOrderAction(orderId, "Cancelado no PDV")
        if (res.success) {
          await refreshOrders()
        } else {
          alert(res.error || "Erro ao cancelar comanda.")
        }
      } finally {
        setLoadingAction(false)
      }
    }
  }

  // Finalizar Venda Rápida -> Abre Comanda temporária e chama Checkout
  const handleCheckoutFastSale = async () => {
    if (fastSaleItems.length === 0) {
      alert("Adicione pelo menos 1 item para finalizar a venda.")
      return
    }

    setLoadingAction(true)
    try {
      const res = await openOrderAction({
        type: "QUICK_SALE",
        clientName: fastSaleClientName.trim() || "Cliente Balcão",
        clientPhone: fastSaleClientPhone.trim() || undefined,
        chairOrTable: "Balcão",
        professionalId: fastSaleProfId || undefined,
        initialItems: fastSaleItems,
      })

      if (res.success && res.order) {
        setOrderToCheckout(res.order)
        setCheckoutModalOpen(true)
        setFastSaleItems([])
        setFastSaleClientName("")
        setFastSaleClientPhone("")
      } else {
        alert(res.error || "Erro ao gerar venda rápida.")
      }
    } finally {
      setLoadingAction(false)
    }
  }

  // Lista combinada de catálogo filtrado
  const filteredCatalog = React.useMemo(() => {
    let list: any[] = []

    if (catalogType === "ALL" || catalogType === "SERVICES") {
      const servs = services.map((s) => ({ ...s, itemType: "SERVICE" as const }))
      list = [...list, ...servs]
    }

    if (catalogType === "ALL" || catalogType === "PRODUCTS") {
      const prods = products.map((p: any) => ({ ...p, itemType: "PRODUCT" as const }))
      list = [...list, ...prods]
    }

    if (catalogSearch) {
      list = list.filter((i) =>
        i.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (i.category && i.category.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (i.barcode && i.barcode.includes(catalogSearch)) ||
        (i.sku && i.sku.toLowerCase().includes(catalogSearch.toLowerCase()))
      )
    }

    if (catalogCategory !== "all") {
      list = list.filter((i) => i.category === catalogCategory)
    }

    return list
  }, [services, products, catalogType, catalogSearch, catalogCategory])

  // Todas as categorias combinadas
  const allCategories = React.useMemo(() => {
    const set = new Set([...catalogData.categories.services, ...catalogData.categories.products])
    return Array.from(set).filter(Boolean)
  }, [catalogData])

  // Totais do Carrinho de Venda Rápida
  const fastSaleSubtotal = fastSaleItems.reduce((acc, i) => acc + i.totalPrice, 0)
  const fastSaleCost = fastSaleItems.reduce((acc, i) => acc + (i.costPrice || 0) * i.quantity, 0)
  const fastSaleCommission = fastSaleItems.reduce(
    (acc, i) => acc + (i.totalPrice * (i.commissionRate || 0)) / 100,
    0
  )
  const fastSaleNetProfit = fastSaleSubtotal - fastSaleCost - fastSaleCommission

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Top Header com Seletor de Modo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-7 w-7 text-amber-500" />
            PDV & CRM de Vendas Inteligente
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Lançamento na cadeira, venda express de produtos e serviços, controle de estoque e rateio financeiro.
          </p>
        </div>

        {/* Abas Principais de Modo */}
        <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-2xl border border-border/60 shadow-inner">
          <button
            onClick={() => setActiveTab("LIVE_ORDERS")}
            className={cn(
              "cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 active:scale-95",
              activeTab === "LIVE_ORDERS"
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Clock className={cn("h-3.5 w-3.5", activeTab === "LIVE_ORDERS" ? "text-white" : "text-amber-500")} />
            <span>Comandas Abertas ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("FAST_SALE")}
            className={cn(
              "cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 active:scale-95",
              activeTab === "FAST_SALE"
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Sparkles className={cn("h-3.5 w-3.5", activeTab === "FAST_SALE" ? "text-white" : "text-emerald-500")} />
            <span>Venda Balcão Express</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Catálogo / Seleção à Esquerda + Carrinho / Comanda à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA (CATÁLOGO RÁPIDO & LEITOR BARCODE) (7 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-3">
          {/* Barra de Leitor de Código de Barras & Busca */}
          <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-2.5">
            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Barcode className="h-4 w-4 text-emerald-500 absolute left-3 top-2.5" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Escanear código de barras ou digitar SKU e apertar Enter..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 rounded-xl px-3"
              >
                + Bipar
              </Button>
            </form>

            {barcodeFeedback && (
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                {barcodeFeedback}
              </div>
            )}

            {/* Filtros do Catálogo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40">
              {/* Abas Tipo: Todos / Serviços / Produtos */}
              <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 shadow-inner">
                {(["ALL", "SERVICES", "PRODUCTS"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCatalogType(t)}
                    className={cn(
                      "cursor-pointer px-3 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 active:scale-95",
                      catalogType === t
                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-xs font-black"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    )}
                  >
                    {t === "ALL" ? "Todos" : t === "SERVICES" ? "Serviços" : "Produtos / Bar"}
                  </button>
                ))}
              </div>

              {/* Input Busca Nome */}
              <div className="relative w-full sm:w-48">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Buscar catálogo..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 rounded-lg border border-border/50 bg-background/50 text-[11px] text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Categorias Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setCatalogCategory("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                  catalogCategory === "all"
                    ? "bg-muted/80 text-foreground font-black"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                Todas ({filteredCatalog.length})
              </button>
              {allCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatalogCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    catalogCategory === c
                      ? "bg-muted/80 text-foreground font-black"
                      : "text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Itens do Catálogo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[560px] overflow-y-auto no-scrollbar pr-1">
            {filteredCatalog.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl p-6">
                Nenhum item encontrado no catálogo.
              </div>
            ) : (
              filteredCatalog.map((item) => {
                const isService = item.itemType === "SERVICE"
                const hasStock = isService || !item.trackStock || item.stock > 0
                const isZeroStock = !isService && item.trackStock && item.stock === 0

                return (
                  <button
                    key={`${item.itemType}-${item.id}`}
                    type="button"
                    disabled={isZeroStock || loadingAction}
                    onClick={() => {
                      if (activeTab === "LIVE_ORDERS") {
                        handleAddItemToLiveOrder(item, item.itemType)
                      } else {
                        handleAddItemToFastSale(item, item.itemType)
                      }
                    }}
                    className={cn(
                      "p-3 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden",
                      isZeroStock
                        ? "opacity-50 cursor-not-allowed bg-muted/20 border-border/40"
                        : "bg-card border-border/60 hover:border-primary/60 hover:shadow-md active:scale-98"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
                          {isService ? <Scissors className="h-3.5 w-3.5 text-primary" /> : <Package className="h-3.5 w-3.5 text-emerald-500" />}
                        </div>
                        <Badge
                          variant={isService ? "purple" : isZeroStock ? "destructive" : "success"}
                          className="text-[9px] px-1.5 py-0"
                        >
                          {isService ? `${item.durationMinutes || 30} min` : isZeroStock ? "Esgotado" : `${item.stock} ${item.unit || "UN"}`}
                        </Badge>
                      </div>

                      <div className="font-extrabold text-xs text-foreground line-clamp-2 mt-1">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {item.category || "Geral"}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="font-black text-xs text-foreground">
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-[10px] font-bold text-primary group-hover:underline">
                        + Lançar
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUNA DIREITA (COMANDA VIVA / CARRINHO DE VENDA) (5 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          {activeTab === "LIVE_ORDERS" ? (
            /* Modo Comandas Vivas */
            <div className="space-y-3">
              {/* Seletor Rápido de Comandas Abertas em Pílulas */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Comandas em Andamento ({orders.length})
                </span>
                <Button
                  size="sm"
                  onClick={() => handleOpenNewOrder()}
                  className="text-xs h-7 rounded-xl bg-primary text-primary-foreground font-bold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Nova Ficha
                </Button>
              </div>

              {/* Pílulas de Comandas */}
              {orders.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {orders.map((cmd) => {
                    const isSelected = cmd.id === selectedOrder?.id
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => setSelectedOrderId(cmd.id)}
                        className={cn(
                          "px-3 py-2 rounded-2xl border text-left shrink-0 transition-all",
                          isSelected
                            ? "bg-card border-primary ring-2 ring-primary/20 shadow-md font-bold"
                            : "bg-card/50 border-border/60 hover:bg-card text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-foreground">{cmd.code}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                            R$ {(cmd.total || 0).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {cmd.clientName || "Cliente Balcão"}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Detalhe da Comanda Selecionada */}
              {selectedOrder ? (
                <Card className="rounded-3xl border-border/80 bg-card p-4 sm:p-5 shadow-xl space-y-4">
                  {/* Cabeçalho da Ficha */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-foreground">{selectedOrder.code}</span>
                        <Badge variant="gold" className="text-[10px]">Atendimento Vivo</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedOrder.clientName} • {selectedOrder.chairOrTable}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Cancelar Comanda"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Lista de Itens Lançados */}
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Itens na Comanda ({selectedOrder.items?.length || 0})
                    </span>

                    {selectedOrder.items?.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl p-4">
                        Nenhum item lançado ainda. Clique nos serviços ou produtos ao lado para adicionar.
                      </div>
                    ) : (
                      selectedOrder.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-card border border-border/60">
                              {item.itemType === "SERVICE" ? (
                                <Scissors className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Package className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">{item.name}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {item.quantity}x R$ {item.unitPrice.toFixed(2).replace(".", ",")}
                                {item.commissionValue > 0 ? ` • Comiss: R$ ${item.commissionValue.toFixed(2)}` : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-black text-foreground">
                              R$ {item.totalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted"
                              title="Remover Item"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Resumo Financeiro & Rateio */}
                  <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-semibold">Total a Cobrar:</span>
                      <span className="text-lg font-black text-foreground">
                        R$ {(selectedOrder.total || 0).toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[10px]">
                      <div>
                        <span className="text-muted-foreground block">Repasse Equipe:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          R$ {(selectedOrder.totalCommission || 0).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground block">Líquido da Casa:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {(selectedOrder.netProfit || 0).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Fechamento */}
                  <Button
                    onClick={() => {
                      setOrderToCheckout(selectedOrder)
                      setCheckoutModalOpen(true)
                    }}
                    disabled={!selectedOrder.items || selectedOrder.items.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 rounded-2xl shadow-md gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Finalizar e Cobrar (R$ {(selectedOrder.total || 0).toFixed(2)})</span>
                  </Button>
                </Card>
              ) : (
                <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed rounded-3xl">
                  <Receipt className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <h4 className="text-xs font-bold text-foreground">Nenhuma comanda aberta</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                    Clique no botão &quot;Nova Ficha&quot; acima para iniciar um novo atendimento.
                  </p>
                </Card>
              )}
            </div>
          ) : (
            /* Modo Venda Rápida de Balcão (Express) */
            <Card className="rounded-3xl border-border/80 bg-card p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-black text-foreground">Venda Rápida Balcão</span>
                </div>
                <Badge variant="success" className="text-[10px]">Express</Badge>
              </div>

              {/* Dados do Cliente (Opcional) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Nome do Cliente</label>
                  <input
                    type="text"
                    placeholder="Cliente Avulso"
                    value={fastSaleClientName}
                    onChange={(e) => setFastSaleClientName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">WhatsApp (Recibo)</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={fastSaleClientPhone}
                    onChange={(e) => setFastSaleClientPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Lista do Carrinho Express */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Itens no Carrinho ({fastSaleItems.length})
                </span>

                {fastSaleItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl p-4">
                    Carrinho vazio. Clique nos produtos ao lado para adicionar.
                  </div>
                ) : (
                  fastSaleItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-foreground">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2).replace(".", ",")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground">
                          R$ {item.totalPrice.toFixed(2).replace(".", ",")}
                        </span>
                        <button
                          onClick={() => {
                            const updated = fastSaleItems.filter((_, i) => i !== idx)
                            setFastSaleItems(updated)
                          }}
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Resumo Financeiro da Venda Rápida */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">Total a Pagar:</span>
                  <span className="text-lg font-black text-foreground">
                    R$ {fastSaleSubtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[10px]">
                  <div>
                    <span className="text-muted-foreground block">Custo Produtos:</span>
                    <span className="font-bold text-muted-foreground">
                      R$ {fastSaleCost.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Lucro Líquido:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {fastSaleNetProfit.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Checkout */}
              <Button
                onClick={handleCheckoutFastSale}
                disabled={fastSaleItems.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 rounded-2xl shadow-md gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Cobrar Venda Balcão (R$ {fastSaleSubtotal.toFixed(2)})</span>
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Checkout */}
      <PosCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        order={orderToCheckout}
        business={business}
        paymentMethods={catalogData.paymentMethods || []}
        onSuccess={(closedId) => {
          refreshOrders()
          setReceiptOrderId(closedId)
          setReceiptModalOpen(true)
        }}
      />

      {/* Modal de Recibo Digital */}
      <PosReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        orderId={receiptOrderId}
      />
    </div>
  )
}
