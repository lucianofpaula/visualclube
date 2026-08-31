"use client"

import * as React from "react"
import { useState } from "react"
import { Scissors, Plus, Search, Edit2, Trash2, Clock, Percent, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ServicosPage() {
  const [servicos, setServicos] = useState([
    { id: 1, name: "Corte Degradê / Fade", category: "Cabelo", price: 55.0, duration: "40 min", commission: "50%" },
    { id: 2, name: "Corte Tesoura Clássico", category: "Cabelo", price: 50.0, duration: "40 min", commission: "50%" },
    { id: 3, name: "Barba Terapia com Toalha Quente", category: "Barba", price: 45.0, duration: "30 min", commission: "50%" },
    { id: 4, name: "Combo Cabelo + Barba Premium", category: "Combos", price: 90.0, duration: "60 min", commission: "50%" },
    { id: 5, name: "Pigmentação de Barba", category: "Estética", price: 35.0, duration: "25 min", commission: "50%" },
    { id: 6, name: "Sobrancelha na Pinça / Navalha", category: "Estética", price: 25.0, duration: "15 min", commission: "50%" },
    { id: 7, name: "Manicure Completa em Gel", category: "Unhas", price: 90.0, duration: "60 min", commission: "50%" },
  ])

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Scissors className="h-7 w-7 text-primary" />
            Catálogo de Serviços
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cadastre seus serviços, defina tempo de execução, preço e taxa de comissão da equipe.
          </p>
        </div>

        <Button className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Serviço
        </Button>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/50 flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar serviço..."
              className="w-full h-9 rounded-xl border border-border/60 bg-muted/30 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Badge variant="outline" className="text-xs">{servicos.length} cadastrados</Badge>
        </div>

        <div className="divide-y divide-border/40">
          {servicos.map((svc) => (
            <div key={svc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    {svc.name}
                    <Badge variant="secondary" className="text-[10px]">{svc.category}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {svc.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Comissão padrão: {svc.commission}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-base font-black text-foreground">
                  R$ {svc.price.toFixed(2).replace(".", ",")}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
