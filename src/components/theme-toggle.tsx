"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 border-border bg-card opacity-50 cursor-default"
        aria-label="Carregando tema"
      >
        <Sun className="h-4 w-4 text-amber-500" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className={`h-9 w-9 border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer ${
        className || ""
      }`}
      title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
      aria-label={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 rotate-0" />
      )}
    </Button>
  );
}
