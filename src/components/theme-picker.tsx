"use client"

import * as React from "react"
import { useState } from "react"
import { Check, Sparkles, Palette, Crown, Flame, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { COLOR_THEMES, ColorThemeId, ColorThemeOption, normalizeThemeId } from "@/components/theme-manager"
import { cn } from "@/lib/utils"

interface ThemePickerProps {
  currentTheme: string
  onSelectTheme: (themeId: ColorThemeId) => void
  disabled?: boolean
  className?: string
}

export function ThemePicker({
  currentTheme,
  onSelectTheme,
  disabled = false,
  className,
}: ThemePickerProps) {
  const activeId = normalizeThemeId(currentTheme)
  const [filter, setFilter] = useState<"all" | "exclusive" | "essentials">("all")

  const filteredThemes = React.useMemo(() => {
    if (filter === "all") return COLOR_THEMES
    return COLOR_THEMES.filter((t) => t.category === filter)
  }, [filter])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho do Seletor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h4 className="font-bold text-foreground text-sm sm:text-base">
            Paleta de Cores & Identidade Visual
          </h4>
        </div>

        {/* Filtro de Categorias */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/60 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all text-xs",
              filter === "all"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos (10)
          </button>
          <button
            type="button"
            onClick={() => setFilter("exclusive")}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-lg transition-all text-xs",
              filter === "exclusive"
                ? "bg-background text-foreground shadow-xs font-bold text-amber-500 dark:text-amber-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Crown className="w-3 h-3 text-amber-500" />
            <span>Exclusivos & Luxo</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("essentials")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all text-xs",
              filter === "essentials"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Essenciais
          </button>
        </div>
      </div>

      {/* Regra 60-30-10 Info Bar */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
        <span className="text-[11px] font-medium hidden sm:inline">
          Proporção Harmoniosa de Contraste:
        </span>
        <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-around sm:justify-end">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted border border-border" />
            <span className="text-[11px]">60% Fundo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-card border border-border" />
            <span className="text-[11px]">30% Estrutura</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold text-foreground">10% Destaque</span>
          </div>
        </div>
      </div>

      {/* Grid dos Temas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {filteredThemes.map((theme: ColorThemeOption) => {
          const isSelected = activeId === theme.id

          return (
            <button
              key={theme.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTheme(theme.id)}
              className={cn(
                "group relative flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none",
                "hover:border-primary/50 hover:shadow-md active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border/60 bg-card/60 hover:bg-card/90",
                disabled && "opacity-60 cursor-not-allowed pointer-events-none"
              )}
            >
              {/* Miniatura Ilustrativa da Regra 60-30-10 */}
              <div className="w-full h-20 rounded-xl bg-muted/60 border border-border/50 p-2.5 flex flex-col justify-between mb-3 overflow-hidden shadow-inner">
                {/* Header de simulação */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn("w-2.5 h-2.5 rounded-full shadow-xs bg-gradient-to-r", theme.gradient)}
                    />
                    <div className="w-10 h-1.5 rounded-full bg-foreground/20" />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white shadow-xs bg-gradient-to-r",
                      theme.gradient
                    )}
                  >
                    {theme.badge}
                  </span>
                </div>

                {/* Área de conteúdo do preview (30% superfície cards, 10% botão de ação) */}
                <div className="flex gap-1.5 items-end pt-1">
                  <div className="h-6 flex-1 rounded-md bg-card border border-border/60 p-1 flex items-center justify-start">
                    <div className="w-6 h-1 rounded bg-muted-foreground/30" />
                  </div>
                  <div
                    className={cn(
                      "h-6 px-2 rounded-md flex items-center justify-center font-bold text-[9px] text-white shadow-xs bg-gradient-to-r",
                      theme.gradient
                    )}
                  >
                    CTA
                  </div>
                </div>
              </div>

              {/* Informações do Tema */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {theme.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in-50 duration-200">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <span className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                {theme.subtitle}
              </span>

              <div className="mt-2.5 pt-2 border-t border-border/40 w-full flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="truncate max-w-[130px]">{theme.bestFor}</span>
                <span
                  className={cn("w-2.5 h-2.5 rounded-full shrink-0 shadow-xs bg-gradient-to-r", theme.gradient)}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
