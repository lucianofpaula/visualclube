"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Zap, 
  Flame, 
  Scissors, 
  Terminal, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Compass, 
  Activity,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TemplateProps {
  onOpenBooking: () => void
}

export function TemplateNeoTokyo({ onOpenBooking }: TemplateProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  return (
    <div className="min-h-screen bg-[#05060a] text-[#f1f5f9] selection:bg-cyan-500 selection:text-black font-mono antialiased overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1526_1px,transparent_1px),linear-gradient(to_bottom,#0e1526_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10">
        {/* ─────────────────────────────────────────────────────────────
            1. TECH NAVBAR
        ───────────────────────────────────────────────────────────── */}
        <header className="border-b border-cyan-500/20 bg-[#070912]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <div className="size-full bg-[#070912] rounded-[11px] flex items-center justify-center text-cyan-400">
                  <Zap className="size-5" />
                </div>
              </div>
              <div>
                <span className="font-sans font-black tracking-widest text-lg uppercase bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent block">
                  CYBER BLADE //
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-400/80 block">
                  NEO-TOKYO GROOMING LAB • 2026
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider text-slate-400">
              <a href="#lab" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <span className="text-cyan-500">//</span> 01. O Lab
              </a>
              <a href="#protocolos" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <span className="text-cyan-500">//</span> 02. Protocolos
              </a>
              <a href="#crew" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <span className="text-cyan-500">//</span> 03. Squad
              </a>
              <a href="#pass" className="hover:text-fuchsia-400 text-fuchsia-400 font-bold flex items-center gap-1">
                <span className="text-fuchsia-500">//</span> 04. Cyber Pass
              </a>
            </nav>

            <Button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-black font-black text-xs uppercase tracking-widest h-11 px-6 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-105 cursor-pointer font-sans"
            >
              <Radio className="size-4 animate-pulse" />
              <span>Book Slot</span>
            </Button>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION CYBERPUNK CHIC
        ───────────────────────────────────────────────────────────── */}
        <section className="pt-16 pb-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono">
                <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                <span>STATUS: OPERACIONAL • SLOTS AO VIVO</span>
              </div>

              <h1 className="font-sans text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[0.98] text-white">
                Precisão <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">Cirúrgica</span>. <br />
                Design Urbano de Elite.
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 font-sans font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                Skin fades milimétricos com geometria avançada, barboterapia por indução térmica e tratamentos capilares de alta performance. O futuro da barbearia é agora.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2 font-sans">
                <Button
                  onClick={onOpenBooking}
                  className="w-full sm:w-auto h-13 px-8 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.4)] gap-3 cursor-pointer"
                >
                  <span>Reservar Atendimento</span>
                  <ArrowRight className="size-4" />
                </Button>

                <a
                  href="#protocolos"
                  className="w-full sm:w-auto h-13 px-7 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-[#0b0f1a] text-slate-300 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Cpu className="size-4 text-cyan-400" />
                  <span>Ver Protocolos</span>
                </a>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center lg:justify-start gap-8 text-xs font-mono">
                <div>
                  <strong className="block text-xl font-black text-cyan-400">0.1mm</strong>
                  <span className="text-[10px] text-slate-400 uppercase">Tolerância Fade</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <strong className="block text-xl font-black text-violet-400">100%</strong>
                  <span className="text-[10px] text-slate-400 uppercase">Navalhas Japonesas</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <strong className="block text-xl font-black text-fuchsia-400">4.98★</strong>
                  <span className="text-[10px] text-slate-400 uppercase">Rating na Rede</span>
                </div>
              </div>
            </div>

            {/* Visual Cyber Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-1 bg-gradient-to-b from-cyan-500/40 via-violet-500/20 to-transparent shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                <div className="rounded-[22px] overflow-hidden bg-[#0a0d18] border border-cyan-500/30 relative">
                  <img
                    src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80"
                    alt="Cyber Blade Studio"
                    className="w-full h-[460px] object-cover filter contrast-125 brightness-90 hover:scale-105 transition-transform duration-700"
                  />

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-400">
                    // SOHO_UNIT_01
                  </div>

                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#070912]/90 backdrop-blur-md border border-cyan-500/30 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white font-sans">Barboterapia a Laser & Ozônio</span>
                      <span className="text-[10px] text-cyan-400 font-mono">35 MIN</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">Higienização térmica com nano vapor e hidratação profunda.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. PROTOCOLOS & MENU DE SERVIÇOS
        ───────────────────────────────────────────────────────────── */}
        <section id="protocolos" className="py-24 border-t border-cyan-500/20 bg-[#070912]/90">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs text-cyan-400 font-mono uppercase block mb-1">
                  // PROTOCOLOS DE EXECUÇÃO
                </span>
                <h2 className="font-sans text-3xl sm:text-4xl font-black uppercase text-white">
                  Menu de Procedimentos
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-400">Slots Disponíveis Hoje</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
              {[
                {
                  code: "MOD-01",
                  title: "Cyber Fade & Geometria Capilar",
                  desc: "Degradê cirúrgico na máquina de alta rotação + tesoura japonesa e alinhamento de contorno a laser.",
                  time: "45 MIN",
                  price: "R$ 85,00",
                },
                {
                  code: "MOD-02",
                  title: "Barboterapia Térmica & Navalhado",
                  desc: "Vapor de ozônio, hidratação de barba com sérum de carvão ativado e lâmina de precisão.",
                  time: "35 MIN",
                  price: "R$ 65,00",
                },
                {
                  code: "MOD-03",
                  title: "Combo Full Armor: Corte + Barba",
                  desc: "Corte completo + Barboterapia completa + Massagem craniana com revitalizante mentolado.",
                  time: "75 MIN",
                  price: "R$ 140,00",
                },
                {
                  code: "MOD-04",
                  title: "Pigmentação HD & Camuflagem",
                  desc: "Preenchimento de falhas na barba e cabelo com micropigmentação temporária de alta densidade.",
                  time: "30 MIN",
                  price: "R$ 70,00",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0c101c] border border-cyan-500/20 hover:border-cyan-500/60 transition-all duration-200 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                        {item.code}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{item.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="font-mono text-xl font-bold text-cyan-300">{item.price}</span>
                    <Button
                      onClick={onOpenBooking}
                      size="sm"
                      className="bg-cyan-500/20 hover:bg-cyan-400 hover:text-black text-cyan-300 font-bold text-xs uppercase tracking-wider rounded-xl px-5 h-9 border border-cyan-500/40 transition-colors"
                    >
                      Agendar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. CYBER PASS (ASSINATURA VIP RECORRENTE)
        ───────────────────────────────────────────────────────────── */}
        <section id="pass" className="py-24 border-t border-cyan-500/20 bg-[#05060a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-fuchsia-500/40 bg-gradient-to-br from-[#130d22] via-[#090b14] to-[#060810] p-8 sm:p-14 relative overflow-hidden shadow-[0_0_60px_rgba(217,70,239,0.15)]">
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-mono">
                  <Flame className="size-3.5 text-fuchsia-400" />
                  <span>SUBSCRIPTION MEMBERSHIP</span>
                </div>

                <h2 className="font-sans text-3xl sm:text-5xl font-black uppercase text-white leading-tight">
                  CYBER PASS // <br />
                  <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Acesso Ilimitado ao Lab
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 font-sans font-light leading-relaxed">
                  Corte e barba sempre no padrão máximo. Agendamento prioritário sem filas, 1 chopp IPA cortesia em toda sessão e 15% OFF em produtos streetwear.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-sans">
                  {[
                    "Cortes ilimitados no mês",
                    "Barba completa a cada 15 dias",
                    "Acesso prioritário via App",
                    "Chopp cortesia ilimitado",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="size-4 text-fuchsia-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 font-sans">
                  <Button
                    onClick={onOpenBooking}
                    className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(217,70,239,0.3)] cursor-pointer"
                  >
                    Ativar Cyber Pass • R$ 179/mês
                  </Button>
                  <span className="text-xs text-slate-400 font-mono">Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. FOOTER
        ───────────────────────────────────────────────────────────── */}
        <footer className="border-t border-cyan-500/20 bg-[#040508] py-16 text-xs text-slate-400 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-3 font-sans">
              <span className="font-black text-lg text-white uppercase tracking-widest block">
                CYBER BLADE //
              </span>
              <p className="text-slate-400 font-light leading-relaxed text-xs">
                O laboratório urbano definitivo de cortes e barboterapia de alta performance.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">// LOCALIZAÇÃO</h4>
              <p className="text-slate-400 leading-relaxed font-sans text-xs">
                Rua Augusta, 2100 • Consolação, São Paulo - SP
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3">// HORÁRIOS</h4>
              <p className="text-slate-400 leading-relaxed">
                Seg a Sáb: 10:00 - 22:00 <br />
                Dom: 12:00 - 18:00
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <Button
                onClick={onOpenBooking}
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-widest rounded-xl h-11"
              >
                Agendar Agora
              </Button>
              <p className="text-[10px] text-slate-400 text-center font-mono">
                Engine by <strong className="text-white">Cluberize</strong>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
