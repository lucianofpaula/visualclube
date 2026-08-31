"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { AgendaView } from "@/components/agenda/agenda-view"
import { getAgendaDataAction, AgendaFilter } from "@/actions/agenda-actions"
import { Loader2 } from "lucide-react"

export default function AgendaPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadData = () => {
    setLoading(true)
    startTransition(async () => {
      const res = await getAgendaDataAction({ viewMode: "week" })
      if (res.success) {
        setData(res)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <LockedFeatureGuard featureName="Agenda & Horários" requiredFeature="agenda">
      {loading && !data ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-muted-foreground font-medium">
            Carregando grade de horários da equipe...
          </p>
        </div>
      ) : (
        <AgendaView
          initialData={data}
          onRefresh={loadData}
          loading={loading || isPending}
        />
      )}
    </LockedFeatureGuard>
  )
}
