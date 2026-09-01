"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  X,
  Check,
  DollarSign,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Scissors,
  Package,
  FileText,
  QrCode,
  Banknote,
  Building2,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { settleCommissionAction } from "@/actions/commission-actions"

interface SettleCommissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (settlementId: string) => void
  reportEntry: any | null
  periodStart: string
  periodEnd: string
}

export function SettleCommissionModal({
  isOpen,
  onClose,
  onSuccess,
  reportEntry,
  periodStart,
  periodEnd,
}: SettleCommissionModalProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [selectedAdvanceIds, setSelectedAdvanceIds] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CASH" | "BANK_TRANSFER" | "OTHER">("PIX")
  const [notes, setNotes] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [expandedSection, setExpandedSection] = useState<"services" | "products" | "advances" | "none">("services")

  // Inicializa todos os itens e vales como selecionados por padrão
  React.useEffect(() => {
    if (reportEntry && isOpen) {
      setSelectedItemIds(reportEntry.items?.map((i: any) => i.id) || [])
      setSelectedAdvanceIds(reportEntry.advances?.map((a: any) => a.id) || [])
      setNotes("")
      setError(null)
    }
  }, [reportEntry, isOpen])

  // Itens filtrados
  const selectedItems = useMemo(() => {
    if (!reportEntry?.items) return []
    return reportEntry.items.filter((i: any) => selectedItemIds.includes(i.id))
  }, [reportEntry, selectedItemIds])

  // Vales filtrados
  const selectedAdvances = useMemo(() => {
    if (!reportEntry?.advances) return []
    return reportEntry.advances.filter((a: any) => selectedAdvanceIds.includes(a.id))
  }, [reportEntry, selectedAdvanceIds])

  // Cálculos Dinâmicos com base nos itens e vales marcados
  const calculatedTotals = useMemo(() => {
    let grossServices = 0
    let grossProducts = 0
    let serviceCommission = 0
    let productCommission = 0

    selectedItems.forEach((i: any) => {
      const total = Number(i.totalPrice || 0)
      const comm = Number(i.commissionValue || 0)
      if (i.itemType === "SERVICE") {
        grossServices += total
        serviceCommission += comm
      } else {
        grossProducts += total
        productCommission += comm
      }
    })

    const grossSales = grossServices + grossProducts
    const totalCommission = serviceCommission + productCommission

    const advancesTotal = selectedAdvances.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0)
    const netPayout = Math.max(0, Math.round((totalCommission - advancesTotal) * 100) / 100)
    const houseNet = Math.max(0, Math.round((grossSales - totalCommission) * 100) / 100)

    return {
      grossServices,
      grossProducts,
      grossSales,
      serviceCommission,
      productCommission,
      totalCommission,
      advancesTotal,
      netPayout,
      houseNet,
    }
  }, [selectedItems, selectedAdvances])

  if (!isOpen || !reportEntry) return null

  const prof = reportEntry.professional

  const handleToggleItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((x) => x !== id))
    } else {
      setSelectedItemIds([...selectedItemIds, id])
    }
  }

  const handleToggleAdvance = (id: string) => {
    if (selectedAdvanceIds.includes(id)) {
      setSelectedAdvanceIds(selectedAdvanceIds.filter((x) => x !== id))
    } else {
      setSelectedAdvanceIds([...selectedAdvanceIds, id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItemIds.length === 0 && selectedAdvanceIds.length === 0) {
      setError("Selecione pelo menos um item ou vale para fechar.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await settleCommissionAction({
        professionalId: prof.id,
        periodStart,
        periodEnd,
        itemIds: selectedItemIds,
        advanceIds: selectedAdvanceIds,
        paymentMethod,
        notes: notes.trim() || undefined,
      })

      if (res.success && res.settlementId) {
        onSuccess(res.settlementId)
        onClose()
      } else {
        setError(res.error || "Falha ao processar fechamento.")
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao realizar fechamento.")
    } finally {
      setLoading(false)
    }
  }

  const servicesItems = reportEntry.items?.filter((i: any) => i.itemType === "SERVICE") || []
  const productsItems = reportEntry.items?.filter((i: any) => i.itemType === "PRODUCT") || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-black text-lg">
              {prof.name[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                <span>Fechamento de Repasse • {prof.name}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Período: <b>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(periodStart))}</b> a{" "}
                <b>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(periodEnd))}</b>
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Resumo de Indicadores da Produção */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Faturamento Total
              </span>
              <strong className="text-sm font-black text-foreground block mt-0.5">
                R$ {calculatedTotals.grossSales.toFixed(2).replace(".", ",")}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Comissão Bruta
              </span>
              <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400 block mt-0.5">
                R$ {calculatedTotals.totalCommission.toFixed(2).replace(".", ",")}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                Vales Descontados
              </span>
              <strong className="text-sm font-black text-rose-600 dark:text-rose-400 block mt-0.5">
                - R$ {calculatedTotals.advancesTotal.toFixed(2).replace(".", ",")}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                LÍQUIDO A PAGAR
              </span>
              <strong className="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                R$ {calculatedTotals.netPayout.toFixed(2).replace(".", ",")}
              </strong>
            </div>
          </div>

          {/* Dados PIX do Profissional */}
          {prof.pixKey && (
            <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-foreground">
                  Chave PIX ({prof.pixKeyType || "PIX"}): <b className="font-mono text-emerald-600 dark:text-emerald-400">{prof.pixKey}</b>
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Cadastrada
              </Badge>
            </div>
          )}

          {/* Seção 1: Serviços Realizados (Acordeão) */}
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
            <button
              type="button"
              onClick={() => setExpandedSection(expandedSection === "services" ? "none" : "services")}
              className="w-full p-3.5 flex items-center justify-between bg-muted/30 text-xs font-bold hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-emerald-500" />
                <span>Serviços Realizados ({selectedItems.filter((i: any) => i.itemType === "SERVICE").length} de {servicesItems.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  R$ {calculatedTotals.serviceCommission.toFixed(2).replace(".", ",")}
                </span>
                {expandedSection === "services" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {expandedSection === "services" && (
              <div className="p-3 space-y-2 max-h-56 overflow-y-auto divide-y divide-border/40">
                {servicesItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhum serviço registrado no período.</p>
                ) : (
                  servicesItems.map((item: any) => {
                    const isChecked = selectedItemIds.includes(item.id)
                    return (
                      <label
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer hover:bg-muted/40 transition-colors",
                          isChecked ? "bg-card" : "opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(item.id)}
                            className="rounded h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <strong className="text-foreground block">{item.name}</strong>
                            <span className="text-[10px] text-muted-foreground">
                              {item.order?.clientName || "Cliente"} • Comanda #{item.order?.code}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-foreground block">
                            R$ {Number(item.totalPrice).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-extrabold">
                            Comissão: R$ {Number(item.commissionValue).toFixed(2)} ({item.commissionRate}%)
                          </span>
                        </div>
                      </label>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Seção 2: Produtos Vendidos (Acordeão) */}
          {productsItems.length > 0 && (
            <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === "products" ? "none" : "products")}
                className="w-full p-3.5 flex items-center justify-between bg-muted/30 text-xs font-bold hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-500" />
                  <span>Produtos Vendidos ({selectedItems.filter((i: any) => i.itemType === "PRODUCT").length} de {productsItems.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                    R$ {calculatedTotals.productCommission.toFixed(2).replace(".", ",")}
                  </span>
                  {expandedSection === "products" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {expandedSection === "products" && (
                <div className="p-3 space-y-2 max-h-56 overflow-y-auto divide-y divide-border/40">
                  {productsItems.map((item: any) => {
                    const isChecked = selectedItemIds.includes(item.id)
                    return (
                      <label
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer hover:bg-muted/40 transition-colors",
                          isChecked ? "bg-card" : "opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(item.id)}
                            className="rounded h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <strong className="text-foreground block">{item.name}</strong>
                            <span className="text-[10px] text-muted-foreground">
                              Qtd: {item.quantity} • Comanda #{item.order?.code}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-foreground block">
                            R$ {Number(item.totalPrice).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-extrabold">
                            Comissão: R$ {Number(item.commissionValue).toFixed(2)} ({item.commissionRate}%)
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Seção 3: Vales e Adiantamentos a Descontar (Acordeão) */}
          {reportEntry.advances?.length > 0 && (
            <div className="rounded-2xl border border-rose-500/30 overflow-hidden bg-rose-500/5">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === "advances" ? "none" : "advances")}
                className="w-full p-3.5 flex items-center justify-between bg-rose-500/10 text-xs font-bold hover:bg-rose-500/15 transition-colors"
              >
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <DollarSign className="h-4 w-4" />
                  <span>Vales & Adiantamentos ({selectedAdvances.length} de {reportEntry.advances.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-600 font-black">
                    - R$ {calculatedTotals.advancesTotal.toFixed(2).replace(".", ",")}
                  </span>
                  {expandedSection === "advances" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {expandedSection === "advances" && (
                <div className="p-3 space-y-2 max-h-48 overflow-y-auto divide-y divide-rose-500/20">
                  {reportEntry.advances.map((adv: any) => {
                    const isChecked = selectedAdvanceIds.includes(adv.id)
                    return (
                      <label
                        key={adv.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer hover:bg-rose-500/10 transition-colors",
                          isChecked ? "bg-card" : "opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAdvance(adv.id)}
                            className="rounded h-4 w-4 text-rose-600 focus:ring-rose-500"
                          />
                          <div>
                            <strong className="text-foreground block">{adv.description}</strong>
                            <span className="text-[10px] text-muted-foreground">
                              Data: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(adv.date))}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-rose-600 block">
                            - R$ {Number(adv.amount).toFixed(2)}
                          </span>
                          <span className="text-[9px] text-muted-foreground">Descontar do repasse</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Forma de Pagamento do Repasse */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-foreground">Como será feito o repasse?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("PIX")}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "PIX"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "CASH"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Banknote className="h-4 w-4" />
                <span>Dinheiro (Caixa)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Transferência</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("OTHER")}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "OTHER"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Outro</span>
              </button>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground">Observações do Fechamento (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Pagamento quinzenal referente à primeira quinzena de Agosto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none"
            />
          </div>
        </form>

        {/* Rodapé de Ações */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-left">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Valor Líquido do Repasse:</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              R$ {calculatedTotals.netPayout.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-10 rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (selectedItemIds.length === 0 && selectedAdvanceIds.length === 0)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-10 px-6 rounded-xl shadow-md gap-1.5 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>{loading ? "Processando..." : `Quitar & Fechar Repasse (R$ ${calculatedTotals.netPayout.toFixed(2)})`}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
