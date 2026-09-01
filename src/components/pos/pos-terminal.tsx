"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Receipt,
  Plus,
  Search,
  Scissors,
  Package,
  Barcode,
  Sparkles,
  Clock,
  User,
  Check,
  X,
  CreditCard,
  Eye,
  ChevronRight,
  AlertCircle
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PosCheckoutModal } from "@/components/pos/pos-checkout-modal"
import { PosReceiptModal } from "@/components/pos/pos-receipt-modal"
import { PosOrderDrawer, DrawerItem } from "@/components/pos/pos-order-drawer"
import { PosCashStatusBar } from "@/components/pos/pos-cash-status-bar"
import { OpenCashModal } from "@/components/cash-register/open-cash-modal"
import { CashMovementModal } from "@/components/cash-register/cash-movement-modal"
import { CloseCashModal } from "@/components/cash-register/close-cash-modal"
import { getCurrentCashSessionAction } from "@/actions/cash-register-actions"
import {
  openOrderAction,
  addItemToOrderAction,
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

  // Controle de Sessão de Caixa (PDV)
  const [cashData, setCashData] = useState<any>(null)
  const [cashLoading, setCashLoading] = useState(false)
  const [openCashModalOpen, setOpenCashModalOpen] = useState(false)
  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [movementType, setMovementType] = useState<"BLEEDING" | "SUPPLY" | "EXPENSE_OUT">("BLEEDING")
  const [closeCashModalOpen, setCloseCashModalOpen] = useState(false)
  const [pendingOrderToCheckout, setPendingOrderToCheckout] = useState<any | null>(null)

  // Drawer Lateral Não-Modal (Substitui/sobrepõe a listagem de comandas à direita)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"NEW" | "EDIT">("NEW")
  const [targetOrderForDrawer, setTargetOrderForDrawer] = useState<any | null>(null)
  const [drawerQueuedItems, setDrawerQueuedItems] = useState<DrawerItem[]>([])

  // Modais de Checkout e Recibo
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [orderToCheckout, setOrderToCheckout] = useState<any | null>(null)

  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null)

  // Filtros do Catálogo
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogCategory, setCatalogCategory] = useState("all")
  const [catalogType, setCatalogType] = useState<"ALL" | "SERVICES" | "PRODUCTS">("ALL")

  // Leitor de Código de Barras
  const [barcodeInput, setBarcodeInput] = useState("")
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Carrinho de Venda Rápida Balcão Express
  const [fastSaleItems, setFastSaleItems] = useState<any[]>([])
  const [fastSaleClientName, setFastSaleClientName] = useState("")
  const [fastSaleClientPhone, setFastSaleClientPhone] = useState("")
  const [fastSaleProfId, setFastSaleProfId] = useState("")
  const [fastSaleError, setFastSaleError] = useState<string | null>(null)

  const [loadingAction, setLoadingAction] = useState(false)

  const { business, operator, services, products, professionals } = catalogData

  // Atualizar dados de caixa em tempo real
  const refreshCashData = async () => {
    setCashLoading(true)
    try {
      const res = await getCurrentCashSessionAction()
      if (res.success) {
        setCashData(res)
      }
    } finally {
      setCashLoading(false)
    }
  }

  useEffect(() => {
    refreshCashData()
  }, [])

  // Atualizar lista de comandas do servidor
  const refreshOrders = async () => {
    const res = await getPosActiveOrdersAction()
    if (res.success) {
      setOrders(res.orders || [])
      // Se o drawer estiver com uma comanda aberta em modo EDIT, atualiza ela com os novos dados
      if (targetOrderForDrawer) {
        const updated = res.orders?.find((o: any) => o.id === targetOrderForDrawer.id)
        if (updated) {
          setTargetOrderForDrawer(updated)
        }
      }
    }
  }

  // Clicar em um produto ou serviço do catálogo à esquerda
  const handleSelectItemFromCatalog = (item: any, itemType: "SERVICE" | "PRODUCT") => {
    if (activeTab === "FAST_SALE") {
      handleAddItemToFastSale(item, itemType)
      return
    }

    const commissionRate =
      itemType === "SERVICE"
        ? item.customCommission || professionals[0]?.commissionPercent || 50
        : item.customCommission || professionals[0]?.productCommission || 10

    const commissionValue = (item.price * commissionRate) / 100

    const newItem: DrawerItem = {
      id: `${itemType}-${item.id}-${Date.now()}`,
      itemType,
      serviceId: itemType === "SERVICE" ? item.id : undefined,
      productId: itemType === "PRODUCT" ? item.id : undefined,
      name: item.name,
      quantity: 1,
      unitPrice: item.price,
      costPrice: item.costPrice || 0,
      totalPrice: item.price,
      professionalId: targetOrderForDrawer?.professionalId || professionals[0]?.id || undefined,
      commissionRate,
      commissionValue,
    }

    // Se o drawer já está aberto, adiciona à fila de itens
    if (drawerOpen) {
      const existingIndex = drawerQueuedItems.findIndex(
        (i) => (itemType === "SERVICE" ? i.serviceId === item.id : i.productId === item.id)
      )

      if (existingIndex >= 0) {
        const updated = [...drawerQueuedItems]
        updated[existingIndex].quantity += 1
        updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice
        updated[existingIndex].commissionValue =
          (updated[existingIndex].totalPrice * (updated[existingIndex].commissionRate || 0)) / 100
        setDrawerQueuedItems(updated)
      } else {
        setDrawerQueuedItems([...drawerQueuedItems, newItem])
      }
    } else {
      // Se o drawer estava fechado, abre em modo NEW com o item já adicionado
      setDrawerMode("NEW")
      setTargetOrderForDrawer(null)
      setDrawerQueuedItems([newItem])
      setDrawerOpen(true)
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
        setBarcodeFeedback(`✓ "${prod.name}" identificado!`)
        setTimeout(() => setBarcodeFeedback(null), 2500)
        setBarcodeInput("")

        handleSelectItemFromCatalog(prod, "PRODUCT")
      } else {
        setBarcodeFeedback("❌ Código de barras não encontrado.")
        setTimeout(() => setBarcodeFeedback(null), 3000)
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

    const commissionRate =
      itemType === "SERVICE"
        ? item.customCommission || professionals[0]?.commissionPercent || 50
        : item.customCommission || professionals[0]?.productCommission || 10

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

  // Trava Inteligente e Interceptador de Checkout do PDV
  const handleInitiateCheckout = (order: any) => {
    // 1. Se o caixa estiver fechado, intercepta e abre o modal de abertura
    if (!cashData?.isOpen) {
      setPendingOrderToCheckout(order)
      setOpenCashModalOpen(true)
      return
    }

    // 2. Se o caixa aberto for do dia anterior (pendente de ontem), orienta o fechamento
    if (cashData?.session?.openedAt) {
      const openedDate = new Date(cashData.session.openedAt)
      const today = new Date()
      const isYesterday = (
        openedDate.getDate() !== today.getDate() ||
        openedDate.getMonth() !== today.getMonth() ||
        openedDate.getFullYear() !== today.getFullYear()
      )

      if (isYesterday) {
        setPendingOrderToCheckout(order)
        setCloseCashModalOpen(true)
        return
      }
    }

    // 3. Tudo correto: abre o modal de pagamento
    setOrderToCheckout(order)
    setCheckoutModalOpen(true)
  }

  // Finalizar Venda Rápida -> Abre Comanda express e chama Checkout
  const handleCheckoutFastSale = async () => {
    if (fastSaleItems.length === 0) {
      setFastSaleError("Adicione pelo menos 1 item para finalizar a venda.")
      return
    }

    setLoadingAction(true)
    setFastSaleError(null)
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
        setFastSaleItems([])
        setFastSaleClientName("")
        setFastSaleClientPhone("")
        handleInitiateCheckout(res.order)
      } else {
        setFastSaleError(res.error || "Erro ao gerar venda rápida.")
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
      list = list.filter(
        (i) =>
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

  // Totais das Comandas Abertas
  const totalOpenAmount = orders.reduce((acc, o) => acc + (o.total || 0), 0)

  // Totais do Carrinho de Venda Rápida
  const fastSaleSubtotal = fastSaleItems.reduce((acc, i) => acc + i.totalPrice, 0)
  const fastSaleCost = fastSaleItems.reduce((acc, i) => acc + (i.costPrice || 0) * i.quantity, 0)
  const fastSaleCommission = fastSaleItems.reduce(
    (acc, i) => acc + (i.totalPrice * (i.commissionRate || 0)) / 100,
    0
  )
  const fastSaleNetProfit = fastSaleSubtotal - fastSaleCost - fastSaleCommission

  // Formatar Horário
  const formatOrderTime = (dateStr?: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Top Header com Título e Seletor de Modo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              PDV & Comandas Digitais
            </h1>
            <p className="text-xs text-muted-foreground">
              Catálogo de serviços e produtos à esquerda • Comandas e lançamentos à direita
            </p>
          </div>
        </div>

        {/* Seletor de Modo */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60 shadow-inner">
          <button
            onClick={() => setActiveTab("LIVE_ORDERS")}
            className={cn(
              "cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95",
              activeTab === "LIVE_ORDERS"
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Clock className={cn("h-3.5 w-3.5", activeTab === "LIVE_ORDERS" ? "text-white" : "text-amber-500")} />
            <span>Comandas Abertas ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("FAST_SALE")
              setDrawerOpen(false)
            }}
            className={cn(
              "cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95",
              activeTab === "FAST_SALE"
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Sparkles className={cn("h-3.5 w-3.5", activeTab === "FAST_SALE" ? "text-white" : "text-emerald-500")} />
            <span>Venda Rápida Express</span>
          </button>
        </div>
      </div>

      {/* Barra de Status do Caixa / PDV (Tempo Real) */}
      <PosCashStatusBar
        cashData={cashData}
        loading={cashLoading}
        onOpenCash={() => setOpenCashModalOpen(true)}
        onCloseCash={() => setCloseCashModalOpen(true)}
        onSangria={() => {
          setMovementType("BLEEDING")
          setMovementModalOpen(true)
        }}
        onSuprimento={() => {
          setMovementType("SUPPLY")
          setMovementModalOpen(true)
        }}
        onDespesa={() => {
          setMovementType("EXPENSE_OUT")
          setMovementModalOpen(true)
        }}
        onRefresh={refreshCashData}
      />

      {/* ========================================================================= */}
      {/* GRID PRINCIPAL: 2 COLUNAS LADO A LADO                                     */}
      {/* ESQUERDA: CATÁLOGO DE SERVIÇOS & PRODUTOS (SEMPRE VISÍVEL E CLICÁVEL)     */}
      {/* DIREITA: LISTAGEM DE COMANDAS OU DRAWER NÃO-MODAL SOBREPOSTO              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA: CATÁLOGO DE PRODUTOS & SERVIÇOS (7 Colunas)             */}
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 rounded-xl px-3 cursor-pointer"
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
                  placeholder="Buscar no catálogo..."
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
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[620px] overflow-y-auto no-scrollbar pr-1">
            {filteredCatalog.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl p-6">
                Nenhum item encontrado no catálogo.
              </div>
            ) : (
              filteredCatalog.map((item) => {
                const isService = item.itemType === "SERVICE"
                const isZeroStock = !isService && item.trackStock && item.stock === 0

                return (
                  <button
                    key={`${item.itemType}-${item.id}`}
                    type="button"
                    disabled={isZeroStock || loadingAction}
                    onClick={() => handleSelectItemFromCatalog(item, item.itemType)}
                    className={cn(
                      "p-3 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden cursor-pointer",
                      isZeroStock
                        ? "opacity-50 cursor-not-allowed bg-muted/20 border-border/40"
                        : "bg-card border-border/60 hover:border-primary/60 hover:shadow-md active:scale-98"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
                          {isService ? (
                            <Scissors className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Package className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                        <Badge
                          variant={isService ? "purple" : isZeroStock ? "destructive" : "success"}
                          className="text-[9px] px-1.5 py-0"
                        >
                          {isService
                            ? `${item.durationMinutes || 30} min`
                            : isZeroStock
                            ? "Esgotado"
                            : `${item.stock} ${item.unit || "UN"}`}
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
        {/* COLUNA DIREITA: LISTA DE COMANDAS OU DRAWER NÃO-MODAL (5 Colunas)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          {activeTab === "LIVE_ORDERS" ? (
            drawerOpen ? (
              /* ESTADO 1: DRAWER NÃO-MODAL ABERTO SOBREPOSTO */
              <PosOrderDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                mode={drawerMode}
                targetOrder={targetOrderForDrawer}
                professionals={professionals}
                queuedItems={drawerQueuedItems}
                onUpdateQueuedItems={setDrawerQueuedItems}
                onOrderCreated={(newOrder) => {
                  refreshOrders()
                  setTargetOrderForDrawer(newOrder)
                  setDrawerMode("EDIT")
                  setDrawerQueuedItems([])
                }}
                onOpenCheckout={(order) => {
                  refreshOrders()
                  handleInitiateCheckout(order)
                }}
                onRefreshOrders={refreshOrders}
              />
            ) : (
              /* ESTADO 2: LISTAGEM DE COMANDAS EM CARDS (SEM COMANDA PRÉ-SELECIONADA) */
              <div className="space-y-3">
                {/* Header das Comandas */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                      Comandas Abertas ({orders.length})
                    </span>
                    {orders.length > 0 && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Total Aberto: R$ {totalOpenAmount.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setDrawerMode("NEW")
                      setTargetOrderForDrawer(null)
                      setDrawerQueuedItems([])
                      setDrawerOpen(true)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 rounded-xl shadow-xs gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nova Comanda</span>
                  </Button>
                </div>

                {/* Grid de Cards de Comandas Abertas */}
                {orders.length === 0 ? (
                  <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed rounded-3xl bg-card/50">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 mb-2">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">Nenhuma comanda aberta</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                      Clique em &quot;Nova Comanda&quot; ou clique nos produtos/serviços ao lado para iniciar.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setDrawerMode("NEW")
                        setTargetOrderForDrawer(null)
                        setDrawerQueuedItems([])
                        setDrawerOpen(true)
                      }}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 rounded-xl shadow-xs gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Abrir Primeira Comanda</span>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[620px] overflow-y-auto pr-1">
                    {orders.map((cmd) => {
                      const itemCount = cmd.items?.length || 0
                      const orderTotal = Number(cmd.total || 0)

                      return (
                        <div
                          key={cmd.id}
                          onClick={() => {
                            setTargetOrderForDrawer(cmd)
                            setDrawerMode("EDIT")
                            setDrawerQueuedItems([])
                            setDrawerOpen(true)
                          }}
                          role="button"
                          tabIndex={0}
                          className="p-3.5 rounded-3xl border border-border/70 bg-card hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-xs text-foreground group-hover:text-primary transition-colors">
                                  {cmd.code}
                                </span>
                                <Badge variant="gold" className="text-[9px] px-1 py-0 h-4">
                                  Aberto
                                </Badge>
                              </div>

                              {cmd.openedAt && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatOrderTime(cmd.openedAt)}
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="font-bold text-xs text-foreground truncate">
                                {cmd.clientName || "Cliente em Atendimento"}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">
                                {cmd.chairOrTable || "Balcão / Principal"}
                              </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                              {itemCount === 0 ? (
                                <span className="italic">Nenhum item lançado</span>
                              ) : (
                                <span className="line-clamp-1">
                                  {itemCount} {itemCount === 1 ? "item" : "itens"}:{" "}
                                  {cmd.items?.map((i: any) => i.name).join(", ")}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between">
                            <span className="font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                              R$ {orderTotal.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-0.5">
                              <span>Gerenciar</span>
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          ) : (
            /* ESTADO 3: CARRINHO DE VENDA EXPRESS (Modo FAST_SALE) */
            <Card className="rounded-3xl border-border/80 bg-card p-4 sm:p-5 shadow-2xl space-y-4 max-h-[85vh] lg:max-h-[calc(100vh-140px)] sticky top-20 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-black text-foreground">Venda Rápida Balcão</span>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Express
                </Badge>
              </div>

              {fastSaleError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shrink-0">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{fastSaleError}</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {/* Dados do Cliente (Opcional) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      placeholder="Cliente Avulso"
                      value={fastSaleClientName}
                      onChange={(e) => setFastSaleClientName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground">
                      WhatsApp (Recibo)
                    </label>
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
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
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
              </div>

              {/* Botão de Checkout */}
              <div className="pt-3 border-t border-border/50 shrink-0">
                <Button
                  onClick={handleCheckoutFastSale}
                  disabled={fastSaleItems.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-11 rounded-2xl shadow-md gap-2 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Cobrar Venda Balcão (R$ {fastSaleSubtotal.toFixed(2)})</span>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Checkout / Pagamento */}
      <PosCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        order={orderToCheckout}
        business={business}
        paymentMethods={catalogData.paymentMethods || []}
        onSuccess={(closedId) => {
          refreshOrders()
          setDrawerOpen(false)
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

      {/* Modal de Abertura de Caixa (Acionado na trava do checkout ou na barra) */}
      <OpenCashModal
        open={openCashModalOpen}
        onClose={() => {
          setOpenCashModalOpen(false)
          setPendingOrderToCheckout(null)
        }}
        onSuccess={() => {
          setOpenCashModalOpen(false)
          refreshCashData()
          // Se havia uma comanda pendente esperando o caixa abrir, abre o checkout direto
          if (pendingOrderToCheckout) {
            setOrderToCheckout(pendingOrderToCheckout)
            setCheckoutModalOpen(true)
            setPendingOrderToCheckout(null)
          }
        }}
        accounts={cashData?.accounts || []}
      />

      {/* Modal de Movimentações de Caixa (Sangria, Suprimento, Despesa) */}
      <CashMovementModal
        open={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        onSuccess={() => {
          setMovementModalOpen(false)
          refreshCashData()
        }}
        type={movementType}
        currentDrawerCash={cashData?.session?.liveMetrics?.currentDrawerCash || 0}
        accounts={cashData?.accounts || []}
      />

      {/* Modal de Fechamento de Caixa */}
      <CloseCashModal
        open={closeCashModalOpen}
        onClose={() => {
          setCloseCashModalOpen(false)
          setPendingOrderToCheckout(null)
        }}
        onSuccess={() => {
          setCloseCashModalOpen(false)
          refreshCashData()
          // Se o fechamento foi de um caixa de ontem e havia uma venda pendente, já sugere abrir o de hoje
          if (pendingOrderToCheckout) {
            setOpenCashModalOpen(true)
          }
        }}
        session={cashData?.session}
      />
    </div>
  )
}
