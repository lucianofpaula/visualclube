"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Lock, Check, Eye, EyeOff, ShieldCheck, Sparkles, Scissors, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { validateClientActivationTokenAction, activateClientPasswordAction } from "@/actions/client-actions"

export default function ClientActivationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [isLoading, setIsLoading] = React.useState(true)
  const [isValid, setIsValid] = React.useState(false)
  const [clientInfo, setClientInfo] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Formulário de Senha
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  React.useEffect(() => {
    if (token) {
      validateClientActivationTokenAction(token)
        .then((res) => {
          if (res.valid && res.client) {
            setIsValid(true)
            setClientInfo(res.client)
          } else {
            setIsValid(false)
            setError(res.error || "Link de ativação inválido ou expirado.")
          }
        })
        .catch(() => {
          setIsValid(false)
          setError("Erro ao validar token de ativação.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas digitadas não coincidem.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await activateClientPasswordAction(token, password)
      if (res.success) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push(res.redirectUrl || "/portal")
        }, 2000)
      } else {
        setError(res.error || "Falha ao ativar a senha. Tente novamente.")
      }
    } catch (err: any) {
      setError(err?.message || "Erro na conexão.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-xs text-muted-foreground">Validando seu link de acesso seguro...</p>
      </div>
    )
  }

  if (!isValid || !clientInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl border border-border shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black text-foreground">Link Inválido ou Expirado</h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {error || "Este link de ativação já foi utilizado ou sua validade expirou."}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Solicite um novo link diretamente à equipe do estabelecimento pelo WhatsApp.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-muted/30 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header com Branding do Estabelecimento */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Acesso VIP Cluberize</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {clientInfo.business?.name || "Cluberize"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Olá, <strong className="text-foreground">{clientInfo.name}</strong>! Crie sua senha de acesso para acompanhar agendamentos e o seu saldo de indicações.
          </p>
        </div>

        {/* Card do Formulário */}
        <Card className="p-6 sm:p-7 rounded-3xl border border-border/80 shadow-2xl bg-card">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-black text-foreground">Senha Criada com Sucesso!</h2>
              <p className="text-xs text-muted-foreground">
                Redirecionando você para o seu Portal VIP...
              </p>
              <div className="pt-2 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Campo de Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Criar Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-9 pr-9 h-11 rounded-xl text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a mesma senha"
                    className="pl-9 pr-9 h-11 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              {/* Bullets de Benefícios */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Acompanhe seus próximos agendamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Acesse seu link de indicação para ganhar cashback</span>
                </div>
              </div>

              {/* Botão de Envio */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl font-bold text-xs bg-primary text-primary-foreground gap-2 shadow-md shadow-primary/20 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>Ativar Meu Acesso & Entrar</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
