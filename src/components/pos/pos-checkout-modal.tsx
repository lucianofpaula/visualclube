"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  X, 
  QrCode, 
  CreditCard, 
  Banknote, 
  Layers, 
  Sparkles, 
  Check, 
  Percent, 
  DollarSign, 
  Copy, 
  CheckCircle2, 
  TrendingUp,
  AlertCircle,
  Award,
  Building2,
  Plus,
  Trash2,
  FileText,
  Calendar,
  Clock,
  UserCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { checkoutOrderAction } from "@/actions/pos-actions"

interface PosCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  order: any | null
  business: any
  paymentMethods?: any[]
  onSuccess: (closedOrderId: string) => void
}

export function PosCheckoutModal({
  isOpen,
  onClose,
  order,
  business,
  paymentMethods = [],
  onSuccess,
}: PosCheckoutModalProps) {
  // Filtrar apenas os meios ativos do estabelecimento
  const activeMethods = paymentMethods.filter((m) => m.isActive)

  const [selectedMethodId, setSelectedMethodId] = useState<string>("PIX")
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENT">("FIXED")
  const [discountInput, setDiscountInput] = useState<string>("")
  const [cashReceived, setCashReceived] = useState<string>("")
  const [copiedPix, setCopiedPix] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fiado / Pagar Depois (Conta do Cliente)
  const [debtDueDate, setDebtDueDate] = useState<string>("")
  const [debtNotes, setDebtNotes] = useState<string>("")

  // Split Payment Rows
  const [splitRows, setSplitRows] = useState<Array<{ methodId: string; amount: string }>>([
    { methodId: "PIX", amount: "" },
    { methodId: "CASH", amount: "" },
  ])

  // Inicializa o primeiro meio ativo ao abrir
  useEffect(() => {
    if (activeMethods.length > 0) {
      setSelectedMethodId(activeMethods[0].id || activeMethods[0].type || "PIX")
      if (activeMethods.length >= 2) {
        setSplitRows([
          { methodId: activeMethods[0].id, amount: "" },
          { methodId: activeMethods[1].id, amount: "" },
        ])
      }
    }
  }, [isOpen, paymentMethods])

  if (!isOpen || !order) return null

  const subtotal = order.subtotal || 0
  const costTotal = order.costTotal || 0
  const totalCommission = order.totalCommission || 0

  const numDiscount = parseFloat(discountInput.replace(",", ".")) || 0
  const discountValue = discountType === "PERCENT" ? (subtotal * numDiscount) / 100 : numDiscount
  const finalTotal = Math.max(0, subtotal - discountValue)

  // Meio selecionado atualmente
  const isSplit = selectedMethodId === "__SPLIT__"
  const isCustomerTab = selectedMethodId === "__CUSTOMER_TAB__"
  const currentMethod = activeMethods.find((m) => m.id === selectedMethodId || m.type === selectedMethodId)

  // Taxa da Maquininha do meio atual
  const feePercent = isCustomerTab || isSplit ? 0 : (currentMethod?.feePercentage || 0)
  const feeValue = (finalTotal * feePercent) / 100
  const netProfit = finalTotal - costTotal - totalCommission - feeValue

  const numCashReceived = parseFloat(cashReceived.replace(",", ".")) || 0
  const cashChange = numCashReceived > finalTotal ? numCashReceived - finalTotal : 0

  // Cálculo do Split
  const splitSum = splitRows.reduce((acc, r) => acc + (parseFloat(r.amount.replace(",", ".")) || 0), 0)
  const splitRemaining = Math.max(0, Math.round((finalTotal - splitSum) * 100) / 100)

  const handleCopyPix = () => {
    const key = currentMethod?.pixKey || business?.pixKey
    if (key) {
      navigator.clipboard.writeText(key)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 2500)
    }
  }

  const handleQuickCash = (val: number) => {
    setCashReceived(String(val))
  }

  const handleQuickDueDate = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setDebtDueDate(d.toISOString().split("T")[0])
  }

  const handleConfirmCheckout = async () => {
    setError(null)
    setLoading(true)

    let splitPaymentsPayload: any[] | undefined = undefined

    if (isSplit) {
      if (Math.abs(splitSum - finalTotal) > 0.05) {
        setError(`A soma dos pagamentos (R$ ${splitSum.toFixed(2)}) deve ser exatamente igual ao total (R$ ${finalTotal.toFixed(2)}).`)
        setLoading(false)
        return
      }

      splitPaymentsPayload = splitRows
        .filter((r) => parseFloat(r.amount) > 0)
        .map((r) => {
          const m = activeMethods.find((x) => x.id === r.methodId)
          return {
            method: m?.type || "OTHER",
            methodId: m?.id,
            label: m?.name || "Outro",
            amount: parseFloat(r.amount.replace(",", ".")),
          }
        })
    }

    try {
      let finalPaymentMethodEnum: any = "OTHER"

      if (isCustomerTab) {
        finalPaymentMethodEnum = "CUSTOMER_TAB"
      } else if (isSplit) {
        finalPaymentMethodEnum = "SPLIT_PAYMENT"
      } else if (["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH"].includes(currentMethod?.type)) {
        finalPaymentMethodEnum = currentMethod.type
      }

      const res = await checkoutOrderAction({
        orderId: order.id,
        paymentMethod: finalPaymentMethodEnum,
        splitPayments: splitPaymentsPayload,
        discount: numDiscount,
        discountType,
        cashReceived: currentMethod?.type === "CASH" ? numCashReceived : undefined,
        notes: isCustomerTab 
          ? (debtNotes.trim() || `Pagar Depois / Conta do Cliente: ${order.clientName || 'Cliente'}`) 
          : (currentMethod ? `Meio de Pagamento: ${currentMethod.name}` : undefined),
        customerDebtDueDate: isCustomerTab && debtDueDate ? debtDueDate : undefined,
      })

      if (res.success) {
        onSuccess(order.id)
        onClose()
      } else {
        setError(res.error || "Falha ao finalizar venda.")
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao finalizar.")
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PIX":
        return <QrCode className="h-4 w-4" />
      case "CASH":
        return <Banknote className="h-4 w-4" />
      case "CITY_CARD":
        return <Award className="h-4 w-4" />
      case "LOCAL_AGREEMENT":
        return <Building2 className="h-4 w-4" />
      case "VOUCHER":
        return <Sparkles className="h-4 w-4" />
      case "DEBIT_CARD":
      case "CREDIT_CARD":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Layers className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                Finalizar Pagamento • {order.code}
              </h2>
              <p className="text-xs text-muted-foreground">
                {order.clientName || "Cliente Balcão"} • {order.items?.length || 0} itens lançados
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Seletor Dinâmico de Meios de Pagamento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Selecione a Forma de Pagamento</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeMethods.map((m) => {
                const isSelected = selectedMethodId === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethodId(m.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-semibold ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-black shadow-xs"
                        : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-card border border-border/50 shrink-0">
                      {getTypeIcon(m.type)}
                    </div>
                    <div className="truncate">
                      <div className="truncate text-xs">{m.name}</div>
                      {m.feePercentage > 0 ? (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          Taxa: {m.feePercentage}%
                        </div>
                      ) : null}
                    </div>
                  </button>
                )
              })}

              {/* Botão Split / Misto */}
              <button
                type="button"
                onClick={() => setSelectedMethodId("__SPLIT__")}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-semibold ${
                  isSplit
                    ? "bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/20 font-black shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-card border border-border/50 shrink-0">
                  <Layers className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <div className="text-xs">Split / Misto</div>
                  <div className="text-[10px] text-muted-foreground font-normal">2 ou mais formas</div>
                </div>
              </button>

              {/* Botão Pagar Depois (Fiado / Conta Cliente) */}
              <button
                type="button"
                onClick={() => setSelectedMethodId("__CUSTOMER_TAB__")}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-semibold ${
                  isCustomerTab
                    ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20 font-black shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-card border border-border/50 shrink-0">
                  <FileText className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs">Pagar Depois</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Conta Cliente (A Prazo)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Painel do Meio Selecionado */}
          {currentMethod?.type === "PIX" && !isSplit && (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-md shrink-0">
                <div className="h-28 w-28 bg-zinc-900 rounded-xl flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 text-center p-2">
                  <QrCode className="h-10 w-10 text-emerald-400" />
                  <span>PIX Instantâneo</span>
                  <span className="text-emerald-400 font-extrabold text-[11px]">
                    R$ {finalTotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Chave PIX ({currentMethod?.pixKeyType || business?.pixKeyType || "Chave"})
                </span>
                <div className="p-2 rounded-xl bg-card border border-border/60 font-mono text-xs font-bold text-foreground truncate">
                  {currentMethod?.pixKey || business?.pixKey || "Chave PIX não cadastrada"}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyPix}
                  className="text-xs h-8 rounded-xl font-bold gap-1.5 w-full sm:w-auto"
                >
                  {copiedPix ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPix ? "Chave Copiada!" : "Copiar Chave PIX"}</span>
                </Button>
              </div>
            </div>
          )}

          {currentMethod?.type === "CASH" && !isSplit && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Valor Recebido em Dinheiro (R$)</label>
                {cashChange > 0 && (
                  <Badge variant="gold" className="text-xs font-black">
                    Troco: R$ {cashChange.toFixed(2).replace(".", ",")}
                  </Badge>
                )}
              </div>

              <input
                type="number"
                step="0.01"
                placeholder={`R$ ${finalTotal.toFixed(2)}`}
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/50 bg-card text-base font-black text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />

              {/* Botões Rápidos de Notas */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickCash(finalTotal)}
                  className="px-2.5 py-1 rounded-lg bg-card border border-border/60 text-[11px] font-bold hover:bg-muted"
                >
                  Exato (R$ {finalTotal.toFixed(2)})
                </button>
                {[20, 50, 100, 200]
                  .filter((v) => v >= finalTotal)
                  .map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleQuickCash(v)}
                      className="px-2.5 py-1 rounded-lg bg-card border border-border/60 text-[11px] font-bold hover:bg-muted"
                    >
                      Nota R$ {v},00
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Se for Cartão Cidadão, Voucher, Débito, Crédito ou Outro Meio Customizado */}
          {!["PIX", "CASH"].includes(currentMethod?.type) && !isSplit && currentMethod && (
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground flex items-center gap-2">
                  {getTypeIcon(currentMethod.type)}
                  <span>{currentMethod.name}</span>
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  R$ {finalTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {currentMethod.details && (
                <p className="text-xs text-muted-foreground leading-snug">
                  {currentMethod.details}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[10px]">
                <div>
                  <span className="text-muted-foreground block">Taxa da Operadora:</span>
                  <span className="font-bold text-foreground">
                    {currentMethod.feePercentage ? `${currentMethod.feePercentage}% (- R$ ${feeValue.toFixed(2)})` : "0% (Isento)"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block">Prazo de Liquidação:</span>
                  <span className="font-bold text-foreground">
                    {currentMethod.payoutDays === 0 ? "D+0 (Mesmo dia)" : `D+${currentMethod.payoutDays} dias`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Painel de Split Payment Dinâmico com Qualquer Meio */}
          {isSplit && (
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Dividir em Múltiplos Meios de Pagamento</span>
                <span className={`text-[11px] font-bold ${splitRemaining === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-purple-600 dark:text-purple-400"}`}>
                  {splitRemaining > 0 ? `Faltam: R$ ${splitRemaining.toFixed(2)}` : "Total distribuído perfeitamente! ✓"}
                </span>
              </div>

              <div className="space-y-2">
                {splitRows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={row.methodId}
                      onChange={(e) => {
                        const updated = [...splitRows]
                        updated[idx].methodId = e.target.value
                        setSplitRows(updated)
                      }}
                      className="w-1/2 px-2.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-bold"
                    >
                      {activeMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    <div className="relative w-1/2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="R$ 0,00"
                        value={row.amount}
                        onChange={(e) => {
                          const updated = [...splitRows]
                          updated[idx].amount = e.target.value
                          setSplitRows(updated)
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-black text-foreground"
                      />
                    </div>

                    {splitRows.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSplitRows(splitRows.filter((_, i) => i !== idx))
                        }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSplitRows([...splitRows, { methodId: activeMethods[0]?.id || "", amount: "" }])
                }}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>+ Adicionar outra forma de pagamento</span>
              </button>
            </div>
          )}

          {/* Painel do Fiado / Pagar Depois (Conta do Cliente) */}
          {isCustomerTab && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Venda a Prazo / Conta do Cliente
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Cliente: <b className="text-foreground">{order.clientName || "Cliente Balcão"}</b>
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold">
                  A Prazo / Crediário
                </Badge>
              </div>

              {/* Data Combinada de Vencimento */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-amber-600" />
                  Data Combinada para Pagamento (Vencimento)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-amber-500/40 bg-card text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
                {/* Botões Rápidos de Vencimento */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDueDate(7)}
                    className="px-2 py-0.5 rounded-lg bg-card border border-border/60 text-[10px] font-bold hover:bg-muted"
                  >
                    + 7 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDueDate(15)}
                    className="px-2 py-0.5 rounded-lg bg-card border border-border/60 text-[10px] font-bold hover:bg-muted"
                  >
                    + 15 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDueDate(30)}
                    className="px-2 py-0.5 rounded-lg bg-card border border-border/60 text-[10px] font-bold hover:bg-muted"
                  >
                    + 30 dias (Fim do mês)
                  </button>
                </div>
              </div>

              {/* Observação / Justificativa */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-foreground">
                  Observações / Acordo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prometeu acertar no próximo corte ou no quinto dia útil..."
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-500/40 bg-card text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Desconto Opcional */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                Desconto Promocional / Cortesia
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDiscountType("FIXED")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    discountType === "FIXED" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  R$ Fixo
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("PERCENT")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    discountType === "PERCENT" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  % Porcentagem
                </button>
              </div>
            </div>

            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={discountType === "FIXED" ? "0,00 em R$" : "Ex: 10 para 10% de desconto"}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Resumo Financeiro da Venda */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Subtotal dos Itens:</span>
              <span className="font-bold text-foreground">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>

            {discountValue > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Desconto Concedido:</span>
                <span>- R$ {discountValue.toFixed(2).replace(".", ",")}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-base font-black pt-2 border-t border-border/60">
              <span className="text-foreground">
                {isCustomerTab ? "TOTAL A REGISTRAR NA CONTA DO CLIENTE:" : "TOTAL A COBRAR:"}
              </span>
              <span className={`text-xl ${isCustomerTab ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                R$ {finalTotal.toFixed(2).replace(".", ",")}
              </span>
            </div>

            {/* DRE em Tempo Real da Venda */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-card border border-border/40">
                <span className="text-muted-foreground block">Custo Produtos</span>
                <span className="font-bold text-foreground">
                  R$ {costTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/40">
                <span className="text-muted-foreground block">Comissão Equipe</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  R$ {totalCommission.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-card border border-border/40">
                <span className="text-muted-foreground block">Líquido da Casa</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {netProfit.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-2 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs h-10 rounded-xl">
            Voltar
          </Button>
          <Button
            onClick={handleConfirmCheckout}
            disabled={loading}
            className={`text-white font-black text-xs h-10 px-6 rounded-xl shadow-md gap-1.5 ${
              isCustomerTab
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {isCustomerTab ? <FileText className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            <span>
              {loading
                ? "Processando..."
                : isCustomerTab
                ? `Confirmar na Conta Cliente (R$ ${finalTotal.toFixed(2)})`
                : `Confirmar Recebimento (R$ ${finalTotal.toFixed(2)})`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
