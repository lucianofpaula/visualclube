"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Lock, 
  Unlock, 
  ArrowDownLeft, 
  PlusCircle, 
  MinusCircle, 
  Wallet, 
  AlertTriangle, 
  RefreshCw, 
  ChevronRight,
  ShieldAlert,
  Clock,
  User,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PosCashStatusBarProps {
  cashData: any
  loading?: boolean
  onOpenCash: () => void
  onCloseCash: () => void
  onSangria: () => void
  onSuprimento: () => void
  onDespesa: () => void
  onRefresh: () => void
}

export function PosCashStatusBar({
  cashData,
  loading = false,
  onOpenCash,
  onCloseCash,
  onSangria,
  onSuprimento,
  onDespesa,
  onRefresh,
}: PosCashStatusBarProps) {
  const isOpen = cashData?.isOpen || false
  const session = cashData?.session || null
  const metrics = session?.liveMetrics || {
    currentDrawerCash: session?.initialBalance || 0,
    initialBalance: session?.initialBalance || 0,
  }

  // Verifica se a sessão aberta foi iniciada em um dia anterior (Caixa de Ontem Pendente)
  const isYesterdaySession = React.useMemo(() => {
    if (!isOpen || !session?.openedAt) return false
    const openedDate = new Date(session.openedAt)
    const today = new Date()
    return (
      openedDate.getDate() !== today.getDate() ||
      openedDate.getMonth() !== today.getMonth() ||
      openedDate.getFullYear() !== today.getFullYear()
    )
  }, [isOpen, session])

  // Alerta de limite de segurança em dinheiro vivo (ex: >= R$ 600)
  const isHighDrawerCash = isOpen && metrics.currentDrawerCash >= 600

  // ----------------------------------------------------
  // CASO 1: CAIXA ABERTO DO DIA ANTERIOR (ALERTA DE VIRADA)
  // ----------------------------------------------------
  if (isOpen && isYesterdaySession) {
    const openedFormatted = new Date(session.openedAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
    const openedTime = new Date(session.openedAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    return (
      <div className="w-full bg-linear-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-300">
                Caixa Pendente de Ontem ({openedFormatted} às {openedTime})
              </h3>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold">
                Turno não encerrado
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              O caixa aberto por <b className="text-foreground">{session.openedByName}</b> no dia anterior ainda não foi finalizado. Encerre o dia anterior para iniciar o caixa de hoje e manter o financeiro 100% organizado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-xs h-9 border-amber-500/30"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
          <Button
            onClick={onCloseCash}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Encerrar Caixa de Ontem & Abrir Hoje</span>
          </Button>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // CASO 2: CAIXA ABERTO HOJE (EM OPERAÇÃO NORMAL)
  // ----------------------------------------------------
  if (isOpen) {
    const openedTime = new Date(session.openedAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    return (
      <div className="w-full bg-card border border-emerald-500/20 bg-linear-to-r from-emerald-500/5 via-card to-card rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-150">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Unlock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Caixa Aberto Hoje
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                • Gaveta: R$ {metrics.currentDrawerCash.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {isHighDrawerCash && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse">
                  Sangria Recomendada
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Operador: <b className="text-foreground">{session.openedByName}</b></span>
              <span>•</span>
              <span>Aberto às {openedTime}</span>
              <span>•</span>
              <span>Fundo: R$ {Number(metrics.initialBalance || 0).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Ações Rápidas no PDV */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onSuprimento}
            className="text-[11px] h-8 px-2.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Suprimento
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSangria}
            className={cn(
              "text-[11px] h-8 px-2.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-600 font-semibold gap-1",
              isHighDrawerCash && "bg-amber-500/15 font-black animate-pulse"
            )}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            - Sangria
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDespesa}
            className="text-[11px] h-8 px-2.5 text-rose-600 border-rose-500/30 hover:bg-rose-500/10 font-semibold gap-1"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            - Despesa
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onCloseCash}
            className="text-[11px] h-8 px-2.5 text-foreground hover:text-rose-600 border-border hover:border-rose-500/30 font-semibold gap-1"
          >
            <Lock className="w-3.5 h-3.5" />
            Fechar Caixa
          </Button>

          <Link href="/app/financeiro/caixa" className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] h-8 px-2 text-muted-foreground hover:text-primary gap-0.5"
            >
              Extrato
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // CASO 3: CAIXA FECHADO
  // ----------------------------------------------------
  return (
    <div className="w-full bg-linear-to-r from-rose-500/10 via-card to-card border border-rose-500/20 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-150">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-foreground">
              Caixa Fechado no Momento
            </h3>
            <Badge variant="outline" className="text-[10px] px-2 py-0 bg-muted text-muted-foreground border-border font-medium">
              PDV Bloqueado p/ Recebimentos
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Abra a sessão informando o fundo de troco para liberar os pagamentos e recebimentos no balcão.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-xs h-8 border-border"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </Button>

        <Button
          onClick={onOpenCash}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs gap-1.5"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>Abrir Caixa de Hoje</span>
        </Button>
      </div>
    </div>
  )
}
