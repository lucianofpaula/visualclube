"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "icon" | "dropdown" | "pills"
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("h-9 w-9 rounded-xl border border-border/50 bg-card/60 animate-pulse", className)} />
    )
  }

  const isDark = resolvedTheme === "dark"

  if (variant === "pills") {
    return (
      <div className={cn("inline-flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/60 text-xs font-medium", className)}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
            theme === "light"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Modo Claro"
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">Claro</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
            theme === "dark"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Modo Escuro"
        >
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Escuro</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
            theme === "system"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Modo Sistema"
        >
          <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/70 hover:bg-card text-foreground shadow-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95",
        className
      )}
      title={isDark ? "Mudar para modo Claro" : "Mudar para modo Escuro"}
      aria-label="Alternar tema"
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-all duration-300 text-amber-500",
          isDark ? "-rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "h-4 w-4 transition-all duration-300 text-indigo-400",
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0 absolute"
        )}
      />
    </button>
  )
}
