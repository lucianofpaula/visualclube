"use client"

import * as React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Sparkles, 
  MessageSquare, 
  Mail, 
  Lock, 
  ArrowRight, 
  Scissors, 
  ShieldCheck, 
  CheckCircle2,
  Loader2,
  User,
  Phone,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  UploadCloud,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/ui/logo"
import { cn, formatSmartIdentifier } from "@/lib/utils"
import { loginWithCredentials, registerUser, checkEmailExists, checkPhoneExists } from "@/actions/auth-actions"
import { registerUserSchema, type RegisterUserInput } from "@/lib/schemas/register-user.schema"

export default function AppLoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [identifier, setIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const identifierInfo = formatSmartIdentifier(identifier)

  // Registration states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [emailExists, setEmailExists] = useState(false)
  const [phoneExists, setPhoneExists] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError,
    clearErrors,
    getValues,
    reset,
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
    },
  })

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode)
    setError(null)
    setSuccessMsg(null)
    setEmailExists(false)
    setPhoneExists(false)
    setIdentifier("")
    setLoginPassword("")
    reset({
      fullName: "",
      email: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
    })
  }

  // ── Login Submit ───────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("identifier", identifier)
      formData.append("password", loginPassword)
      formData.append("redirectTo", "/app")

      const res = await loginWithCredentials(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        const targetUrl = res?.redirectUrl || (res?.isProfessional ? "/pro" : "/app")
        setSuccessMsg("Autenticado com sucesso! Entrando no painel...")
        window.location.href = targetUrl
      }
    } catch (err: any) {
      if (!err.message?.includes("NEXT_REDIRECT")) {
        setError("Não foi possível conectar. Verifique seus dados de acesso.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Avatar ─────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.")
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Async blur checks ──────────────────────────────────────
  const handleEmailBlur = async () => {
    const email = getValues("email")
    if (!email || !email.includes("@")) return
    const exists = await checkEmailExists(email)
    setEmailExists(exists)
    if (exists) {
      setFieldError("email", { message: "Este e-mail já está cadastrado." })
    } else {
      clearErrors("email")
    }
  }

  const handleWhatsappBlur = async () => {
    const raw = getValues("whatsapp")
    const digits = raw?.replace(/\D/g, "") ?? ""
    if (digits.length < 10) return
    const exists = await checkPhoneExists(digits)
    setPhoneExists(exists)
    if (exists) {
      setFieldError("whatsapp", { message: "Este WhatsApp já está cadastrado." })
    } else {
      clearErrors("whatsapp")
    }
  }

  // ── Register Submit ────────────────────────────────────────
  const onRegisterSubmit = async (data: RegisterUserInput) => {
    if (emailExists || phoneExists) {
      setError("Corrija os campos destacados antes de continuar.")
      return
    }
    setError(null)
    setSuccessMsg(null)

    const res = await registerUser(data)

    if (!res.success) {
      if (res.field === "email") {
        setFieldError("email", { message: res.error })
        setEmailExists(true)
      } else if (res.field === "whatsapp") {
        setFieldError("whatsapp", { message: res.error })
        setPhoneExists(true)
      } else {
        setError(res.error ?? "Erro ao criar sua conta.")
      }
      return
    }

    setSuccessMsg("Conta criada com sucesso! Entrando no painel...")
    setTimeout(() => {
      window.location.href = "/app"
    }, 1200)
  }

  const fillDemo = (type: "barber" | "salon") => {
    if (type === "barber") {
      setIdentifier("11999887766")
      setLoginPassword("demo1234")
    } else {
      setIdentifier("contato@salaovip.com.br")
      setLoginPassword("demo1234")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-muted/30 via-background to-background text-foreground relative">
      {/* Top Controls */}
      <div className="absolute top-5 right-5 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-6 my-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo href="/" size="md" badgeText="SaaS" subtitle="Gestão de Espaços & Beleza" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {mode === "login" ? "Acessar Painel do Espaço" : "Criar Conta Gratuita"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            {mode === "login"
              ? "Gerencie agendamentos, comandas, profissionais e financeiro."
              : "Cadastre seu estabelecimento e automatize seu espaço em minutos."}
          </p>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Alternador Login / Cadastro */}
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-muted/60 p-1.5 text-xs font-bold border border-border/60 shadow-inner">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "cursor-pointer rounded-xl py-2 transition-all duration-200 text-center active:scale-95",
                mode === "login"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              Já tenho conta
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "cursor-pointer rounded-xl py-2 transition-all duration-200 text-center active:scale-95",
                mode === "register"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              Cadastre-se
            </button>
          </div>

          {/* Mensagens de Erro / Sucesso */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORMULÁRIO DE LOGIN */}
          {mode === "login" ? (
            <form key="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-foreground">
                    WhatsApp ou E-mail
                  </label>
                  {identifierInfo.isValid && (
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.2 rounded border animate-in fade-in-50",
                      identifierInfo.isPhone
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                    )}>
                      {identifierInfo.isPhone ? "WhatsApp Detectado" : "E-mail Detectado"}
                    </span>
                  )}
                </div>

                <div className="relative">
                  {identifierInfo.isPhone ? (
                    <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-emerald-500 transition-colors" />
                  ) : identifierInfo.isEmail ? (
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-indigo-500 dark:text-indigo-400 transition-colors" />
                  ) : (
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors" />
                  )}

                  <Input
                    type="text"
                    placeholder="(11) 99999-9999 ou seu@email.com"
                    value={identifier}
                    onChange={(e) => {
                      const info = formatSmartIdentifier(e.target.value)
                      setIdentifier(info.formatted)
                    }}
                    className="pl-10 h-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-foreground">Senha</label>
                  <a href="#esqueceu" className="text-muted-foreground hover:text-foreground">Esqueceu a senha?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Acessando...
                  </>
                ) : (
                  <>
                    Entrar no Painel
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>

              {/* Acesso Demo */}
              <div className="pt-4 border-t border-border/60">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Demonstração rápida:</span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono">1-clique</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo("barber")}
                    className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Scissors className="h-3.5 w-3.5 text-amber-500" />
                    Barbearia Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("salon")}
                    className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                    Salão Demo
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* FORMULÁRIO DE CADASTRO */
            <form key="register-form" onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="relative group">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative h-20 w-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border-2 overflow-hidden shadow-inner",
                      avatarPreview
                        ? "border-emerald-500 ring-4 ring-emerald-500/20"
                        : "border-dashed border-border/80 bg-muted/40 hover:bg-muted/70 hover:border-primary/60"
                    )}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Foto de perfil" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground">
                        <Camera className="h-6 w-6 mb-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[9px] font-medium">Foto</span>
                      </div>
                    )}
                  </div>
                  {avatarPreview ? (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Foto de perfil (opcional)
                </span>
              </div>

              {/* Nome Completo */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    {...register("fullName")}
                    className={cn("pl-10 h-10 text-sm", errors.fullName && "border-destructive")}
                  />
                </div>
                {errors.fullName?.message && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* E-mail e WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...register("email", { onBlur: handleEmailBlur })}
                      className={cn("pl-10 h-10 text-sm", (errors.email || emailExists) && "border-destructive")}
                    />
                  </div>
                  {errors.email?.message && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-emerald-500" />
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      {...register("whatsapp", { onBlur: handleWhatsappBlur })}
                      className={cn("pl-10 h-10 text-sm", (errors.whatsapp || phoneExists) && "border-destructive")}
                    />
                  </div>
                  {errors.whatsapp?.message && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.whatsapp.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Senhas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 dígitos"
                      {...register("password")}
                      className={cn("pl-10 pr-9 h-10 text-sm", errors.password && "border-destructive")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password?.message && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita sua senha"
                      {...register("confirmPassword")}
                      className={cn("pl-10 pr-9 h-10 text-sm", errors.confirmPassword && "border-destructive")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword?.message && (
                    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg mt-3"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando sua conta...
                  </>
                ) : (
                  <>
                    Criar Conta Gratuita
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Ambiente seguro protegido com criptografia de ponta a ponta.</span>
        </div>
      </div>
    </div>
  )
}
