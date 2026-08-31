"use client"

import * as React from "react"
import { Star, Quote, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rodrigo Sanches",
      role: "Fundador da Barber House Premium",
      business: "Barbearia • 6 Barbeiros • SP",
      comment:
        "O robô de WhatsApp do VisualClube praticamente zerou as faltas de sexta e sábado. E a comanda com cerveja e pomada aumentou nosso faturamento em quase 40%. Não troco por nada.",
      rating: 5,
      avatarBg: "bg-amber-600",
      initials: "RS",
    },
    {
      name: "Mariana Vasconcelos",
      role: "Proprietária do Studio Glow Beleza & Estética",
      business: "Salão & Estética • 11 Profissionais • RJ",
      comment:
        "Antes eu passava o domingo inteiro fechando folha de comissão no Excel. Com o VisualClube, o repasse de cada cabeleireira e manicure é gerado com um clique no PIX. Mudou minha vida.",
      rating: 5,
      avatarBg: "bg-purple-600",
      initials: "MV",
    },
    {
      name: "Felipe Albuquerque",
      role: "Sócio da Rede Don Mustache",
      business: "3 Unidades de Barbearia • PR",
      comment:
        "O módulo de Clube de Assinatura nos gerou uma receita recorrente de mais de R$ 28 mil fixos todo início de mês. Os clientes adoram poder cortar quando quiserem com pagamento automático.",
      rating: 5,
      avatarBg: "bg-emerald-600",
      initials: "FA",
    },
  ]

  return (
    <section className="py-20 sm:py-28 bg-muted/20 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-primary/30 text-primary">
            Casos Reais
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Quem usa o VisualClube não volta para o papel
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Mais de 2.400 barbearias, salões e clínicas já modernizaram o atendimento em todo o Brasil.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="relative bg-card/80 backdrop-blur-md border-border/60 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-foreground leading-relaxed italic mb-6">
                  "{t.comment}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-border/60">
                <div className={`h-11 w-11 rounded-2xl ${t.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    {t.name}
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                  <div className="text-[11px] text-primary font-medium">{t.business}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
