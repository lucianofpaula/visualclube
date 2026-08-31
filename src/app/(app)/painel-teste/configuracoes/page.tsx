"use client"

import * as React from "react"
import { useState } from "react"
import { Settings, MessageSquare, Building2, QrCode, Clock, ShieldCheck, Save, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ConfiguracoesPage() {
  const [salvo, setSalvo] = useState(false)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Configurações do Espaço
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Dados cadastrais, chave PIX, horários de funcionamento e integração com WhatsApp.
          </p>
        </div>

        <Button
          onClick={() => {
            setSalvo(true)
            setTimeout(() => setSalvo(false), 2000)
          }}
          className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {salvo ? "Salvo com Sucesso!" : "Salvar Alterações"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Dados do Estabelecimento */}
        <Card className="p-6 rounded-3xl border-border/60 bg-card/80 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-sm text-foreground">Identificação do Estabelecimento</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground">Nome Comercial:</label>
              <Input defaultValue="Barbearia Imperial Premium" className="mt-1" />
            </div>
            <div>
              <label className="font-semibold text-muted-foreground">Link da Bio / Agendamento:</label>
              <Input defaultValue="visualclube.com.br/b/barbearia-imperial" className="mt-1" />
            </div>
            <div>
              <label className="font-semibold text-muted-foreground">Chave PIX Oficial:</label>
              <Input defaultValue="financeiro@barbeariaimperial.com" className="mt-1" />
            </div>
            <div>
              <label className="font-semibold text-muted-foreground">WhatsApp de Notificações:</label>
              <Input defaultValue="(11) 98765-4321" className="mt-1" />
            </div>
          </div>
        </Card>

        {/* Robô do WhatsApp */}
        <Card className="p-6 rounded-3xl border-border/60 bg-card/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              <h3 className="font-extrabold text-sm text-foreground">Robô de WhatsApp Anti-NoShow</h3>
            </div>
            <Badge variant="success">Conectado na Nuvem</Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            O robô envia mensagens automáticas com o nome da barbearia solicitando confirmação de presença com 1 toque.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
              <div>
                <div className="font-bold text-foreground">Lembrete de 24 horas antes</div>
                <div className="text-[11px] text-muted-foreground">Envia mensagem pedindo confirmação de presença no dia anterior.</div>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
              <div>
                <div className="font-bold text-foreground">Lembrete de 2 horas antes</div>
                <div className="text-[11px] text-muted-foreground">Envia lembrete com localização e endereço no dia do atendimento.</div>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
