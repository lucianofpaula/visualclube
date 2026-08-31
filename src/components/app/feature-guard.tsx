"use client"

import * as React from "react"
import { Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/lib/permissions"

interface FeatureGuardProps {
  children: React.ReactNode
  code: string
  featureName?: string
  fallback?: React.ReactNode
}

export function FeatureGuard({
  children,
  code,
  featureName,
  fallback,
}: FeatureGuardProps) {
  const { hasFeature, openUpgradeModal } = usePermissions()

  const isPermitted = hasFeature(code)

  if (isPermitted) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="relative rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center space-y-3">
      <div className="mx-auto h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <Lock className="h-5 w-5" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-foreground">
          {featureName ? `Recurso "${featureName}" Bloqueado` : "Recurso Exclusivo"}
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Este recurso não está incluso no seu plano atual. Faça upgrade para desbloquear.
        </p>
      </div>

      <Button
        onClick={() => openUpgradeModal(featureName)}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1" />
        Ver Planos de Upgrade
      </Button>
    </div>
  )
}
