"use client"

import * as React from "react"
import {
  Search,
  Plus,
  Phone,
  MessageCircle,
  Sparkles,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  Clock,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CRMStatsCards } from "./crm-stats-cards"
import { CreateClientModal } from "./create-client-modal"
import { PostActivationModal } from "./post-activation-modal"
import { Client360Drawer } from "./client-360-drawer"
import { getClientsAction } from "@/actions/client-actions"

export function ClientList() {
  const [clients, setClients] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [activeFilter, setActiveFilter] = React.useState<"all" | "new" | "recurrent" | "club" | "at_risk">("all")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)

  // Paginação
  const [currentPage, setCurrentPage] = React.useState(1)
  const [limitPerPage, setLimitPerPage] = React.useState<number>(10)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalFiltered, setTotalFiltered] = React.useState(0)

  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [selectedClientIdFor360, setSelectedClientIdFor360] = React.useState<string | null>(null)

  // Estado do Modal Pós-Cadastro
  const [postActivationData, setPostActivationData] = React.useState<{
    isOpen: boolean
    clientName: string
    clientPhone: string
    activationUrl: string
    whatsappUrl: string
    whatsappMessage: string
  }>({
    isOpen: false,
    clientName: "",
    clientPhone: "",
    activationUrl: "",
    whatsappUrl: "",
    whatsappMessage: "",
  })

  // Carregar lista de clientes
  const loadClients = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getClientsAction({
        search: searchTerm,
        status: activeFilter,
        page: currentPage,
        limit: limitPerPage,
      })
      if (res.success) {
        setClients(res.data || [])
        setStats(res.stats)
        setTotalFiltered(res.total || 0)
        setTotalPages(res.totalPages || 1)
        if (res.page && res.page !== currentPage) {
          setCurrentPage(res.page)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, activeFilter, currentPage, limitPerPage])

  // Resetar para página 1 ao alterar busca ou filtro
  const handleFilterChange = (filter: "all" | "new" | "recurrent" | "club" | "at_risk") => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimitPerPage(newLimit)
    setCurrentPage(1)
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadClients()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadClients])

  const handlePostCreateSuccess = (data: {
    client: any
    activationUrl: string
    whatsappUrl: string
    whatsappMessage: string
  }) => {
    loadClients()
    setPostActivationData({
      isOpen: true,
      clientName: data.client.name,
      clientPhone: data.client.phone,
      activationUrl: data.activationUrl,
      whatsappUrl: data.whatsappUrl,
      whatsappMessage: data.whatsappMessage,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
            Novo
          </Badge>
        )
      case "recurrent":
        return (
          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-bold">
            Recorrente / VIP
          </Badge>
        )
      case "at_risk":
        return (
          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold">
            Em Risco
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border">
            Cliente
          </Badge>
        )
    }
  }

  // Cálculos de exibição da paginação
  const startItem = totalFiltered === 0 ? 0 : (currentPage - 1) * limitPerPage + 1
  const endItem = Math.min(currentPage * limitPerPage, totalFiltered)

  return (
    <div className="space-y-6 max-w-7xl pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] px-2 border-primary/30 text-primary bg-primary/10 font-bold">
              CRM & Fidelização Inteligente
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Clientes & Rede VIP
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie sua base de clientes, histórico de visitas, LTV e o programa de indicação multinível.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-primary-foreground font-bold text-xs h-10 px-4 rounded-xl shadow-md shadow-primary/20 gap-1.5 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar no Balcão</span>
          </Button>
        </div>
      </div>

      {/* Cards de Métricas & Filtros */}
      <CRMStatsCards
        stats={stats}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Barra de Ações, Busca e Controles */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por nome, WhatsApp ou código..."
            className="pl-9 h-10 rounded-xl text-xs bg-card"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Seletor de Itens por Página */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border/80 rounded-xl px-2.5 h-10">
            <span className="text-[11px] font-semibold">Exibir:</span>
            {[5, 10, 20].map((qty) => (
              <button
                key={qty}
                onClick={() => handleLimitChange(qty)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  limitPerPage === qty
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {qty}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadClients()}
            className="h-10 text-xs rounded-xl gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LISTAGEM: MOBILE (CARDS) vs DESKTOP (TABELA)
      ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <Card className="rounded-2xl border border-border/80 p-12 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground bg-card/60">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs">Carregando clientes...</span>
        </Card>
      ) : clients.length === 0 ? (
        <Card className="rounded-2xl border border-border/80 p-12 text-center flex flex-col items-center justify-center border-dashed bg-card/60">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <UserCheck className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">Nenhum cliente encontrado</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchTerm
              ? "Nenhum cliente corresponde ao filtro de busca atual."
              : "Cadastre seu primeiro cliente no balcão para iniciar a rede de fidelização."}
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 text-xs font-bold rounded-xl h-9 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Cadastrar Primeiro Cliente</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* ─────────────────────────────────────────────────────────────
              1. VERSÃO MOBILE: CARDS VERTICAIS E LIMPOS
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {clients.map((client) => {
              const initials = (client.name || "C")
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()

              return (
                <Card
                  key={client.id}
                  className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm space-y-3"
                >
                  {/* Topo do Card: Avatar, Nome, Código e Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground">
                          {client.name || "Sem Nome"}
                        </h3>
                        {client.referralCode && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-mono mt-0.5 inline-block">
                            {client.referralCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {getStatusBadge(client.crmStatus)}
                  </div>

                  {/* Informações Essenciais: WhatsApp e Visitas */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                    {/* WhatsApp */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        WhatsApp
                      </span>
                      {client.phone ? (
                        <a
                          href={`https://wa.me/55${client.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-foreground hover:text-emerald-500 transition-colors flex items-center gap-1"
                        >
                          <span>{client.phone}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* Visitas */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Visitas
                      </span>
                      <p className="text-xs font-bold text-foreground">
                        {client.visitCount || 0} visitas
                      </p>
                      {client.lastVisitDate && (
                        <p className="text-[10px] text-muted-foreground">
                          Última: {new Date(client.lastVisitDate).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rodapé com Botão de Detalhes / Ficha 360º */}
                  <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                    {client.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const clean = client.phone.replace(/\D/g, "")
                          window.open(`https://wa.me/55${clean}`, "_blank")
                        }}
                        className="h-9 px-3 rounded-xl text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 text-xs"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Conversar</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => setSelectedClientIdFor360(client.id)}
                      className="h-9 flex-1 rounded-xl text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ver Ficha Completa</span>
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. VERSÃO DESKTOP: TABELA COMPLETA
          ───────────────────────────────────────────────────────────── */}
          <Card className="hidden md:block rounded-2xl border border-border/80 overflow-hidden bg-card/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4 font-bold">Cliente</th>
                    <th className="py-3 px-4 font-bold">Status CRM</th>
                    <th className="py-3 px-4 font-bold">LTV / Total Gasto</th>
                    <th className="py-3 px-4 font-bold">Visitas</th>
                    <th className="py-3 px-4 font-bold">Indicações (N1)</th>
                    <th className="py-3 px-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {clients.map((client) => {
                    const initials = (client.name || "C")
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-muted/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedClientIdFor360(client.id)}
                      >
                        {/* Cliente (Nome + WhatsApp + Código) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <strong className="text-foreground text-xs font-bold group-hover:text-primary transition-colors">
                                  {client.name || "Sem Nome"}
                                </strong>
                                {client.referralCode && (
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-mono">
                                    {client.referralCode}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {client.phone || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {getStatusBadge(client.crmStatus)}
                        </td>

                        {/* LTV */}
                        <td className="py-3 px-4 font-black text-foreground text-xs">
                          R$ {(client.totalSpent || 0).toFixed(2).replace(".", ",")}
                        </td>

                        {/* Visitas */}
                        <td className="py-3 px-4">
                          <div className="text-xs font-bold text-foreground">
                            {client.visitCount || 0} visitas
                          </div>
                          {client.lastVisitDate ? (
                            <span className="text-[10px] text-muted-foreground">
                              Última: {new Date(client.lastVisitDate).toLocaleDateString("pt-BR")}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Nunca atendeu</span>
                          )}
                        </td>

                        {/* Rede de Indicações */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span>{client._count?.directs || 0} amigos</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block">
                            Indicado por: {client.sponsor ? client.sponsor.name : "Indicador Padrão"}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {client.phone && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const clean = client.phone.replace(/\D/g, "")
                                  window.open(`https://wa.me/55${clean}`, "_blank")
                                }}
                                className="h-8 w-8 p-0 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                                title="Abrir WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedClientIdFor360(client.id)}
                              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Ver Ficha</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ─────────────────────────────────────────────────────────────
              3. BARRA DE PAGINAÇÃO
          ───────────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
            <div>
              Mostrando <strong className="text-foreground">{startItem} - {endItem}</strong> de{" "}
              <strong className="text-foreground">{totalFiltered}</strong> clientes
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="h-8 px-2.5 rounded-xl text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>

              {/* Páginas Numéricas */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1]
                    const showEllipsis = prev && p - prev > 1

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                            currentPage === p
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    )
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="h-8 px-2.5 rounded-xl text-xs gap-1"
              >
                <span className="hidden sm:inline">Próximo</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePostCreateSuccess}
      />

      <PostActivationModal
        isOpen={postActivationData.isOpen}
        onClose={() => setPostActivationData((prev) => ({ ...prev, isOpen: false }))}
        clientName={postActivationData.clientName}
        clientPhone={postActivationData.clientPhone}
        activationUrl={postActivationData.activationUrl}
        whatsappUrl={postActivationData.whatsappUrl}
        whatsappMessage={postActivationData.whatsappMessage}
      />

      <Client360Drawer
        clientId={selectedClientIdFor360}
        isOpen={!!selectedClientIdFor360}
        onClose={() => setSelectedClientIdFor360(null)}
      />
    </div>
  )
}
