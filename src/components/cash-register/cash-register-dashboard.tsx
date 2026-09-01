"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  Lock, 
  Unlock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  DollarSign, 
  Wallet, 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  Clock, 
  User, 
  History, 
  Plus, 
  MinusCircle, 
  PlusCircle, 
  FileText,
  Calculator,
  RefreshCw,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  QrCode,
  Sparkles
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OpenCashModal } from "@/components/cash-register/open-cash-modal"
import { CashMovementModal } from "@/components/cash-register/cash-movement-modal"
import { CloseCashModal } from "@/components/cash-register/close-cash-modal"
import { CashReceiptModal } from "@/components/cash-register/cash-receipt-modal"
import { cn } from "@/lib/utils"

interface CashRegisterDashboardProps {
  initialData: any
  historyData: any
  onRefresh: () => void
  loading?: boolean
}

export function CashRegisterDashboard({
  initialData,
  historyData,
  onRefresh,
  loading = false,
}: CashRegisterDashboardProps) {
  const [activeTab, setActiveTab] = useState<"current" | "history">("current")
  
  // Modais
  const [openModalVisible, setOpenModalVisible] = useState(false)
  const [movementModalVisible, setMovementModalVisible] = useState(false)
  const [movementType, setMovementType] = useState<"BLEEDING" | "SUPPLY" | "EXPENSE_OUT">("BLEEDING")
  const [closeModalVisible, setCloseModalVisible] = useState(false)
  const [receiptModalVisible, setReceiptModalVisible] = useState(false)
  const [selectedSessionForReceipt, setSelectedSessionForReceipt] = useState<any>(null)

  const isOpen = initialData?.isOpen || false
  const session = initialData?.session || null
  const accounts = initialData?.accounts || []
  const metrics = session?.liveMetrics || {
    initialBalance: 0,
    salesCash: 0,
    salesPix: 0,
    salesCard: 0,
    salesOther: 0,
    totalSales: 0,
    totalSupplies: 0,
    totalBleedings: 0,
    totalExpenses: 0,
    totalRefunds: 0,
    currentDrawerCash: 0,
    ordersCount: 0,
    movementsCount: 0,
  }

  // Alerta de Sangria sugerida se o saldo em dinheiro passar de R$ 600,00
  const SANG_THRESHOLD = 600
  const isHighDrawerCash = isOpen && metrics.currentDrawerCash >= SANG_THRESHOLD

  const handleOpenMovement = (type: "BLEEDING" | "SUPPLY" | "EXPENSE_OUT") => {
    setMovementType(type)
    setMovementModalVisible(true)
  }

  const handleShowReceipt = (sessionObj: any) => {
    setSelectedSessionForReceipt(sessionObj)
    setReceiptModalVisible(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Principal do Caixa com Status em Tempo Real */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-2xl p-5 shadow-xs">
        <div className="flex items-start md:items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-colors shrink-0",
            isOpen 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
              : "bg-muted border-border text-muted-foreground"
          )}>
            {isOpen ? <Unlock className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Controle de Caixa & Turno
              </h1>
              <Badge variant="outline" className={cn(
                "px-2.5 py-0.5 font-semibold text-xs border rounded-full",
                isOpen 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-muted text-muted-foreground border-border"
              )}>
                {isOpen ? "Sessão Aberta / Ativa" : "Caixa Fechado"}
              </Badge>
              {isHighDrawerCash && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Sugestão de Sangria
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isOpen ? (
                <>Operado por <span className="font-medium text-foreground">{session?.openedByName}</span> desde {new Date(session?.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ({new Date(session?.openedAt).toLocaleDateString("pt-BR")})</>
              ) : (
                "Abra o caixa informando o fundo de troco para iniciar os lançamentos do dia."
              )}
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida no Topo */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Atualizar
          </Button>

          {isOpen ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShowReceipt(session)}
                className="text-xs gap-1.5 h-9 border-border hover:bg-muted"
              >
                <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                Leitura X (Parcial)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenMovement("SUPPLY")}
                className="text-xs gap-1.5 h-9 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Suprimento
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenMovement("BLEEDING")}
                className={cn(
                  "text-xs gap-1.5 h-9 border-amber-500/30 hover:bg-amber-500/10 text-amber-600",
                  isHighDrawerCash && "bg-amber-500/15 font-semibold animate-pulse"
                )}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Sangria
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenMovement("EXPENSE_OUT")}
                className="text-xs gap-1.5 h-9 text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                Despesa Rápida
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setCloseModalVisible(true)}
                className="text-xs gap-1.5 h-9 bg-rose-600 hover:bg-rose-700 text-white shadow-xs font-semibold"
              >
                <Lock className="w-3.5 h-3.5" />
                Fechar Caixa
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setOpenModalVisible(true)}
              className="text-xs gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
            >
              <Unlock className="w-3.5 h-3.5" />
              Abrir Novo Caixa
            </Button>
          )}
        </div>
      </div>

      {/* Abas de Navegação (Turno Atual / Histórico de Fechamentos) */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab("current")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "current"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Wallet className="w-3.5 h-3.5" />
          Turno em Andamento
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
            activeTab === "history"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <History className="w-3.5 h-3.5" />
          Histórico de Caixas Fechados ({historyData?.total || 0})
        </button>
      </div>

      {activeTab === "current" ? (
        <>
          {/* Se o Caixa estiver FECHADO */}
          {!isOpen ? (
            <div className="bg-card border border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">O caixa está fechado no momento</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Para registrar vendas em dinheiro no balcão, controlar sangrias e suprimentos de troco, abra uma nova sessão de turno informando o valor inicial.
                </p>
              </div>
              <Button
                onClick={() => setOpenModalVisible(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 mt-2"
              >
                <Unlock className="w-4 h-4" />
                Iniciar Abertura de Caixa
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alerta de Segurança se Saldo em Gaveta For Alto */}
              {isHighDrawerCash && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        Alerta de Gaveta Cheia: R$ {metrics.currentDrawerCash.toFixed(2)} em dinheiro vivo
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Por segurança, recomendamos efetuar uma sangria para transferir o excedente ao cofre ou depósito bancário.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenMovement("BLEEDING")}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shrink-0"
                  >
                    Fazer Sangria Agora
                  </Button>
                </div>
              )}

              {/* Cards de Métricas Principais do Turno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Saldo em Dinheiro na Gaveta (Destaque Máximo) */}
                <Card className="border-emerald-500/30 bg-linear-to-br from-emerald-500/5 via-card to-card shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Dinheiro na Gaveta
                      </span>
                      <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      R$ {metrics.currentDrawerCash.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-[11px] text-muted-foreground pt-0 flex items-center justify-between">
                    <span>Fundo inicial: R$ {metrics.initialBalance.toFixed(2)}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Saldo Físico
                    </Badge>
                  </CardContent>
                </Card>

                {/* 2. Total Vendas do Turno (Todos os meios) */}
                <Card className="border-border shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Vendas no Turno
                      </span>
                      <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600">
                        <Receipt className="w-4 h-4" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black text-foreground mt-1">
                      R$ {metrics.totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-[11px] text-muted-foreground pt-0 flex items-center justify-between">
                    <span>{metrics.ordersCount} comanda(s) paga(s)</span>
                    <span className="text-emerald-600 font-medium">+R$ {metrics.salesCash.toFixed(2)} em espécie</span>
                  </CardContent>
                </Card>

                {/* 3. Meios Digitais (PIX + Cartões) */}
                <Card className="border-border shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        PIX & Cartões
                      </span>
                      <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                      R$ {(metrics.salesPix + metrics.salesCard + metrics.salesOther).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-[11px] text-muted-foreground pt-0 flex items-center justify-between">
                    <span>PIX: R$ {metrics.salesPix.toFixed(2)}</span>
                    <span>Cartões: R$ {metrics.salesCard.toFixed(2)}</span>
                  </CardContent>
                </Card>

                {/* 4. Sangrias & Saídas de Caixa */}
                <Card className="border-border shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Sangrias & Despesas
                      </span>
                      <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                      R$ {(metrics.totalBleedings + metrics.totalExpenses).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-[11px] text-muted-foreground pt-0 flex items-center justify-between">
                    <span>Sangrias: R$ {metrics.totalBleedings.toFixed(2)}</span>
                    <span>Gastos: R$ {metrics.totalExpenses.toFixed(2)}</span>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela / Timeline de Movimentações da Sessão Atual */}
              <Card className="border-border shadow-xs">
                <CardHeader className="border-b border-border/60 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Extrato do Turno em Andamento
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Todas as entradas, sangrias, suprimentos e gastos lançados nesta sessão
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenMovement("SUPPLY")}
                        className="text-xs h-8 text-emerald-600 border-emerald-500/30"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        + Suprimento
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenMovement("BLEEDING")}
                        className="text-xs h-8 text-amber-600 border-amber-500/30"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />
                        - Sangria
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenMovement("EXPENSE_OUT")}
                        className="text-xs h-8 text-rose-600 border-rose-500/30"
                      >
                        <MinusCircle className="w-3.5 h-3.5 mr-1" />
                        - Despesa Balcão
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!session?.movements || session.movements.length === 0) ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      Nenhuma movimentação avulsa registrada ainda no turno.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {session.movements.map((mov: any) => {
                        const isPositive = mov.type === "OPENING_BALANCE" || mov.type === "SUPPLY" || mov.type === "SALE_IN"
                        const isBleeding = mov.type === "BLEEDING"
                        const isExpense = mov.type === "EXPENSE_OUT"

                        return (
                          <div
                            key={mov.id}
                            className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 text-xs font-semibold",
                                mov.type === "OPENING_BALANCE" && "bg-blue-500/10 border-blue-500/20 text-blue-600",
                                mov.type === "SUPPLY" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
                                isBleeding && "bg-amber-500/10 border-amber-500/20 text-amber-600",
                                isExpense && "bg-rose-500/10 border-rose-500/20 text-rose-600",
                                mov.type === "MANUAL_ADJUST" && "bg-purple-500/10 border-purple-500/20 text-purple-600"
                              )}>
                                {mov.type === "OPENING_BALANCE" && <Wallet className="w-4 h-4" />}
                                {mov.type === "SUPPLY" && <PlusCircle className="w-4 h-4" />}
                                {isBleeding && <ArrowDownLeft className="w-4 h-4" />}
                                {isExpense && <MinusCircle className="w-4 h-4" />}
                                {mov.type === "MANUAL_ADJUST" && <RefreshCw className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-foreground">
                                    {mov.reason || "Movimentação de Caixa"}
                                  </span>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] px-2 py-0 border",
                                    mov.type === "OPENING_BALANCE" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                                    mov.type === "SUPPLY" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                    isBleeding && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                    isExpense && "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                  )}>
                                    {mov.type === "OPENING_BALANCE" && "Fundo de Abertura"}
                                    {mov.type === "SUPPLY" && "Suprimento"}
                                    {isBleeding && "Sangria"}
                                    {isExpense && "Despesa Balcão"}
                                    {mov.type === "MANUAL_ADJUST" && "Ajuste"}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                                  <span>Por: {mov.createdByName || "Operador"}</span>
                                  <span>•</span>
                                  <span>{new Date(mov.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                  {mov.authorizedBy && (
                                    <>
                                      <span>•</span>
                                      <span className="text-foreground font-medium">Aut: {mov.authorizedBy}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={cn(
                                "text-sm font-extrabold",
                                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              )}>
                                {isPositive ? "+" : "-"} R$ {Number(mov.amount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : (
        /* Aba 2: Histórico de Caixas Anteriores */
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-foreground">
              Histórico de Fechamentos de Caixa
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Auditoria de todos os turnos encerrados, conferências cegas e quebras apuradas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {(!historyData?.sessions || historyData.sessions.length === 0) ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                Nenhum histórico de caixa fechado encontrado.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {historyData.sessions.map((item: any) => {
                  const isClosed = item.status === "CLOSED"
                  const diff = item.differenceAmount || 0
                  const hasDiff = diff !== 0

                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-muted border flex items-center justify-center shrink-0 text-muted-foreground">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">
                              Turno: {new Date(item.openedAt).toLocaleDateString("pt-BR")} ({new Date(item.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              {item.closedAt ? ` às ${new Date(item.closedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : " - Aberto"})
                            </span>
                            <Badge variant="outline" className={cn(
                              "text-[10px] px-2 py-0 border",
                              isClosed ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}>
                              {isClosed ? "Encerrado" : "Em Aberto"}
                            </Badge>
                            {isClosed && (
                              <Badge variant="outline" className={cn(
                                "text-[10px] px-2 py-0 border font-bold",
                                !hasDiff && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                diff > 0 && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                                diff < 0 && "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              )}>
                                {!hasDiff && "✓ Balanço Exato"}
                                {diff > 0 && `+ Sobra: R$ ${diff.toFixed(2)}`}
                                {diff < 0 && `- Quebra: R$ ${Math.abs(diff).toFixed(2)}`}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                            <span>Aberto por: <b className="text-foreground">{item.openedByName}</b></span>
                            {item.closedByName && <span>• Fechado por: <b className="text-foreground">{item.closedByName}</b></span>}
                            <span>• Fundo: R$ {Number(item.initialBalance || 0).toFixed(2)}</span>
                            {item.closingNotes && <span>• Obs: <i>"{item.closingNotes}"</i></span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground block">
                            Informado: R$ {Number(item.reportedCash || item.calculatedCash || 0).toFixed(2)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Esperado: R$ {Number(item.calculatedCash || 0).toFixed(2)}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowReceipt(item)}
                          className="text-xs h-8 gap-1 border-border"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Comprovante
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modais de Operação */}
      {openModalVisible && (
        <OpenCashModal
          open={openModalVisible}
          onClose={() => setOpenModalVisible(false)}
          onSuccess={() => {
            setOpenModalVisible(false)
            onRefresh()
          }}
          accounts={accounts}
        />
      )}

      {movementModalVisible && (
        <CashMovementModal
          open={movementModalVisible}
          onClose={() => setMovementModalVisible(false)}
          onSuccess={() => {
            setMovementModalVisible(false)
            onRefresh()
          }}
          type={movementType}
          currentDrawerCash={metrics.currentDrawerCash}
          accounts={accounts}
        />
      )}

      {closeModalVisible && (
        <CloseCashModal
          open={closeModalVisible}
          onClose={() => setCloseModalVisible(false)}
          onSuccess={(closedSession) => {
            setCloseModalVisible(false)
            onRefresh()
            if (closedSession) {
              handleShowReceipt(closedSession)
            }
          }}
          session={session}
        />
      )}

      {receiptModalVisible && selectedSessionForReceipt && (
        <CashReceiptModal
          open={receiptModalVisible}
          onClose={() => {
            setReceiptModalVisible(false)
            setSelectedSessionForReceipt(null)
          }}
          sessionId={selectedSessionForReceipt.id}
          fallbackSession={selectedSessionForReceipt}
        />
      )}
    </div>
  )
}
