"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { 
  Globe, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  Smartphone, 
  Palette, 
  Share2, 
  QrCode, 
  Store, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  Layers,
  Wand2,
  Copy,
  Check,
  Save,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Camera,
  MessageSquare,
  Star,
  Scissors,
  Users,
  Image as ImageIcon,
  Flame,
  ShieldCheck,
  Zap,
  Printer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useSubscription } from "@/components/app/app-shell"
import { generateAiEstablishmentAction } from "@/actions/ai-actions"
import { updateBusinessWebsite } from "@/actions/business-actions"
import { AvatarUploader } from "@/components/ui/avatar-uploader"
import { cn } from "@/lib/utils"

// Paletas de Cores Presets (10 Temas 60-30-10)
const THEME_PALETTES = [
  { id: "emerald", name: "Esmeralda Glow", primary: "#10b981", bg: "#022c22", text: "#ecfdf5", accent: "from-emerald-600 via-teal-500 to-indigo-600" },
  { id: "sapphire", name: "Safira Noturno", primary: "#2563eb", bg: "#041e30", text: "#f0f9ff", accent: "from-sky-500 via-blue-600 to-indigo-700" },
  { id: "amethyst", name: "Ametista Glamour", primary: "#8b5cf6", bg: "#1f0736", text: "#faf5ff", accent: "from-purple-600 via-fuchsia-500 to-indigo-600" },
  { id: "amber", name: "Ouro Champagne", primary: "#f59e0b", bg: "#261904", text: "#fef3c7", accent: "from-amber-500 via-yellow-400 to-amber-700" },
  { id: "rose", name: "Rubi Velvet", primary: "#f43f5e", bg: "#2b0511", text: "#fff1f2", accent: "from-rose-500 via-pink-500 to-purple-600" },
  { id: "midnight-gold", name: "Noir & Ouro Real", primary: "#eab308", bg: "#171202", text: "#fef9c3", accent: "from-yellow-400 via-amber-500 to-yellow-600" },
  { id: "moka-leather", name: "Moka & Couro", primary: "#a76535", bg: "#1c0d02", text: "#fed7aa", accent: "from-amber-700 via-amber-800 to-stone-900" },
  { id: "sunset-glow", name: "Sunset Gradient", primary: "#f97316", bg: "#240c02", text: "#ffedd5", accent: "from-orange-500 via-amber-500 to-rose-500" },
  { id: "titanium-noir", name: "Titânio & Obsidian", primary: "#e4e4e7", bg: "#09090b", text: "#fafafa", accent: "from-zinc-400 via-neutral-300 to-slate-500" },
  { id: "matcha-zen", name: "Matcha Zen", primary: "#84934a", bg: "#0f1c08", text: "#f7fee7", accent: "from-lime-600 via-emerald-600 to-teal-700" },
]

// Banners Presets
const BANNER_PRESETS = [
  { label: "Barbearia Clássica", url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80" },
  { label: "Salão & Hair", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80" },
  { label: "Estética & Spa", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80" },
  { label: "Moderno Dark", url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80" },
]

export default function WebsitePremiumPage() {
  const { hasBusiness, business } = useSubscription()
  const [activeTab, setActiveTab] = useState<"ai" | "visual" | "qrcode">("ai")
  const [mobilePreviewTab, setMobilePreviewTab] = useState<"home" | "booking">("home")

  // Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [tagline, setTagline] = useState("")
  const [instagramBio, setInstagramBio] = useState("")
  const [differentials, setDifferentials] = useState<string[]>([])
  const [aiCustomContext, setAiCustomContext] = useState("")
  const [selectedTheme, setSelectedTheme] = useState(THEME_PALETTES[0])
  const [bannerUrl, setBannerUrl] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [openingHours, setOpeningHours] = useState("Segunda a Sábado: 09h às 20h")

  // Status & Feedback
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedBio, setCopiedBio] = useState(false)

  // Carrega dados iniciais do negócio
  useEffect(() => {
    if (business) {
      setName(business.name || "")
      setSlug(business.slug || "")
      setDescription(business.description || "O melhor atendimento para o seu estilo e bem-estar.")
      setHeroTitle(business.name ? `Bem-vindo à ${business.name}` : "Seu Estilo, Nossa Arte")
      setHeroSubtitle("Agende seu horário online em segundos e viva uma experiência premium.")
      setTagline("Excelência em cada detalhe.")
      setDifferentials([
        "Ambiente climatizado e confortável",
        "Profissionais altamente qualificados",
        "Bebida cortesia e atendimento VIP",
        "Agendamento online 24h sem espera"
      ])
      if (business.bannerUrl) setBannerUrl(business.bannerUrl)
      if (business.logoUrl) setLogoUrl(business.logoUrl)
      if (business.openingHours) setOpeningHours(business.openingHours)
      if (business.themeColor) {
        const found = THEME_PALETTES.find((p) => p.id === business.themeColor)
        if (found) setSelectedTheme(found)
      }
    }
  }, [business])

  const [publicUrl, setPublicUrl] = useState("")
  const [subdomainUrl, setSubdomainUrl] = useState("")

  useEffect(() => {
    if (slug) {
      const isLocal = typeof window !== "undefined" && window.location.hostname.includes("localhost")
      const sub = isLocal
        ? `http://${slug}.localhost:3000`
        : `https://${slug}.visualclube.com.br`
      const fallback = `https://visualclube.com.br/b/${slug}`
      setSubdomainUrl(sub)
      setPublicUrl(sub || fallback)
    }
  }, [slug])

  const handleCopyLink = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyBio = () => {
    if (!instagramBio) return
    navigator.clipboard.writeText(instagramBio)
    setCopiedBio(true)
    setTimeout(() => setCopiedBio(false), 2500)
  }

  // Geração com Gemini IA
  const handleGenerateAi = async () => {
    if (!name.trim()) return
    setIsGeneratingAi(true)

    try {
      const res = await generateAiEstablishmentAction({
        name,
        category: business?.type || "BARBERSHOP",
        city: business?.city || "Brasil",
        differentials: aiCustomContext || "Atendimento de alta qualidade, pontualidade e ambiente exclusivo",
      })

      if (res.success && res.data) {
        const data = res.data
        if (data.tagline) setTagline(data.tagline)
        if (data.heroTitle) setHeroTitle(data.heroTitle)
        if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle)
        if (data.aboutText) setDescription(data.aboutText)
        if (data.instagramBio) setInstagramBio(data.instagramBio)
        if (data.differentialsList && Array.isArray(data.differentialsList)) {
          setDifferentials(data.differentialsList)
        }
        setSuccessMsg("Conteúdo gerado com sucesso pelo Gemini IA! 🎉")
        setTimeout(() => setSuccessMsg(null), 4000)
      }
    } catch (err) {
      console.error("Erro na IA:", err)
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // Salva customizações
  const handleSaveWebsite = async () => {
    if (!business?.id) return
    setIsSaving(true)
    setSuccessMsg(null)

    try {
      const res = await updateBusinessWebsite(business.id, {
        name,
        description,
        bannerUrl: bannerUrl || null,
        logoUrl: logoUrl || null,
        openingHours,
        themeColor: selectedTheme.id,
      })

      if (res.success) {
        setSuccessMsg("Website Institucional e Paleta de Cores salvos com sucesso! 🚀")
        setTimeout(() => setSuccessMsg(null), 4000)
      }
    } catch (err) {
      console.error("Erro ao salvar:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Se não tem negócio criado ainda
  if (!hasBusiness) {
    return (
      <div className="space-y-6 max-w-4xl py-6">
        <div className="border-b border-border/50 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] px-2 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
              Configuração Pendente
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-7 w-7 text-primary" />
            Website Premium na Bio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cadastre seu estabelecimento primeiro para liberar o gerador de Website com Inteligência Artificial.
          </p>
        </div>

        <Card className="rounded-3xl border-border/80 bg-card/80 p-8 sm:p-12 text-center shadow-xl backdrop-blur-md">
          <div className="h-16 w-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Store className="h-8 w-8" />
          </div>

          <Badge variant="outline" className="px-3 py-0.5 text-xs font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 mb-2">
            Nenhum Espaço Criado
          </Badge>

          <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">
            Você ainda não cadastrou seu estabelecimento
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            Para gerar seu Website na Bio com Inteligência Artificial e receber agendamentos online, cadastre seu espaço agora.
          </p>

          <Link href="/app/meu-negocio/criar">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-12 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 gap-2 hover:scale-[1.02] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Meu Espaço Agora</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground">Meu Negócio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Globe className="h-7 w-7 text-primary" />
            Website Institucional Premium
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Personalize o website institucional completo do seu espaço (Hero, Sobre, Serviços, Equipe, Galeria e Agendamento Online).
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/exemplos-sites" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-xs gap-1.5 shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Ver 3 Amostras Fora da Curva</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </Button>
          </Link>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="h-10 rounded-xl text-xs font-bold gap-1.5 shadow-xs"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copiedLink ? "Link Copiado!" : "Copiar Link da Bio"}</span>
          </Button>

          {slug && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Eye className="h-4 w-4" />
                <span>Abrir Site ao Vivo</span>
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </Button>
            </a>
          )}

          <Button
            onClick={handleSaveWebsite}
            disabled={isSaving}
            size="sm"
            className="h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-md"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar Website</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Editor & Right Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tabs & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub Tabs Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-2xl border border-border/60 shadow-inner max-w-lg">
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={cn(
                "cursor-pointer flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95",
                activeTab === "ai"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <Wand2 className={cn("h-3.5 w-3.5", activeTab === "ai" ? "text-white" : "text-purple-500")} />
              <span>1. Inteligência Artificial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={cn(
                "cursor-pointer flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95",
                activeTab === "visual"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <Palette className={cn("h-3.5 w-3.5", activeTab === "visual" ? "text-white" : "text-indigo-500")} />
              <span>2. Visual & Cores</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("qrcode")}
              className={cn(
                "cursor-pointer flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95",
                activeTab === "qrcode"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <QrCode className={cn("h-3.5 w-3.5", activeTab === "qrcode" ? "text-white" : "text-emerald-500")} />
              <span>3. QR Code Balcão</span>
            </button>
          </div>

          {/* TAB 1: IA & Conteúdo */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              {/* Card Destaque: Botão Gemini */}
              <Card className="relative overflow-hidden rounded-3xl border-purple-500/40 bg-gradient-to-br from-purple-950/30 via-card to-background p-6 shadow-xl backdrop-blur-md">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-foreground">
                          Gerador Automático com Gemini 2.0
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Crie slogans, títulos, história e diferenciais profissionais em 2 segundos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Diferenciais do seu espaço para guiar a IA (Opcional):
                    </label>
                    <Input
                      placeholder="Ex: Cerveja cortesia, espaço gamer, toalha quente, ambiente climatizado..."
                      value={aiCustomContext}
                      onChange={(e) => setAiCustomContext(e.target.value)}
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleGenerateAi}
                    disabled={isGeneratingAi}
                    className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs h-11 rounded-2xl shadow-lg shadow-purple-600/20 gap-2 transition-all hover:scale-[1.01]"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Gemini IA criando seu Website Premium...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        <span>Gerar Todo o Conteúdo com IA Agora</span>
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Formulário de Textos */}
              <Card className="rounded-3xl border-border/70 bg-card/80 p-6 space-y-5">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Textos & Conteúdo do Site
                  </CardTitle>
                </CardHeader>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Título Principal do Banner (Hero Title)
                    </label>
                    <Input
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="Ex: Seu Estilo, Nossa Paixão"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Subtítulo do Banner
                    </label>
                    <Input
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="Ex: Agende seu horário online em segundos e viva uma experiência premium."
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Slogan de 1 Linha (Tagline)
                    </label>
                    <Input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Ex: Tradição em cortes clássicos e atendimento VIP."
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Sobre o Estabelecimento / História
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Conte um pouco sobre a história e a paixão do seu espaço..."
                      className="w-full rounded-xl border border-border/70 bg-background p-3 text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  {/* Bio do Instagram Gerada */}
                  {instagramBio && (
                    <div className="p-4 rounded-2xl border border-pink-500/30 bg-pink-500/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400">
                          <Camera className="h-4 w-4" />
                          <span>Bio Sugerida para seu Instagram</span>
                        </div>
                        <Button
                          type="button"
                          onClick={handleCopyBio}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-500/20"
                        >
                          {copiedBio ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          <span>{copiedBio ? "Copiado!" : "Copiar Bio"}</span>
                        </Button>
                      </div>
                      <p className="text-xs text-foreground whitespace-pre-line font-medium leading-relaxed">
                        {instagramBio}
                      </p>
                    </div>
                  )}

                  {/* Diferenciais */}
                  {differentials.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-amber-500" />
                        Diferenciais & Destaques
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {differentials.map((diff, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/40 text-xs font-semibold text-foreground"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{diff}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: Visual & Imagens */}
          {activeTab === "visual" && (
            <div className="space-y-6">
              {/* Seleção de Paleta de Cores */}
              <Card className="rounded-3xl border-border/70 bg-card/80 p-6 space-y-4">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Paleta de Cores do Website Institucional
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Escolha a identidade visual que mais combina com a proposta do seu espaço.
                  </CardDescription>
                </CardHeader>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEME_PALETTES.map((pal) => (
                    <div
                      key={pal.id}
                      onClick={() => setSelectedTheme(pal)}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-3 transition-all text-left flex flex-col justify-between h-24",
                        selectedTheme.id === pal.id
                          ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary"
                          : "border-border/60 bg-muted/20 hover:border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{pal.name}</span>
                        {selectedTheme.id === pal.id && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-5 w-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: pal.bg }} />
                        <div className="h-5 w-5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: pal.primary }} />
                        <div className={cn("h-5 flex-1 rounded-full bg-gradient-to-r shadow-xs", pal.accent)} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Banners & Imagens */}
              <Card className="rounded-3xl border-border/70 bg-card/80 p-6 space-y-4">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Banner de Capa & Logo
                  </CardTitle>
                </CardHeader>

                <div className="space-y-4">
                  {/* Presets de Banner */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Escolha uma foto de capa pré-selecionada:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BANNER_PRESETS.map((bp, i) => (
                        <div
                          key={i}
                          onClick={() => setBannerUrl(bp.url)}
                          className={cn(
                            "relative cursor-pointer rounded-xl overflow-hidden border h-16 group transition-all",
                            bannerUrl === bp.url ? "ring-2 ring-primary border-primary" : "border-border/60"
                          )}
                        >
                          <img src={bp.url} alt={bp.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white leading-tight drop-shadow-sm">{bp.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Ou insira a URL da sua foto de capa personalizada:
                    </label>
                    <Input
                      placeholder="https://..."
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">
                      Logo do Estabelecimento
                    </label>
                    <div className="flex items-center gap-4">
                      <AvatarUploader
                        currentImageUrl={logoUrl}
                        name={name || "Logo"}
                        size="md"
                        folder="visualclube/logos"
                        onUploadSuccess={(url) => setLogoUrl(url)}
                        onRemove={() => setLogoUrl("")}
                      />
                      <div className="flex-1">
                        <Input
                          placeholder="Ou cole a URL da logo: https://..."
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          className="h-10 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Horário de Funcionamento
                    </label>
                    <Input
                      placeholder="Ex: Terça a Sábado: 09h às 20h"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: QR Code de Balcão */}
          {activeTab === "qrcode" && (
            <Card className="rounded-3xl border-border/70 bg-card/80 p-8 text-center space-y-6">
              <div className="space-y-2 max-w-md mx-auto">
                <Badge variant="outline" className="text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  <QrCode className="h-3.5 w-3.5 mr-1" />
                  Pronto para Impressão
                </Badge>
                <h3 className="text-xl font-black text-foreground">
                  QR Code Oficial do Estabelecimento
                </h3>
                <p className="text-xs text-muted-foreground">
                  Coloque este QR Code nas bancadas, espelhos e recepção para que seus clientes agendem o próximo horário com facilidade pelo celular.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="inline-block p-6 rounded-3xl bg-white text-black shadow-2xl border-4 border-muted">
                {/* Simulated QR Code SVG */}
                <div className="h-48 w-48 flex flex-col items-center justify-center bg-black text-white p-3 rounded-2xl">
                  <QrCode className="h-36 w-36 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-emerald-400">
                    {slug || "visualclube"}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-neutral-900 mt-3">
                  Aponte a câmera para agendar
                </p>
                <p className="text-[10px] text-neutral-500 font-semibold truncate max-w-[200px]">
                  {slug ? `${slug}.visualclube.com.br` : "visualclube.com.br"}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="rounded-2xl h-11 px-5 text-xs font-bold gap-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir Plaquinha de Balcão</span>
                </Button>

                <Button
                  onClick={handleCopyLink}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl h-11 px-5 text-xs font-bold gap-2 shadow-md"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Compartilhar no WhatsApp</span>
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Live Mobile Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-20">
          <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-1">
            <span className="text-xs font-extrabold text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-primary" />
              Preview ao Vivo (Mobile)
            </span>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-[10px] font-bold shadow-inner">
              <button
                type="button"
                onClick={() => setMobilePreviewTab("home")}
                className={cn(
                  "cursor-pointer px-2.5 py-1 rounded-lg transition-all duration-150 active:scale-95",
                  mobilePreviewTab === "home"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                Site
              </button>
              <button
                type="button"
                onClick={() => setMobilePreviewTab("booking")}
                className={cn(
                  "cursor-pointer px-2.5 py-1 rounded-lg transition-all duration-150 active:scale-95",
                  mobilePreviewTab === "booking"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                Agenda
              </button>
            </div>
          </div>

          {/* Smartphone Frame */}
          <div className="relative w-[340px] h-[680px] rounded-[44px] border-[8px] border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden flex flex-col">
            {/* Top Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 bg-neutral-800 rounded-full z-30" />

            {/* Scrollable Screen Content */}
            <div
              className="flex-1 overflow-y-auto no-scrollbar text-white pb-6 select-none"
              style={{ backgroundColor: selectedTheme.bg }}
            >
              {/* Header / Hero Banner */}
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={bannerUrl || BANNER_PRESETS[0].url}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Logo & Status Badge */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg border-2 border-white/20">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" /> : name.charAt(0) || "V"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-tight drop-shadow-sm">
                        {name || "Seu Estabelecimento"}
                      </h4>
                      <p className="text-[10px] text-white/80 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        {business?.city ? `${business.city}, ${business?.state || "BR"}` : "Brasil"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                    Aberto
                  </span>
                </div>
              </div>

              {/* Screen Body */}
              {mobilePreviewTab === "home" ? (
                <div className="p-4 space-y-5 text-neutral-200">
                  {/* Hero Headline & Quick CTA */}
                  <div className="space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Espaço de Alto Padrão</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-white leading-tight">
                      {heroTitle || "A Arte do Cuidado e Estilo em Cada Detalhe."}
                    </h4>

                    <p className="text-[10px] text-white/80 leading-snug">
                      {heroSubtitle || "Agende seu horário online em segundos e viva uma experiência premium."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMobilePreviewTab("booking")}
                        className="py-2.5 px-3 rounded-xl font-black text-xs text-white flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                        style={{ backgroundColor: selectedTheme.primary, color: selectedTheme.id === "dark" ? "#000" : "#fff" }}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Agendar Online</span>
                      </button>

                      <a
                        href={business?.phone ? `https://wa.me/55${business.phone.replace(/\D/g, "")}` : "#"}
                        target="_blank"
                        className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 font-bold text-xs text-white flex items-center justify-center gap-1.5 border border-white/15"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-center">
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="font-black text-xs text-white block">4.9 ★</span>
                        <span className="text-[8px] text-white/60 uppercase">Google</span>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="font-black text-xs text-emerald-400 block">+2.500</span>
                        <span className="text-[8px] text-white/60 uppercase">Clientes</span>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="font-black text-xs text-teal-300 block">100%</span>
                        <span className="text-[8px] text-white/60 uppercase">Pontual</span>
                      </div>
                    </div>
                  </div>

                  {/* Seção Sobre Nós & Pilares */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Sobre o Espaço
                    </span>
                    <p className="text-[10px] text-white/80 leading-relaxed">
                      {description}
                    </p>

                    {differentials.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {differentials.map((d, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[9px] text-white/90 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cardápio de Serviços & Valores */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                        Procedimentos em Destaque
                      </span>
                      <span className="text-[8px] text-white/50">Ver todos</span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { name: "Corte Degradê / Social Master", price: "R$ 65,00", time: "45 min" },
                        { name: "Barba Terapia Toalha Quente", price: "R$ 50,00", time: "35 min" },
                        { name: "Combo Executivo Completo", price: "R$ 105,00", time: "75 min" },
                      ].map((s, i) => (
                        <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[10px] text-white">{s.name}</p>
                            <p className="text-[8px] text-white/60">{s.time}</p>
                          </div>
                          <span className="font-black text-[11px] text-emerald-400">{s.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipe de Especialistas */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Nossos Artistas
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                        <div className="h-10 w-10 mx-auto rounded-full bg-emerald-600/30 text-emerald-400 font-black text-xs flex items-center justify-center">
                          LM
                        </div>
                        <p className="font-bold text-[10px] text-white">Lucas Mendes</p>
                        <p className="text-[8px] text-emerald-400">Master Barber</p>
                      </div>

                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                        <div className="h-10 w-10 mx-auto rounded-full bg-indigo-600/30 text-indigo-400 font-black text-xs flex items-center justify-center">
                          GS
                        </div>
                        <p className="font-bold text-[10px] text-white">Gabriel Santos</p>
                        <p className="text-[8px] text-indigo-400">Especialista Visagismo</p>
                      </div>
                    </div>
                  </div>

                  {/* Depoimento VIP */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex text-amber-400 text-[10px]">★★★★★</div>
                    <p className="text-[9px] text-white/80 italic">"Melhor barbearia de Araruama! Toalha quente impecável e atendimento 10 estrelas."</p>
                    <p className="text-[8px] font-bold text-white/60">— Rodrigo A., Cliente VIP</p>
                  </div>

                  {/* Horários e Localização */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-[10px]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-white/80"><strong>Horários:</strong> {openingHours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white/80 truncate">{business?.city ? `${business.city}, ${business?.state || "RJ"}` : "Brasil"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Aba Agendamento Preview */
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Scissors className="h-3.5 w-3.5 text-emerald-400" />
                      Escolha o Serviço
                    </span>
                    <span className="text-[10px] text-white/60">Passo 1 de 3</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Corte Degradê / Social", price: "R$ 55,00", time: "40 min" },
                      { name: "Barba Terapia Completa", price: "R$ 45,00", time: "30 min" },
                      { name: "Combo Cabelo + Barba VIP", price: "R$ 90,00", time: "60 min" },
                    ].map((svc, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between hover:bg-white/15 transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-[11px] text-white">{svc.name}</p>
                          <p className="text-[9px] text-white/70">{svc.time}</p>
                        </div>
                        <span className="font-black text-xs text-emerald-400">{svc.price}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    className="w-full h-8 text-[11px] font-bold bg-emerald-600 text-white rounded-xl shadow-xs mt-2"
                  >
                    Continuar Agendamento
                  </Button>
                </div>
              )}
            </div>

            {/* Smartphone Bottom Bar */}
            <div className="h-4 bg-neutral-900 flex items-center justify-center">
              <div className="h-1 w-24 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
