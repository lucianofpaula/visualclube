"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  Crown, 
  Flower2, 
  Zap, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Calendar, 
  ArrowLeft, 
  Eye, 
  ExternalLink,
  Layers,
  Check,
  Palette,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TemplateNoirGold } from "./template-noir-gold"
import { TemplateMaisonEclat } from "./template-maison-eclat"
import { TemplateNeoTokyo } from "./template-neo-tokyo"
import { SharedBookingDialog } from "./shared-booking-dialog"

export type TemplateId = "noir-gold" | "maison-eclat" | "neo-tokyo"
export type ViewportMode = "desktop" | "tablet" | "mobile"

const TEMPLATES = [
  {
    id: "noir-gold" as TemplateId,
    name: "Royal Gentleman",
    type: "noir" as const,
    subtitle: "Barbearia de Altíssimo Luxo • London Club",
    badge: "Noir & Gold",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: Crown,
    desc: "Estilo bespoke inglês, cores carvão e ouro envelhecido, tipografia serifada editorial e clima speakeasy.",
    palette: ["#070709", "#eab308", "#f4f4f5", "#261904"],
  },
  {
    id: "maison-eclat" as TemplateId,
    name: "Maison Éclat",
    type: "maison" as const,
    subtitle: "Salão de Alta Beleza & Hair Spa Parisiense",
    badge: "Parisienne Vogue",
    badgeColor: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300",
    icon: Flower2,
    desc: "Design editorial estilo revista Vogue, paleta marfim e rose champagne, mechas francesas e spa orgânico.",
    palette: ["#faf8f5", "#a36854", "#2b2420", "#f2e7e1"],
  },
  {
    id: "neo-tokyo" as TemplateId,
    name: "Cyber Blade",
    type: "neo" as const,
    subtitle: "Studio Urbano Futurista & Streetwear Grooming",
    badge: "Cyberpunk Tech",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    icon: Zap,
    desc: "Aesthetic Tokyo Harajuku / NYC SoHo, neon cyan & violet glow, fades geométricos milimétricos e grids técnicos.",
    palette: ["#05060a", "#06b6d4", "#d946ef", "#0c101c"],
  },
]

export function SitesShowcaseView() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("noir-gold")
  const [viewport, setViewport] = useState<ViewportMode>("desktop")
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const activeTpl = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0]

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR DE CONTROLE E SELEÇÃO DE TEMPLATES
      ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-border/40 bg-[#0c0e17]/95 backdrop-blur-xl sticky top-0 z-50 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Voltar */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <Link
              href="/app/website"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Painel</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-400" />
                <span>Showcase de Sites Premium</span>
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
                3 Amostras Exclusivas
              </Badge>
            </div>
          </div>

          {/* Seletor dos 3 Modelos de Sites */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-border/60 overflow-x-auto max-w-full">
            {TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id
              const Icon = tpl.icon

              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-white/10 text-white shadow-sm border border-white/20"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{tpl.name}</span>
                </button>
              )
            })}
          </div>

          {/* Seletor de Viewport (Desktop / Tablet / Mobile) + Ação */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center rounded-xl bg-black/50 border border-border/60 p-0.5 text-xs">
              <button
                onClick={() => setViewport("desktop")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewport === "desktop" ? "bg-white/20 text-white" : "text-muted-foreground hover:text-white"
                )}
                title="Visualização Desktop"
              >
                <Monitor className="size-4" />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewport === "tablet" ? "bg-white/20 text-white" : "text-muted-foreground hover:text-white"
                )}
                title="Visualização Tablet (768px)"
              >
                <Tablet className="size-4" />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewport === "mobile" ? "bg-white/20 text-white" : "text-muted-foreground hover:text-white"
                )}
                title="Visualização Celular (390px)"
              >
                <Smartphone className="size-4" />
              </button>
            </div>

            <Button
              onClick={() => setIsBookingOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black h-9 rounded-xl px-4 gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Calendar className="size-3.5" />
              <span>Testar Agendamento</span>
            </Button>
          </div>
        </div>

        {/* Sub-bar com Metadados do Template Ativo */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{activeTpl.name}:</span>
            <span>{activeTpl.desc}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px]">Paleta de Cores:</span>
            <div className="flex items-center gap-1">
              {activeTpl.palette.map((color, i) => (
                <div
                  key={i}
                  className="size-3.5 rounded-full border border-white/20 shadow-xs"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ÁREA DE VISUALIZAÇÃO DO TEMPLATE (COM RESPONSIVIDADE)
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex justify-center items-start p-0 bg-[#050608] overflow-y-auto">
        <div
          className={cn(
            "transition-all duration-300 w-full min-h-screen bg-background",
            viewport === "tablet" && "max-w-[768px] my-6 rounded-[2.5rem] overflow-hidden border-8 border-neutral-800 shadow-2xl ring-1 ring-white/10",
            viewport === "mobile" && "max-w-[390px] my-6 rounded-[3rem] overflow-hidden border-[10px] border-neutral-800 shadow-2xl ring-1 ring-white/10"
          )}
        >
          {selectedTemplate === "noir-gold" && (
            <TemplateNoirGold onOpenBooking={() => setIsBookingOpen(true)} />
          )}
          {selectedTemplate === "maison-eclat" && (
            <TemplateMaisonEclat onOpenBooking={() => setIsBookingOpen(true)} />
          )}
          {selectedTemplate === "neo-tokyo" && (
            <TemplateNeoTokyo onOpenBooking={() => setIsBookingOpen(true)} />
          )}
        </div>
      </main>

      {/* Modal de Agendamento Compartilhado */}
      <SharedBookingDialog
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        themeType={activeTpl.type}
        shopName={activeTpl.name}
      />
    </div>
  )
}
