"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  X, 
  CreditCard, 
  Percent, 
  Clock, 
  QrCode, 
  Building2, 
  Sparkles, 
  Banknote, 
  Award, 
  Layers, 
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createPaymentMethodAction, updatePaymentMethodAction, PaymentMethodInput } from "@/actions/payment-method-actions"

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  methodToEdit?: any | null
  onSuccess: () => void
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  methodToEdit,
  onSuccess,
}: PaymentMethodModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<PaymentMethodInput["type"]>("OTHER")
  const [accountId, setAccountId] = useState<string>("")
  const [feePercentage, setFeePercentage] = useState<string>("0")
  const [payoutDays, setPayoutDays] = useState<string>("0")
  const [details, setDetails] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState("CHAVE")
  const [isActive, setIsActive] = useState(true)
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!methodToEdit

  useEffect(() => {
    // Carregar contas disponíveis
    import("@/actions/account-actions").then(({ getFinancialAccountsAction }) => {
      getFinancialAccountsAction().then((res) => {
        if (res.success && res.accounts) {
          setAvailableAccounts(res.accounts)
        }
      })
    })

    if (methodToEdit) {
      setName(methodToEdit.name || "")
      setType(methodToEdit.type || "OTHER")
      setAccountId(methodToEdit.accountId || "")
      setFeePercentage(methodToEdit.feePercentage !== undefined ? String(methodToEdit.feePercentage) : "0")
      setPayoutDays(methodToEdit.payoutDays !== undefined ? String(methodToEdit.payoutDays) : "0")
      setDetails(methodToEdit.details || "")
      setPixKey(methodToEdit.pixKey || "")
      setPixKeyType(methodToEdit.pixKeyType || "CHAVE")
      setIsActive(methodToEdit.isActive !== undefined ? methodToEdit.isActive : true)
    } else {
      setName("")
      setType("CITY_CARD")
      setAccountId("")
      setFeePercentage("1.5")
      setPayoutDays("1")
      setDetails("")
      setPixKey("")
      setPixKeyType("CHAVE")
      setIsActive(true)
    }
    setError(null)
  }, [methodToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Por favor, informe o nome do meio de pagamento.")
      return
    }

    setLoading(true)

    const payload: PaymentMethodInput = {
      name: name.trim(),
      type,
      accountId: accountId || undefined,
      feePercentage: parseFloat(feePercentage.replace(",", ".")) || 0,
      payoutDays: parseInt(payoutDays) || 0,
      details: details.trim() || undefined,
      pixKey: type === "PIX" ? pixKey.trim() : undefined,
      pixKeyType: type === "PIX" ? pixKeyType : undefined,
      isActive,
    }

    try {
      if (isEditing) {
        const res = await updatePaymentMethodAction(methodToEdit.id, payload)
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.error || "Erro ao atualizar meio de pagamento.")
        }
      } else {
        const res = await createPaymentMethodAction(payload)
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.error || "Erro ao cadastrar meio de pagamento.")
        }
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao salvar.")
    } finally {
      setLoading(false)
    }
  }

  const typePresets = [
    { type: "CITY_CARD", label: "Cartão Cidadão / Moeda Local", icon: Award, defaultName: "Cartão Cidadão / Mumbuca", defaultFee: "1.5", defaultDays: "1" },
    { type: "LOCAL_AGREEMENT", label: "Convênio Local / Parceria", icon: Building2, defaultName: "Convênio Empresa Parceira", defaultFee: "0.0", defaultDays: "30" },
    { type: "VOUCHER", label: "Voucher / Ticket Benefício", icon: Sparkles, defaultName: "Ticket / Alelo / Sodexo", defaultFee: "4.5", defaultDays: "30" },
    { type: "DEBIT_CARD", label: "Cartão de Débito (Maquininha)", icon: CreditCard, defaultName: "Cartão de Débito", defaultFee: "1.89", defaultDays: "1" },
    { type: "CREDIT_CARD", label: "Cartão de Crédito (Maquininha)", icon: CreditCard, defaultName: "Cartão de Crédito", defaultFee: "3.49", defaultDays: "30" },
    { type: "PIX", label: "PIX Específico / Alternativo", icon: QrCode, defaultName: "PIX QR Code", defaultFee: "0.0", defaultDays: "0" },
    { type: "CASH", label: "Dinheiro / Espécie", icon: Banknote, defaultName: "Dinheiro", defaultFee: "0.0", defaultDays: "0" },
    { type: "OTHER", label: "Outro Meio Customizado", icon: Layers, defaultName: "Meio Personalizado", defaultFee: "0.0", defaultDays: "0" },
  ]

  const handleSelectPreset = (preset: typeof typePresets[0]) => {
    setType(preset.type as any)
    if (!isEditing && (!name || typePresets.some(p => p.defaultName === name))) {
      setName(preset.defaultName)
      setFeePercentage(preset.defaultFee)
      setPayoutDays(preset.defaultDays)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                {isEditing ? "Editar Meio de Pagamento" : "Novo Meio de Pagamento"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure cartões da cidade, convênios, taxas de operadora e regras de recebimento.
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
          {/* Seletor Rápido de Tipo de Meio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Tipo de Meio de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {typePresets.map((preset) => {
                const Icon = preset.icon
                const isSelected = type === preset.type

                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all text-xs font-semibold ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-bold shadow-xs"
                        : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nome de Exibição */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Nome de Exibição no PDV *</label>
            <input
              type="text"
              placeholder="Ex: Cartão Cidadão Maricá, Maquininha Stone, Ticket Restaurante..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Conta de Destino / Onde cai o dinheiro */}
          {availableAccounts.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Conta de Destino (Onde cai o dinheiro deste meio?)</span>
                <span className="text-[10px] text-blue-500 font-normal">Para conciliação automática</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">-- Conta Principal do Estabelecimento --</option>
                {availableAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.bankName || "Conta"}) — Saldo: R$ {(acc.currentBalance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Taxa da Maquininha & Prazo D+X */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/20 border border-border/60">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Taxa da Operadora (%)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0,00"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(e.target.value)}
                  className="w-full pl-3 pr-7 py-2 rounded-xl border border-border/60 bg-card text-xs font-black text-foreground focus:outline-none"
                />
                <Percent className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-2.5" />
              </div>
              <span className="text-[10px] text-muted-foreground block">
                Para cálculo de lucro líquido
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Prazo de Recebimento</span>
              </label>
              <select
                value={payoutDays}
                onChange={(e) => setPayoutDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="0">D+0 (Mesmo dia / Imediato)</option>
                <option value="1">D+1 (1 dia útil)</option>
                <option value="2">D+2 (2 dias úteis)</option>
                <option value="14">D+14 (14 dias corridos)</option>
                <option value="30">D+30 (30 dias corridos)</option>
              </select>
              <span className="text-[10px] text-muted-foreground block">
                Previsão de caixa no DRE
              </span>
            </div>
          </div>

          {/* Detalhes de PIX (se for tipo PIX) */}
          {type === "PIX" && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-2.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-emerald-500" />
                Chave PIX Própria para este Meio (Opcional)
              </span>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value)}
                  className="col-span-1 px-2.5 py-1.5 rounded-xl border border-border/60 bg-card text-xs font-semibold"
                >
                  <option value="CHAVE">Aleatória</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Celular</option>
                </select>

                <input
                  type="text"
                  placeholder="Informe a chave PIX..."
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs text-foreground font-mono"
                />
              </div>
            </div>
          )}

          {/* Instruções / Observações */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Instruções para o Operador do Caixa (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Passar na maquininha vermelha Stone e pedir CPF na nota"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Status Ativo */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/10 border border-border/40">
            <input
              type="checkbox"
              id="isActivePayment"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary/40"
            />
            <label htmlFor="isActivePayment" className="text-xs font-bold text-foreground cursor-pointer">
              Disponível para seleção imediata no PDV e Checkout de Comandas
            </label>
          </div>
        </form>

        {/* Rodapé */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-2 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9 rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
          >
            {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Meio de Pagamento"}
          </Button>
        </div>
      </div>
    </div>
  )
}
