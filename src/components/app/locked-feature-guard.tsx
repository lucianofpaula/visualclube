"use client"

import * as React from "react"
import { Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/components/app/app-shell"

interface LockedFeatureGuardProps {
  children: React.ReactNode
  featureName: string
  requiredFeature?: string
}

export function LockedFeatureGuard({
  children,
  featureName,
  requiredFeature,
}: LockedFeatureGuardProps) {
  const { isLocked, hasFeature, openPlansModal } = useSubscription()

  // Se o usuário está sem plano OU não tem a feature específica liberada
  const isBlocked = isLocked || (requiredFeature ? !hasFeature(requiredFeature) : false)

  if (!isBlocked) {
    return <>{children}</>
  }

  return (
    <div className="relative w-full">
      {/* Blurred Children */}
      <div className="filter blur-xs pointer-events-none opacity-40 select-none">
        {children}
      </div>

      {/* Lock Overlay Modal Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
        <div className="max-w-md w-full rounded-3xl bg-background/95 border border-border/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-foreground">
              Módulo {featureName} Bloqueado
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isLocked ? (
                <>
                  Para utilizar este recurso e automatizar seu espaço, escolha um de nossos planos e inicie seu período de <strong className="text-foreground">7 dias de teste grátis</strong> sem compromisso.
                </>
              ) : (
                <>
                  O recurso <strong className="text-foreground">{featureName}</strong> não faz parte do seu plano atual. Faça um upgrade para liberar o acesso instantâneo.
                </>
              )}
            </p>
          </div>

          <Button
            onClick={openPlansModal}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs h-10 rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLocked ? "Escolher Plano & Testar Grátis" : "Fazer Upgrade de Plano"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
