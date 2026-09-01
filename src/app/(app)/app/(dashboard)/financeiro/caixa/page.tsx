"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { CashRegisterDashboard } from "@/components/cash-register/cash-register-dashboard"
import { getCurrentCashSessionAction, getCashSessionHistoryAction } from "@/actions/cash-register-actions"
import { Loader2 } from "lucide-react"

export default function CashRegisterPage() {
  const [initialData, setInitialData] = useState<any>(null)
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadData = () => {
    setLoading(true)
    startTransition(async () => {
      const [currentRes, historyRes] = await Promise.all([
        getCurrentCashSessionAction(),
        getCashSessionHistoryAction({ limit: 30 }),
      ])

      if (currentRes.success) {
        setInitialData(currentRes)
      }
      if (historyRes.success) {
        setHistoryData(historyRes)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <LockedFeatureGuard featureName="Controle de Caixa & Sangrias" requiredFeature="financeiro">
      {loading && !initialData ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Carregando controle de caixa e sessões de turno...</p>
        </div>
      ) : (
        <CashRegisterDashboard
          initialData={initialData}
          historyData={historyData}
          onRefresh={loadData}
          loading={loading || isPending}
        />
      )}
    </LockedFeatureGuard>
  )
}
