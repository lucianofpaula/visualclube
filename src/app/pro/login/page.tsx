"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { 
  Users, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Phone,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { loginProfessionalAction } from "@/actions/pro-auth-actions"

export default function ProLoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

      const res = await loginProfessionalAction(formData)
      if (res.success) {
        window.location.href = res.redirectUrl || "/pro"
      } else {
        setError(res.error || "Falha ao autenticar.")
      }
    } catch (err: any) {
      setError("Ocorreu um erro ao conectar. Verifique sua conexão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-primary selection:text-white">
      {/* Botão de Tema no Canto Superior */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Brand & Badge Header */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 border border-white/20 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-2xl">
            <Users className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <Badge variant="outline" className="text-[10px] font-extrabold uppercase tracking-widest border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-3 py-0.5">
              Portal do Profissional
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Área da Equipe
            </h1>
            <p className="text-xs text-neutral-400">
              Acompanhe seus agendamentos diários, comissões e repasses.
            </p>
          </div>
        </div>

        {/* Card do Formulário */}
        <Card className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">WhatsApp ou E-mail</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  required
                  placeholder="(22) 99999-8888 ou seu@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12 pl-10 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Sua Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha cadastrada"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Entrando no painel...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Meu Painel</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-3 border-t border-neutral-800 text-center space-y-2">
            <p className="text-[11px] text-neutral-400">
              Ainda não criou sua senha?
            </p>
            <p className="text-xs text-neutral-400">
              Solicite ao responsável do seu espaço para enviar o link de convite oficial no WhatsApp.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
