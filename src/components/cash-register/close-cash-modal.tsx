"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  Lock, 
  DollarSign, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  CreditCard,
  QrCode,
  AlertTriangle,
  Scale,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { closeCashSessionAction } from "@/actions/cash-register-actions"
import { cn } from "@/lib/utils"

interface CloseCashModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (closedSession?: any) => void
  session: any
}

export function CloseCashModal({
  open,
  onClose,
  onSuccess,
  session,
}: CloseCashModalProps) {
  const [reportedCash, setReportedCash] = useState<string>("")
  const [reportedPix, setReportedPix] = useState<string>("")
  const [reportedCard, setReportedCard] = useState<string>("")
  const [reportedOther, setReportedOther] = useState<string>("")
  const [closingNotes, setClosingNotes] = useState<string>("")
  
  // Passo da conferência (Passo 1: Digitação Cega -> Passo 2: Confrontação com Sistema)
  const [step, setStep] = useState<"BLIND_COUNT" | "CONFRONTATION">("BLIND_COUNT")
  const [confrontationResult, setConfrontationResult] = useState<any>(null)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  const liveMetrics = session?.liveMetrics || {}
  const expectedCash = liveMetrics.currentDrawerCash || 0
  const expectedPix = liveMetrics.salesPix || 0
  const expectedCard = liveMetrics.salesCard || 0
  const expectedOther = liveMetrics.salesOther || 0

  // Passo 1: Avança para confrontar
  const handleProceedToConfrontation = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numCash = parseFloat(reportedCash.replace(",", "."))
    if (isNaN(numCash) || numCash < 0) {
      setError("Informe o valor total contado em dinheiro físico na gaveta.")
      return
    }

    const numPix = reportedPix ? parseFloat(reportedPix.replace(",", ".")) : expectedPix
    const numCard = reportedCard ? parseFloat(reportedCard.replace(",", ".")) : expectedCard
    const numOther = reportedOther ? parseFloat(reportedOther.replace(",", ".")) : expectedOther

    const diffCash = Math.round((numCash - expectedCash) * 100) / 100

    setConfrontationResult({
      reportedCash: numCash,
      reportedPix: numPix,
      reportedCard: numCard,
      reportedOther: numOther,
      expectedCash,
      expectedPix,
      expectedCard,
      expectedOther,
      diffCash,
      isExact: diffCash === 0,
      isSurplus: diffCash > 0,
      isDeficit: diffCash < 0,
    })

    setStep("CONFRONTATION")
  }

  // Passo 2: Confirma o encerramento no banco
  const handleConfirmClose = () => {
    if (!confrontationResult) return
    setError(null)

    startTransition(async () => {
      const res = await closeCashSessionAction({
        sessionId: session.id,
        reportedCash: confrontationResult.reportedCash,
        reportedPix: confrontationResult.reportedPix,
        reportedCard: confrontationResult.reportedCard,
        reportedOther: confrontationResult.reportedOther,
        closingNotes: closingNotes.trim() || undefined,
      })

      if (res.success) {
        onSuccess(res.session)
      } else {
        setError(res.error || "Falha ao encerrar caixa.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Fechamento & Balanço de Caixa</h2>
              <p className="text-xs text-muted-foreground">
                {step === "BLIND_COUNT" 
                  ? "Conferência Cega: conte os valores físicos sem viés" 
                  : "Confronto e Auditoria: apuração de sobras e quebras"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "BLIND_COUNT" ? (
          /* PASSO 1: CONFERÊNCIA CEGA */
          <form onSubmit={handleProceedToConfrontation} className="p-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <Scale className="w-4 h-4" />
                Princípio da Conferência Cega
              </p>
              <p className="text-[11px] leading-relaxed opacity-90">
                Conte o dinheiro físico presente na gaveta e insira o valor exato. O sistema fará a comparação matemática e identificará eventuais divergências no próximo passo.
              </p>
            </div>

            {/* Dinheiro Vivo na Gaveta (Obrigatório) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Total em Dinheiro Vivo Contado na Gaveta (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={reportedCash}
                  onChange={(e) => setReportedCash(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 text-lg font-bold h-12 text-foreground"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Meios Opcionais / Cartões e PIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-purple-500" />
                  Total em PIX (Opcional)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={reportedPix}
                  onChange={(e) => setReportedPix(e.target.value)}
                  placeholder={`Esperado: R$ ${expectedPix.toFixed(2)}`}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-blue-500" />
                  Total em Cartões (Opcional)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={reportedCard}
                  onChange={(e) => setReportedCard(e.target.value)}
                  placeholder={`Esperado: R$ ${expectedCard.toFixed(2)}`}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Observações de Encerramento */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">
                Observações de Fechamento (Opcional)
              </label>
              <Textarea
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder="Ex: Turno encerrado sem intercorrências..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                Confrontar com o Sistema
              </Button>
            </div>
          </form>
        ) : (
          /* PASSO 2: CONFRONTAÇÃO E RESULTADO */
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Banner de Status da Quebra / Sobra */}
            <div className={cn(
              "p-4 rounded-2xl border text-center space-y-1",
              confrontationResult.isExact && "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
              confrontationResult.isSurplus && "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
              confrontationResult.isDeficit && "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
            )}>
              <div className="flex items-center justify-center gap-2">
                {confrontationResult.isExact && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {confrontationResult.isSurplus && <Sparkles className="w-6 h-6 text-blue-500" />}
                {confrontationResult.isDeficit && <AlertTriangle className="w-6 h-6 text-rose-500" />}
                <h3 className="text-base font-black">
                  {confrontationResult.isExact && "Balanço Perfeito: Sem Divergências!"}
                  {confrontationResult.isSurplus && `Sobra de Caixa: + R$ ${confrontationResult.diffCash.toFixed(2)}`}
                  {confrontationResult.isDeficit && `Quebra de Caixa (Falta): - R$ ${Math.abs(confrontationResult.diffCash).toFixed(2)}`}
                </h3>
              </div>
              <p className="text-xs opacity-90">
                {confrontationResult.isExact && "O valor contado bateu 100% com o saldo teórico calculado pelo sistema."}
                {confrontationResult.isSurplus && "Há mais dinheiro físico na gaveta do que o registrado nas vendas."}
                {confrontationResult.isDeficit && "O valor físico está abaixo do esperado pelo sistema. Verifique recibos ou trocos."}
              </p>
            </div>

            {/* Grid de Comparação Detalhada */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Esperado pelo Sistema</span>
                <p className="text-xl font-extrabold text-foreground">
                  R$ {confrontationResult.expectedCash.toFixed(2)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase">Contado pelo Operador</span>
                <p className="text-xl font-extrabold text-primary">
                  R$ {confrontationResult.reportedCash.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Justificativa caso haja diferença */}
            {!confrontationResult.isExact && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Justificativa da Divergência (Recomendado)
                </label>
                <Textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Explique o motivo da sobra ou quebra de caixa..."
                  rows={2}
                  className="text-xs resize-none border-rose-500/30"
                />
              </div>
            )}

            {/* Rodapé de Ações */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("BLIND_COUNT")}
                disabled={isPending}
                className="text-xs h-9"
              >
                ← Recontar Valores
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isPending}
                  className="text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmClose}
                  disabled={isPending}
                  className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Encerrando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Finalizar Fechamento Definitivo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
