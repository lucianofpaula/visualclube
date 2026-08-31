"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  Calendar, 
  Receipt, 
  TrendingUp, 
  Users, 
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Store,
  LogOut,
  User,
  ExternalLink,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { getCurrentUserAction, handleSignOut } from "@/actions/auth-actions"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onOpenAuth: (mode?: "login" | "register") => void
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detecta scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Carrega usuário autenticado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserAction()
        setCurrentUser(user)
      } catch (err) {
        console.error("Erro ao carregar sessão:", err)
      } finally {
        setLoadingUser(false)
      }
    }
    fetchUser()
  }, [])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "VC"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/70 py-3 shadow-md"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl tracking-wider">V</span>
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5 leading-none">
              VisualClube
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5 hidden sm:block">
              Gestão para Barbearias & Estética
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links - Com espaçamento expandido e sem quebra */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <a
            href="#recursos"
            className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Recursos
          </a>
          <a
            href="#segmentos"
            className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Para Quem É
          </a>
          <a
            href="#comandas"
            className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Comandas & Finanças
          </a>
          <a
            href="#calculadora"
            className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Calculadora ROI
          </a>
          <a
            href="#planos"
            className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Planos
          </a>
          <a
            href="#faq"
            className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Dúvidas
          </a>
        </nav>

        {/* Action Buttons / User Session & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <ThemeToggle />

          {!loadingUser && currentUser ? (
            /* USUÁRIO AUTENTICADO: Avatar com Menu Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all shadow-xs hover:shadow-md"
              >
                <div className="flex flex-col text-right hidden md:block">
                  <span className="text-xs font-extrabold text-foreground leading-tight truncate max-w-[130px]">
                    {currentUser.name?.split(" ")[0] || "Usuário"}
                  </span>
                  <span className="text-[10px] text-primary font-semibold truncate max-w-[130px]">
                    {currentUser.business?.name || "Minha Conta"}
                  </span>
                </div>

                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs overflow-hidden border border-white/20">
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>

                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", userDropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu Suspenso */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl p-3 shadow-2xl space-y-2 animate-in fade-in-50 zoom-in-95 z-50">
                  {/* Cabeçalho do Perfil */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
                    <p className="text-xs font-black text-foreground truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{currentUser.email || currentUser.phone}</p>
                    <Badge variant="outline" className="text-[9px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 mt-1">
                      <Crown className="h-3 w-3 mr-1" />
                      {currentUser.business ? "Dono de Estabelecimento" : "Membro VisualClube"}
                    </Badge>
                  </div>

                  {/* Links de Ação */}
                  <div className="space-y-1 text-xs font-semibold">
                    <Link
                      href="/app"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all group"
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        <span>Acessar Meu Painel</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    {currentUser.business && (
                      <Link
                        href="/app/meu-negocio"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl text-foreground hover:bg-muted transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-amber-500" />
                          <span className="truncate max-w-[170px]">{currentUser.business.name}</span>
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* Sair da Conta */}
                  <div className="pt-2 border-t border-border/50">
                    <form action={handleSignOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-all text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair da Conta</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* NÃO AUTENTICADO: Botões Entrar & Testar Grátis */
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                onClick={() => onOpenAuth("login")}
                className="text-xs font-bold uppercase tracking-wider hover:bg-muted text-foreground h-10 px-4 rounded-xl"
              >
                Entrar
              </Button>

              <Button
                onClick={() => onOpenAuth("register")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider px-5 h-10 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Testar 7 Dias Grátis</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          
          {currentUser ? (
            <Link
              href="/app"
              className="h-8 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Painel</span>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAuth("login")}
              className="text-xs h-8 px-2.5 font-bold"
            >
              Entrar
            </Button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border/60 bg-card/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            <a
              href="#recursos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Recursos
            </a>
            <a
              href="#segmentos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Para Quem É
            </a>
            <a
              href="#comandas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Comandas & Finanças
            </a>
            <a
              href="#calculadora"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Calculadora ROI
            </a>
            <a
              href="#planos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Planos & Preços
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              Dúvidas Frequentes
            </a>
          </nav>
          
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tema da Interface:</span>
            <ThemeToggle variant="pills" />
          </div>

          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            {currentUser ? (
              <div className="space-y-2">
                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Acessar Painel ({currentUser.name?.split(" ")[0]})</span>
                </Link>

                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-muted text-destructive font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair da Conta</span>
                  </button>
                </form>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenAuth("register")
                }}
                className="w-full h-11 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
              >
                Começar Teste Grátis de 7 Dias
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
