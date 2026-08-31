"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  X, 
  Mail, 
  MessageSquare, 
  Lock, 
  User, 
  Scissors, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Camera,
  Phone,
  Eye,
  EyeOff,
  Trash2,
  UploadCloud,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatSmartIdentifier } from "@/lib/utils"
import { loginWithCredentials, registerUser, checkEmailExists, checkPhoneExists } from "@/actions/auth-actions"
import { registerUserSchema, type RegisterUserInput } from "@/lib/schemas/register-user.schema"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "login" | "register"
}

// FieldError: exibe mensagem de erro inline por campo
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-[11px] text-destructive mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [refCode, setRefCode] = useState<string | null>(null)

  // Login state (simples — sem RHF pois tem poucos campos)
  const [identifier, setIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const identifierInfo = formatSmartIdentifier(identifier)

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password visibility
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Async field-level dedup state
  const [emailExists, setEmailExists] = useState(false)
  const [phoneExists, setPhoneExists] = useState(false)

  // react-hook-form
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

  // Lê cookie de referral
  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/visualclube_ref=([^;]+)/)
      if (match?.[1]) setRefCode(decodeURIComponent(match[1]))
    }
  }, [isOpen])

  // Reseta estado ao alternar modo
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

  if (!isOpen) return null

  // ── Avatar ──────────────────────────────────────────────────────
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

  // ── Login ────────────────────────────────────────────────────────
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
        setSuccessMsg("Autenticado com sucesso! Redirecionando...")
        setTimeout(() => {
          window.location.href = targetUrl
        }, 500)
      }
    } catch (err: any) {
      if (!err.message?.includes("NEXT_REDIRECT")) {
        setError("Não foi possível conectar. Verifique seus dados.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Validações assíncronas (onBlur) ─────────────────────────────
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

  // ── Cadastro ─────────────────────────────────────────────────────
  const onRegisterSubmit = async (data: RegisterUserInput) => {
    if (emailExists || phoneExists) {
      setError("Corrija os erros nos campos antes de continuar.")
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
        setError(res.error ?? "Erro ao criar conta.")
      }
      return
    }

    setSuccessMsg(`Conta criada! Bem-vindo ao VisualClube 🎉 Redirecionando...`)
    setTimeout(() => {
      const appHost =
        process.env.NODE_ENV === "production"
          ? "https://app.visualclube.com.br"
          : "http://app.localhost:3000"
      window.location.href = appHost
    }, 1500)
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              {mode === "login" ? "Acesso ao Sistema" : "Cadastro Gratuito"}
            </div>
            {refCode && mode === "register" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-in fade-in-50">
                <span>🎁 Convite VIP ({refCode})</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {mode === "login" ? "Entrar no VisualClube" : "Criar sua conta"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Gerencie agendamentos, comandas e equipe em um só lugar."
              : "Acesse o app e descubra tudo que o VisualClube oferece."}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-muted/60 p-1.5 mb-6 text-xs font-bold border border-border/60 shadow-inner">
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

        {/* Alertas globais */}
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── FORMULÁRIO DE LOGIN ─────────────────────────────────── */}
        {mode === "login" ? (
          <form key="modal-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-foreground">
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
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-foreground">Senha</label>
                <a href="#recuperar" className="text-muted-foreground hover:text-foreground">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10 pr-10"
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
              className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  Acessar Painel
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>

            <div className="mt-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Demonstração rápida:</span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded">1-clique</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setIdentifier("11999887766"); setLoginPassword("demo1234") }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted text-xs text-foreground transition-all"
                >
                  <Scissors className="h-3.5 w-3.5 text-amber-500" />
                  Barbearia Demo
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier("contato@salaovip.com.br"); setLoginPassword("demo1234") }}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted text-xs text-foreground transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  Salão & Estética
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ── FORMULÁRIO DE CADASTRO ──────────────────────────────── */
          <form key="modal-register-form" onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="h-5 w-5" />
                  </div>
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
              <span className="text-[11px] text-muted-foreground font-medium">
                {avatarPreview ? "Clique para alterar a foto" : "Adicionar foto de perfil (opcional)"}
              </span>
            </div>

            {/* Nome Completo */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  {...register("fullName")}
                  className={cn("pl-10 h-10 text-sm", errors.fullName && "border-destructive focus-visible:ring-destructive/20")}
                />
              </div>
              <FieldError message={errors.fullName?.message} />
            </div>

            {/* E-mail e WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* E-mail */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">E-mail *</label>
                <div className="relative">
                  <Mail className={cn("absolute left-3.5 top-3 h-4 w-4", emailExists ? "text-destructive" : "text-muted-foreground")} />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email", {
                      onBlur: handleEmailBlur,
                    })}
                    className={cn(
                      "pl-10 h-10 text-sm",
                      (errors.email || emailExists) && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">WhatsApp *</label>
                <div className="relative">
                  <Phone className={cn("absolute left-3.5 top-3 h-4 w-4", phoneExists ? "text-destructive" : "text-emerald-500")} />
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    {...register("whatsapp", {
                      onBlur: handleWhatsappBlur,
                    })}
                    className={cn(
                      "pl-10 h-10 text-sm",
                      (errors.whatsapp || phoneExists) && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                </div>
                <FieldError message={errors.whatsapp?.message} />
              </div>
            </div>

            {/* Senha e Confirmar Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Senha */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 dígitos"
                    {...register("password")}
                    className={cn("pl-10 pr-9 h-10 text-sm", errors.password && "border-destructive focus-visible:ring-destructive/20")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Confirmar Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita sua senha"
                    {...register("confirmPassword")}
                    className={cn("pl-10 pr-9 h-10 text-sm", errors.confirmPassword && "border-destructive focus-visible:ring-destructive/20")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.confirmPassword?.message} />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full h-11 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-lg shadow-primary/20 mt-3"
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

            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Seus dados estão protegidos com criptografia.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
