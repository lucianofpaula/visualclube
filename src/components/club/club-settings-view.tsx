"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Settings, 
  Sparkles, 
  TrendingUp, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  Award
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { updateClubSettings } from "@/actions/club-actions"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ClubSettingsViewProps {
  initialSettings: {
    id: string
    clubEnabled?: boolean
    clubReferralEnabled?: boolean
    clubDirectReferral?: boolean
    clubIndirectReferral?: boolean
    clubReferralTerms?: string | null
  } | null
}

export function ClubSettingsView({ initialSettings }: ClubSettingsViewProps) {
  const [clubEnabled, setClubEnabled] = useState(initialSettings?.clubEnabled ?? true)
  const [clubReferralEnabled, setClubReferralEnabled] = useState(initialSettings?.clubReferralEnabled ?? false)
  const [clubDirectReferral, setClubDirectReferral] = useState(initialSettings?.clubDirectReferral ?? true)
  const [clubIndirectReferral, setClubIndirectReferral] = useState(initialSettings?.clubIndirectReferral ?? false)
  const [clubReferralTerms, setClubReferralTerms] = useState(initialSettings?.clubReferralTerms || "")

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await updateClubSettings({
        clubEnabled,
        clubReferralEnabled,
        clubDirectReferral,
        clubIndirectReferral,
        clubReferralTerms: clubReferralTerms.trim() || null,
      })

      if (res.success) {
        setFeedback({ success: true, message: "Configurações do clube atualizadas com sucesso!" })
      } else {
        setFeedback({ success: false, message: res.error || "Falha ao atualizar configurações." })
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err?.message || "Erro de conexão ao salvar." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/app/clube"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground inline-flex items-center justify-center")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="h-7 w-7 text-purple-500" />
              Configuração do Clube & Indicações
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Defina as regras gerais do clube de assinaturas e a ativação de comissionamento direto e multinível.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs self-end sm:self-auto"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            feedback.success
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Seção 1: Operação do Clube de Assinaturas */}
      <Card className="rounded-3xl border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Módulo de Clube de Assinaturas
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Habilita a venda e gestão de planos de recorrência para os seus clientes.
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={clubEnabled}
              onCheckedChange={setClubEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Quando o Clube de Assinaturas está <strong>Ativo</strong>, seus planos cadastrados podem ser contratados pelos clientes, liberando os agendamentos inclusos e gerando faturamento recorrente mensal. Se desativado, nenhum novo plano será oferecido no portal público.
          </p>
        </CardContent>
      </Card>

      {/* Seção 2: Programa de Indicação de Clientes (Direta & Multinível) */}
      <Card className="rounded-3xl border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Sistema de Indicação de Clientes
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Recompense seus clientes que indicarem amigos e familiares para assinar o clube.
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={clubReferralEnabled}
              onCheckedChange={setClubReferralEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-foreground leading-relaxed flex items-start gap-3">
            <Share2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground mb-0.5">Como funciona a bonificação?</p>
              Cada cliente possui um link de indicação próprio. Quando um novo cliente assina um plano através do link dele, o sistema pode comissionar o indicador direto e os níveis superiores da rede, de acordo com o que você configurar em cada plano.
            </div>
          </div>

          {clubReferralEnabled && (
            <div className="space-y-4 pt-2 animate-in fade-in-50 duration-200">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Modalidades de Indicação Permitidas
              </h4>

              {/* Opção 1: Indicação Direta */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card flex items-center justify-between shadow-2xs">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground cursor-pointer">
                      Indicação Direta (Nível 1)
                    </label>
                    <Badge className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold">
                      Recomendado
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    O cliente que indicou recebe a comissão de 1º nível sempre que o amigo pagar a mensalidade do plano.
                  </p>
                </div>
                <Switch
                  checked={clubDirectReferral}
                  onCheckedChange={setClubDirectReferral}
                />
              </div>

              {/* Opção 2: Indicação Indireta / Multinível */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card flex items-center justify-between shadow-2xs">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground cursor-pointer">
                      Indicação Indireta / Multinível (Níveis 2 em diante)
                    </label>
                    <Badge className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold">
                      Viralização
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Permite criar planos com múltiplos níveis de profundidade (Nível 2, 3, 4... N) onde o cliente também ganha quando os indicados dele indicarem outras pessoas.
                  </p>
                </div>
                <Switch
                  checked={clubIndirectReferral}
                  onCheckedChange={setClubIndirectReferral}
                />
              </div>

              {/* Diagrama Visual Didático */}
              <div className="p-5 rounded-2xl border border-border/60 bg-muted/20 space-y-3">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-500" />
                  Estrutura da Rede de Assinantes
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                    <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-[10px] font-black mb-1.5">
                      Nível 1 (Direto)
                    </Badge>
                    <p className="text-xs font-bold text-foreground">Indicador Imediato</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Amigo que compartilhou o link</p>
                  </div>

                  <div className={`p-3 rounded-xl border shadow-2xs transition-all ${
                    clubIndirectReferral ? "bg-card border-blue-500/40" : "bg-muted/40 border-dashed border-border opacity-50"
                  }`}>
                    <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] font-black mb-1.5">
                      Nível 2 (Indireto)
                    </Badge>
                    <p className="text-xs font-bold text-foreground">Upline Nível 2</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {clubIndirectReferral ? "Quem indicou o indicador" : "Desabilitado"}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border shadow-2xs transition-all ${
                    clubIndirectReferral ? "bg-card border-blue-500/40" : "bg-muted/40 border-dashed border-border opacity-50"
                  }`}>
                    <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] font-black mb-1.5">
                      Nível 3+ (Multinível)
                    </Badge>
                    <p className="text-xs font-bold text-foreground">Profundidade N</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {clubIndirectReferral ? "Níveis infinitos customizáveis por plano" : "Desabilitado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 3: Regras e Instruções para Clientes */}
      <Card className="rounded-3xl border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="text-base font-bold text-foreground">
            Termos & Instruções do Programa de Indicação
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Orientações adicionais que serão exibidas aos seus clientes no portal de membros.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <Textarea
            rows={3}
            placeholder="Ex: As comissões são creditadas no seu extrato todo dia 1º de cada mês e podem ser resgatadas via PIX ou convertidas em saldo para novos serviços e produtos."
            value={clubReferralTerms}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClubReferralTerms(e.target.value)}
            className="text-xs resize-none rounded-xl"
          />
          <p className="text-[11px] text-muted-foreground">
            Você pode definir prazos de carência, regras de resgate ou conversão em serviços no balcão.
          </p>
        </CardContent>
      </Card>

      {/* Botão Salvar no Rodapé */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary text-primary-foreground font-bold text-xs h-10 px-6 rounded-xl shadow-xs"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {loading ? "Salvando..." : "Salvar Configurações do Clube"}
        </Button>
      </div>
    </div>
  )
}
