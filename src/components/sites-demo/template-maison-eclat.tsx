"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Sparkles, 
  Heart, 
  Star, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Check, 
  Flower2, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight,
  Smile,
  Eye,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TemplateProps {
  onOpenBooking: () => void
}

export function TemplateMaisonEclat({ onOpenBooking }: TemplateProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "hair" | "color" | "spa" | "makeup">("hair")

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d2926] selection:bg-[#e0b0a8] selection:text-white font-sans antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER EDITORIAL MINIMALISTA (VOGUE PARIS STYLE)
      ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#ece6de] bg-[#faf8f5]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#3d312a] text-[#f7f2ea] flex items-center justify-center font-serif text-lg font-normal tracking-wider">
              M
            </div>
            <div>
              <span className="font-serif tracking-[0.25em] text-xl font-medium uppercase text-[#2b2420] block">
                Maison Éclat
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#a3806c] font-medium block">
                Haute Coiffure & Botanical Spa • Paris / SP
              </span>
            </div>
          </div>

          {/* Menu */}
          <nav className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.25em] font-medium text-[#736357]">
            <a href="#conceito" className="hover:text-[#2b2420] transition-colors">O Conceito</a>
            <a href="#servicos" className="hover:text-[#2b2420] transition-colors">Menu de Rituais</a>
            <a href="#transformacoes" className="hover:text-[#2b2420] transition-colors">Transformações</a>
            <a href="#assinatura" className="hover:text-[#a3806c] text-[#a3806c] font-bold">Clube Éclat</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={onOpenBooking}
              className="bg-[#2b2420] hover:bg-[#423832] text-[#f7f2ea] text-xs uppercase tracking-[0.15em] font-bold h-11 px-7 rounded-full shadow-md gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Calendar className="size-3.5" />
              <span>Agendar Horário</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION EDITORIAL & SENSORIAL
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ebdcd3] bg-[#f5ebe6] text-[#8c5e4d] text-[11px] uppercase tracking-[0.2em] font-semibold">
              <Flower2 className="size-3.5 text-[#b07865]" />
              <span>Alta Performance & Beleza Orgânica</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-light leading-[1.05] tracking-tight text-[#2b2420]">
              A arte de realçar sua beleza com <span className="italic font-serif text-[#a36854]">naturalidade</span> e sofisticação.
            </h1>

            <p className="text-sm sm:text-base text-[#6e5e54] font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              Especialistas em mechas francesas, morenas iluminadas e terapias botânicas de recuperação capilar. Um refúgio sensorial no coração da cidade.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Button
                onClick={onOpenBooking}
                className="w-full sm:w-auto h-13 px-8 rounded-full bg-[#2b2420] hover:bg-[#3d342f] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#2b2420]/15 gap-3 cursor-pointer"
              >
                <span>Agendar Consulta</span>
                <ArrowRight className="size-4" />
              </Button>

              <a
                href="#servicos"
                className="w-full sm:w-auto h-13 px-7 rounded-full border border-[#d6c7ba] hover:border-[#2b2420] bg-transparent text-[#2b2420] text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center transition-colors"
              >
                <span>Ver Menu de Serviços</span>
              </a>
            </div>

            <div className="pt-6 border-t border-[#ebdcd3] flex items-center justify-center lg:justify-start gap-8 text-xs text-[#736357]">
              <div>
                <strong className="block font-serif text-2xl font-normal text-[#2b2420]">+8.500</strong>
                <span className="text-[10px] uppercase tracking-wider">Cabelos Transformados</span>
              </div>
              <div className="h-8 w-px bg-[#ebdcd3]" />
              <div>
                <strong className="block font-serif text-2xl font-normal text-[#2b2420]">5.0 ★</strong>
                <span className="text-[10px] uppercase tracking-wider">Avaliação Média</span>
              </div>
              <div className="h-8 w-px bg-[#ebdcd3]" />
              <div>
                <strong className="block font-serif text-2xl font-normal text-[#2b2420]">100%</strong>
                <span className="text-[10px] uppercase tracking-wider">Produtos Cruelty-free</span>
              </div>
            </div>
          </div>

          {/* Grid de Imagens Editorial */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <div className="rounded-[2.5rem] overflow-hidden shadow-xl border border-[#ebdcd3] h-64 sm:h-80">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&auto=format&fit=crop&q=80"
                  alt="Maison Éclat Interior"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-5 rounded-3xl bg-[#f2e7e1] border border-[#e6d3c8] text-center space-y-1">
                <span className="font-serif text-lg font-bold text-[#2b2420]">Atendimento Exclusivo</span>
                <p className="text-[11px] text-[#736357]">Apenas 4 clientes simultâneos por estilista</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-5 rounded-3xl bg-[#2b2420] text-[#f7f2ea] text-center space-y-1">
                <Sparkles className="size-5 text-[#dfb8a6] mx-auto mb-1" />
                <span className="font-serif text-lg font-bold">Spa Capilar Botânico</span>
                <p className="text-[11px] text-[#d6c7ba]">Argiloterapia & Massagem Craniana</p>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden shadow-xl border border-[#ebdcd3] h-64 sm:h-80">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&auto=format&fit=crop&q=80"
                  alt="Hair Transformation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. RITUAIS & MENU DE SERVIÇOS
      ───────────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-24 border-t border-[#ece6de] bg-[#f5f1eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#a36854]">
              Nosso Cardápio Sensorial
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#2b2420]">
              Rituais pensados para realçar sua essência
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "French Balayage & Morena Iluminada",
                desc: "Técnica francesa de clareamento à mão livre com transição ultra suave e acabamento luminoso natural.",
                time: "180 min",
                price: "A partir de R$ 480,00",
                tag: "Assinatura",
              },
              {
                title: "Corte Editorial & Visagismo Feminino",
                desc: "Lavagem terapêutica com massagem craniana, corte estruturado e finalização com ondas de passarela.",
                time: "60 min",
                price: "R$ 160,00",
                tag: "Popular",
              },
              {
                title: "Ritual Spa Couro Cabeludo & Detox",
                desc: "Esfoliação com microesferas de jojoba, vapor de ozônio, argila vulcânica e máscara nutritiva de argan.",
                time: "75 min",
                price: "R$ 220,00",
                tag: "Sensorial",
              },
              {
                title: "Tratamento de Blindagem & Reconstrução",
                desc: "Reposição proteica profunda com aminoácidos botânicos para fios sensibilizados ou pós-química.",
                time: "50 min",
                price: "R$ 190,00",
                tag: "Recuperação",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-[#faf8f5] border border-[#e6ddd2] hover:border-[#a36854]/40 transition-all duration-300 hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#f2e7e1] text-[#8c5e4d]">
                      {item.tag}
                    </span>
                    <span className="text-xs text-[#736357] font-mono">{item.time}</span>
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[#2b2420]">{item.title}</h3>
                  <p className="text-xs text-[#6e5e54] font-light leading-relaxed">{item.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#ebdcd3]">
                  <span className="font-serif text-lg font-bold text-[#2b2420]">{item.price}</span>
                  <Button
                    onClick={onOpenBooking}
                    size="sm"
                    className="rounded-full bg-[#2b2420] hover:bg-[#423832] text-white text-xs uppercase tracking-wider px-5 h-9"
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
          4. CLUBE ÉCLAT (ASSINATURA VIP FEMININA)
      ───────────────────────────────────────────────────────────── */}
      <section id="assinatura" className="py-24 border-t border-[#ece6de] bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[3rem] bg-gradient-to-br from-[#f2e7e1] via-[#f7efe9] to-[#ebdcd3] p-8 sm:p-14 border border-[#e0cbbf] shadow-xl">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#2b2420] text-white text-[11px] uppercase tracking-widest font-bold">
                <Crown className="size-3.5 text-[#dfb8a6]" />
                <span>Assinatura Beauty Club</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#2b2420] leading-tight">
                Cabelos impecáveis toda semana com o <span className="italic font-serif text-[#8c5e4d]">Club Éclat</span>.
              </h2>

              <p className="text-xs sm:text-sm text-[#6e5e54] font-light leading-relaxed">
                Escovas semanais, hidratações profundas quinzenais e 20% de desconto em procedimentos químicos e mechas. Uma rotina de beleza contínua sem surpresas no orçamento.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "4 Escovas & Modelagens por mês",
                  "2 Rituais de Hidratação Profunda",
                  "Prioridade na escolha de horários",
                  "Taça de espumante em todas as visitas",
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#2b2420] font-medium">
                    <CheckCircle2 className="size-4 text-[#8c5e4d] shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Button
                  onClick={onOpenBooking}
                  className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#2b2420] hover:bg-[#3d342f] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-md cursor-pointer"
                >
                  Fazer Parte do Club • R$ 269/mês
                </Button>
                <span className="text-xs text-[#736357]">Cancele a qualquer momento sem carência</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER COM CONTATO
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#ece6de] bg-[#241e1a] text-[#d6c7ba] py-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <span className="font-serif text-xl font-normal text-white uppercase tracking-[0.2em] block">
              Maison Éclat
            </span>
            <p className="font-light text-[#9e8b7d] leading-relaxed">
              O espaço onde beleza e bem-estar se encontram em harmonia com a natureza e o cuidado pessoal.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">Endereço</h4>
            <p className="font-light text-[#9e8b7d] leading-relaxed flex items-start gap-2">
              <MapPin className="size-4 text-[#dfb8a6] shrink-0 mt-0.5" />
              <span>Rua Oscar Freire, 1420 • Jardins, São Paulo - SP</span>
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-3">Horários</h4>
            <p className="font-light text-[#9e8b7d] leading-relaxed">
              Terça a Sábado: 09:00 às 20:00 <br />
              Domingos e Segundas: Fechado
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onOpenBooking}
              className="w-full rounded-full bg-[#dfb8a6] hover:bg-[#c9a391] text-[#241e1a] font-bold text-xs uppercase tracking-wider h-11"
            >
              Agendar Visita Online
            </Button>
            <p className="text-[10px] text-[#9e8b7d] text-center">
              Powered by <strong className="text-white">Cluberize SaaS</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
