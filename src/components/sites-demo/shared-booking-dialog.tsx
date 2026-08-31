"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Phone,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SharedBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  themeType: "noir" | "maison" | "neo"
  shopName: string
}

export function SharedBookingDialog({
  isOpen,
  onClose,
  themeType,
  shopName,
}: SharedBookingDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedService, setSelectedService] = useState<string>("Corte Signature & Barboterapia")
  const [selectedTime, setSelectedTime] = useState<string>("15:30")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const isNoir = themeType === "noir"
  const isMaison = themeType === "maison"
  const isNeo = themeType === "neo"

  const handleReset = () => {
    setStep(1)
    setIsSuccess(false)
    setName("")
    setPhone("")
  }

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSuccess(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in-50">
      <div
        className={cn(
          "relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all duration-300 my-8 animate-in zoom-in-95",
          isNoir && "bg-[#0c0c0e] border-amber-500/30 text-neutral-100",
          isMaison && "bg-[#faf9f6] border-[#e6ddd2] text-stone-900",
          isNeo && "bg-[#090a10] border-cyan-500/40 text-cyan-50 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
        )}
      >
        {/* Botão Fechar */}
        <button
          onClick={() => { onClose(); setTimeout(handleReset, 300); }}
          className={cn(
            "absolute top-5 right-5 p-1.5 rounded-xl transition-colors cursor-pointer",
            isNoir && "text-neutral-400 hover:text-white hover:bg-white/10",
            isMaison && "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50",
            isNeo && "text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10"
          )}
        >
          <X className="size-4" />
        </button>

        {!isSuccess ? (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn(
                  "text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5",
                  isNoir && "bg-amber-500/15 text-amber-400 border-amber-500/30",
                  isMaison && "bg-rose-500/10 text-rose-700 border-rose-300",
                  isNeo && "bg-cyan-500/15 text-cyan-400 border-cyan-500/40 font-mono"
                )}>
                  {shopName}
                </Badge>
                <span className="text-xs text-muted-foreground">• Agendamento Online</span>
              </div>
              <h3 className="text-xl font-black tracking-tight">
                {step === 1 && "1. Escolha o Serviço"}
                {step === 2 && "2. Data & Horário"}
                {step === 3 && "3. Seus Dados"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Experiência de reserva rápida sem fricção integrada ao Cluberize.
              </p>
            </div>

            {/* Passo 1 */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Scissors className="size-3.5 text-primary" />
                    <span>Selecione o Procedimento</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { name: "Corte Signature & Barboterapia", time: "50 min", price: "R$ 95,00" },
                      { name: "Design de Barba com Toalha Quente", time: "35 min", price: "R$ 60,00" },
                      { name: "Tratamento Capilar & Revitalização", time: "45 min", price: "R$ 130,00" },
                      { name: "Experiência Completa VIP Club", time: "80 min", price: "R$ 180,00" },
                    ].map((srv) => (
                      <button
                        key={srv.name}
                        type="button"
                        onClick={() => setSelectedService(srv.name)}
                        className={cn(
                          "w-full p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer",
                          selectedService === srv.name
                            ? isNoir ? "bg-amber-500/15 border-amber-500 text-amber-200 font-bold"
                              : isMaison ? "bg-[#f2e7e1] border-[#cbb1a3] text-stone-950 font-bold shadow-xs"
                              : "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            : "border-border/60 hover:bg-muted/40"
                        )}
                      >
                        <div>
                          <p className="font-extrabold">{srv.name}</p>
                          <p className="text-[10px] text-muted-foreground">{srv.time}</p>
                        </div>
                        <span className="font-mono font-bold">{srv.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className={cn(
                    "w-full h-11 rounded-2xl text-xs font-black gap-2 shadow-md cursor-pointer",
                    isNoir && "bg-amber-500 hover:bg-amber-400 text-neutral-950",
                    isMaison && "bg-stone-900 hover:bg-stone-800 text-white",
                    isNeo && "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-cyan-500/20 font-mono"
                  )}
                >
                  <span>Continuar para Horários</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}

            {/* Passo 2 */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    <span>Horários de Hoje</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["09:00", "10:30", "11:15", "14:00", "15:30", "16:45", "18:00", "19:30"].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer",
                          selectedTime === time
                            ? isNoir ? "bg-amber-500 border-amber-500 text-neutral-950 shadow-md"
                              : isMaison ? "bg-stone-900 border-stone-900 text-white shadow-md"
                              : "bg-cyan-500 border-cyan-400 text-neutral-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                            : "border-border/60 hover:bg-muted/40"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-bold truncate max-w-[200px]">{selectedService}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-2xl text-xs font-bold">
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className={cn(
                      "flex-1 h-11 rounded-2xl text-xs font-black gap-2 cursor-pointer",
                      isNoir && "bg-amber-500 hover:bg-amber-400 text-neutral-950",
                      isMaison && "bg-stone-900 hover:bg-stone-800 text-white",
                      isNeo && "bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-mono"
                    )}
                  >
                    <span>Preencher Dados</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 3 */}
            {step === 3 && (
              <form onSubmit={handleFinish} className="space-y-4 animate-in fade-in">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Seu Nome Completo *</label>
                    <input
                      required
                      placeholder="Ex: Gustavo Alencar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 rounded-xl px-3 text-xs border border-border bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">WhatsApp para Confirmação *</label>
                    <input
                      required
                      placeholder="(11) 98833-2211"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 rounded-xl px-3 text-xs border border-border bg-background font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário Marcado:</span>
                    <span className="font-bold font-mono">Hoje às {selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lembrete Automático:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="size-3" />
                      Ativo via WhatsApp Bot
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-2xl text-xs font-bold">
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className={cn(
                      "flex-1 h-11 rounded-2xl text-xs font-black shadow-md cursor-pointer",
                      isNoir && "bg-amber-500 hover:bg-amber-400 text-neutral-950",
                      isMaison && "bg-stone-900 hover:bg-stone-800 text-white",
                      isNeo && "bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-mono"
                    )}
                  >
                    Confirmar Agendamento
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
            <div className={cn(
              "size-16 mx-auto rounded-3xl flex items-center justify-center shadow-xl",
              isNoir && "bg-amber-500/20 text-amber-400 border border-amber-500/40",
              isMaison && "bg-rose-500/15 text-rose-700 border border-rose-300",
              isNeo && "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.3)]"
            )}>
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-foreground">Agendamento Confirmado!</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Obrigado, <strong className="text-foreground">{name || "Cliente"}</strong>! Você receberá uma notificação no WhatsApp com o horário de <strong className="text-foreground">{selectedTime}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>Sincronizado automaticamente com a Agenda Cluberize</span>
            </div>

            <Button
              onClick={() => { onClose(); setTimeout(handleReset, 300); }}
              className={cn(
                "w-full rounded-2xl text-xs font-black h-11",
                isNoir && "bg-amber-500 text-neutral-950",
                isMaison && "bg-stone-900 text-white",
                isNeo && "bg-cyan-500 text-neutral-950 font-mono"
              )}
            >
              Fechar Demonstração
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
