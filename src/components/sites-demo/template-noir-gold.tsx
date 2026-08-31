"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Scissors, 
  Crown, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Coffee, 
  Wine, 
  Flame, 
  Calendar,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TemplateProps {
  onOpenBooking: () => void
}

export function TemplateNoirGold({ onOpenBooking }: TemplateProps) {
  const [activeTab, setActiveTab] = useState<"cuts" | "beards" | "spa" | "vip">("cuts")

  return (
    <div className="min-h-screen bg-[#070709] text-[#f4f4f5] selection:bg-amber-500 selection:text-black font-sans antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR EXCLUSIVA & NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-amber-500/15 bg-[#0a0a0e]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Monograma */}
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
              RG
            </div>
            <div>
              <span className="font-serif tracking-widest text-lg sm:text-xl font-bold uppercase text-white block leading-none">
                Royal Gentleman
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-amber-400 font-semibold mt-1 block">
                Bespoke Barber Club • Est. 2019
              </span>
            </div>
          </div>

          {/* Links Centrais (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-semibold text-neutral-400">
            <a href="#experiencia" className="hover:text-amber-400 transition-colors">A Experiência</a>
            <a href="#servicos" className="hover:text-amber-400 transition-colors">Menu de Serviços</a>
            <a href="#mestres" className="hover:text-amber-400 transition-colors">Mestres</a>
            <a href="#clube" className="hover:text-amber-400 transition-colors text-amber-400 flex items-center gap-1">
              <Crown className="size-3" />
              <span>Clube VIP</span>
            </a>
          </nav>

          {/* Botão de Agendamento */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider h-11 px-6 rounded-2xl shadow-lg shadow-amber-500/20 gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Calendar className="size-4" />
              <span>Reservar Horário</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION CINEMATOGRÁFICO
      ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
        {/* Background Mesh Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent blur-[140px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(#amber-500_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna de Texto */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs uppercase tracking-widest font-bold">
              <Crown className="size-3.5 text-amber-400" />
              <span>A Essência do Cuidado Masculino de Elite</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-normal leading-[1.08] tracking-tight text-white">
              Mais que um corte. Uma declaração de <span className="italic font-serif bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">distinção</span>.
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              O ponto de encontro entre a precisão milimétrica da alfaiataria clássica britânica e a sofisticação da barboterapia moderna. Relaxe em nossas poltronas de couro legítimo enquanto degusta um whisky 12 anos.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Button
                onClick={onOpenBooking}
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 gap-3 cursor-pointer"
              >
                <span>Agendar Atendimento</span>
                <ArrowRight className="size-4" />
              </Button>

              <a
                href="#experiencia"
                className="w-full sm:w-auto h-13 px-7 rounded-2xl border border-neutral-800 hover:border-amber-500/40 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Conhecer o Espaço</span>
              </a>
            </div>

            {/* Badges de Autoridade */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <span className="font-serif text-2xl font-bold text-amber-400 block">+14.000</span>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Cortes Realizados</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-amber-400 block">4.9 ★</span>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Google Reviews</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-amber-400 block">100%</span>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Privacidade VIP</span>
              </div>
            </div>
          </div>

          {/* Coluna Visual: Card Fotográfico com Efeito Glass & Dourado */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Moldura Dourada Flutuante */}
              <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-br from-amber-500/40 via-amber-700/20 to-transparent blur-md -z-10" />
              
              <div className="relative rounded-[2rem] overflow-hidden border border-amber-500/30 bg-[#111116] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&auto=format&fit=crop&q=80"
                  alt="Royal Gentleman Barbershop"
                  className="w-full h-[480px] object-cover filter contrast-[1.05] brightness-90 hover:scale-105 transition-transform duration-700"
                />

                {/* Card Flutuante no Bottom */}
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#09090c]/90 backdrop-blur-md border border-amber-500/25 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Wine className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bar Exclusivo Cortesia</h4>
                      <p className="text-[11px] text-neutral-400">Single Malt, Café Espresso & Cerveja Artesanal</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-400/20 text-amber-300 border-none text-[10px] font-bold">
                    Incluso
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SEÇÃO "A EXPERIÊNCIA" (RITUAIS DE CUIDADO)
      ───────────────────────────────────────────────────────────── */}
      <section id="experiencia" className="py-24 border-t border-neutral-900 bg-[#09090c] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">
              O Padrão Royal Gentleman
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
              Quatro pilares de um atendimento incomparável
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-light">
              Cada minuto na nossa cadeira é planejado para desacelerar seu dia e restaurar sua presença.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Scissors,
                title: "Visagismo Personalizado",
                desc: "Análise da estrutura óssea e estilo de vida antes de passar a primeira tesoura.",
              },
              {
                icon: Flame,
                title: "Toalha Quente com Óleos",
                desc: "Ritual térmico com essência de cedro e eucalipto para abrir os poros e relaxar a pele.",
              },
              {
                icon: Wine,
                title: "Speakeasy Lounge",
                desc: "Desfrute de uma carta selecionada de whiskies escoceses e café torrado artesanalmente.",
              },
              {
                icon: ShieldCheck,
                title: "Lâminas Japonesas",
                desc: "Afiação tradicional em aço forjado para o barbear mais suave e preciso da sua vida.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#111117]/80 border border-neutral-800 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="size-13 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <item.icon className="size-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. MENU DE SERVIÇOS EM ESTILO ALFAIATARIA
      ───────────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-24 border-t border-neutral-900 bg-[#07070a] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-amber-400 block mb-1">
                Catálogo Selecionado
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
                Menu de Rituais & Cuidados
              </h2>
            </div>

            {/* Abas */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-bold">
              {[
                { id: "cuts", label: "Cortes" },
                { id: "beards", label: "Barboterapia" },
                { id: "spa", label: "Tratamentos" },
                { id: "vip", label: "Combos" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl transition-all uppercase tracking-wider text-[11px] cursor-pointer",
                    activeTab === tab.id
                      ? "bg-amber-400 text-black font-black shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Itens do Menu */}
          <div className="space-y-4">
            {[
              {
                title: "Royal Signature Haircut",
                desc: "Consultoria visagista completa, lavagem com massagem craniana, corte na tesoura e styling com pomada matte inglesa.",
                time: "45 min",
                price: "R$ 95,00",
                popular: true,
              },
              {
                title: "Barboterapia Tradicional com Navalha",
                desc: "Esfoliação facial, 2 toalhas quentes aromáticas, barbear clássico com espuma densa e hidratação com óleo de argan.",
                time: "40 min",
                price: "R$ 75,00",
                popular: false,
              },
              {
                title: "Experiência Completa: Corte + Barba + Spa",
                desc: "O ritual definitivo do cavalheiro. Inclui corte completo, barboterapia premium, máscara de carvão ativado e dose dupla de whisky.",
                time: "80 min",
                price: "R$ 160,00",
                popular: true,
              },
              {
                title: "Camuflagem de Fios Brancos (Barba ou Cabelo)",
                desc: "Pigmentação sutil e natural sem efeito artificial, preservando a masculinidade e jovialidade dos traços.",
                time: "30 min",
                price: "R$ 80,00",
                popular: false,
              },
            ].map((srv, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#0d0d12] border border-neutral-800/80 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {srv.title}
                    </h3>
                    {srv.popular && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] uppercase font-bold tracking-wider">
                        Mais Pedido
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">{srv.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/80 font-mono pt-1">
                    <Clock className="size-3" />
                    <span>Duração: {srv.time}</span>
                  </span>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                  <span className="font-serif text-2xl font-bold text-white tracking-tight">{srv.price}</span>
                  <Button
                    onClick={onOpenBooking}
                    size="sm"
                    className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-white font-bold text-xs uppercase tracking-wider rounded-xl px-5 h-9 transition-colors cursor-pointer"
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
          5. CLUBE VIP & ASSINATURA ("THE GENTLEMAN'S KEY")
      ───────────────────────────────────────────────────────────── */}
      <section id="clube" className="py-24 border-t border-neutral-900 bg-gradient-to-b from-[#09090c] to-[#060608] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-[#121118] via-[#0c0c10] to-[#07070a] p-8 sm:p-14 overflow-hidden shadow-2xl">
            {/* Efeito Card Black Gold */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                  <Crown className="size-3.5 text-amber-400" />
                  <span>Plano de Recorrência Mensal</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white leading-tight">
                  The Gentleman's Key: <br />
                  <span className="italic font-serif text-amber-400">Cortes & Barba Ilimitados</span>
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed max-w-lg">
                  Mantenha sua aparência impecável o mês inteiro sem se preocupar com valores individuais por visita. Prioridade na grade de horários, acesso ao lounge VIP e benefícios exclusivos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "Cortes ilimitados no mês",
                    "Barboterapia completa quinzenal",
                    "Prioridade máxima na agenda",
                    "1 Convidado cortesia por mês",
                    "Dose dupla no Bar Lounge",
                    "Desconto de 20% em produtos",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="size-4 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    onClick={onOpenBooking}
                    className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Assinar Membresia VIP • R$ 199/mês
                  </Button>
                  <span className="text-xs text-neutral-400 font-light">Sem taxa de adesão • Cancele quando quiser</span>
                </div>
              </div>

              {/* Cartão Black VIP Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm h-56 rounded-3xl bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border border-amber-500/40 p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 size-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="size-5 text-amber-400" />
                      <span className="font-serif text-sm uppercase tracking-widest text-white font-bold">
                        Royal Gentleman
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                      VIP PASS
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-neutral-400">Membro Exclusivo</span>
                    <p className="font-serif text-lg font-bold text-amber-200 tracking-wider">CARLOS E. SILVA</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-neutral-800 pt-3">
                    <span>MEMBER SINCE 2024</span>
                    <span className="text-amber-400 font-bold">UNLIMITED ACCESS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FOOTER COM MAPA & HORÁRIOS
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-900 bg-[#050507] py-16 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center font-serif">
                RG
              </div>
              <span className="font-serif text-base font-bold text-white uppercase tracking-widest">
                Royal Gentleman
              </span>
            </div>
            <p className="font-light text-neutral-400 leading-relaxed">
              Alta barbearia e cuidados masculinos sob medida para homens que valorizam seu tempo e imagem.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">Localização</h4>
            <p className="font-light text-neutral-400 leading-relaxed flex items-start gap-2">
              <MapPin className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Av. Brigadeiro Faria Lima, 3477 - 2º Andar • Itaim Bibi, São Paulo - SP</span>
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">Expediente</h4>
            <ul className="space-y-1.5 font-light">
              <li className="flex justify-between">
                <span>Segunda a Sexta:</span>
                <span className="text-white font-mono">08:00 - 21:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sábados:</span>
                <span className="text-white font-mono">08:00 - 20:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domingos:</span>
                <span className="text-amber-400">Sob agendamento VIP</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">Agendamento</h4>
            <Button
              onClick={onOpenBooking}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl h-10 shadow-md"
            >
              Agendar Horário Online
            </Button>
            <p className="text-[10px] text-neutral-400 text-center">
              Powered by <strong className="text-white">Cluberize SaaS</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
