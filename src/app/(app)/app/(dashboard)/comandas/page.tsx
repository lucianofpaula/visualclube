"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { PosTerminal } from "@/components/pos/pos-terminal"
import { getPosCatalogAction, getPosActiveOrdersAction } from "@/actions/pos-actions"

export default function ComandasPage() {
  const [catalogData, setCatalogData] = useState<any | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [catRes, ordRes] = await Promise.all([
          getPosCatalogAction(),
          getPosActiveOrdersAction(),
        ])

        if (catRes.success) {
          setCatalogData(catRes.data)
        }
        if (ordRes.success) {
          setOrders(ordRes.orders || [])
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <LockedFeatureGuard featureName="Comandas Digitais & PDV" requiredFeature="comandas">
      {loading || !catalogData ? (
        <div className="py-24 text-center text-xs text-muted-foreground">
          Carregando Terminal PDV e catálogo de produtos...
        </div>
      ) : (
        <PosTerminal
          catalogData={catalogData}
          initialOrders={orders}
        />
      )}
    </LockedFeatureGuard>
  )
}
