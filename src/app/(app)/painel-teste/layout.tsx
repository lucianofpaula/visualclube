"use client"

import * as React from "react"
import { useState } from "react"
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
  Plus, 
  LogOut,
  ChevronDown,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppBreadcrumb } from "@/components/app/app-breadcrumb"
import { cn } from "@/lib/utils"

export default function PainelTesteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { label: "Visão Geral", href: "/painel-teste", icon: LayoutDashboard },
    { label: "Agenda & Horários", href: "/painel-teste/agenda", icon: Calendar },
    { label: "Comandas Digitais", href: "/painel-teste/comandas", icon: Receipt, badge: "6 ativas" },
    { label: "Serviços & Catálogo", href: "/painel-teste/servicos", icon: Scissors },
    { label: "Equipe & Comissões", href: "/painel-teste/equipe", icon: Users },
    { label: "Financeiro & Caixa", href: "/painel-teste/financeiro", icon: Wallet },
    { label: "Clube VIP & Recorrência", href: "/painel-teste/clube", icon: Sparkles },
    { label: "Robô WhatsApp & Ajustes", href: "/painel-teste/configuracoes", icon: Settings },
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/20 text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-0 md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col justify-between p-4">
          {/* Top Section */}
          <div className="space-y-6">
            {/* Brand Header */}
            <div className="flex h-14 items-center justify-between px-2 border-b border-border/50 pb-3">
              <Link href="/painel-teste" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-lg shadow-md">
                  V
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1.5">
                    VisualClube
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      DEMO
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">Painel de Demonstração</span>
                </div>
              </Link>

              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted md:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Business Selector Pill */}
            <div className="px-2">
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 border border-border/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold truncate">Barbearia Imperial</p>
                    <p className="text-[10px] text-muted-foreground truncate">Unidade Jardins (SP)</p>
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 px-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="space-y-3 pt-4 border-t border-border/50 px-2">
            <Link
              href="/app"
              className="flex items-center justify-between w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
            >
              <span>Ir para o App Oficial (/app)</span>
              <Sparkles className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground border border-border">
                  VS
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Victor Silveira</p>
                  <p className="text-[10px] text-muted-foreground">Admin / Dono</p>
                </div>
              </div>
              <Link href="/painel-teste/login" className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors">
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Alinhado à Esquerda */}
            <AppBreadcrumb />
          </div>

          {/* Actions Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nova Comanda</span>
            </Button>

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

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  )
}