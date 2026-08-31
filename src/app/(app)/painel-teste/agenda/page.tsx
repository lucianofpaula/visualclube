"use client"

import * as React from "react"
import { useState } from "react"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  MessageSquare, 
  Phone,
  Filter
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AgendaPage() {
  const [selectedProf, setSelectedProf] = useState<string>("TODOS")

  const appointments = [
    {
      id: 1,
      time: "09:00 - 09:40",
      client: "Lucas Ribeiro",
      phone: "(11) 98888-1111",
      service: "Corte Degradê + Sobrancelha",
      prof: "Lucas Mendes",
      status: "COMPLETED",
      statusLabel: "Concluído",
      price: "R$ 75,00",
    },
    {
      id: 2,
      time: "10:00 - 10:30",
      client: "Gustavo Nogueira",
      phone: "(11) 97777-2222",
      service: "Barba Terapia Tradicional",
      prof: "Lucas Mendes",
      status: "COMPLETED",
      statusLabel: "Concluído",
      price: "R$ 45,00",
    },
    {
      id: 3,
      time: "14:30 - 15:15",
      client: "Rodrigo Almeida",
      phone: "(11) 98765-4321",
      service: "Corte Degradê + Barboterapia",
      prof: "Lucas Mendes",
      status: "IN_PROGRESS",
      statusLabel: "Em Atendimento",
      price: "R$ 100,00",
    },
    {
      id: 4,
      time: "15:00 - 16:00",
      client: "Camila Fernandes",
      phone: "(11) 97654-3210",
      service: "Manicure Gel + Spa dos Pés",
      prof: "Juliana Costa",
      status: "CONFIRMED",
      statusLabel: "Confirmado WhatsApp",
      price: "R$ 135,00",
    },
    {
      id: 5,
      time: "16:00 - 16:45",
      client: "Gabriel Siqueira",
      phone: "(11) 96543-2109",
      service: "Corte Social Tesoura",
      prof: "Matheus Silveira",
      status: "CONFIRMED",
      statusLabel: "Confirmado WhatsApp",
      price: "R$ 65,00",
    },
    {
      id: 6,
      time: "17:30 - 18:15",
      client: "André Luiz",
      phone: "(11) 95432-1098",
      service: "Barba Terapia + Hidratação",
      prof: "Gabriel Santos",
      status: "SCHEDULED",
      statusLabel: "Aguardando",
      price: "R$ 60,00",
    },
  ]

  const filtered = selectedProf === "TODOS" 
    ? appointments 
    : appointments.filter(a => a.prof.includes(selectedProf))

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-primary" />
            Agenda de Atendimentos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Visualize a grade de horários da equipe e os agendamentos confirmados pelo WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button className="bg-primary text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Agendamento Manual
          </Button>
        </div>
      </div>

      {/* Date Navigation & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-bold text-sm text-foreground px-2">Hoje, 26 de Agosto</span>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter by Professional */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["TODOS", "Lucas Mendes", "Gabriel Santos", "Matheus", "Juliana Costa"].map((prof) => (
            <button
              key={prof}
              onClick={() => setSelectedProf(prof)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                selectedProf === prof
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {prof === "TODOS" ? "Toda a Equipe" : prof}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Horários */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-border/60 bg-card hover:bg-card/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center font-bold text-xs bg-muted/40 px-3.5 py-2.5 rounded-xl border border-border/50 min-w-[110px]">
                <Clock className="h-3.5 w-3.5 text-primary mb-1" />
                <span>{item.time}</span>
              </div>

              <div>
                <div className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  {item.client}
                  <span className="text-xs text-muted-foreground font-normal">{item.phone}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.service}</div>
                <div className="text-[11px] text-primary font-semibold mt-1">
                  Profissional: {item.prof}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
              <span className="font-black text-sm text-foreground">{item.price}</span>
              <Badge
                variant={
                  item.status === "COMPLETED"
                    ? "outline"
                    : item.status === "IN_PROGRESS"
                    ? "gold"
                    : "success"
                }
                className="text-[10px] font-bold"
              >
                {item.statusLabel}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
