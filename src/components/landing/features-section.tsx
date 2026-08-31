"use client"

import * as React from "react"
import { 
  CalendarCheck, 
  Receipt, 
  Wallet, 
  Users, 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Repeat
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function FeaturesSection() {
  const features = [
    {
      icon: CalendarCheck,
      badge: "24/7 Online",
      badgeVariant: "success" as const,
      title: "Agendamento Inteligente & Link Próprio",
      description:
        "Seus clientes agendam pelo link no Instagram ou Google sem precisar ligar ou esperar resposta. Sincronização em tempo real de horários livres.",
    },
    {
      icon: Receipt,
      badge: "Diferencial",
      badgeVariant: "gold" as const,
      title: "Comandas Digitais & Bar Integrado",
      description:
        "Abra comandas por cadeira ou comanda física. Lance cortes, cervejas, cafés e cosméticos. O sistema faz o split automático no fechamento.",
    },
    {
      icon: MessageSquare,
      badge: "WhatsApp",
      badgeVariant: "success" as const,
      title: "Robô de Confirmação & Anti No-Show",
      description:
        "Lembretes automáticos enviados no WhatsApp do cliente 24h e 2h antes do horário. O cliente confirma ou desmarca com 1 toque.",
    },
    {
      icon: Wallet,
      badge: "Financeiro",
      badgeVariant: "default" as const,
      title: "Fluxo de Caixa & Split de Pagamento",
      description:
        "Receba via PIX ou Cartão e veja as comissões calculadas na hora. DRE simples, previsão de faturamento e extrato por método de pagamento.",
    },
    {
      icon: Users,
      badge: "Equipe",
      badgeVariant: "purple" as const,
      title: "Comissões & Relatório por Profissional",
      description:
        "Chega de perder horas calculando comissões no fim do mês. Relatório transparente onde cada profissional acompanha seus ganhos pelo próprio celular.",
    },
    {
      icon: Repeat,
      badge: "Recorrência",
      badgeVariant: "gold" as const,
      title: "Clube VIP & Assinatura Mensal",
      description:
        "Crie planos mensais (ex: R$ 119/mês para cortes ilimitados). Cobrança automática no cartão do cliente e receita previsível todo dia 1º.",
    },
  ]

  return (
    <section id="recursos" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-primary/30 text-primary">
            Módulos Completos
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Tudo o que seu negócio precisa em uma única plataforma
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Esqueça sistemas complicados com dezenas de botões inúteis. O VisualClube foi desenhado para ser rápido, direto e bonito.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <Card
                key={idx}
                className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-card/60 backdrop-blur-md"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant={feat.badgeVariant} className="text-[10px] font-semibold">
                      {feat.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">{feat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
