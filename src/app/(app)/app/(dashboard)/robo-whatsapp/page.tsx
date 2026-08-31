"use client"

import * as React from "react"
import { MessageSquare, Bot, Sparkles, CheckCircle2, PhoneCall, Zap, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"

export default function RoboWhatsAppPage() {
  return (
    <LockedFeatureGuard featureName="Robô de WhatsApp & Confirmações" requiredFeature="robo_whatsapp">
      <div className="space-y-6 max-w-5xl">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-bold">
                <Sparkles className="h-3 w-3 mr-1" />
                Automação Inteligente
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-emerald-500" />
              Robô de WhatsApp & Lembretes
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Envio automático de lembretes 2h antes, confirmação de presença e redução de faltas.
            </p>
          </div>
        </div>

        {/* Status / Configurações do Bot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 rounded-3xl border-border/60 bg-card p-6 space-y-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-500" />
                <span>Instância do WhatsApp Conectada</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Seu número está pronto para disparar notificações automáticas para os clientes.
              </CardDescription>
            </CardHeader>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <strong className="block font-extrabold">Disparador Ativo 24/7</strong>
                <span>Os lembretes são enviados automaticamente 2 horas antes de cada agendamento.</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                Gatilhos de Notificação Ativos:
              </h4>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <div>
                      <strong className="text-foreground block">Lembrete Automático (2h antes)</strong>
                      <span className="text-[11px] text-muted-foreground">Envia mensagem com horário, serviço e nome do profissional.</span>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">Ativo</Badge>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-indigo-500" />
                    <div>
                      <strong className="text-foreground block">Confirmação de Presença no WhatsApp</strong>
                      <span className="text-[11px] text-muted-foreground">Botões rápidos "Confirmar" ou "Reagendar" direto no app.</span>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">Ativo</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-border/60 bg-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-emerald-500" />
                <span>Estatísticas de Impacto</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Métricas estimadas de comparecimento com o robô de lembrete ativo.
              </p>

              <div className="pt-2 space-y-2">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-center">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">-85%</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">Redução de no-shows (faltas)</span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-center">
                  <span className="text-2xl font-black text-foreground block">98%</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">Taxa de abertura de mensagens</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </LockedFeatureGuard>
  )
}
