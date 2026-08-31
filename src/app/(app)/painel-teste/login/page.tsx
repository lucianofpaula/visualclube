"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  MessageSquare, 
  Mail, 
  Lock, 
  ArrowRight, 
  Scissors, 
  ShieldCheck, 
  CheckCircle2,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { loginWithCredentials } from "@/actions/auth-actions"

export default function AppLoginPage() {
  const [loginMethod, setLoginMethod] = useState<"whatsapp" | "email">("whatsapp")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("identifier", identifier)
      formData.append("password", password)
      formData.append("redirectTo", "/app")

      const res = await loginWithCredentials(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        window.location.href = "/app"
      }
    } catch (err: any) {
      if (!err.message?.includes("NEXT_REDIRECT")) {
        setError("Não foi possível conectar. Tente a demonstração rápida.")
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (type: "barber" | "salon") => {
    if (type === "barber") {
      setIdentifier("11999887766")
      setPassword("demo1234")
    } else {
      setIdentifier("contato@salaovip.com.br")
      setPassword("demo1234")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-muted/30 to-background text-foreground relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-2xl shadow-lg">
              V
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
                VisualClube
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  PRO
                </span>
              </span>
              <span className="text-[11px] block text-muted-foreground">app.visualclube.com.br</span>
            </div>
          </Link>

          <h1 className="text-2xl font-black text-foreground">Acessar Painel do Espaço</h1>
          <p className="text-xs text-muted-foreground">
            Gerencie atendimentos, comandas e equipe em tempo real.
          </p>
        </div>

        {/* Card de Login */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Escolha do Método */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold text-muted-foreground">Entrar com:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod("whatsapp")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                    loginMethod === "whatsapp"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                    loginMethod === "email"
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Mail className="h-3.5 w-3.5" />
                  E-mail
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {loginMethod === "whatsapp" ? "Número de WhatsApp" : "Seu E-mail"}
              </label>
              <div className="relative">
                {loginMethod === "whatsapp" ? (
                  <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-emerald-500" />
                ) : (
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type={loginMethod === "whatsapp" ? "tel" : "email"}
                  placeholder={loginMethod === "whatsapp" ? "(11) 99999-9999" : "seu@email.com"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-foreground">Senha</label>
                <a href="#esqueceu" className="text-muted-foreground hover:text-foreground">Esqueceu?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
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

            {/* Acesso Rápido Demo / Teste */}
            <div className="pt-4 border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Entrar no modo demonstração:</span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded">1-clique</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo("barber")}
                  className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5"
                >
                  <Scissors className="h-3.5 w-3.5 text-amber-500" />
                  Barbearia Demo
                </button>
                <Link
                  href="/app"
                  className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Acessar Direto
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Ambiente seguro protegido por criptografia de ponta a ponta.</span>
        </div>
      </div>
    </div>
  )
}
