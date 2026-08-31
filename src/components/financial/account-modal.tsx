"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  X, 
  Building2, 
  Wallet, 
  Banknote, 
  CreditCard, 
  DollarSign, 
  Sparkles, 
  Check, 
  AlertCircle,
  QrCode,
  Layers,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createFinancialAccountAction, updateFinancialAccountAction, FinancialAccountInput } from "@/actions/account-actions"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  accountToEdit?: any | null
  onSuccess: () => void
}

export function AccountModal({
  isOpen,
  onClose,
  accountToEdit,
  onSuccess,
}: AccountModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<FinancialAccountInput["type"]>("CHECKING_ACCOUNT")
  const [bankName, setBankName] = useState("Banco Bradesco")
  const [initialBalance, setInitialBalance] = useState<string>("0")
  const [agency, setAgency] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [color, setColor] = useState("blue")
  const [isDefault, setIsDefault] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!accountToEdit

  const bankPresets = [
    { name: "Banco Bradesco", type: "CHECKING_ACCOUNT", color: "rose", label: "Bradesco" },
    { name: "Banco Itaú", type: "CHECKING_ACCOUNT", color: "amber", label: "Itaú" },
    { name: "Nubank", type: "CHECKING_ACCOUNT", color: "purple", label: "Nubank" },
    { name: "Banco Inter", type: "CHECKING_ACCOUNT", color: "amber", label: "Inter" },
    { name: "Mercado Pago", type: "GATEWAY_ACCOUNT", color: "blue", label: "Mercado Pago" },
    { name: "Banco Neon", type: "CHECKING_ACCOUNT", color: "blue", label: "Neon" },
    { name: "C6 Bank", type: "CHECKING_ACCOUNT", color: "slate", label: "C6 Bank" },
    { name: "Banco do Brasil", type: "CHECKING_ACCOUNT", color: "blue", label: "Banco do Brasil" },
    { name: "Caixa Econômica", type: "CHECKING_ACCOUNT", color: "blue", label: "Caixa" },
    { name: "Santander", type: "CHECKING_ACCOUNT", color: "rose", label: "Santander" },
    { name: "Conta Stone", type: "GATEWAY_ACCOUNT", color: "emerald", label: "Stone" },
    { name: "PagBank / PagSeguro", type: "GATEWAY_ACCOUNT", color: "emerald", label: "PagBank" },
    { name: "PicPay", type: "DIGITAL_WALLET", color: "emerald", label: "PicPay" },
    { name: "Banco Mumbuca / Social", type: "DIGITAL_WALLET", color: "emerald", label: "Mumbuca" },
    { name: "Caixa Físico / Gaveta", type: "CASH_DRAWER", color: "emerald", label: "Caixa Dinheiro" },
    { name: "Outro Banco / Carteira", type: "OTHER", color: "slate", label: "Outro" },
  ]

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name || "")
      setType(accountToEdit.type || "CHECKING_ACCOUNT")
      setBankName(accountToEdit.bankName || "")
      setInitialBalance(String(accountToEdit.initialBalance || 0))
      setAgency(accountToEdit.agency || "")
      setAccountNumber(accountToEdit.accountNumber || "")
      setPixKey(accountToEdit.pixKey || "")
      setColor(accountToEdit.color || "blue")
      setIsDefault(!!accountToEdit.isDefault)
      setIsActive(accountToEdit.isActive !== undefined ? accountToEdit.isActive : true)
    } else {
      setName("Conta Bradesco PJ")
      setType("CHECKING_ACCOUNT")
      setBankName("Banco Bradesco")
      setInitialBalance("1200")
      setAgency("")
      setAccountNumber("")
      setPixKey("")
      setColor("rose")
      setIsDefault(false)
      setIsActive(true)
    }
    setError(null)
  }, [accountToEdit, isOpen])

  if (!isOpen) return null

  const handleSelectBank = (preset: typeof bankPresets[0]) => {
    setBankName(preset.name)
    setType(preset.type as any)
    setColor(preset.color)
    if (!isEditing) {
      setName(preset.type === "CASH_DRAWER" ? "Caixa Físico Balcão" : `${preset.name} PJ`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Por favor, informe o nome da conta.")
      return
    }

    setLoading(true)

    const payload: FinancialAccountInput = {
      name: name.trim(),
      type,
      bankName: bankName.trim() || undefined,
      initialBalance: parseFloat(initialBalance.replace(",", ".")) || 0,
      agency: agency.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      pixKey: pixKey.trim() || undefined,
      color,
      isDefault,
      isActive,
    }

    try {
      if (isEditing) {
        const res = await updateFinancialAccountAction(accountToEdit.id, payload)
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.error || "Erro ao atualizar conta.")
        }
      } else {
        const res = await createFinancialAccountAction(payload)
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.error || "Erro ao cadastrar conta.")
        }
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado ao salvar conta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                {isEditing ? "Editar Conta Bancária / Carteira" : "Nova Conta Bancária / Carteira"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Cadastre contas correntes, caixas ou carteiras para controle de saldo e saídas.
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
          {/* Presets Rápidos de Bancos / Carteiras */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Banco / Instituição</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {bankPresets.map((preset) => {
                const isSelected = bankName === preset.name
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectBank(preset)}
                    className={`p-2 rounded-xl border text-center text-xs font-bold truncate transition-all ${
                      isSelected
                        ? "bg-primary/15 border-primary text-primary ring-2 ring-primary/20 shadow-xs"
                        : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nome da Conta */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Nome de Identificação da Conta *</label>
            <input
              type="text"
              placeholder="Ex: Conta Bradesco Principal, Caixa Gaveta, Stone Balcão..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Saldo Inicial e Tipo */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/20 border border-border/60">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {isEditing ? "Saldo Inicial de Abertura" : "Saldo Inicial (R$)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  disabled={isEditing}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-black text-foreground focus:outline-none disabled:opacity-60"
                />
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {isEditing ? "Para alterar saldo atual, lance uma transação" : "Valor com que a conta começa hoje"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Tipo de Conta</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="CHECKING_ACCOUNT">Conta Corrente Bancária</option>
                <option value="CASH_DRAWER">Caixa Físico / Gaveta</option>
                <option value="GATEWAY_ACCOUNT">Conta Maquininha / Gateway</option>
                <option value="DIGITAL_WALLET">Carteira Digital / Social</option>
                <option value="SAVINGS">Poupança / Reserva</option>
                <option value="OTHER">Outra Conta</option>
              </select>
            </div>
          </div>

          {/* Agência, Conta e Chave PIX (Opcional) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">Agência (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: 0142"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-muted/10 text-xs text-foreground font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">Nº da Conta (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: 58291-0"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-muted/10 text-xs text-foreground font-mono"
              />
            </div>
          </div>

          {/* Chave PIX */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground">Chave PIX desta Conta (Opcional)</label>
            <input
              type="text"
              placeholder="CNPJ, CPF, E-mail ou chave aleatória..."
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-muted/10 text-xs text-foreground font-mono"
            />
          </div>

          {/* Cor do Cartão */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Cor do Cartão no Painel</label>
            <div className="flex items-center gap-2">
              {[
                { id: "blue", bg: "bg-blue-600", label: "Azul" },
                { id: "rose", bg: "bg-rose-600", label: "Vermelho / Bradesco / Santander" },
                { id: "purple", bg: "bg-purple-600", label: "Roxo / Nubank" },
                { id: "amber", bg: "bg-amber-600", label: "Laranja / Itaú / Inter" },
                { id: "emerald", bg: "bg-emerald-600", label: "Verde / Stone / Caixa" },
                { id: "slate", bg: "bg-zinc-700", label: "Cinza Escuro" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  className={`h-7 w-7 rounded-xl ${c.bg} flex items-center justify-center transition-all ${
                    color === c.id ? "ring-3 ring-foreground scale-110 shadow-md" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {color === c.id && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Conta Padrão */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/10 border border-border/40">
            <input
              type="checkbox"
              id="isDefaultAccount"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary/40"
            />
            <label htmlFor="isDefaultAccount" className="text-xs font-bold text-foreground cursor-pointer">
              Definir como Conta Principal do Estabelecimento
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
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
          >
            <Check className="h-4 w-4" />
            <span>{loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Conta"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
