"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export type ColorThemeId =
  | "emerald"
  | "sapphire"
  | "amethyst"
  | "amber"
  | "rose"
  | "midnight-gold"
  | "moka-leather"
  | "sunset-glow"
  | "titanium-noir"
  | "matcha-zen"

export interface ColorThemeOption {
  id: ColorThemeId
  name: string
  subtitle: string
  hex: string
  badge: string
  bestFor: string
  gradient: string
  category: "essentials" | "exclusive"
}

export const COLOR_THEMES: ColorThemeOption[] = [
  // ── Clássicos & Essenciais ──
  {
    id: "emerald",
    name: "Esmeralda Glow",
    subtitle: "Frescor, Saúde & Sucesso",
    hex: "#10B981",
    badge: "Padrão",
    bestFor: "Barbearias, Estética & Bem-Estar",
    gradient: "from-emerald-500 to-teal-400",
    category: "essentials",
  },
  {
    id: "sapphire",
    name: "Safira Noturno",
    subtitle: "Confiança, Tecnologia & Foco",
    hex: "#2563EB",
    badge: "Moderno",
    bestFor: "Barbearias Premium & Estúdios",
    gradient: "from-blue-600 to-indigo-500",
    category: "essentials",
  },
  {
    id: "amethyst",
    name: "Ametista Glamour",
    subtitle: "Luxo, Criatividade & Charme",
    hex: "#8B5CF6",
    badge: "Exclusivo",
    bestFor: "Salões de Beleza & Cabeleireiros",
    gradient: "from-violet-600 to-purple-400",
    category: "essentials",
  },
  {
    id: "amber",
    name: "Ouro Champagne",
    subtitle: "Elegância Vintage & Alto Padrão",
    hex: "#F59E0B",
    badge: "Premium",
    bestFor: "Barbearias Clássicas & Spas VIP",
    gradient: "from-amber-500 to-yellow-400",
    category: "essentials",
  },
  {
    id: "rose",
    name: "Rubi Velvet",
    subtitle: "Estética Fina & Delicadeza",
    hex: "#F43F5E",
    badge: "Tendência",
    bestFor: "Esmalterias, Spas & Lash Designers",
    gradient: "from-rose-500 to-pink-400",
    category: "essentials",
  },

  // ── Edições Especiais & Exclusivas ──
  {
    id: "midnight-gold",
    name: "Noir & Ouro Real",
    subtitle: "Preto Ônix com Dourado Solar Acetinado",
    hex: "#EAB308",
    badge: "Ultra Luxo",
    bestFor: "Barbearias Executivas & Clubes Privados",
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    category: "exclusive",
  },
  {
    id: "moka-leather",
    name: "Moka Imperial & Couro",
    subtitle: "Tons Terrosos Nobres, Conhaque & Café",
    hex: "#A76535",
    badge: "Artesanal",
    bestFor: "Barbearias Rústicas, Charutarias & Cafés",
    gradient: "from-amber-700 via-amber-800 to-stone-900",
    category: "exclusive",
  },
  {
    id: "sunset-glow",
    name: "Sunset Gradient",
    subtitle: "Laranja Pôr do Sol Radiante & Coral",
    hex: "#F97316",
    badge: "Gradiente",
    bestFor: "Estúdios Jovens, Tendências & Visagismo",
    gradient: "from-orange-500 via-amber-500 to-rose-500",
    category: "exclusive",
  },
  {
    id: "titanium-noir",
    name: "Titânio & Obsidian",
    subtitle: "Monocromático Stealth & Aço Fosco",
    hex: "#71717A",
    badge: "Stealth",
    bestFor: "Conceito Minimalista & Clínicas High-Tech",
    gradient: "from-zinc-400 via-neutral-300 to-slate-500",
    category: "exclusive",
  },
  {
    id: "matcha-zen",
    name: "Matcha & Sálvia Zen",
    subtitle: "Verde Botânico Orgânico & Sereno",
    hex: "#84934A",
    badge: "Orgânico",
    bestFor: "Spas Holísticos, Massoterapia & Bem-Estar",
    gradient: "from-lime-600 via-emerald-600 to-teal-700",
    category: "exclusive",
  },
]

interface ThemeManagerContextType {
  colorTheme: ColorThemeId
  setColorTheme: (theme: ColorThemeId) => void
}

const ThemeManagerContext = createContext<ThemeManagerContextType>({
  colorTheme: "emerald",
  setColorTheme: () => {},
})

export function useColorTheme() {
  return useContext(ThemeManagerContext)
}

/**
 * Normaliza nomes de tema vindos do banco de dados
 */
export function normalizeThemeId(rawTheme?: string | null): ColorThemeId {
  if (!rawTheme) return "emerald"
  const clean = rawTheme.toLowerCase().trim()
  if (clean === "blue" || clean === "sapphire") return "sapphire"
  if (clean === "purple" || clean === "amethyst") return "amethyst"
  if (clean === "gold" || clean === "amber") return "amber"
  if (clean === "rose") return "rose"
  if (clean === "midnight-gold" || clean === "midnight_gold" || clean === "black-gold") return "midnight-gold"
  if (clean === "moka-leather" || clean === "moka_leather" || clean === "brown" || clean === "coffee") return "moka-leather"
  if (clean === "sunset-glow" || clean === "sunset_glow" || clean === "sunset" || clean === "orange") return "sunset-glow"
  if (clean === "titanium-noir" || clean === "titanium_noir" || clean === "titanium" || clean === "dark" || clean === "slate") return "titanium-noir"
  if (clean === "matcha-zen" || clean === "matcha_zen" || clean === "matcha" || clean === "zen") return "matcha-zen"
  if (clean === "emerald") return "emerald"
  return "emerald"
}

export function ThemeManagerProvider({
  children,
  initialTheme = "emerald",
}: {
  children: React.ReactNode
  initialTheme?: string
}) {
  const [colorTheme, setColorThemeState] = useState<ColorThemeId>(() => normalizeThemeId(initialTheme))

  const applyThemeToDOM = (theme: ColorThemeId) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }

  const setColorTheme = (newTheme: ColorThemeId) => {
    const valid = normalizeThemeId(newTheme)
    setColorThemeState(valid)
    if (typeof window !== "undefined") {
      localStorage.setItem("cluberize_color_theme", valid)
    }
    applyThemeToDOM(valid)
  }

  // Sincroniza tema inicial / localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("cluberize_color_theme") : null
    const effective = normalizeThemeId(saved || initialTheme)
    setColorThemeState(effective)
    applyThemeToDOM(effective)
  }, [initialTheme])

  return (
    <ThemeManagerContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeManagerContext.Provider>
  )
}
