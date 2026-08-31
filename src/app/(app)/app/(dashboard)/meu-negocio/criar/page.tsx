"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  Store, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Scissors, 
  FileText, 
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { createBusiness, checkSlugAvailability, CreateBusinessInput } from "@/actions/business-actions"
import { cn } from "@/lib/utils"

const BUSINESS_TYPES = [
  { value: "BARBERSHOP", label: "Barbearia", desc: "Cortes, barba, bar e grooming masculino" },
  { value: "HAIR_SALON", label: "Salão de Beleza", desc: "Cabelos, coloração, mechas e tratamentos" },
  { value: "NAIL_SALON", label: "Esmalteria & Nails", desc: "Manicure, pedicure, alongamentos em gel" },
  { value: "ESTHETICS_CLINIC", label: "Clínica de Estética", desc: "Facial, corporal, micropigmentação e laser" },
  { value: "SPA", label: "Spa & Massoterapia", desc: "Massagens, relaxamento e terapias corporais" },
  { value: "OTHER", label: "Outros Serviços", desc: "Tatuagem, sobrancelhas e estética em geral" },
]

export default function CriarEspacoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEditedManually, setSlugEditedManually] = useState(false)
  const [slugStatus, setSlugStatus] = useState<"checking" | "available" | "taken" | "idle">("idle")
  const [type, setType] = useState<any>("BARBERSHOP")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [document, setDocument] = useState("")
  const [description, setDescription] = useState("")
  
  // Endereço
  const [postalCode, setPostalCode] = useState("")
  const [address, setAddress] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [loadingCep, setLoadingCep] = useState(false)

  // Helper para gerar slug automático
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // Atualiza slug automaticamente quando o nome muda (se não editado manualmente)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!slugEditedManually) {
      setSlug(generateSlug(val))
    }
  }

  // Checa disponibilidade do slug com debounce
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugStatus("idle")
      return
    }

    setSlugStatus("checking")
    const timer = setTimeout(async () => {
      const res = await checkSlugAvailability(slug)
      setSlugStatus(res.available ? "available" : "taken")
    }, 400)

    return () => clearTimeout(timer)
  }, [slug])

  // Máscara de Telefone / WhatsApp
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "")
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`
    }
    setPhone(v)
  }

  // Máscara e Busca de CEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "")
    if (v.length > 8) v = v.slice(0, 8)
    const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v
    setPostalCode(formatted)

    if (v.length === 8) {
      setLoadingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${v}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setAddress(data.logradouro || "")
          setNeighborhood(data.bairro || "")
          setCity(data.localidade || "")
          setState(data.uf || "")
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err)
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Informe o nome comercial do seu espaço.")
      return
    }
    if (!slug.trim() || slugStatus === "taken") {
      setError("Escolha um link válido e disponível para sua bio.")
      return
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Informe um WhatsApp de atendimento válido com DDD.")
      return
    }

    setLoading(true)

    try {
      const payload: CreateBusinessInput = {
        name,
        slug,
        type,
        phone,
        email: email || null,
        document: document || null,
        description: description || null,
        postalCode: postalCode || null,
        address: address || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
      }

      const res = await createBusiness(payload)

      if (!res.success) {
        setError(res.error || "Erro ao cadastrar espaço.")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/app")
        router.refresh()
      }, 1200)
    } catch (err: any) {
      setError("Erro inesperado. Tente novamente.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-emerald-500/40 bg-card/90 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">
            Espaço Criado com Sucesso! 🎉
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Seu estabelecimento está pronto e configurado no VisualClube. Redirecionando para seu painel...
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            <span>Atualizando permissões e menus...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para Visão Geral
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] px-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              Passo 1 de 1
            </Badge>
            <span className="text-xs text-muted-foreground">Ativação do Sistema</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Store className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            Cadastre o seu Estabelecimento
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Preencha as informações do seu espaço para liberar a agenda, comandas, equipe e o seu Website na Bio.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-semibold text-destructive flex items-center gap-3 animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Identidade do Espaço */}
        <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              1. Identidade & Categoria
            </CardTitle>
            <CardDescription className="text-xs">
              Como seus clientes conhecem seu negócio e qual é o link público de agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  Nome do Estabelecimento *
                </label>
                <Input
                  required
                  placeholder="Ex: Barbearia Cavalheiro Nobre, Studio Glow..."
                  value={name}
                  onChange={handleNameChange}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {/* Tipo de Negócio */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  Segmento Principal *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {BUSINESS_TYPES.map((bt) => (
                    <div
                      key={bt.value}
                      onClick={() => setType(bt.value)}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-3 transition-all duration-200 text-left",
                        type === bt.value
                          ? "border-primary bg-primary/10 text-foreground shadow-xs ring-1 ring-primary"
                          : "border-border/60 bg-muted/20 hover:border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="font-bold text-xs text-foreground flex items-center justify-between">
                        <span>{bt.label}</span>
                        {type === bt.value && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                        {bt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slug / Link Público */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Subdomínio & Link Oficial *</span>
                  {slugStatus === "available" && (
                    <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Subdomínio disponível!
                    </span>
                  )}
                  {slugStatus === "taken" && (
                    <span className="text-[11px] text-destructive font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Subdomínio em uso
                    </span>
                  )}
                  {slugStatus === "checking" && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Verificando...
                    </span>
                  )}
                </label>
                <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 px-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                  <input
                    required
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugEditedManually(true)
                      setSlug(generateSlug(e.target.value))
                    }}
                    placeholder="barbeariadoluciano"
                    className="w-full bg-transparent py-2.5 text-xs sm:text-sm font-bold text-foreground focus:outline-hidden"
                  />
                  <span className="text-xs font-semibold text-muted-foreground select-none shrink-0">
                    .visualclube.com.br
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Seus clientes acessarão diretamente seu site exclusivo em: <strong className="text-foreground">{slug ? `${slug}.visualclube.com.br` : "seunegocio.visualclube.com.br"}</strong>
                </p>
              </div>

              {/* Bio / Descrição */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  Descrição Curta / Slogan (Opcional)
                </label>
                <Input
                  placeholder="Ex: Tradição em cortes clássicos e cerveja artesanal no coração dos Jardins."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Contatos & Atendimento */}
        <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              2. Contato & Notificações
            </CardTitle>
            <CardDescription className="text-xs">
              Canais que o sistema utilizará para disparos de lembretes e comunicação com clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  WhatsApp Oficial de Atendimento *
                </label>
                <Input
                  required
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="h-11 rounded-xl text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Número principal do estabelecimento para receber confirmações.
                </p>
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  E-mail Comercial (Opcional)
                </label>
                <Input
                  type="email"
                  placeholder="contato@seuespaco.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {/* CNPJ / CPF */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  CNPJ ou CPF do Responsável (Opcional)
                </label>
                <Input
                  placeholder="00.000.000/0001-00"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Localização */}
        <Card className="rounded-3xl border-border/70 bg-card/80 backdrop-blur-md shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" />
              3. Localização & Endereço
            </CardTitle>
            <CardDescription className="text-xs">
              Endereço que aparecerá no mapa do seu Website Premium e nas mensagens de agendamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* CEP */}
              <div className="space-y-1.5 sm:col-span-4">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>CEP</span>
                  {loadingCep && <span className="text-[10px] text-primary flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Buscando</span>}
                </label>
                <Input
                  placeholder="00000-000"
                  value={postalCode}
                  onChange={handleCepChange}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {/* Rua e Número */}
              <div className="space-y-1.5 sm:col-span-8">
                <label className="text-xs font-bold text-foreground">
                  Rua / Avenida e Número
                </label>
                <Input
                  placeholder="Ex: Av. Paulista, 1500 - Sala 30"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {/* Bairro */}
              <div className="space-y-1.5 sm:col-span-5">
                <label className="text-xs font-bold text-foreground">
                  Bairro
                </label>
                <Input
                  placeholder="Ex: Bela Vista"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {/* Cidade */}
              <div className="space-y-1.5 sm:col-span-5">
                <label className="text-xs font-bold text-foreground">
                  Cidade
                </label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {/* Estado */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-foreground">
                  UF
                </label>
                <Input
                  placeholder="SP"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  className="h-11 rounded-xl text-sm uppercase text-center"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link href="/app" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 rounded-2xl text-xs font-bold"
            >
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || slugStatus === "taken" || slugStatus === "checking"}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-12 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cadastrando Espaço...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Salvar e Ativar Meu Espaço</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
