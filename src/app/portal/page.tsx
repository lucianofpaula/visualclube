"use client"

import * as React from "react"
import {
  Sparkles,
  Calendar,
  Clock,
  Scissors,
  Users,
  Share2,
  Copy,
  Check,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Phone,
  ChevronRight,
  LogOut,
  MapPin,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getClientPortalDataAction } from "@/actions/client-portal-actions"
import Link from "next/link"

export default function ClientPortalPage() {
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    getClientPortalDataAction()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }, [])

  const handleCopyLink = () => {
    if (!data?.user?.referralLink) return
    navigator.clipboard.writeText(data.user.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareWhatsApp = () => {
    if (!data?.user?.referralLink || !data?.business) return
    const text = `Fala aí! 👋 Conheça a *${data.business.name}* e faça seu agendamento VIP pelo meu link exclusivo de indicação:\n👉 ${data.user.referralLink}\n\nRecomendo demais! 💈✨`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-xs text-muted-foreground">Carregando seu Portal VIP...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl border border-border shadow-xl space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black text-foreground">Acesso ao Portal do Cliente</h1>
          <p className="text-xs text-muted-foreground">
            Você precisa estar conectado à sua conta para acessar seu histórico e suas indicações.
          </p>
          <Link href="/login" className="inline-block w-full">
            <Button className="w-full h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground">
              Fazer Login
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const user = data.user
  const business = data.business
  const network = data.network
  const wallet = data.wallet
  const upcoming = data.upcomingAppointments || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 pb-16">
      {/* Topo / Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm border border-primary/20">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "VIP"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{user.name}</span>
                <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 font-bold">
                  Membro VIP
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{business?.name || "Cluberize"}</p>
            </div>
          </div>

          {business?.slug && (
            <Link href={`/b/${business.slug}`}>
              <Button size="sm" className="h-9 px-3.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-xs">
                <Scissors className="h-3.5 w-3.5" />
                <span>Agendar Horário</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* CARD PRINCIPAL: PROGRAMA INDIQUE & GANHE MULTINÍVEL */}
        <Card className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider mb-2">
                  <Sparkles className="h-3 w-3" />
                  <span>Programa Indique & Ganhe Multinível</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  Indique amigos e ganhe cashback
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Compartilhe seu link exclusivo. Você ganha comissões a cada atendimento dos seus indicados diretos e também dos amigos deles!
                </p>
              </div>

              {/* Saldo de Cashback */}
              <div className="p-4 rounded-2xl bg-card border border-primary/20 shadow-sm text-right shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Seu Saldo Disponível
                </span>
                <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  R$ {(wallet.available || 0).toFixed(2).replace(".", ",")}
                </strong>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Total acumulado: R$ {(wallet.totalEarned || 0).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Ações de Compartilhamento */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                onClick={handleShareWhatsApp}
                className="h-11 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-[#25D366]/20 gap-2 flex-1"
              >
                <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
                <span>Compartilhar no WhatsApp</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="h-11 rounded-2xl text-xs font-semibold gap-2 border-border/80 bg-card"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    <span>Copiar Meu Link VIP</span>
                  </>
                )}
              </Button>
            </div>

            {/* Árvore Multinível de Indicados */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
              <div className="p-3 rounded-2xl bg-card/80 border border-border/60 text-center">
                <span className="text-[10px] font-bold text-primary uppercase block">Nível 1 (Diretos)</span>
                <strong className="text-lg font-black text-foreground block mt-0.5">
                  {network.level1Count}
                </strong>
                <span className="text-[9px] text-muted-foreground">seus amigos</span>
              </div>

              <div className="p-3 rounded-2xl bg-card/80 border border-border/60 text-center">
                <span className="text-[10px] font-bold text-blue-500 uppercase block">Nível 2 (Indiretos)</span>
                <strong className="text-lg font-black text-foreground block mt-0.5">
                  {network.level2Count}
                </strong>
                <span className="text-[9px] text-muted-foreground">amigos dos amigos</span>
              </div>

              <div className="p-3 rounded-2xl bg-card/80 border border-border/60 text-center">
                <span className="text-[10px] font-bold text-purple-500 uppercase block">Nível 3 (Rede)</span>
                <strong className="text-lg font-black text-foreground block mt-0.5">
                  {network.level3Count}
                </strong>
                <span className="text-[9px] text-muted-foreground">rede ampliada</span>
              </div>
            </div>
          </div>
        </Card>

        {/* PRÓXIMOS AGENDAMENTOS */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Próximos Agendamentos</span>
          </h3>

          {upcoming.length === 0 ? (
            <Card className="p-6 rounded-2xl border border-dashed text-center">
              <p className="text-xs text-muted-foreground">Você não possui agendamentos futuros marcados.</p>
              {business?.slug && (
                <Link href={`/b/${business.slug}`} className="inline-block mt-3">
                  <Button size="sm" className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5">
                    <Scissors className="h-3.5 w-3.5" />
                    <span>Agendar Agora</span>
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((app: any) => (
                <Card key={app.id} className="p-4 rounded-2xl border border-border/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-foreground">{app.service?.name}</strong>
                      <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Confirmado
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
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* EXTRATO DE INDICAÇÕES & CASHBACK */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span>Extrato de Ganhos por Indicação</span>
          </h3>

          {wallet.recentExtract?.length === 0 ? (
            <Card className="p-6 rounded-2xl border border-dashed text-center">
              <p className="text-xs text-muted-foreground">
                Nenhuma comissão de indicação gerada ainda. Compartilhe seu link para começar a ganhar!
              </p>
            </Card>
          ) : (
            <Card className="rounded-2xl border border-border/80 overflow-hidden divide-y divide-border/50">
              {wallet.recentExtract?.map((ext: any) => (
                <div key={ext.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-foreground block">
                      Indicação Nível {ext.level} • {ext.originUser?.name || "Amigo"}
                    </strong>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(ext.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    + R$ {(ext.amount || 0).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
