import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { 
  ShieldCheck, 
  Layers, 
  CreditCard, 
  Users, 
  ArrowLeft,
  LayoutDashboard,
  Sparkles,
  KeyRound
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export const dynamic = "force-dynamic"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/app/login")
  }

  // Verifica permissão no banco
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true },
  })

  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    redirect("/app")
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo
            href="/admin"
            size="sm"
            badgeText="SaaS Master"
            subtitle="Gestão de Recursos & Planos"
          />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Visão Geral</span>
            </Link>
            <Link
              href="/admin/recursos"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Recursos & Módulos</span>
            </Link>
            <Link
              href="/admin/planos"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
              <span>Planos SaaS</span>
            </Link>
            <Link
              href="/admin/gateway"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              <span>Gateway & Mercado Pago</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app">
            <Button variant="outline" size="sm" className="text-xs font-semibold h-8 rounded-xl">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Voltar ao App
            </Button>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Admin Content Body */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
