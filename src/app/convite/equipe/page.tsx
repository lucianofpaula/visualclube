"use client"

import * as React from "react"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  User, 
  Briefcase, 
  Store, 
  ArrowRight, 
  Loader2, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { validateInviteTokenAction, acceptTeamInviteAction } from "@/actions/invite-actions"
import { cn } from "@/lib/utils"

export default function TeamInviteOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const resolvedParams = use(searchParams)
  const token = resolvedParams.token || ""

  const [loading, setLoading] = useState(true)
  const [inviteData, setInviteData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)

  // Form Fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [bio, setBio] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState("CHAVE_ALEATORIA")

  // Submit State
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Valida o Token ao carregar a página
  useEffect(() => {
    if (!token) {
      setErrorMsg("Link de convite inválido ou incompleto. Verifique o link recebido no WhatsApp.")
      setLoading(false)
      return
    }

    const validateToken = async () => {
      setLoading(true)
      try {
        const res = await validateInviteTokenAction(token)
        if (res.valid && res.invite) {
          setInviteData(res.invite)
          setPhone(res.invite.phone || "")
        } else {
          setErrorMsg(res.error || "Convite inválido.")
          setIsExpired(!!res.isExpired)
          setIsAccepted(!!res.isAccepted)
        }
      } catch (err: any) {
        setErrorMsg("Erro ao validar convite. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  // Submissão do formulário de aceite
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (password !== confirmPassword) {
      setSubmitError("As senhas digitadas não coincidem.")
      return
    }

    if (password.length < 6) {
      setSubmitError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setSubmitting(true)

    try {
      const res = await acceptTeamInviteAction({
        token,
        name,
        email,
        phone,
        password,
        bio,
        pixKey,
        pixKeyType,
      })

      if (res.success) {
        setSubmitSuccess(true)
      } else {
        setSubmitError(res.error || "Falha ao concluir cadastro.")
      }
    } catch (err: any) {
      setSubmitError("Ocorreu um erro ao processar seu cadastro. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-neutral-400 font-semibold tracking-wider uppercase">
            Validando seu convite de equipe...
          </p>
        </div>
      </div>
    )
  }

  // Error / Expired / Already Accepted State
  if (errorMsg || !inviteData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 selection:bg-primary selection:text-white">
        <Card className="max-w-md w-full rounded-3xl border-border/80 bg-card/90 p-8 text-center space-y-5 shadow-2xl backdrop-blur-md">
          <div className="h-16 w-16 rounded-3xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mx-auto">
            {isExpired ? <Clock className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-foreground">
              {isExpired ? "Convite Expirado" : isAccepted ? "Convite Já Utilizado" : "Convite Indisponível"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {errorMsg}
            </p>
          </div>

          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-neutral-400">
              Solicite ao responsável do estabelecimento para gerar um novo link de convite no WhatsApp.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const business = inviteData.business

  // Success State
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 selection:bg-primary selection:text-white">
        <Card className="max-w-lg w-full rounded-3xl border-emerald-500/30 bg-card/95 p-8 sm:p-10 text-center space-y-6 shadow-2xl backdrop-blur-md animate-in zoom-in-95">
          <div className="h-20 w-20 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1">
              🎉 Cadastro Concluído com Sucesso!
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Bem-vindo(a) à Equipe!
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Parabéns, <strong className="text-foreground">{name}</strong>! Seu perfil como <strong className="text-primary">{inviteData.specialty}</strong> na empresa <strong className="text-foreground">{business?.name}</strong> foi ativado com sucesso.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-2 text-xs">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Suas Credenciais de Acesso:</span>
            </p>
            <p className="text-muted-foreground"><strong>E-mail:</strong> {email}</p>
            <p className="text-muted-foreground"><strong>WhatsApp:</strong> {phone}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              ✅ Sessão iniciada automaticamente. Redirecionando para seu painel...
            </p>
          </div>

          <Button
            onClick={() => window.location.href = "/pro"}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 gap-2"
          >
            <span>Acessar Meu Painel Agora</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    )
  }

  // Normal Form State
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-primary selection:text-white antialiased">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header do Estabelecimento */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-3xl bg-neutral-900 border border-white/15 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-xl overflow-hidden">
            {business?.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              business?.name?.charAt(0).toUpperCase() || "V"
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest block">
              Convite Oficial para Equipe
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {business?.name}
            </h1>
            <p className="text-xs text-neutral-400">
              {business?.city} • {business?.state}
            </p>
          </div>
        </div>

        {/* Card Principal do Formulário */}
        <Card className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Banner do Cargo / Função Atribuída pelo Dono */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                Sua Função Definida:
              </span>
              <p className="font-extrabold text-base text-white flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{inviteData.specialty}</span>
              </p>
            </div>

            <Badge variant="outline" className="text-[10px] font-bold border-primary/40 text-primary bg-primary/10 px-2.5 py-1">
              Definido pelo Responsável
            </Badge>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Dados Pessoais Obrigatórios */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                1. Seus Dados Pessoais
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-200">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    required
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-200">Seu E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      required
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-200">WhatsApp Oficial *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <Input
                      required
                      placeholder="(22) 98888-7777"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 pl-10 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Criação de Senha de Acesso */}
            <div className="space-y-3.5 pt-3 border-t border-neutral-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                2. Crie Sua Senha de Acesso
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-200">Criar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10 pr-10 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-200">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-10 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Dados Opcionais: PIX & Bio */}
            <div className="space-y-3.5 pt-3 border-t border-neutral-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                3. Dados Financeiros & Perfil (Opcional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-200">Tipo de Chave PIX</label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value)}
                    className="w-full h-12 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-xs sm:text-sm font-semibold text-white focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="CPF">CPF</option>
                    <option value="PHONE">Telefone / WhatsApp</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="CHAVE_ALEATORIA">Chave Aleatória</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-200">Sua Chave PIX</label>
                  <Input
                    placeholder="Para recebimento de comissões"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    className="h-12 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-200">Sua Minibiografia (Aparecerá no Site)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte brevemente sobre sua experiência e diferenciais..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>
            </div>

            {/* Botão de Conclusão */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 gap-2 hover:scale-[1.01] transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Concluindo seu cadastro...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Concluir Cadastro & Ingressar na Equipe</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
