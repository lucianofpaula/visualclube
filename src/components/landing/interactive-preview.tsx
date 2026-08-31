"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Calendar, 
  Receipt, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  Sparkles, 
  Beer, 
  Scissors, 
  Eye, 
  CreditCard,
  QrCode,
  Smartphone
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "comandas" | "whatsapp">("dashboard")
  
  // Interactive Comanda state in mockup
  const [comandaItems, setComandaItems] = useState([
    { id: 1, name: "Corte Degradê Navalhado", prof: "Lucas (Barbeiro)", price: 55.0, type: "service" },
    { id: 2, name: "Barboterapia com Toalha Quente", prof: "Lucas (Barbeiro)", price: 45.0, type: "service" },
    { id: 3, name: "Cerveja Heineken Long Neck (2x)", prof: "Bar / Recepção", price: 24.0, type: "product" },
    { id: 4, name: "Pomada Modeladora Efeito Matte", prof: "Lucas (Barbeiro)", price: 40.0, type: "product" },
  ])

  const totalComanda = comandaItems.reduce((acc, item) => acc + item.price, 0)
  const comissaoProfissional = 55 * 0.5 + 45 * 0.5 + 40 * 0.1 // 50% em serviços + 10% no produto
  const lucroCasa = totalComanda - comissaoProfissional

  return (
    <div className="w-full rounded-3xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/70 bg-muted/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-medium text-muted-foreground ml-2 hidden sm:inline-block">
            app.visualclube.com.br • Painel em Tempo Real
          </span>
        </div>

        {/* Mockup Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-background/80 p-1 border border-border/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "dashboard"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("comandas")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "comandas"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Receipt className="h-3.5 w-3.5" />
            Comanda Ao Vivo
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all flex items-center gap-1.5",
              activeTab === "whatsapp"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
            Robô WhatsApp
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Sincronizado
          </span>
        </div>
      </div>

      {/* Main Interactive Screen Content */}
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-background/50 to-muted/20">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Faturamento Hoje</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground">R$ 2.480,00</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +24% vs ontem
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Agendamentos</span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground">34 / 38</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  92% ocupação hoje
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Comandas Abertas</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Receipt className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground">6 ativas</div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                  R$ 790,00 em consumo
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Clube VIP / Recorrência</span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground">118 membros</div>
                <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
                  R$ 14.160/mês garantidos
                </div>
              </div>
            </div>

            {/* Live Agenda List & Team Availability */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="font-bold text-sm text-foreground">Próximos Agendamentos do Dia</h4>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Auto-confirmados via WhatsApp
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      time: "14:30",
                      client: "Rodrigo Almeida",
                      service: "Corte + Barba + Sobrancelha",
                      prof: "Lucas Mendes",
                      val: "R$ 110,00",
                      status: "Em Atendimento",
                      statusColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      time: "15:15",
                      client: "Matheus Silveira",
                      service: "Corte Degradê + Pigmentação",
                      prof: "Gabriel Santos",
                      val: "R$ 75,00",
                      status: "Confirmado WhatsApp",
                      statusColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                    },
                    {
                      time: "16:00",
                      client: "Camila Fernandes",
                      service: "Manicure Gel + Spa dos Pés",
                      prof: "Juliana Costa",
                      val: "R$ 130,00",
                      status: "Confirmado WhatsApp",
                      statusColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40 gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center font-bold text-xs bg-background px-2.5 py-1.5 rounded-lg border border-border/60">
                          {item.time}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            {item.client}
                            <span className="text-[10px] text-muted-foreground">({item.prof})</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">{item.service}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-xs font-bold text-foreground">{item.val}</span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", item.statusColor)}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipe & Comissões ao Vivo */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Comissões Hoje
                    </h4>
                    <span className="text-[11px] text-muted-foreground">Split Automático</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "Lucas Mendes", role: "Barbeiro Master", total: "R$ 410,00", atends: 8 },
                      { name: "Gabriel Santos", role: "Barbeiro", total: "R$ 295,00", atends: 6 },
                      { name: "Juliana Costa", role: "Nail Designer", total: "R$ 380,00", atends: 5 },
                    ].map((prof, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs pb-2.5 border-b border-border/50">
                        <div>
                          <div className="font-semibold text-foreground">{prof.name}</div>
                          <div className="text-[10px] text-muted-foreground">{prof.atends} atendimentos</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">{prof.total}</div>
                          <div className="text-[10px] text-muted-foreground">Repasse pronto</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 bg-muted/20 p-3 rounded-xl text-center">
                  <div className="text-[11px] text-muted-foreground">Repasse via PIX integrado com 1 clique</div>
                  <div className="text-xs font-bold text-primary mt-0.5">Sem risco de erro de planilha</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comanda Ao Vivo */}
        {activeTab === "comandas" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-foreground">Comanda #CMD-104 • Cadeira 02</h4>
                  <p className="text-xs text-muted-foreground">Cliente: Marcelo Viana • Chegou às 14:10</p>
                </div>
                <Badge variant="gold">Em Consumo</Badge>
              </div>

              {/* Tabela de Itens da Comanda */}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="p-3 bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground grid grid-cols-12 gap-2">
                  <span className="col-span-6">Item / Descrição</span>
                  <span className="col-span-3">Profissional</span>
                  <span className="col-span-3 text-right">Valor</span>
                </div>
                <div className="divide-y divide-border/40">
                  {comandaItems.map((item) => (
                    <div key={item.id} className="p-3 text-xs grid grid-cols-12 gap-2 items-center hover:bg-muted/20">
                      <div className="col-span-6 font-medium text-foreground flex items-center gap-2">
                        {item.type === "service" ? (
                          <Scissors className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <Beer className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        {item.name}
                      </div>
                      <div className="col-span-3 text-muted-foreground text-[11px]">{item.prof}</div>
                      <div className="col-span-3 text-right font-bold text-foreground">
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setComandaItems([
                      ...comandaItems,
                      {
                        id: Date.now(),
                        name: "Café Espresso Nespresso",
                        prof: "Recepção",
                        price: 8.0,
                        type: "product",
                      },
                    ])
                  }
                  className="text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  + Adicionar Bebida/Produto
                </Button>
              </div>
            </div>

            {/* Split & Fechamento */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <h5 className="font-bold text-sm text-foreground mb-3">Divisão Automática (Split)</h5>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal da Comanda:</span>
                    <span className="font-semibold text-foreground">R$ {totalComanda.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Comissão Barbeiro (Lucas):</span>
                    <span className="font-semibold">R$ {comissaoProfissional.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                    <span>Líquido do Estabelecimento:</span>
                    <span className="font-semibold">R$ {lucroCasa.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/60">
                <div className="text-[11px] text-muted-foreground">Forma de Pagamento:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <QrCode className="h-4 w-4" />
                    PIX Instantâneo
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl border border-border bg-muted/30 text-xs font-medium text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Cartão / Split
                  </div>
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl mt-2 shadow-md">
                  Fechar Comanda & Emitir PIX
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Bot Simulation */}
        {activeTab === "whatsapp" && (
          <div className="max-w-md mx-auto rounded-3xl border border-emerald-500/30 bg-[#0c1317] text-white p-4 shadow-xl font-sans">
            {/* Header WhatsApp */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
                  C
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-black" />
              </div>
              <div>
                <div className="font-semibold text-xs text-zinc-100 flex items-center gap-1">
                  VisualClube Bot • Barbearia Imperial
                  <Sparkles className="h-3 w-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-emerald-400">Online 24h</div>
              </div>
            </div>

            {/* Chat Bubble Thread */}
            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#202c33] text-zinc-200 p-3 rounded-2xl rounded-tl-xs max-w-[85%] space-y-1">
                <p>💈 Olá, Gustavo! Tudo bem?</p>
                <p>Aqui é a assistente virtual da <b>Barbearia Imperial</b>. Deseja agendar um horário hoje?</p>
                <span className="text-[9px] text-zinc-400 block text-right">14:02</span>
              </div>

              <div className="bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-xs max-w-[80%] ml-auto text-right">
                <p>Quero sim! Tem horário com o Lucas às 16:30?</p>
                <span className="text-[9px] text-zinc-300 block text-right">14:02</span>
              </div>

              <div className="bg-[#202c33] text-zinc-200 p-3 rounded-2xl rounded-tl-xs max-w-[88%] space-y-2">
                <p>✅ <b>Horário Confirmado!</b></p>
                <div className="bg-[#111b21] p-2 rounded-xl border border-white/10 text-[11px]">
                  <p>📅 Hoje, às 16:30</p>
                  <p>✂️ Corte Degradê + Barba</p>
                  <p>👤 Profissional: Lucas Mendes</p>
                </div>
                <p className="text-[11px] text-emerald-400">Lembrete de 2 horas antes ativado!</p>
                <span className="text-[9px] text-zinc-400 block text-right">14:03</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-center text-[11px] text-zinc-400">
              ⚡ Zero trabalho manual para recepcionistas ou barbeiros.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
