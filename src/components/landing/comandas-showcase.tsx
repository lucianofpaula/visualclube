"use client"

import * as React from "react"
import { 
  Receipt, 
  Beer, 
  Scissors, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  Sparkles, 
  QrCode, 
  CreditCard,
  Percent,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ComandasProps {
  onOpenAuth: (mode?: "login" | "register") => void
}

export function ComandasShowcase({ onOpenAuth }: ComandasProps) {
  return (
    <section id="comandas" className="py-20 sm:py-28 bg-gradient-to-b from-transparent via-muted/30 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & Value Prop */}
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="gold" className="px-3 py-1 text-xs font-semibold">
              <Receipt className="h-3.5 w-3.5 mr-1" />
              Comandas Digitais Inteligentes
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              O cliente consome, seu time lança e o sistema{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 bg-clip-text text-transparent">
                divide o dinheiro na hora
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Diga adeus às fichas de papel rasgadas e às discussões no fim do dia sobre quem atendeu quem.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Comanda Unificada (Serviço + Bar + Produtos)</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O cliente faz a barba, pede uma cerveja gelada e leva uma pomada para casa. Tudo em uma só comanda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Split Automático de Comissão</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O percentual do profissional (ex: 50% no corte e 10% no produto) é calculado em milissegundos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Fechamento Rápido com PIX ou Cartão</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Gere o QR Code PIX com o valor exato na tela do caixa ou smartphone. Sem fila no balcão.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => onOpenAuth("register")}
                className="bg-primary text-primary-foreground font-semibold rounded-xl h-11 px-6 shadow-md"
              >
                Ver Demonstração da Comanda
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {/* Header Comanda */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Comanda #CMD-089</div>
                    <div className="text-xs text-muted-foreground">Mesa / Cadeira: 03 • Cliente: Felipe D.</div>
                  </div>
                </div>
                <Badge variant="gold">Aberta (1h 15m)</Badge>
              </div>

              {/* Items List */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Scissors className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">Corte Degradê & Freestyle</div>
                      <div className="text-[10px] text-muted-foreground">Profissional: Matheus • 50% comissão</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">R$ 60,00</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">R$ 30,00 comissão</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Beer className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="font-semibold text-foreground">2x Corona Extra Long Neck</div>
                      <div className="text-[10px] text-muted-foreground">Item do Bar / Recepção</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">R$ 26,00</div>
                    <div className="text-[10px] text-muted-foreground">100% Salão</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-semibold text-foreground">Óleo Hidratante de Barba (30ml)</div>
                      <div className="text-[10px] text-muted-foreground">Venda: Matheus • 15% comissão</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">R$ 48,00</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">R$ 7,20 comissão</div>
                  </div>
                </div>
              </div>

              {/* Total & Summary Box */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Total da Comanda:</span>
                  <span className="text-lg font-black text-foreground">R$ 134,00</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Comissão Matheus:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">R$ 37,20</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-[11px] block">Caixa do Estabelecimento:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">R$ 96,80</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
