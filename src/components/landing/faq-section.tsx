"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: "Como funciona o login por WhatsApp ou Email?",
      a: "No VisualClube, você e sua equipe podem fazer login tanto utilizando o e-mail tradicional quanto o número de WhatsApp cadastrado. A autenticação é segura, ágil e elimina o esquecimento de senhas.",
    },
    {
      q: "Preciso cadastrar cartão de crédito para testar?",
      a: "Não! Você tem 7 dias de teste completo e irrestrito. Não solicitamos cartão na hora do cadastro. Se gostar, escolhe o plano que melhor atende seu espaço.",
    },
    {
      q: "Como funciona a Comanda Digital com itens do Bar / Loja?",
      a: "Ao abrir a comanda para o cliente (ou quando ele chega pelo agendamento), qualquer pessoa com permissão pode adicionar serviços (ex: Corte de Cabelo), produtos para casa (ex: Pomada/Shampoo) e bebidas do bar (ex: Cerveja/Refrigerante). No fechamento, o sistema calcula na hora a comissão do profissional e o líquido que fica para o salão.",
    },
    {
      q: "O robô de confirmação pelo WhatsApp precisa de celular ligado?",
      a: "Não. A integração com o WhatsApp roda 100% na nuvem do VisualClube. As mensagens de lembrete (24h e 2h antes) e confirmação são disparadas automaticamente sem depender do seu aparelho estar conectado.",
    },
    {
      q: "Posso configurar comissões diferentes para cada profissional?",
      a: "Sim! Você pode definir porcentagens personalizadas tanto para serviços quanto para vendas de produtos (por exemplo: 50% em serviços para o barbeiro master, 40% para o júnior e 15% em produtos vendidos na recepção).",
    },
    {
      q: "Consigo criar planos de assinatura (Clube do Corte / Barba)?",
      a: "Sim. O módulo de Clube de Assinaturas permite que você cobre uma mensalidade fixa dos seus clientes fiéis via cartão de crédito recorrente ou PIX programado, garantindo faturamento previsível para seu espaço.",
    },
  ]

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-primary/30 text-primary">
            <HelpCircle className="h-3.5 w-3.5 mr-1" />
            Tire Suas Dúvidas
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Perguntas Frequentes
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Tudo o que você precisa saber antes de começar a usar o VisualClube.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden bg-card/60 backdrop-blur-md",
                  isOpen ? "border-primary/50 shadow-md bg-card/90" : "border-border/60 hover:border-border"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex items-center justify-between w-full p-5 sm:p-6 text-left font-bold text-base sm:text-lg text-foreground gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed animate-in fade-in-50 duration-200 border-t border-border/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Still Have Questions? */}
        <div className="mt-12 text-center p-6 rounded-3xl bg-muted/30 border border-border/60">
          <p className="text-sm text-foreground font-semibold">
            Ainda ficou com alguma dúvida sobre o seu espaço?
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Nosso time de especialistas está pronto para conversar no WhatsApp.
          </p>
          <a
            href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20tirar%20dúvidas%20sobre%20o%20VisualClube"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com Especialista no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
