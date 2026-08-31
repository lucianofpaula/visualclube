"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home, LayoutDashboard } from "lucide-react"

// Mapa de segmentos de rota para labels amigaveis
const ROUTE_LABELS: Record<string, { label: string; desc?: string }> = {
  app:           { label: "Visão Geral" },
  "meu-negocio": { label: "Meu Negócio" },
  criar:         { label: "Criar Espaço" },
  configuracao:  { label: "Configuração" },
  "web-site":    { label: "Web Site" },
  website:       { label: "Website Premium" },
  clientes:      { label: "Clientes" },
  agenda:        { label: "Agenda & Horários" },
  comandas:      { label: "Comandas Digitais" },
  servicos:      { label: "Serviços & Catálogo" },
  equipe:        { label: "Equipe & Comissões" },
  financeiro:    { label: "Financeiro & Caixa" },
  clube:         { label: "Clube de Assinaturas" },
  configuracoes: { label: "Configurações" },
  login:         { label: "Login" },
}

export function AppBreadcrumb() {
  const pathname = usePathname() || "/"

  // Detecta se estamos na rota de teste
  const isPainelTeste = pathname.startsWith("/painel-teste")
  const homeHref = isPainelTeste ? "/painel-teste" : "/app"

  // Limpa prefixos e divide em segmentos
  const rawSegments = pathname.replace(/^\//, "").split("/").filter(Boolean)
  
  // Normaliza segmentos (remove "app" ou "painel-teste" se for o primeiro)
  const isHome = rawSegments.length === 0 || 
    (rawSegments.length === 1 && (rawSegments[0] === "app" || rawSegments[0] === "painel-teste"))

  const currentSegment = rawSegments.length > 0 
    ? (["app", "painel-teste"].includes(rawSegments[rawSegments.length - 1]) 
        ? "app" 
        : rawSegments[rawSegments.length - 1])
    : "app"

  const currentInfo = ROUTE_LABELS[currentSegment] || {
    label: currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1)
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center gap-1.5 text-xs font-medium mb-6 text-muted-foreground select-none"
    >
      {/* Link para o Dashboard / Home */}
      <Link
        href={homeHref}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="font-semibold">{isPainelTeste ? "Painel Teste" : "Painel"}</span>
      </Link>

      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />

      {isHome ? (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-muted/60 text-foreground font-semibold">
          Visão Geral
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/10 text-primary dark:text-primary-foreground font-semibold border border-primary/20">
          {currentInfo.label}
        </span>
      )}
    </nav>
  )
}
