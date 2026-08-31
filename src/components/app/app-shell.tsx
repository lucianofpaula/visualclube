"use client"

import * as React from "react"
import { useState, createContext, useContext, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Calendar, 
  Receipt, 
  Scissors, 
  Users, 
  Wallet, 
  Sparkles, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  Search, 
  LogOut, 
  Building2, 
  ExternalLink, 
  Plus, 
  Lock, 
  CreditCard,
  Crown,
  ShieldCheck,
  ChevronDown,
  Globe,
  Store,
  Sliders,
  StoreIcon,
  Package,
  PanelLeft,
  PanelLeftClose
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { handleSignOut } from "@/actions/auth-actions"
import { PlansModal } from "@/components/app/plans-modal"
import { PlatformPlanDTO, FeatureCatalogItemDTO } from "@/actions/subscription-actions"
import { PermissionsContext } from "@/lib/permissions"
import { getFeatureIcon } from "@/components/app/dynamic-icon"
import { ThemeManagerProvider } from "@/components/theme-manager"

interface SubscriptionContextType {
  subscription: any
  plans: PlatformPlanDTO[]
  featuresCatalog?: FeatureCatalogItemDTO[]
  openPlansModal: () => void
  isLocked: boolean
  hasFeature: (featureCode: string) => boolean
  hasBusiness: boolean
  business: any
  currentUser: any
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  plans: [],
  featuresCatalog: [],
  openPlansModal: () => {},
  isLocked: true,
  hasFeature: () => false,
  hasBusiness: false,
  business: null,
  currentUser: null,
})

export const useSubscription = () => useContext(SubscriptionContext)

interface AppShellProps {
  children: React.ReactNode
  plans: PlatformPlanDTO[]
  subscription: any
  featuresCatalog?: FeatureCatalogItemDTO[]
  currentUser?: any
}

export interface NavChildItem {
  id: string
  label: string
  href: string
  featureCode?: string | null
  badge?: string | null
}

export interface NavItemType {
  id: string
  label: string
  href?: string
  icon: React.ComponentType<any>
  featureCode: string | null
  badge?: string | null
  children?: NavChildItem[]
}

export function AppShell({ children, plans, subscription, featuresCatalog = [], currentUser }: AppShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [plansModalOpen, setPlansModalOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    meu_negocio: true,
  })

  // Detecta se está especificamente na Agenda para recolher a barra lateral automaticamente
  const isAgendaRoute = pathname === "/app/agenda" || pathname.startsWith("/app/agenda/")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Ao entrar na Agenda, recolhe a barra lateral automaticamente para dar espaço máximo à grade de horários
  useEffect(() => {
    if (isAgendaRoute) {
      setIsCollapsed(true)
    } else {
      setIsCollapsed(false)
    }
  }, [pathname, isAgendaRoute])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
    setIsHovered(false)
  }

  const isExpanded = !isCollapsed || isHovered

  const userName = currentUser?.name || "Gestor do Espaço"
  const userRole = currentUser?.role || "USER"
  const userImage = currentUser?.image || null
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "VC"

  const business = currentUser?.business || currentUser?.businesses?.[0]
  const hasBusiness = !!business
  const businessName = business?.name || null
  const businessSlug = business?.slug || ""
  const isAdmin = userRole === "ADMIN" || userRole === "OWNER"

  // Usuário bloqueado se NÃO tem plano ativo ou se o trial expirou (exceto ADMIN/OWNER)
  const isLocked = !isAdmin && (!subscription || subscription.status === "EXPIRED")
  const allowedFeatureCodes: string[] = subscription?.allowedFeatureCodes || []

  const hasFeature = (code: string) => {
    if (isAdmin) return true
    if (isLocked) return false
    return allowedFeatureCodes.includes(code)
  }

  const hasAnyFeature = (codes: string[]) => {
    if (isAdmin) return true
    if (isLocked) return false
    return codes.some((c) => allowedFeatureCodes.includes(c))
  }

  // Menus Dinâmicos gerados a partir do banco de dados (PlatformFeature)
  const navItems = React.useMemo<NavItemType[]>(() => {
    const items: NavItemType[] = [
      { id: "overview", label: "Visão Geral", href: "/app", icon: LayoutDashboard, featureCode: null },
    ]

    const isMeuNegocio = (f: { code: string; name: string }) => {
      const c = f.code.toLowerCase().replace(/[-_]/g, "")
      const n = f.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      return c.includes("meunegocio") || n.includes("meu negocio") || n.includes("meu espaco")
    }

    if (featuresCatalog && featuresCatalog.length > 0) {
      let insertedMeuNegocio = false

      for (const feat of featuresCatalog) {
        const IconComponent = getFeatureIcon(feat.icon || feat.code)

        // Se for o recurso Meu Negócio (cadastrado no banco)
        if (isMeuNegocio(feat)) {
          const children = (feat.children && feat.children.length > 0)
            ? feat.children.map((c) => ({
                id: c.id || c.code,
                label: c.name,
                href: c.menuPath || (c.code.includes("web") ? "/app/website" : "/app/configuracoes"),
                featureCode: c.code,
              }))
            : [
                { id: "website", label: "Website Premium", href: "/app/website", featureCode: null },
                { id: "configuracoes", label: "Configurações", href: "/app/configuracoes", featureCode: null },
              ]

          items.push({
            id: feat.id || feat.code,
            label: feat.name,
            icon: IconComponent || Store,
            featureCode: feat.code,
            children,
          })
          insertedMeuNegocio = true
          continue
        }

        // Se for o recurso Financeiro (Caixa & Extrato + Contas & Carteiras + Meios de Pagamento)
        if (feat.code === "financeiro") {
          items.push({
            id: feat.id || feat.code,
            label: "Financeiro",
            icon: IconComponent || Wallet,
            featureCode: feat.code,
            children: [
              { id: "fluxo_caixa", label: "Fluxo de Caixa & Extrato", href: "/app/financeiro", featureCode: "financeiro" },
              { id: "contas_carteiras", label: "Contas & Carteiras", href: "/app/financeiro/contas", featureCode: "financeiro" },
              { id: "meios_pagamento", label: "Meios de Pagamento", href: "/app/financeiro/meios-de-pagamento", featureCode: "financeiro" },
            ],
          })
          continue
        }

        // Se for o recurso Clube de Assinaturas (Planos do Clube + Configuração do Clube)
        if (feat.code === "clube_vip") {
          items.push({
            id: feat.id || feat.code,
            label: "Clube de Assinaturas",
            icon: IconComponent || Sparkles,
            featureCode: feat.code,
            children: [
              { id: "clube_planos", label: "Planos do Clube", href: "/app/clube", featureCode: "clube_vip" },
              { id: "clube_config", label: "Configuração do Clube", href: "/app/clube/configuracoes", featureCode: "clube_vip" },
            ],
          })
          continue
        }

        // Outros recursos do catálogo com sub-recursos
        if (feat.children && feat.children.length > 0) {
          items.push({
            id: feat.id || feat.code,
            label: feat.name,
            icon: IconComponent,
            featureCode: feat.code,
            children: feat.children.map((c) => ({
              id: c.id || c.code,
              label: c.name,
              href: c.menuPath || feat.menuPath || `/app/${feat.code.replace(/_/g, "-")}`,
              featureCode: c.code,
            })),
          })
        } else {
          items.push({
            id: feat.id || feat.code,
            label: feat.name,
            href: feat.menuPath || `/app/${feat.code.replace(/_/g, "-")}`,
            icon: IconComponent,
            featureCode: feat.code,
            badge: null,
          })
        }
      }

      // Se ainda não tiver sido inserido a partir do banco, insere o padrão
      if (!insertedMeuNegocio) {
        items.splice(1, 0, {
          id: "meu_negocio",
          label: "Meu Negócio",
          icon: Store,
          featureCode: null,
          children: [
            { id: "website", label: "Website Premium", href: "/app/website", featureCode: null },
            { id: "configuracoes", label: "Configurações", href: "/app/configuracoes", featureCode: null },
          ],
        })
      }
    } else {
      // Fallback padrão se não houver catálogo do banco
      items.push({
        id: "meu_negocio",
        label: "Meu Negócio",
        icon: Store,
        featureCode: null,
        children: [
          { id: "website", label: "Website Premium", href: "/app/website", featureCode: null },
          { id: "configuracoes", label: "Configurações", href: "/app/configuracoes", featureCode: null },
        ],
      })
      items.push(
        { id: "agenda", label: "Agenda & Horários", href: "/app/agenda", icon: Calendar, featureCode: "agenda" },
        { id: "comandas", label: "PDV & Comandas", href: "/app/comandas", icon: Receipt, featureCode: "comandas" },
        { id: "produtos", label: "Produtos & Estoque", href: "/app/produtos", icon: Package, featureCode: "produtos" },
        { id: "servicos", label: "Serviços & Catálogo", href: "/app/servicos", icon: Scissors, featureCode: "servicos" },
        { id: "equipe", label: "Equipe & Comissões", href: "/app/equipe", icon: Users, featureCode: "equipe" },
        {
          id: "financeiro",
          label: "Financeiro",
          icon: Wallet,
          featureCode: "financeiro",
          children: [
            { id: "fluxo_caixa", label: "Fluxo de Caixa & Extrato", href: "/app/financeiro", featureCode: "financeiro" },
            { id: "contas_carteiras", label: "Contas & Carteiras", href: "/app/financeiro/contas", featureCode: "financeiro" },
            { id: "meios_pagamento", label: "Meios de Pagamento", href: "/app/financeiro/meios-de-pagamento", featureCode: "financeiro" },
          ],
        },
        {
          id: "clube_vip",
          label: "Clube de Assinaturas",
          icon: Sparkles,
          featureCode: "clube_vip",
          children: [
            { id: "clube_planos", label: "Planos do Clube", href: "/app/clube", featureCode: "clube_vip" },
            { id: "clube_config", label: "Configuração do Clube", href: "/app/clube/configuracoes", featureCode: "clube_vip" },
          ],
        }
      )
    }

    return items
  }, [featuresCatalog])

  // Auto-expande o menu se a rota atual coincidir com um dos filhos
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))
        if (isChildActive) {
          setOpenSubmenus((prev) => ({ ...prev, [item.id]: true }))
        }
      }
    })
  }, [pathname, navItems])

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleNavClick = (e: React.MouseEvent, featureCode?: string | null) => {
    if (featureCode && !hasFeature(featureCode)) {
      e.preventDefault()
      setSidebarOpen(false)
      setPlansModalOpen(true)
    } else {
      setSidebarOpen(false)
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans,
        featuresCatalog,
        openPlansModal: () => setPlansModalOpen(true),
        isLocked,
        hasFeature,
        hasBusiness,
        business,
        currentUser,
      }}
    >
      <ThemeManagerProvider initialTheme={business?.themeColor || "emerald"}>
        <PermissionsContext.Provider
          value={{
            allowedFeatureCodes,
            isLocked,
            hasFeature,
            hasAnyFeature,
            openUpgradeModal: () => setPlansModalOpen(true),
          }}
        >
          <div className="flex h-screen w-full overflow-hidden bg-muted/20 text-foreground">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Placeholder Desktop para manter o layout estável quando a barra lateral estiver recolhida */}
          {isCollapsed && (
            <div className="hidden md:block w-[68px] shrink-0 pointer-events-none transition-all duration-300" />
          )}

          {/* Sidebar Desktop & Drawer Mobile */}
          <aside
            onMouseEnter={() => {
              if (isCollapsed) setIsHovered(true)
            }}
            onMouseLeave={() => {
              if (isCollapsed) setIsHovered(false)
            }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border/60 bg-card transition-all duration-300 ease-in-out",
              // Mobile drawer
              sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
              // Desktop layout (Pinned vs Collapsed + Floating Hover)
              isCollapsed
                ? isHovered
                  ? "md:w-72 shadow-2xl md:fixed"
                  : "md:w-[68px] md:fixed"
                : "md:static md:w-72",
              isExpanded ? "p-4" : "p-2.5"
            )}
          >
            {/* Brand Header */}
            <div className={cn(
              "flex h-14 items-center border-b border-border/50 pb-3 transition-all",
              isExpanded ? "justify-between px-2" : "justify-center px-0"
            )}>
              {isExpanded ? (
                <>
                  <Link href="/app" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-lg shadow-md">
                      V
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1.5">
                        VisualClube
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          SaaS
                        </span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">Gestão de Espaços</span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={toggleCollapse}
                      className="hidden md:flex rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title={isCollapsed ? "Fixar Menu Aberto" : "Recolher Menu (Modo Foco)"}
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted md:hidden"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Link
                    href="/app"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-lg shadow-md hover:scale-105 transition-transform"
                    title="VisualClube - Início"
                  >
                    V
                  </Link>
                </div>
              )}
            </div>

            {/* Business Selector Pill */}
            {hasBusiness ? (
              isExpanded ? (
                <div className="my-3 rounded-2xl border border-border/60 bg-muted/40 p-3 animate-in fade-in-50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Espaço Ativo</span>
                    <Badge variant="success" className="text-[9px] px-1.5 py-0">Online</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <div className="truncate text-xs font-bold text-foreground">
                      {businessName}
                    </div>
                  </div>
                  {businessSlug && (
                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <Link
                        href={`/b/${businessSlug}`}
                        target="_blank"
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Ver link da Bio</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="my-2 rounded-xl border border-border/60 bg-muted/40 p-2 flex items-center justify-center cursor-pointer hover:bg-muted"
                  title={`Espaço Ativo: ${businessName}`}
                  onClick={toggleCollapse}
                >
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
              )
            ) : isExpanded ? (
              <div className="my-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 animate-in fade-in-50">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Primeiro Passo
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
                    Pendente
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="truncate text-xs font-bold text-foreground">
                    Nenhum Espaço Criado
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-500/20">
                  <Link
                    href="/app/meu-negocio/criar"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-xs"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Cadastrar Meu Espaço</span>
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                href="/app/meu-negocio/criar"
                title="Cadastrar Meu Espaço"
                className="my-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-colors"
              >
                <Store className="h-4 w-4" />
              </Link>
            )}

            {/* Plan CTA Card in Sidebar when locked */}
            {isLocked && isExpanded && (
              <div className="mb-3 p-3 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 animate-in fade-in-50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span>Escolha seu Plano</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  7 dias grátis para desbloquear os recursos do sistema.
                </p>
                <Button
                  onClick={() => setPlansModalOpen(true)}
                  size="sm"
                  className="w-full mt-2 h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs"
                >
                  Ver 3 Planos
                </Button>
              </div>
            )}

            {/* Navigation Menu with Submenus (Sidebar-07) */}
            <nav className={cn("flex-1 space-y-1.5 overflow-y-auto no-scrollbar py-1 min-h-0", !isExpanded && "flex flex-col items-center")}>
              {navItems.map((item) => {
                const Icon = item.icon

                // Caso 1: Menu com Submenu (Collapsible)
                if (item.children && item.children.length > 0) {
                  const isOpen = !!openSubmenus[item.id]
                  const hasActiveChild = item.children.some(
                    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
                  )
                  const isParentLocked = item.featureCode ? !hasFeature(item.featureCode) : false

                  if (!isExpanded) {
                    return (
                      <Link
                        key={item.id}
                        href={item.children[0].href}
                        title={item.label}
                        onClick={(e) => handleNavClick(e, item.featureCode)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl my-0.5 transition-all",
                          hasActiveChild
                            ? "bg-primary text-primary-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          isParentLocked && "opacity-75"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </Link>
                    )
                  }

                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                          hasActiveChild
                            ? "text-foreground font-bold bg-muted/60"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                          isParentLocked && "opacity-75"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("h-4 w-4 shrink-0", hasActiveChild ? "text-primary" : "text-muted-foreground")} />
                          <span>{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isParentLocked && <Lock className="h-3 w-3 text-amber-500" />}
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                              isOpen && "rotate-180 text-foreground"
                            )}
                          />
                        </div>
                      </button>

                      {/* Submenu Children Links */}
                      {isOpen && (
                        <div className="relative pl-6 pr-1 py-1 space-y-1 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                          {(() => {
                            // Encontra o filho ativo com correspondência mais específica (longest matching href)
                            const activeChild = item.children
                              .filter((c) => pathname === c.href || (c.href !== "/app" && pathname.startsWith(c.href + "/")))
                              .sort((a, b) => b.href.length - a.href.length)[0]

                            return item.children.map((child) => {
                              const isChildActive = activeChild?.id === child.id
                              const isChildLocked = child.featureCode ? !hasFeature(child.featureCode) : false

                              return (
                                <Link
                                  key={child.id}
                                  href={child.href}
                                  onClick={(e) => handleNavClick(e, child.featureCode)}
                                  className={cn(
                                    "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all",
                                    isChildActive
                                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    isChildLocked && "opacity-70"
                                  )}
                                >
                                  <span>{child.label}</span>
                                  {isChildLocked && <Lock className="h-3 w-3 text-amber-500" />}
                                </Link>
                              )
                            })
                          })()}
                        </div>
                      )}
                    </div>
                  )
                }

                // Caso 2: Link Direto (Sem Submenu)
                const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href!))
                const isPermitted = !item.featureCode || hasFeature(item.featureCode)
                const itemLocked = !isPermitted

                if (!isExpanded) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href!}
                      title={item.label}
                      onClick={(e) => handleNavClick(e, item.featureCode)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl my-0.5 transition-all relative",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        itemLocked && "opacity-75"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {itemLocked && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-card" />
                      )}
                    </Link>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href!}
                    onClick={(e) => handleNavClick(e, item.featureCode)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      itemLocked && "opacity-75"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {itemLocked && (
                        <span className="p-1 rounded-md bg-muted/80 text-muted-foreground" title="Recurso bloqueado. Faça upgrade para liberar.">
                          <Lock className="h-3 w-3 text-amber-500" />
                        </span>
                      )}
                      {item.badge && !itemLocked && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          isActive ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* User Footer & Admin Shortcut */}
            <div className="mt-auto border-t border-border/60 pt-3 space-y-2 shrink-0">
              {isAdmin && isExpanded && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition-all animate-in fade-in-50"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Painel Admin SaaS</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-purple-500/20 font-black">
                    Admin
                  </span>
                </Link>
              )}

              {isExpanded ? (
                <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-2 border border-border/40 animate-in fade-in-50">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-xs font-bold overflow-hidden shadow-xs">
                      {userImage ? (
                        <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate text-foreground">{userName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{currentUser?.email || "Sem e-mail"}</p>
                    </div>
                  </div>

                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                      title="Encerrar Sessão"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-xs font-bold overflow-hidden shadow-xs cursor-pointer"
                    title={`${userName} (${currentUser?.email || ""})`}
                    onClick={toggleCollapse}
                  >
                    {userImage ? (
                      <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                      title="Encerrar Sessão"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto">
            {/* Top Navbar */}
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-8 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
                  aria-label="Abrir Menu Lateral"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="hidden md:inline-flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={isCollapsed ? "Fixar Menu Lateral Aberto" : "Recolher Menu (Modo Foco / Mais Espaço na Agenda)"}
                >
                  {isCollapsed ? <PanelLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>

                {/* Breadcrumb Alinhado à Esquerda */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Painel</span>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-xs font-bold text-foreground capitalize">
                      {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Visão Geral"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Bar Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {hasBusiness && (
                  <button
                    onClick={async () => {
                      const { switchToProAction } = await import("@/actions/pro-auth-actions")
                      const res = await switchToProAction()
                      if (res.success) {
                        window.location.href = "/pro"
                      } else {
                        alert(res.error || "Não foi possível alternar para o app do profissional.")
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-black transition-all shadow-xs"
                    title="Abrir Meu App de Atendimento (Modo Barbeiro / Profissional)"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Modo Atendimento (/pro)</span>
                  </button>
                )}

                {hasBusiness ? (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3 rounded-xl shadow-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Nova Comanda</span>
                  </Button>
                ) : (
                  <Link href="/app/meu-negocio/criar">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3 rounded-xl shadow-xs gap-1.5 animate-pulse"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Criar Meu Espaço</span>
                    </Button>
                  </Link>
                )}

                <button
                  type="button"
                  className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                </button>

                <ThemeToggle />
              </div>
            </header>

            {/* Content Area - Alinhado à Esquerda */}
            <main className="flex-1 p-4 sm:p-8 w-full">
              {children}
            </main>
          </div>
        </div>

        {/* Modal Global de Upgrade/Seleção de Planos */}
        <PlansModal
          isOpen={plansModalOpen}
          onClose={() => setPlansModalOpen(false)}
          plans={plans}
          currentPlanSlug={subscription?.plan?.slug || null}
        />
        </PermissionsContext.Provider>
      </ThemeManagerProvider>
    </SubscriptionContext.Provider>
  )
}
