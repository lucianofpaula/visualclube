"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  CreditCard, 
  KeyRound, 
  Webhook, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  FlaskConical, 
  Lock,
  Eye,
  EyeOff,
  HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { GatewayConfigDTO, savePlatformGatewayConfig, testMercadoPagoConnection } from "@/actions/gateway-actions"
import { cn } from "@/lib/utils"

interface GatewaySettingsManagerProps {
  initialConfig: GatewayConfigDTO
  webhookUrl: string
}

export function GatewaySettingsManager({ initialConfig, webhookUrl }: GatewaySettingsManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [testingPending, startTestingTransition] = useTransition()

  const [isSandbox, setIsSandbox] = useState(initialConfig.isSandbox)
  const [sandboxPublicKey, setSandboxPublicKey] = useState(initialConfig.sandboxPublicKey)
  const [sandboxAccessToken, setSandboxAccessToken] = useState(initialConfig.sandboxAccessToken)
  const [prodPublicKey, setProdPublicKey] = useState(initialConfig.prodPublicKey)
  const [prodAccessToken, setProdAccessToken] = useState(initialConfig.prodAccessToken)
  const [webhookSecret, setWebhookSecret] = useState(initialConfig.webhookSecret)
  const [isActive, setIsActive] = useState(initialConfig.isActive)

  const [showSandboxToken, setShowSandboxToken] = useState(false)
  const [showProdToken, setShowProdToken] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)

  const [copiedUrl, setCopiedUrl] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saveFeedback, setSaveFeedback] = useState<{ success: boolean; message: string } | null>(null)

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleTestConnection = () => {
    setTestResult(null)
    setSaveFeedback(null)
    const currentToken = isSandbox ? sandboxAccessToken : prodAccessToken

    if (!currentToken) {
      setTestResult({
        success: false,
        message: `Por favor, insira o Access Token do ambiente de ${isSandbox ? "Sandbox (Testes)" : "Produção"} antes de testar.`,
      })
      return
    }

    startTestingTransition(async () => {
      const res = await testMercadoPagoConnection(currentToken)
      setTestResult({
        success: res.success,
        message: res.success ? (res.message || "Conexão validada com sucesso!") : (res.error || "Erro desconhecido ao testar."),
      })
    })
  }

  const handleSave = () => {
    setSaveFeedback(null)
    startTransition(async () => {
      const res = await savePlatformGatewayConfig({
        isSandbox,
        sandboxPublicKey,
        sandboxAccessToken,
        prodPublicKey,
        prodAccessToken,
        webhookSecret,
        isActive,
      })

      setSaveFeedback({
        success: res.success,
        message: res.message || "Configurações salvas!",
      })
      setTimeout(() => setSaveFeedback(null), 4000)
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-indigo-500" />
              Gateway de Pagamentos & Mercado Pago
            </h1>
            <Badge
              variant={isSandbox ? "outline" : "default"}
              className={cn(
                "font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5",
                isSandbox 
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" 
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              )}
            >
              {isSandbox ? (
                <>
                  <FlaskConical className="h-3 w-3" />
                  Modo Testes (Sandbox)
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  Produção Ativa
                </>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure as credenciais da API do Mercado Pago para processar as assinaturas e pagamentos SaaS dos estabelecimentos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testingPending || isPending}
            className="font-semibold text-xs h-9 rounded-xl border-border/80 hover:bg-muted"
          >
            {testingPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
            )}
            Testar Conexão
          </Button>

          <Button
            onClick={handleSave}
            disabled={isPending || testingPending}
            className="font-bold text-xs h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Feedbacks de Alerta */}
      {testResult && (
        <div
          className={cn(
            "p-4 rounded-2xl border text-sm flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2",
            testResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
          )}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-bold">{testResult.success ? "Conexão Aprovada!" : "Erro na Conexão"}</p>
            <p className="text-xs mt-0.5 opacity-90">{testResult.message}</p>
          </div>
        </div>
      )}

      {saveFeedback && (
        <div
          className={cn(
            "p-4 rounded-2xl border text-sm flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2",
            saveFeedback.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
          )}
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
          <p className="font-medium text-xs self-center">{saveFeedback.message}</p>
        </div>
      )}

      {/* Seletor de Ambiente: Sandbox vs Produção */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-amber-500" />
              Ambiente de Execução Ativo
            </h3>
            <p className="text-xs text-muted-foreground">
              Alterne entre o ambiente de testes (para simular pagamentos com cartões de teste) e produção real.
            </p>
          </div>

          <div className="flex items-center p-1 bg-muted/70 rounded-xl border border-border/50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsSandbox(true)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                isSandbox
                  ? "bg-background text-amber-600 dark:text-amber-400 shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Sandbox (Testes)
            </button>
            <button
              type="button"
              onClick={() => setIsSandbox(false)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                !isSandbox
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              Produção Real
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Credenciais de Teste (Sandbox) */}
        <Card className={cn("border-border/60 transition-all", isSandbox && "ring-2 ring-amber-500/20")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Credenciais de Testes (Sandbox)</CardTitle>
                  <CardDescription className="text-xs">Chaves geradas para teste no portal de desenvolvedores</CardDescription>
                </div>
              </div>
              {isSandbox && <Badge variant="gold" className="text-[10px]">Em Uso</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Sandbox Public Key</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={sandboxPublicKey}
                  onChange={(e) => setSandboxPublicKey(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-border/80 bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Sandbox Access Token</label>
              <div className="relative">
                <input
                  type={showSandboxToken ? "text" : "password"}
                  placeholder="TEST-0000000000000000-000000-00000000000000000000000000000000-000000000"
                  value={sandboxAccessToken}
                  onChange={(e) => setSandboxAccessToken(e.target.value)}
                  className="w-full h-10 px-3 pr-10 text-xs rounded-xl border border-border/80 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowSandboxToken(!showSandboxToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSandboxToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 2: Credenciais de Produção */}
        <Card className={cn("border-border/60 transition-all", !isSandbox && "ring-2 ring-emerald-500/20")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Credenciais de Produção</CardTitle>
                  <CardDescription className="text-xs">Chaves de produção real com liquidação financeira</CardDescription>
                </div>
              </div>
              {!isSandbox && <Badge variant="default" className="text-[10px] bg-emerald-600">Em Uso</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Production Public Key</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={prodPublicKey}
                  onChange={(e) => setProdPublicKey(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-border/80 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Production Access Token</label>
              <div className="relative">
                <input
                  type={showProdToken ? "text" : "password"}
                  placeholder="APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000"
                  value={prodAccessToken}
                  onChange={(e) => setProdAccessToken(e.target.value)}
                  className="w-full h-10 px-3 pr-10 text-xs rounded-xl border border-border/80 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowProdToken(!showProdToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showProdToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook & Notificações */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Webhook className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Configuração de Webhook (Notificações IPN)</CardTitle>
              <CardDescription className="text-xs">
                O Mercado Pago avisa esta URL automaticamente sempre que uma assinatura ou pagamento for aprovado.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">URL de Notificação / Webhook da Plataforma</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full h-10 px-3 text-xs rounded-xl border border-border/80 bg-muted font-mono select-all text-muted-foreground"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyWebhook}
                className="h-10 px-4 rounded-xl font-bold text-xs shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copiar URL
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Webhook Secret / Assinatura de Validação (Opcional)</label>
              <span className="text-[10px] text-muted-foreground">Recomendado para verificar autenticidade das requisições</span>
            </div>
            <div className="relative">
              <input
                type={showWebhookSecret ? "text" : "password"}
                placeholder="Insira o segredo do webhook (se configurado no Mercado Pago)"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full h-10 px-3 pr-10 text-xs rounded-xl border border-border/80 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial / Ajuda */}
      <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 space-y-4">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
          <HelpCircle className="h-4 w-4" />
          Como obter suas credenciais no Mercado Pago
        </div>
        <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground leading-relaxed">
          <li>
            Acesse o painel oficial em{" "}
            <a
              href="https://www.mercadopago.com.br/developers/panel/app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-600 dark:text-indigo-400 underline inline-flex items-center gap-0.5"
            >
              Mercado Pago Developers <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>Crie uma nova Aplicação (Ex: <strong>VisualClube SaaS</strong>) selecionando <em>Pagamento Online</em>.</li>
          <li>No menu lateral esquerdo, vá em <strong>Credenciais de teste</strong> (Sandbox) ou <strong>Credenciais de produção</strong>.</li>
          <li>Copie a <strong>Public Key</strong> e o <strong>Access Token</strong> e cole nos campos correspondentes acima.</li>
          <li>Em <strong>Webhooks</strong>, adicione a URL informada acima e marque os tópicos <code>payment</code> e <code>subscription_preapproval</code>.</li>
        </ol>
      </div>
    </div>
  )
}
