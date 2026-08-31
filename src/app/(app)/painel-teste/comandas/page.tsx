"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Receipt, 
  Plus, 
  Search, 
  Scissors, 
  Beer, 
  ShoppingBag, 
  QrCode, 
  CreditCard, 
  Check, 
  X, 
  Trash2, 
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ComandasPage() {
  const [selectedComanda, setSelectedComanda] = useState<number>(1)
  const [modalNovoItem, setModalNovoItem] = useState(false)
  const [pixModalOpen, setPixModalOpen] = useState(false)

  const [comandas, setComandas] = useState([
    {
      id: 1,
      code: "CMD-104",
      client: "Marcelo Viana",
      phone: "(11) 98765-4321",
      chair: "Cadeira 02 • Lucas Mendes",
      status: "OPEN",
      openedAt: "14:10 (há 45 min)",
      items: [
        { id: 101, name: "Corte Degradê Navalhado", type: "service", prof: "Lucas Mendes", price: 55.0, commission: 27.5 },
        { id: 102, name: "Barboterapia com Toalha Quente", type: "service", prof: "Lucas Mendes", price: 45.0, commission: 22.5 },
        { id: 103, name: "2x Cerveja Heineken Long Neck", type: "product", prof: "Bar / Recepção", price: 24.0, commission: 0.0 },
        { id: 104, name: "Pomada Modeladora Efeito Matte", type: "product", prof: "Lucas Mendes", price: 40.0, commission: 4.0 },
      ],
    },
    {
      id: 2,
      code: "CMD-105",
      client: "Felipe Duarte",
      phone: "(11) 97654-3210",
      chair: "Cadeira 03 • Gabriel Santos",
      status: "OPEN",
      openedAt: "14:35 (há 20 min)",
      items: [
        { id: 201, name: "Corte Social Tesoura", type: "service", prof: "Gabriel Santos", price: 50.0, commission: 25.0 },
        { id: 202, name: "Refrigerante Coca-Cola Zero", type: "product", prof: "Bar / Recepção", price: 7.0, commission: 0.0 },
      ],
    },
    {
      id: 3,
      code: "CMD-106",
      client: "Camila Fernandes",
      phone: "(11) 96543-2109",
      chair: "Mesa 01 • Juliana Costa",
      status: "OPEN",
      openedAt: "14:00 (há 55 min)",
      items: [
        { id: 301, name: "Manicure Gel Completa", type: "service", prof: "Juliana Costa", price: 90.0, commission: 45.0 },
        { id: 302, name: "Spa dos Pés com Esfoliação", type: "service", prof: "Juliana Costa", price: 45.0, commission: 22.5 },
        { id: 303, name: "Café Nespresso Lungo", type: "product", prof: "Bar / Recepção", price: 8.0, commission: 0.0 },
      ],
    },
  ])

  const current = comandas.find((c) => c.id === selectedComanda) || comandas[0]
  const total = current.items.reduce((acc, i) => acc + i.price, 0)
  const totalComissao = current.items.reduce((acc, i) => acc + i.commission, 0)
  const liquidoSalao = total - totalComissao

  const handleAddItem = (item: { name: string; type: string; prof: string; price: number; commission: number }) => {
    const updated = comandas.map((c) => {
      if (c.id === current.id) {
        return {
          ...c,
          items: [...c.items, { ...item, id: Date.now() }],
        }
      }
      return c
    })
    setComandas(updated)
    setModalNovoItem(false)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-7 w-7 text-amber-500" />
            Comandas Digitais & Balcão
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Lançamento unificado de cortes, serviços químicos, bar, bebidas e cosméticos com rateio automático.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              const newId = Date.now()
              const novaComanda = {
                id: newId,
                code: `CMD-${Math.floor(100 + Math.random() * 900)}`,
                client: "Cliente Avulso",
                phone: "(11) 99999-9999",
                chair: "Cadeira Livre",
                status: "OPEN",
                openedAt: "Agora mesmo",
                items: [
                  { id: Date.now(), name: "Corte Degradê", type: "service", prof: "Lucas Mendes", price: 50.0, commission: 25.0 }
                ]
              }
              setComandas([...comandas, novaComanda])
              setSelectedComanda(newId)
            }}
            className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Abrir Nova Ficha / Comanda
          </Button>
        </div>
      </div>

      {/* Grid Principal: Lista de Comandas à esquerda + Detalhes e Fechamento à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Cartões de Comandas Abertas */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Comandas Ativas ({comandas.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {comandas.map((cmd) => {
              const isSelected = cmd.id === current.id
              const cmdTotal = cmd.items.reduce((acc, i) => acc + i.price, 0)
              return (
                <div
                  key={cmd.id}
                  onClick={() => setSelectedComanda(cmd.id)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer",
                    isSelected
                      ? "bg-card border-primary/60 shadow-md ring-2 ring-primary/20"
                      : "bg-card/60 border-border/60 hover:bg-card hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground">{cmd.code}</span>
                      <Badge variant="gold" className="text-[9px] px-1.5 py-0">Aberta</Badge>
                    </div>
                    <span className="font-black text-sm text-foreground">
                      R$ {cmdTotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-foreground">{cmd.client}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{cmd.chair}</div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 mt-2 border-t border-border/40">
                    <span>{cmd.items.length} itens lançados</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cmd.openedAt}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Coluna Direita: Detalhe da Comanda Selecionada */}
        <div className="lg:col-span-7">
          <Card className="rounded-3xl border-border/80 bg-card p-6 shadow-xl space-y-6">
            {/* Header da Comanda */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-foreground">{current.code}</h2>
                  <Badge variant="gold">Consumo Ativo</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {current.client} • {current.phone} • {current.chair}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalNovoItem(true)}
                className="text-xs h-8 rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                + Lançar Item / Bar
              </Button>
            </div>

            {/* Tabela de Itens */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Itens Consumidos:
              </div>

              <div className="divide-y divide-border/40 rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
                {current.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-card border border-border/60">
                        {item.type === "service" ? (
                          <Scissors className="h-4 w-4 text-primary" />
                        ) : (
                          <Beer className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.prof} • {item.commission > 0 ? `Comissão: R$ ${item.commission.toFixed(2).replace(".", ",")}` : "Sem comissão"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-foreground text-sm">
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo Financeiro & Split */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Subtotal a Cobrar:</span>
                <span className="text-xl font-black text-foreground">
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-500/20 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Repasse do Profissional:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    R$ {totalComissao.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground block">Líquido do Estabelecimento:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    R$ {liquidoSalao.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações de Fechamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => setPixModalOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 rounded-xl shadow-md"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Fechar com PIX Instantâneo
              </Button>

              <Button
                variant="outline"
                className="w-full font-bold text-xs h-11 rounded-xl"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Cartão de Débito / Crédito
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Lançar Item Rápido */}
      {modalNovoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="font-bold text-base text-foreground">Lançar Item na Comanda</h3>
              <button onClick={() => setModalNovoItem(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: "Cerveja Heineken Long Neck (330ml)", type: "product", prof: "Bar / Recepção", price: 12.0, commission: 0.0 },
                { name: "Cerveja Corona Extra (330ml)", type: "product", prof: "Bar / Recepção", price: 13.0, commission: 0.0 },
                { name: "Pomada Modeladora Efeito Matte", type: "product", prof: "Lucas Mendes", price: 40.0, commission: 4.0 },
                { name: "Óleo Hidratante de Barba", type: "product", prof: "Lucas Mendes", price: 45.0, commission: 4.5 },
                { name: "Sobrancelha Navalhada / Pinça", type: "service", prof: "Lucas Mendes", price: 25.0, commission: 12.5 },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddItem(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/60 transition-colors text-left text-xs font-semibold"
                >
                  <div>
                    <div className="text-foreground">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.prof}</div>
                  </div>
                  <span className="font-bold text-primary">R$ {item.price.toFixed(2).replace(".", ",")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal PIX Instantâneo */}
      {pixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">PIX Dinâmico</span>
              <button onClick={() => setPixModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white text-black inline-block shadow-md">
              <div className="h-44 w-44 bg-zinc-900 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                <QrCode className="h-16 w-16 text-emerald-400" />
                <span>QR Code PIX</span>
                <span className="text-[10px] text-zinc-400">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-black text-foreground">Total: R$ {total.toFixed(2).replace(".", ",")}</div>
              <p className="text-xs text-muted-foreground">Mostre a tela para o cliente escanear no app do banco.</p>
            </div>

            <Button
              onClick={() => {
                alert("Pagamento PIX confirmado com sucesso! Comanda fechada.")
                setPixModalOpen(false)
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl shadow-md"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
