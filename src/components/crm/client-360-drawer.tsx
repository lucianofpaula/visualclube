"use client"

import * as React from "react"
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Share2,
  DollarSign,
  Clock,
  Scissors,
  ShoppingBag,
  MessageCircle,
  Link,
  ChevronRight,
  Users,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getClientDetailsAction, generateClientActivationLinkAction } from "@/actions/client-actions"

interface Client360DrawerProps {
  clientId: string | null
  isOpen: boolean
  onClose: () => void
}

export function Client360Drawer({ clientId, isOpen, onClose }: Client360DrawerProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "history" | "network">("overview")
  const [clientData, setClientData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)

  React.useEffect(() => {
    if (clientId && isOpen) {
      setIsLoading(true)
      getClientDetailsAction(clientId)
        .then((res) => {
          if (res.success && res.client) {
            setClientData(res.client)
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false))
    } else {
      setClientData(null)
    }
  }, [clientId, isOpen])

  if (!isOpen) return null

  const handleSendWhatsAppLink = async () => {
    if (!clientId) return
    setIsGeneratingLink(true)
    try {
      const res = await generateClientActivationLinkAction(clientId)
      if (res.success && res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleCopyActivationLink = async () => {
    if (!clientId) return
    setIsGeneratingLink(true)
    try {
      const res = await generateClientActivationLinkAction(clientId)
      if (res.success && res.activationUrl) {
        navigator.clipboard.writeText(res.activationUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2500)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-card border-l border-border/80 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header do Drawer */}
        <div className="p-5 sm:p-6 border-b border-border/50 bg-muted/20 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl border border-primary/20">
              {clientData?.name ? clientData.name.slice(0, 2).toUpperCase() : <User className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-foreground">
                  {clientData?.name || "Carregando..."}
                </h2>
                {clientData?.referralCode && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    {clientData.referralCode}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {clientData?.phone || "—"}
                </span>
                {clientData?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {clientData.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="px-6 py-2.5 border-b border-border/50 bg-card">
          <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-2xl border border-border/60 shadow-inner">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95",
                activeTab === "overview"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              Ficha & LTV
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95",
                activeTab === "history"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              Histórico ({clientData?.appointments?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("network")}
              className={cn(
                "cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 active:scale-95",
                activeTab === "network"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40 font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              <Sparkles className={cn("h-3.5 w-3.5", activeTab === "network" ? "text-white" : "text-emerald-500")} />
              <span>Rede ({clientData?.networkStats?.totalNetwork || 0})</span>
            </button>
          </div>
        </div>

        {/* Conteúdo do Drawer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Carregando dados completos...</span>
            </div>
          ) : clientData ? (
            <>
              {/* ABA 1: VISÃO GERAL & LTV */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Cards de Métricas Financeiras */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                        LTV (Total Gasto)
                      </span>
                      <strong className="text-base font-black text-foreground block mt-1">
                        R$ {(clientData.totalSpent || 0).toFixed(2).replace(".", ",")}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                        Total de Visitas
                      </span>
                      <strong className="text-base font-black text-foreground block mt-1">
                        {(clientData.appointments?.length || 0) + (clientData.orders?.length || 0)}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                        Comissões Geradas
                      </span>
                      <strong className="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                        R$ {(clientData.financialStats?.totalCommissionsEarned || 0).toFixed(2).replace(".", ",")}
                      </strong>
                    </div>
                  </div>

                  {/* Informações Cadastrais */}
                  <div className="p-4 rounded-2xl border border-border/60 bg-card space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Dados do Cliente
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Quem Indicou (Patrocinador):</span>
                        <strong className="text-foreground">
                          {clientData.sponsor ? clientData.sponsor.name : "Indicador Padrão da Casa"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Data de Cadastro:</span>
                        <strong className="text-foreground">
                          {new Date(clientData.createdAt).toLocaleDateString("pt-BR")}
                        </strong>
                      </div>
                      {clientData.birthDate && (
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Aniversário:</span>
                          <strong className="text-foreground">
                            {new Date(clientData.birthDate).toLocaleDateString("pt-BR")}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Anotações */}
                  <div className="p-4 rounded-2xl border border-border/60 bg-card space-y-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Anotações
                    </h3>
                    <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/40 whitespace-pre-wrap">
                      {clientData.notes || "Nenhuma anotação registrada ainda para este cliente."}
                    </p>
                  </div>

                  {/* Ações de Reenvio de WhatsApp */}
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-foreground">Acesso ao Portal VIP</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Reenvie o link exclusivo de acesso para o cliente acompanhar agendamentos e o link de indicação.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSendWhatsAppLink}
                        disabled={isGeneratingLink}
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl gap-1.5 h-9"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Enviar no WhatsApp</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyActivationLink}
                        disabled={isGeneratingLink}
                        className="text-xs rounded-xl gap-1.5 h-9"
                      >
                        {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedLink ? "Copiado!" : "Copiar Link"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: HISTÓRICO DE ATENDIMENTOS */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  {clientData.appointments?.length === 0 && clientData.orders?.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs">
                      Nenhum agendamento ou comanda registrada ainda.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientData.appointments?.map((app: any) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-2xl border border-border/60 bg-card flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Scissors className="h-3.5 w-3.5 text-primary" />
                              <strong className="text-xs text-foreground font-bold">{app.service?.name}</strong>
                              <Badge
                                variant="outline"
                                className={`text-[9px] ${
                                  app.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                }`}
                              >
                                {app.status === "COMPLETED" ? "Concluído" : app.status}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Com {app.professional?.name} • {new Date(app.date).toLocaleDateString("pt-BR")} às{" "}
                              {new Date(app.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <span className="text-xs font-black text-foreground">
                            R$ {(app.price || 0).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 3: REDE MULTINÍVEL DE INDICAÇÕES */}
              {activeTab === "network" && (
                <div className="space-y-5">
                  {/* Resumo da Rede */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                      <span className="text-[10px] font-bold text-primary uppercase block">Nível 1 (Diretos)</span>
                      <strong className="text-xl font-black text-foreground block mt-0.5">
                        {clientData.networkStats?.level1Count || 0}
                      </strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center">
                      <span className="text-[10px] font-bold text-blue-500 uppercase block">Nível 2 (Indiretos)</span>
                      <strong className="text-xl font-black text-foreground block mt-0.5">
                        {clientData.networkStats?.level2Count || 0}
                      </strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-center">
                      <span className="text-[10px] font-bold text-purple-500 uppercase block">Nível 3 (Rede)</span>
                      <strong className="text-xl font-black text-foreground block mt-0.5">
                        {clientData.networkStats?.level3Count || 0}
                      </strong>
                    </div>
                  </div>

                  {/* Lista de Indicados Diretos */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Indicados Diretos (Nível 1)</span>
                      <span className="text-muted-foreground text-[11px] normal-case">
                        Amigos que cadastraram pelo link dele
                      </span>
                    </h4>

                    {clientData.directs?.length === 0 ? (
                      <div className="p-6 text-center border border-dashed rounded-2xl text-xs text-muted-foreground">
                        Este cliente ainda não indicou amigos diretamente.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clientData.directs?.map((dir: any) => (
                          <div
                            key={dir.id}
                            className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between text-xs"
                          >
                            <div>
                              <strong className="text-foreground block">{dir.name}</strong>
                              <span className="text-[11px] text-muted-foreground">{dir.phone}</span>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20">
                                {dir.directs?.length || 0} indicados N2
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
