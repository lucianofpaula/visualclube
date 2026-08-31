"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { FinancialFlowDashboard } from "@/components/financial/financial-flow-dashboard"
import { getFinancialFlowAction, FinancialFlowFilter } from "@/actions/financial-flow-actions"
import { Loader2 } from "lucide-react"

export default function FinanceiroPage() {
  const [data, setData] = useState<any>(null)
  const [filter, setFilter] = useState<FinancialFlowFilter>({ period: "month" })
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadData = (currentFilter: FinancialFlowFilter = filter) => {
    setLoading(true)
    startTransition(async () => {
      const res = await getFinancialFlowAction(currentFilter)
      if (res.success) {
        setData(res)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData(filter)
  }, [filter])

  return (
    <LockedFeatureGuard featureName="Fluxo de Caixa & Extrato" requiredFeature="financeiro">
      {loading && !data ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Carregando fluxo de caixa e extrato financeiro...</p>
        </div>
      ) : (
        <FinancialFlowDashboard
          data={data}
          currentFilter={filter}
          onFilterChange={(newFilter) => setFilter(newFilter)}
          onRefresh={() => loadData(filter)}
          loading={loading || isPending}
        />
      )}
    </LockedFeatureGuard>
  )
}
