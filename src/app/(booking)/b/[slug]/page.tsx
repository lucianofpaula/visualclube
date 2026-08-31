"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  Scissors, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  Check, 
  ChevronRight, 
  MapPin, 
  Phone, 
  MessageSquare,
  Star,
  CheckCircle2,
  Store,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  Loader2,
  Share2,
  Award,
  ShieldCheck,
  Flame,
  Heart,
  Navigation,
  Quote,
  CheckCircle,
  Menu,
  X,
  Coffee,
  Wifi,
  Sparkle,
  Crown,
  Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { getPublicBusinessBySlug } from "@/actions/business-actions"
import { cn } from "@/lib/utils"

// Definição de Estilos por Paleta de Cores Selecionada
const THEME_STYLES: Record<string, {
  primaryBtn: string
  primaryText: string
  primaryBg: string
  primaryBorder: string
  gradientText: string
  badgeBg: string
  ring: string
  glow: string
  dot: string
  cardHover: string
  accentIcon: string
}> = {
  emerald: {
    primaryBtn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
    primaryText: "text-emerald-400",
    primaryBg: "bg-emerald-950/40",
    primaryBorder: "border-emerald-500/50 hover:border-emerald-400",
    gradientText: "from-emerald-400 via-teal-300 to-indigo-400",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ring: "ring-emerald-500 border-emerald-500",
    glow: "shadow-emerald-950/30",
    dot: "bg-emerald-500",
    cardHover: "hover:border-emerald-500/50 hover:shadow-emerald-950/30",
    accentIcon: "text-emerald-400",
  },
  gold: {
    primaryBtn: "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/30",
    primaryText: "text-amber-400",
    primaryBg: "bg-amber-950/40",
    primaryBorder: "border-amber-500/50 hover:border-amber-400",
    gradientText: "from-amber-300 via-yellow-200 to-orange-400",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ring: "ring-amber-500 border-amber-500",
    glow: "shadow-amber-950/30",
    dot: "bg-amber-500",
    cardHover: "hover:border-amber-500/50 hover:shadow-amber-950/30",
    accentIcon: "text-amber-400",
  },
  purple: {
    primaryBtn: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30",
    primaryText: "text-purple-400",
    primaryBg: "bg-purple-950/40",
    primaryBorder: "border-purple-500/50 hover:border-purple-400",
    gradientText: "from-purple-400 via-fuchsia-300 to-indigo-400",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    ring: "ring-purple-500 border-purple-500",
    glow: "shadow-purple-950/30",
    dot: "bg-purple-500",
    cardHover: "hover:border-purple-500/50 hover:shadow-purple-950/30",
    accentIcon: "text-purple-400",
  },
  blue: {
    primaryBtn: "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30",
    primaryText: "text-sky-400",
    primaryBg: "bg-sky-950/40",
    primaryBorder: "border-sky-500/50 hover:border-sky-400",
    gradientText: "from-sky-400 via-cyan-300 to-blue-500",
    badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    ring: "ring-sky-500 border-sky-500",
    glow: "shadow-sky-950/30",
    dot: "bg-sky-500",
    cardHover: "hover:border-sky-500/50 hover:shadow-sky-950/30",
    accentIcon: "text-sky-400",
  },
  rose: {
    primaryBtn: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30",
    primaryText: "text-rose-400",
    primaryBg: "bg-rose-950/40",
    primaryBorder: "border-rose-500/50 hover:border-rose-400",
    gradientText: "from-rose-400 via-pink-300 to-purple-400",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    ring: "ring-rose-500 border-rose-500",
    glow: "shadow-rose-950/30",
    dot: "bg-rose-500",
    cardHover: "hover:border-rose-500/50 hover:shadow-rose-950/30",
    accentIcon: "text-rose-400",
  },
  dark: {
    primaryBtn: "bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/20",
    primaryText: "text-white",
    primaryBg: "bg-neutral-900/80",
    primaryBorder: "border-neutral-700 hover:border-white",
    gradientText: "from-white via-neutral-300 to-neutral-500",
    badgeBg: "bg-white/10 text-white border-white/20",
    ring: "ring-white border-white",
    glow: "shadow-black/50",
    dot: "bg-white",
    cardHover: "hover:border-neutral-500 hover:shadow-black/50",
    accentIcon: "text-white",
  },
  "midnight-gold": {
    primaryBtn: "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-neutral-950 font-black shadow-amber-500/30",
    primaryText: "text-yellow-400",
    primaryBg: "bg-amber-950/40",
    primaryBorder: "border-yellow-500/50 hover:border-yellow-400",
    gradientText: "from-yellow-300 via-amber-200 to-yellow-500",
    badgeBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ring: "ring-yellow-500 border-yellow-500",
    glow: "shadow-amber-950/40",
    dot: "bg-yellow-400",
    cardHover: "hover:border-yellow-500/50 hover:shadow-amber-950/30",
    accentIcon: "text-yellow-400",
  },
  "moka-leather": {
    primaryBtn: "bg-gradient-to-r from-amber-700 via-amber-800 to-yellow-900 hover:from-amber-600 hover:to-amber-800 text-white shadow-amber-900/40 font-bold",
    primaryText: "text-amber-300",
    primaryBg: "bg-amber-950/50",
    primaryBorder: "border-amber-700/50 hover:border-amber-500",
    gradientText: "from-amber-300 via-yellow-200 to-stone-400",
    badgeBg: "bg-amber-700/20 text-amber-300 border-amber-700/30",
    ring: "ring-amber-700 border-amber-700",
    glow: "shadow-amber-950/40",
    dot: "bg-amber-600",
    cardHover: "hover:border-amber-700/60 hover:shadow-amber-950/40",
    accentIcon: "text-amber-400",
  },
  "sunset-glow": {
    primaryBtn: "bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:opacity-95 text-white shadow-orange-500/30 font-bold",
    primaryText: "text-orange-400",
    primaryBg: "bg-orange-950/40",
    primaryBorder: "border-orange-500/50 hover:border-orange-400",
    gradientText: "from-orange-400 via-amber-300 to-rose-400",
    badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    ring: "ring-orange-500 border-orange-500",
    glow: "shadow-orange-950/30",
    dot: "bg-orange-500",
    cardHover: "hover:border-orange-500/50 hover:shadow-orange-950/30",
    accentIcon: "text-orange-400",
  },
  "titanium-noir": {
    primaryBtn: "bg-zinc-100 hover:bg-white text-zinc-950 shadow-white/10 font-bold",
    primaryText: "text-zinc-200",
    primaryBg: "bg-zinc-900/60",
    primaryBorder: "border-zinc-600 hover:border-zinc-400",
    gradientText: "from-zinc-100 via-neutral-300 to-zinc-400",
    badgeBg: "bg-zinc-800 text-zinc-200 border-zinc-700",
    ring: "ring-zinc-400 border-zinc-400",
    glow: "shadow-black/60",
    dot: "bg-zinc-300",
    cardHover: "hover:border-zinc-500 hover:shadow-black/50",
    accentIcon: "text-zinc-300",
  },
  "matcha-zen": {
    primaryBtn: "bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-800/30 font-bold",
    primaryText: "text-lime-300",
    primaryBg: "bg-emerald-950/40",
    primaryBorder: "border-lime-600/50 hover:border-lime-500",
    gradientText: "from-lime-300 via-emerald-200 to-teal-300",
    badgeBg: "bg-lime-600/15 text-lime-300 border-lime-600/25",
    ring: "ring-lime-600 border-lime-600",
    glow: "shadow-emerald-950/30",
    dot: "bg-lime-500",
    cardHover: "hover:border-lime-600/50 hover:shadow-emerald-950/30",
    accentIcon: "text-lime-400",
  },
}

export default function PublicInstitutionalWebsitePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("")
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("TODOS")

  // Agendamento State
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProf, setSelectedProf] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>("Hoje")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  // Desembrulha os parâmetros de rota e busca o negócio real
  useEffect(() => {
    params.then(async (p) => {
      setSlug(p.slug)
      if (p.slug) {
        const data = await getPublicBusinessBySlug(p.slug)
        setBusiness(data)
      }
      setLoading(false)
    })
  }, [params])

  const themeKey = (business?.themeColor || "emerald").toLowerCase()
  const theme = THEME_STYLES[themeKey] || THEME_STYLES.emerald

  const businessName = business?.name || (slug ? slug.replace(/-/g, " ") : "VisualClube Espaço")
  const businessAddress = business?.address || "Atendimento com hora marcada"
  const businessCity = business?.city || "Brasil"
  const businessState = business?.state || "BR"
  const businessPhone = business?.phone || ""
  const businessLogo = business?.logoUrl || null
  const businessBanner = business?.bannerUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&auto=format&fit=crop&q=80"
  const businessDesc = business?.description || "Referência em excelência, estilo e bem-estar. Unimos técnica impecável, produtos de linha internacional e um ambiente sofisticado para você viver a melhor experiência."
  const openingHours = business?.openingHours || "Segunda a Sábado: 09h às 20h"

  // Serviços
  const services = business?.services && business.services.length > 0 ? business.services : [
    { id: "1", name: "Corte Degradê / Social Master", duration: 45, price: 65.0, category: "Cabelo", desc: "Lavagem com shampoo premium, visagismo personalizado e finalização com pomada matte." },
    { id: "2", name: "Barba Terapia com Toalha Quente", duration: 35, price: 50.0, category: "Barba", desc: "Esfoliação facial, aplicação de óleo essencial, toalha vaporizada e massagem pós-barba." },
    { id: "3", name: "Combo Executivo (Cabelo + Barba)", duration: 75, price: 105.0, category: "Combos", desc: "Experiência completa com direito a cerveja artesanal ou café espresso cortesia." },
    { id: "4", name: "Tratamento Capilar & Hidratação", duration: 30, price: 45.0, category: "Cabelo", desc: "Nutrição profunda dos fios com reconstrução capilar e massagem relaxante no couro cabeludo." },
    { id: "5", name: "Design de Sobrancelha & Acabamento", duration: 20, price: 30.0, category: "Estética", desc: "Alinhamento com navalha e pinça respeitando o desenho natural do rosto." },
  ]

  // Categorias únicas
  const categories: string[] = ["TODOS", ...Array.from(new Set<string>(services.map((s: any) => (s.category as string) || "Geral")))]

  // Profissionais
  const professionals = business?.professionals && business.professionals.length > 0 ? business.professionals : [
    { id: "1", name: "Lucas Mendes", specialty: "Master Barber & Visagista", rating: "4.9", experience: "8 anos de experiência", initials: "LM", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
    { id: "2", name: "Gabriel Santos", specialty: "Especialista em Degradê & Barboterapia", rating: "4.8", experience: "5 anos de experiência", initials: "GS", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" },
    { id: "3", name: "Matheus Silveira", specialty: "Especialista em Cortes Clássicos", rating: "5.0", experience: "6 anos de experiência", initials: "MS", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" },
  ]

  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:30", "18:30", "19:30"]

  // Galeria de Fotos Institucionais
  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80", title: "Bancadas Clássicas" },
    { url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80", title: "Barboterapia" },
    { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80", title: "Corte & Estilo" },
    { url: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&auto=format&fit=crop&q=80", title: "Lounge de Espera" },
  ]

  // Depoimentos
  const testimonials = [
    { name: "Rodrigo Almeida", role: "Cliente VIP", comment: "Melhor atendimento da região! O ambiente é espetacular, toalha quente na barba e ainda tomo um café de primeira.", rating: 5, date: "Semana passada" },
    { name: "Felipe Nogueira", role: "Cliente Frequente", comment: "Agendar online pelo site facilitou minha vida. Chego no horário certinho e não perco 1 minuto de fila.", rating: 5, date: "Há 2 dias" },
    { name: "Carlos Eduardo", role: "Cliente VIP", comment: "Profissionais extremamente detalhistas. O corte dura semanas impecável. Recomendo de olhos fechados.", rating: 5, date: "Ontem" },
  ]

  // Planos de Assinatura Recorrente (Clube VIP)
  const subscriptionPlans = business?.subscriptions && business.subscriptions.length > 0 ? business.subscriptions : []

  // Filtro de serviços
  const filteredServices = activeCategory === "TODOS" 
    ? services 
    : services.filter((s: any) => (s.category || "Geral") === activeCategory)

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={cn("h-10 w-10 animate-spin", theme.accentIcon)} />
          <p className="text-sm text-neutral-400 font-semibold tracking-wider uppercase">Carregando website institucional...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white font-sans antialiased">
      
      {/* ─────────────────────────────────────────────────────────────
          1. NAVBAR INSTITUCIONAL FIXA
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
          
          {/* Logo & Marca */}
          <a href="#inicio" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white font-black text-xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform">
              {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                businessName.charAt(0).toUpperCase() || "V"
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-neutral-200 transition-colors uppercase">
                {businessName}
              </span>
              <span className="text-[10px] text-neutral-400 tracking-wider font-semibold uppercase flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-full inline-block animate-pulse", theme.dot)} />
                {businessCity} • {businessState}
              </span>
            </div>
          </a>

          {/* Links de Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <button onClick={() => scrollToSection("inicio")} className="hover:text-white transition-colors">Início</button>
            <button onClick={() => scrollToSection("sobre")} className="hover:text-white transition-colors">Sobre</button>
            <button onClick={() => scrollToSection("servicos")} className="hover:text-white transition-colors">Procedimentos</button>
            {subscriptionPlans.length > 0 && (
              <button onClick={() => scrollToSection("planos")} className={cn("transition-colors font-black flex items-center gap-1", theme.primaryText)}>
                <Crown className="h-3.5 w-3.5" />
                <span>Planos VIP</span>
              </button>
            )}
            <button onClick={() => scrollToSection("equipe")} className="hover:text-white transition-colors">Especialistas</button>
            <button onClick={() => scrollToSection("galeria")} className="hover:text-white transition-colors">O Espaço</button>
            <button onClick={() => scrollToSection("depoimentos")} className="hover:text-white transition-colors">Avaliações</button>
            <button onClick={() => scrollToSection("localizacao")} className="hover:text-white transition-colors">Localização</button>
          </nav>

          {/* Ações Direitas */}
          <div className="hidden sm:flex items-center gap-3">
            {businessPhone && (
              <a
                href={`https://wa.me/55${businessPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className={cn("h-4 w-4", theme.accentIcon)} />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              onClick={() => scrollToSection("agendamento")}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg transition-all hover:scale-105 active:scale-95",
                theme.primaryBtn
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>Agendar Horário</span>
            </button>
          </div>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Drawer Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-800 bg-neutral-950 p-6 space-y-4 animate-in slide-in-from-top-4">
            <div className="flex flex-col space-y-3 text-sm font-bold uppercase tracking-wider text-neutral-300">
              <button onClick={() => scrollToSection("inicio")} className="text-left py-2 hover:text-white">Início</button>
              <button onClick={() => scrollToSection("sobre")} className="text-left py-2 hover:text-white">Sobre o Espaço</button>
              <button onClick={() => scrollToSection("servicos")} className="text-left py-2 hover:text-white">Serviços & Preços</button>
              {subscriptionPlans.length > 0 && (
                <button onClick={() => scrollToSection("planos")} className={cn("text-left py-2 flex items-center gap-1.5 font-black", theme.primaryText)}>
                  <Crown className="h-4 w-4" />
                  <span>Planos de Assinatura VIP</span>
                </button>
              )}
              <button onClick={() => scrollToSection("equipe")} className="text-left py-2 hover:text-white">Nossa Equipe</button>
              <button onClick={() => scrollToSection("galeria")} className="text-left py-2 hover:text-white">Galeria de Fotos</button>
              <button onClick={() => scrollToSection("localizacao")} className="text-left py-2 hover:text-white">Localização & Contato</button>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <button
                onClick={() => scrollToSection("agendamento")}
                className={cn(
                  "w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md",
                  theme.primaryBtn
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Agendar Horário Agora</span>
              </button>
              {businessPhone && (
                <a
                  href={`https://wa.me/55${businessPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  className="w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <MessageSquare className={cn("h-4 w-4", theme.accentIcon)} />
                  <span>Falar no WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION CINEMATOGRÁFICO
      ───────────────────────────────────────────────────────────── */}
      <section id="inicio" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-24">
        <div className="absolute inset-0 z-0">
          <img
            src={businessBanner}
            alt={businessName}
            className="w-full h-full object-cover scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold uppercase tracking-widest animate-in fade-in-50",
            theme.badgeBg
          )}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>Experiência & Cuidado Premium</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none">
            A Arte do Estilo &<br />
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", theme.gradientText)}>
              Excelência Impecável.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed">
            {businessDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => scrollToSection("agendamento")}
              className={cn(
                "w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2",
                theme.primaryBtn
              )}
            >
              <Calendar className="h-5 w-5" />
              <span>Agendar Meu Horário Online</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <button
              onClick={() => scrollToSection("servicos")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 font-bold text-sm uppercase tracking-wider backdrop-blur-md transition-all hover:border-neutral-500"
            >
              <span>Ver Serviços & Valores</span>
            </button>
          </div>

          {/* Social Proof Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-neutral-800/80">
            <div className="p-3 text-center space-y-0.5">
              <p className="text-2xl sm:text-3xl font-black text-white">4.9 ★</p>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Avaliação no Google</p>
            </div>
            <div className="p-3 text-center space-y-0.5">
              <p className={cn("text-2xl sm:text-3xl font-black", theme.primaryText)}>+2.500</p>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Clientes Satisfeitos</p>
            </div>
            <div className="p-3 text-center space-y-0.5">
              <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Pontualidade & Conforto</p>
            </div>
            <div className="p-3 text-center space-y-0.5">
              <p className={cn("text-2xl sm:text-3xl font-black", theme.primaryText)}>VIP</p>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Bebida & Café Cortesia</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SEÇÃO SOBRE NÓS & PILARES
      ───────────────────────────────────────────────────────────── */}
      <section id="sobre" className="py-24 bg-neutral-900/40 border-y border-neutral-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Foto Editorial do Espaço */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-neutral-700/60 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1000&auto=format&fit=crop&q=80"
                  alt="Espaço e Atendimento"
                  className="w-full h-[460px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-amber-400" />
                    <div>
                      <p className="font-extrabold text-sm text-white">Espaço Certificado VisualClube</p>
                      <p className="text-xs text-neutral-400">Padrão Ouro em Higiene & Atendimento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Textos Institucionais & Pilares */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className={cn("text-xs font-bold uppercase tracking-widest", theme.primaryText)}>
                  Nossa História & Propósito
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Mais que um corte,<br />uma experiência completa de bem-estar.
                </h2>
              </div>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                Fundada para transformar a rotina em um momento de cuidado exclusivo, a <strong className="text-white">{businessName}</strong> une as melhores técnicas da estética moderna à atmosfera clássica de acolhimento e hospitalidade.
              </p>

              {/* Grid de 4 Pilares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center font-bold", theme.badgeBg)}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Higiene Absoluta</h4>
                  <p className="text-xs text-neutral-400">Materiais 100% descartáveis e navalhas esterilizadas.</p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <Coffee className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Lounge & Bar Cortesia</h4>
                  <p className="text-xs text-neutral-400">Café espresso cremoso e cerveja artesanal gelada.</p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center font-bold", theme.badgeBg)}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Sem Fila de Espera</h4>
                  <p className="text-xs text-neutral-400">Agendamento pontual com cadeira reservada para você.</p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Wi-Fi & Climatizado</h4>
                  <p className="text-xs text-neutral-400">Ambiente 100% refrigerado com internet de alta velocidade.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CATÁLOGO COMPLETO DE SERVIÇOS & PROCEDIMENTOS
      ───────────────────────────────────────────────────────────── */}
      <section id="servicos" className="py-24 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className={cn("text-xs font-bold uppercase tracking-widest", theme.primaryText)}>
            Cardápio de Serviços & Valores
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Procedimentos Realizados com Perfeição
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Consulte nossos preços, tempo de atendimento e escolha o serviço ideal para o seu estilo.
          </p>

          {/* Filtros de Categoria */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  activeCategory === cat
                    ? theme.primaryBtn
                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Cards de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc: any) => (
            <div
              key={svc.id}
              className={cn(
                "group p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1",
                theme.cardHover
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border", theme.badgeBg)}>
                    {svc.category || "Geral"}
                  </span>
                  <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-neutral-500" />
                    {typeof svc.duration === "number" ? `${svc.duration} min` : svc.duration}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-white transition-colors">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                    {svc.desc || svc.description || "Procedimento completo com cosméticos de alta qualidade e finalização profissional."}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Investimento</span>
                  <span className="text-xl font-black text-white">
                    {typeof svc.price === "number" ? `R$ ${svc.price.toFixed(2).replace(".", ",")}` : svc.price}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedService(svc)
                    scrollToSection("agendamento")
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5",
                    theme.badgeBg,
                    "hover:bg-opacity-80"
                  )}
                >
                  <span>Agendar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4.1 CLUBE DE ASSINATURAS & PLANOS VIP
      ───────────────────────────────────────────────────────────── */}
      {subscriptionPlans.length > 0 && (
        <section id="planos" className="py-24 bg-neutral-900/60 border-t border-neutral-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold uppercase tracking-widest", theme.badgeBg)}>
                <Crown className="h-3.5 w-3.5" />
                <span>Assinaturas Mensais Recorrentes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Faça Parte do Nosso Clube VIP
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Economize todo mês, garanta seus atendimentos com prioridade na agenda e desfrute de vantagens e descontos exclusivos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subscriptionPlans.map((plan: any) => {
                const includedRules = Array.isArray(plan.servicesRules) ? plan.servicesRules : []
                const message = encodeURIComponent(`Olá! Gostaria de assinar o plano *${plan.name}* (R$ ${plan.priceMonthly.toFixed(2)}/mês) no ${businessName}!`)
                const whatsappUrl = businessPhone ? `https://wa.me/55${businessPhone.replace(/\D/g, "")}?text=${message}` : "#agendamento"

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-3xl bg-neutral-950 border border-neutral-800 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl overflow-hidden group",
                      theme.cardHover
                    )}
                  >
                    <div className="space-y-6">
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          {plan.badge && (
                            <span className={cn("text-[10px] font-black uppercase px-2.5 py-1 rounded-md border inline-block", theme.badgeBg)}>
                              {plan.badge}
                            </span>
                          )}
                          <h3 className="text-2xl font-black text-white tracking-tight">
                            {plan.name}
                          </h3>
                        </div>
                        <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center border shrink-0", theme.badgeBg)}>
                          <Crown className="h-5 w-5" />
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 leading-relaxed min-h-[36px]">
                        {plan.description || "Assinatura mensal com serviços inclusos e benefícios exclusivos."}
                      </p>

                      {/* Preço */}
                      <div className="pt-4 border-t border-neutral-800/80 flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-neutral-400">R$</span>
                        <span className="text-4xl font-black text-white tracking-tight">
                          {plan.priceMonthly.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-xs text-neutral-400 font-semibold">
                          /{plan.billingCycle === "YEARLY" ? "ano" : plan.billingCycle === "QUARTERLY" ? "trimestre" : "mês"}
                        </span>
                      </div>

                      {plan.productDiscountPercent > 0 && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                          <Tag className="h-3.5 w-3.5" />
                          <span>+{plan.productDiscountPercent}% de desconto em cosméticos</span>
                        </div>
                      )}

                      {/* Comparativo de Serviços Inclusos vs Não Inclusos */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Scissors className="h-3.5 w-3.5 text-purple-400" />
                            Serviços do Espaço
                          </p>
                          <span className="text-[10px] text-neutral-500 font-bold">
                            {includedRules.length} de {services.length} inclusos
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {services.map((svc: any) => {
                            const isIncluded =
                              plan.includedServiceIds?.includes(svc.id) ||
                              includedRules.some((r: any) => r.serviceId === svc.id)
                            const rule = includedRules.find((r: any) => r.serviceId === svc.id)

                            if (isIncluded) {
                              return (
                                <div key={svc.id} className="flex items-center justify-between text-xs py-0.5">
                                  <span className="flex items-center gap-2 truncate text-neutral-100 font-semibold">
                                    <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                                    </span>
                                    <span className="truncate">{svc.name}</span>
                                  </span>
                                  <span className="text-[10px] font-extrabold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-500/30 shrink-0">
                                    {rule?.limitType === "FIXED" ? `${rule.monthlyLimit}x/mês` : "Ilimitado"}
                                  </span>
                                </div>
                              )
                            } else {
                              return (
                                <div key={svc.id} className="flex items-center justify-between text-xs py-0.5 text-neutral-500">
                                  <span className="flex items-center gap-2 truncate">
                                    <span className="h-4 w-4 rounded-full bg-neutral-800/80 text-neutral-500 flex items-center justify-center shrink-0">
                                      <X className="h-2.5 w-2.5 stroke-[2.5]" />
                                    </span>
                                    <span className="truncate line-through text-neutral-500">{svc.name}</span>
                                  </span>
                                  <span className="text-[10px] text-neutral-600 italic shrink-0">
                                    Não incluso
                                  </span>
                                </div>
                              )
                            }
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Botão CTA Assinar */}
                    <div className="pt-6 mt-6 border-t border-neutral-800/80">
                      <a
                        href={whatsappUrl}
                        target={businessPhone ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={cn(
                          "w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 text-center",
                          theme.primaryBtn
                        )}
                      >
                        <Crown className="h-4 w-4" />
                        <span>Quero Assinar este Plano</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. EQUIPE DE PROFISSIONAIS
      ───────────────────────────────────────────────────────────── */}
      <section id="equipe" className="py-24 bg-neutral-900/40 border-y border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className={cn("text-xs font-bold uppercase tracking-widest", theme.primaryText)}>
              Equipe de Especialistas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Profissionais Apaixonados pelo que Fazem
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Mestres barbeiros e estilistas com anos de treinamento para entregar o resultado impecável que você merece.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {professionals.map((prof: any) => (
              <div
                key={prof.id}
                className="group rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all text-center p-6 space-y-4"
              >
                <div className="relative h-44 w-44 mx-auto rounded-full overflow-hidden border-4 border-neutral-800 transition-colors shadow-xl">
                  {prof.avatarUrl || prof.image ? (
                    <img src={prof.avatarUrl || prof.image} alt={prof.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center text-white text-3xl font-black">
                      {prof.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-white">{prof.name}</h3>
                  <p className={cn("text-xs font-bold", theme.primaryText)}>{prof.specialty || prof.role || "Especialista"}</p>
                  <p className="text-xs text-neutral-500 font-medium line-clamp-2">{prof.bio || prof.experience || "Especialista em atendimento de excelência"}</p>
                </div>

                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold pt-2 border-t border-neutral-900">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{prof.rating || "5.0"} (140+ avaliações)</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProf(prof)
                    scrollToSection("agendamento")
                  }}
                  className={cn(
                    "w-full py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                    theme.badgeBg,
                    "hover:bg-opacity-80"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Agendar com {prof.name.split(" ")[0]}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. GALERIA DE FOTOS DO ESPAÇO
      ───────────────────────────────────────────────────────────── */}
      <section id="galeria" className="py-24 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className={cn("text-xs font-bold uppercase tracking-widest", theme.primaryText)}>
            Ambiente & Estrutura
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Conheça o Nosso Espaço
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Cada detalhe foi planejado para oferecer conforto, estilo e um momento único de relaxamento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="group relative h-72 rounded-3xl overflow-hidden border border-neutral-800 shadow-xl"
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="font-black text-sm text-white drop-shadow-md">{img.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. DEPOIMENTOS DE CLIENTES
      ───────────────────────────────────────────────────────────── */}
      <section id="depoimentos" className="py-24 bg-neutral-900/40 border-y border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className={cn("text-xs font-bold uppercase tracking-widest", theme.primaryText)}>
              Opinião de Quem Frequenta
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              O que Nossos Clientes Dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-300 italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-900 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-sm text-white">{t.name}</p>
                    <p className={cn("text-[11px] font-semibold", theme.primaryText)}>{t.role}</p>
                  </div>
                  <span className="text-[10px] text-neutral-500">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. MÓDULO DE AGENDAMENTO ONLINE INTEGRADO
      ───────────────────────────────────────────────────────────── */}
      <section id="agendamento" className="py-24 max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className={cn("text-xs font-bold uppercase tracking-widest", theme.primaryText)}>
            Reserve seu Atendimento
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Agende Online em 30 Segundos
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
            Escolha o procedimento, o profissional de sua preferência e o melhor horário na grade diária.
          </p>
        </div>

        {/* Card Interativo de Agendamento */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {!bookingConfirmed ? (
            <div className="space-y-6">
              {/* Resumo ou Seleção do Procedimento */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  1. Procedimento Escolhido
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {services.map((svc: any) => (
                    <div
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      className={cn(
                        "cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between",
                        selectedService?.id === svc.id
                          ? cn("text-white ring-1 shadow-md", theme.primaryBg, theme.ring)
                          : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 text-neutral-300"
                      )}
                    >
                      <div>
                        <p className="font-bold text-xs">{svc.name}</p>
                        <p className="text-[11px] text-neutral-400">{typeof svc.duration === "number" ? `${svc.duration} min` : svc.duration}</p>
                      </div>
                      <span className={cn("font-black text-xs", theme.primaryText)}>
                        {typeof svc.price === "number" ? `R$ ${svc.price.toFixed(2).replace(".", ",")}` : svc.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seleção do Profissional */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  2. Especialista Preferido
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {professionals.map((prof: any) => (
                    <div
                      key={prof.id}
                      onClick={() => setSelectedProf(prof)}
                      className={cn(
                        "cursor-pointer p-3 rounded-2xl border transition-all text-center space-y-1",
                        selectedProf?.id === prof.id
                          ? cn("text-white ring-1 shadow-md", theme.primaryBg, theme.ring)
                          : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 text-neutral-300"
                      )}
                    >
                      <p className="font-bold text-xs text-white">{prof.name}</p>
                      <p className={cn("text-[10px]", theme.primaryText)}>{prof.specialty || prof.role || "Especialista"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data & Horários */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  3. Escolha o Horário
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {times.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={cn(
                        "py-2.5 rounded-xl border text-xs font-bold transition-all",
                        selectedTime === t
                          ? cn("shadow-lg", theme.primaryBtn)
                          : "border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  4. Seus Dados de Contato
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    required
                    placeholder="Seu Nome Completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-12 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                  />
                  <Input
                    required
                    placeholder="WhatsApp (com DDD)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="h-12 rounded-xl bg-neutral-950 border-neutral-800 text-sm text-white placeholder:text-neutral-500"
                  />
                </div>
              </div>

              {/* Botão de Finalização */}
              <Button
                type="button"
                disabled={!selectedService || !selectedTime || !clientName.trim() || clientPhone.length < 10}
                onClick={() => setBookingConfirmed(true)}
                className={cn(
                  "w-full font-black text-sm uppercase tracking-wider h-14 rounded-2xl shadow-xl gap-2 mt-4",
                  theme.primaryBtn
                )}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Confirmar Reserva de Horário</span>
              </Button>
            </div>
          ) : (
            /* Tela de Confirmação */
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
              <div className={cn("h-20 w-20 rounded-full border flex items-center justify-center mx-auto mb-3 animate-bounce", theme.badgeBg)}>
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Reserva Confirmada com Sucesso! 🎉
              </h3>

              <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                Parabéns, <strong className="text-white">{clientName}</strong>! Seu horário para <strong className={theme.primaryText}>{selectedService?.name}</strong> foi reservado para <strong className="text-white">{selectedDate} às {selectedTime}</strong> com <strong className="text-white">{selectedProf?.name || "nossa equipe"}</strong>.
              </p>

              <div className={cn("p-4 rounded-2xl border text-xs font-semibold max-w-md mx-auto", theme.badgeBg)}>
                Enviamos os detalhes e lembretes automáticos para seu WhatsApp!
              </div>

              <Button
                type="button"
                onClick={() => {
                  setBookingConfirmed(false)
                  setSelectedService(null)
                  setSelectedProf(null)
                  setSelectedTime("")
                  setClientName("")
                  setClientPhone("")
                }}
                variant="outline"
                className="rounded-xl border-neutral-700 text-white hover:bg-neutral-800 font-bold text-xs"
              >
                Realizar Novo Agendamento
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. LOCALIZAÇÃO, MAPA & CONTATO
      ───────────────────────────────────────────────────────────── */}
      <section id="localizacao" className="py-24 bg-neutral-900/40 border-t border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Informações de Contato */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className={cn("text-xs font-bold uppercase tracking-widest", theme.primaryText)}>
                  Como Chegar & Horários
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Estamos Prontos para Receber Você
                </h2>
              </div>

              <div className="space-y-4 text-sm text-neutral-300">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <MapPin className={cn("h-5 w-5 shrink-0 mt-0.5", theme.accentIcon)} />
                  <div>
                    <strong className="block text-white font-bold">Endereço Oficial</strong>
                    <span className="text-xs text-neutral-400">{businessAddress} • {businessCity}, {businessState}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Horário de Funcionamento</strong>
                    <span className="text-xs text-neutral-400">{openingHours}</span>
                  </div>
                </div>

                {businessPhone && (
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <Phone className={cn("h-5 w-5 shrink-0 mt-0.5", theme.accentIcon)} />
                    <div>
                      <strong className="block text-white font-bold">WhatsApp de Atendimento</strong>
                      <span className="text-xs text-neutral-400">{businessPhone}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessName} ${businessAddress}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md", theme.primaryBtn)}
                >
                  <Navigation className="h-4 w-4" />
                  <span>Traçar Rota no Google Maps</span>
                </a>

                {businessPhone && (
                  <a
                    href={`https://wa.me/55${businessPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-2"
                  >
                    <MessageSquare className={cn("h-4 w-4", theme.accentIcon)} />
                    <span>Conversar no WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Simulação Visual do Mapa */}
            <div className="lg:col-span-6">
              <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950 flex items-center justify-center p-6 text-center group">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1000&auto=format&fit=crop&q=80"
                  alt="Mapa"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="relative z-10 space-y-3 p-6 rounded-2xl bg-neutral-950/90 border border-neutral-800 backdrop-blur-md max-w-sm">
                  <MapPin className={cn("h-8 w-8 mx-auto animate-bounce", theme.accentIcon)} />
                  <h4 className="font-extrabold text-sm text-white">{businessName}</h4>
                  <p className="text-xs text-neutral-400">{businessAddress}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessName} ${businessAddress}`)}`}
                    target="_blank"
                    className={cn("inline-flex items-center gap-1 text-xs font-bold hover:underline", theme.primaryText)}
                  >
                    <span>Abrir GPS / Navegação</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FOOTER INSTITUCIONAL COMPLETO
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-900 bg-black py-12 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-neutral-800 text-white font-black text-sm flex items-center justify-center">
              {businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-sm text-white uppercase">{businessName}</p>
              <p className="text-[10px] text-neutral-500">Website Oficial • Todos os direitos reservados © {new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-semibold uppercase tracking-wider text-[11px]">
            <button onClick={() => scrollToSection("inicio")} className="hover:text-white transition-colors">Início</button>
            <button onClick={() => scrollToSection("servicos")} className="hover:text-white transition-colors">Serviços</button>
            <button onClick={() => scrollToSection("equipe")} className="hover:text-white transition-colors">Equipe</button>
            <button onClick={() => scrollToSection("agendamento")} className="hover:text-white transition-colors">Agendar</button>
          </div>

          <p className="text-[10px] text-neutral-600">
            Desenvolvido pela plataforma <strong className="text-neutral-400">VisualClube SaaS</strong>
          </p>
        </div>
      </footer>
    </div>
  )
}
