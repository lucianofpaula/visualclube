"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  CreditCard, 
  Plus, 
  Percent, 
  Clock, 
  QrCode, 
  Building2, 
  Sparkles, 
  Banknote, 
  Award, 
  Layers, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Power,
  Info,
  ShieldCheck
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PaymentMethodModal } from "@/components/financial/payment-method-modal"
import { togglePaymentMethodAction, deletePaymentMethodAction } from "@/actions/payment-method-actions"

interface PaymentMethodsManagerProps {
  initialMethods: any[]
  onRefresh: () => void
}

export function PaymentMethodsManager({
  initialMethods,
  onRefresh,
}: PaymentMethodsManagerProps) {
  const [methods, setMethods] = useState(initialMethods)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition()

  React.useEffect(() => {
    setMethods(initialMethods)
  }, [initialMethods])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PIX":
        return <QrCode className="h-4 w-4 text-emerald-500" />
      case "CASH":
        return <Banknote className="h-4 w-4 text-amber-500" />
      case "CITY_CARD":
        return <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case "LOCAL_AGREEMENT":
        return <Building2 className="h-4 w-4 text-indigo-500" />
      case "VOUCHER":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "DEBIT_CARD":
      case "CREDIT_CARD":
        return <CreditCard className="h-4 w-4 text-primary" />
      default:
        return <Layers className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PIX":
        return <Badge variant="success" className="text-[10px]">PIX</Badge>
      case "CASH":
        return <Badge variant="gold" className="text-[10px]">Dinheiro</Badge>
      case "CITY_CARD":
        return <Badge variant="success" className="text-[10px] bg-emerald-500/15 border-emerald-500/30">Cartão da Cidade / Cidadão</Badge>
      case "LOCAL_AGREEMENT":
        return <Badge variant="secondary" className="text-[10px]">Convênio Local</Badge>
      case "VOUCHER":
        return <Badge variant="purple" className="text-[10px]">Voucher / Ticket</Badge>
      case "DEBIT_CARD":
        return <Badge variant="default" className="text-[10px]">Cartão Débito</Badge>
      case "CREDIT_CARD":
        return <Badge variant="default" className="text-[10px]">Cartão Crédito</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">Personalizado</Badge>
    }
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    startTransition(async () => {
      const res = await togglePaymentMethodAction(id, !currentActive)
      if (res.success) {
        onRefresh()
      } else {
        alert(res.error || "Erro ao alterar status.")
      }
    })
  }

  const handleDelete = async (id: string, name: string, isDefault: boolean) => {
    const msg = isDefault
      ? `"${name}" é uma forma padrão do sistema. Deseja desativá-la no PDV?`
      : `Tem certeza que deseja excluir o meio de pagamento "${name}"?`

    if (confirm(msg)) {
      startTransition(async () => {
        const res = await deletePaymentMethodAction(id)
        if (res.success) {
          onRefresh()
        } else {
          alert(res.error || "Erro ao excluir meio.")
        }
      })
    }
  }

  const activeCount = methods.filter((m) => m.isActive).length
  const customCount = methods.filter((m) => !m.isDefault).length

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-emerald-500" />
            Meios de Pagamento & Recebimento
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure as formas de pagamento disponíveis no seu PDV (PIX, Dinheiro, Cartões, Moedas Locais e Convênios).
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingMethod(null)
            setModalOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Meio de Pagamento</span>
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl border-border/60 bg-card/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Meios Ativos no PDV
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {activeCount} de {methods.length}
          </div>
          <span className="text-[10px] text-muted-foreground block">Disponíveis no caixa e checkout</span>
        </Card>

        <Card className="p-4 rounded-2xl border-border/60 bg-card/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Meios Customizados / Regionais
          </span>
          <div className="text-2xl font-black text-foreground">
            {customCount}
          </div>
          <span className="text-[10px] text-muted-foreground block">Cartões locais, convênios ou vouchers</span>
        </Card>

        <Card className="p-4 rounded-2xl border-border/60 bg-card/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Padrões do Sistema
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {methods.filter((m) => m.isDefault).length}
          </div>
          <span className="text-[10px] text-muted-foreground block">PIX, Dinheiro, Cartão Débito e Crédito</span>
        </Card>
      </div>

      {/* Grade de Meios de Pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {methods.map((method) => {
          return (
            <Card
              key={method.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                method.isActive
                  ? "bg-card border-border/70 shadow-xs"
                  : "bg-muted/20 border-border/40 opacity-70"
              }`}
            >
              {/* Top Row: Icon + Name + Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center shrink-0 shadow-2xs">
                    {getTypeIcon(method.type)}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                      {method.name}
                      {method.isDefault && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getTypeBadge(method.type)}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(method.id, method.isActive)}
                  className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                    method.isActive
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                  title={method.isActive ? "Desativar no PDV" : "Ativar no PDV"}
                >
                  <Power className="h-3.5 w-3.5" />
                  <span className="text-[10px]">{method.isActive ? "Ativo no PDV" : "Pausado"}</span>
                </button>
              </div>

              {/* Informações de Taxa e Prazo */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/40 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px]">Taxa da Maquininha</span>
                  <span className="font-extrabold text-foreground">
                    {method.feePercentage && method.feePercentage > 0 ? `${method.feePercentage}%` : "0% (Sem taxa)"}
                  </span>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-muted-foreground block text-[10px]">Prazo de Recebimento</span>
                  <span className="font-extrabold text-foreground">
                    {method.payoutDays === 0 ? "D+0 (Imediato)" : `D+${method.payoutDays} dias`}
                  </span>
                </div>
              </div>

              {/* Detalhes / Chave PIX se houver */}
              {(method.details || method.pixKey) && (
                <div className="text-[11px] text-muted-foreground leading-snug truncate">
                  {method.pixKey && (
                    <span className="font-mono text-foreground block">
                      PIX: {method.pixKey} ({method.pixKeyType || "Chave"})
                    </span>
                  )}
                  {method.details && <span>{method.details}</span>}
                </div>
              )}

              {/* Rodapé: Ações */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>
                  {method.createdByName ? `Criado por: ${method.createdByName}` : "Sistema"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingMethod(method)
                      setModalOpen(true)
                    }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Editar Meio"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(method.id, method.name, method.isDefault)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title={method.isDefault ? "Desativar meio padrão" : "Excluir meio"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal */}
      <PaymentMethodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        methodToEdit={editingMethod}
        onSuccess={onRefresh}
      />
    </div>
  )
}
