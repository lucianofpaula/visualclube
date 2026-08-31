"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Scissors, 
  Sparkles, 
  Heart, 
  Flower2, 
  Eye, 
  Palette, 
  Check, 
  ArrowRight,
  TrendingUp,
  Receipt,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SegmentsProps {
  onOpenAuth: (mode?: "login" | "register") => void
}

export function SegmentsSection({ onOpenAuth }: SegmentsProps) {
  const [selectedSegment, setSelectedSegment] = useState(0)

  const segments = [
    {
      id: "barbershop",
      title: "Barbearias",
      icon: Scissors,
      tagline: "Do corte à cerveja gelada na comanda",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
      description:
        "Feito sob medida para o fluxo dinâmico da barbearia: comanda de bar/bebidas, comissão por barbeiro, clube de assinatura de corte/barba ilimitado e agendamento instantâneo no WhatsApp.",
      benefits: [
        "Comanda integrada com o Bar (Heineken, refrigerante, snacks e pomadas)",
        "Divisão automática de comissão por cadeira/barbeiro",
        "Clube VIP de Assinaturas (recorrência garantida todo mês)",
        "Bloqueio de horários e escala de folga flexível",
      ],
      metrics: "+42% na venda de itens de bar e produtos",
    },
    {
      id: "hair-salon",
      title: "Salões de Beleza",
      icon: Sparkles,
      tagline: "Gestão impecável de mechas, cortes e equipe",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
      description:
        "Elimine o caos das agendas simultâneas. Controle com precisão o tempo de química, lavatório, assistentes e comissões diferenciadas por tipo de serviço.",
      benefits: [
        "Agendamento simultâneo (cabelo + unha ao mesmo tempo)",
        "Rateio de comissão entre Cabeleireiro Titular e Assistente",
        "Ficha de anamnese e histórico de colorações da cliente",
        "Lembrete automático para retorno de mechas/hidratação",
      ],
      metrics: "-70% de faltas com lembretes automáticos",
    },
    {
      id: "nail-salon",
      title: "Esmalterias & Nail Designers",
      icon: Flower2,
      tagline: "Controle de tempo, esmaltes e nail art",
      color: "text-pink-500 bg-pink-500/10 border-pink-500/30",
      description:
        "Gerencie mesas de atendimento, manutenção de fibra de vidro, gel e cutilagem. Agendamentos organizados sem sobreposição de horários.",
      benefits: [
        "Controle de tempo exato por técnica (Gel, Fibra, Esmaltação em Gel)",
        "Cobrança de sinal/reserva via PIX para evitar horários vagos",
        "Histórico de preferências de cores e formatos da cliente",
        "Comissão transparente para cada manicure/designer",
      ],
      metrics: "Zero buracos na agenda nos finais de semana",
    },
    {
      id: "esthetics",
      title: "Clínicas de Estética & Spas",
      icon: Heart,
      tagline: "Pacotes de sessões, anamnese e recorrência",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
      description:
        "Controle pacotes de sessões (ex: 10 sessões de drenagem), evolução com fotos antes/depois, controle de salas/equipamentos e termos de consentimento.",
      benefits: [
        "Venda e controle de pacotes e planos de tratamento",
        "Ficha digital de avaliação e evolução estética",
        "Alocação de salas e equipamentos sem conflito",
        "Emissão simplificada de relatórios de faturamento",
      ],
      metrics: "+35% de vendas com pacotes recorrentes",
    },
    {
      id: "lash-eyebrow",
      title: "Lash & Sobrancelhas",
      icon: Eye,
      tagline: "Agilidade na manutenção e fidelização",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
      description:
        "Ideal para studios de extensão de cílios e micropigmentação. Alerte a cliente automaticamente quando a manutenção estiver próxima de vencer.",
      benefits: [
        "Alerta automático de manutenção aos 15 e 21 dias",
        "Catálogo visual de mapeamento (Lash Mapping) por cliente",
        "Link de agendamento personalizado no perfil do Instagram",
        "Recebimento de PIX com comprovante anexado",
      ],
      metrics: "Clientes retornam até 2x mais rápido",
    },
  ]

  const current = segments[selectedSegment]

  return (
    <section id="segmentos" className="py-20 sm:py-28 bg-muted/20 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-primary/30 text-primary">
            Especializado no Seu Ramo
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Feito para quem vive o dia a dia da beleza e estética
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Personalize fluxos, comandas, taxas de comissão e termos de acordo com a sua especialidade.
          </p>
        </div>

        {/* Horizontal Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 sm:pb-6 justify-start sm:justify-center no-scrollbar">
          {segments.map((seg, idx) => {
            const Icon = seg.icon
            const isSelected = selectedSegment === idx
            return (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(idx)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                  isSelected
                    ? "bg-card border-primary/50 text-foreground shadow-md ring-2 ring-primary/20 scale-[1.02]"
                    : "bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-card/70"
                )}
              >
                <div className={cn("p-1.5 rounded-xl border", seg.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{seg.title}</span>
              </button>
            )
          })}
        </div>

        {/* Selected Segment Highlight Card */}
        <div className="mt-8 rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Details Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {current.tagline}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Como o VisualClube transforma sua gestão de {current.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {current.description}
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {current.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/40">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-border/60">
                <Button
                  onClick={() => onOpenAuth("register")}
                  className="bg-primary text-primary-foreground font-semibold rounded-xl h-11 px-6 shadow-md"
                >
                  Começar com {current.title}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Impacto médio: {current.metrics}</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill Right */}
            <div className="lg:col-span-5 flex flex-col gap-4 bg-gradient-to-br from-muted/50 to-muted/20 p-6 rounded-2xl border border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Resultado no primeiro mês</span>
                <Badge variant="gold">Case Comprovado</Badge>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-card border border-border/60">
                  <div className="text-xs text-muted-foreground">Economia de tempo da recepção</div>
                  <div className="text-xl font-bold text-foreground">+18 horas / semana</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Robô do WhatsApp agenda sozinho</div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/60">
                  <div className="text-xs text-muted-foreground">Zero brigas de comissão</div>
                  <div className="text-xl font-bold text-foreground">100% automatizado</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Relatório diário com PIX instantâneo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
