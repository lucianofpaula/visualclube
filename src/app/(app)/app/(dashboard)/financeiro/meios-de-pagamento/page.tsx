"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { PaymentMethodsManager } from "@/components/financial/payment-methods-manager"
import { getPaymentMethodsAction } from "@/actions/payment-method-actions"

export default function MeiosDePagamentoPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadMethods = () => {
    setLoading(true)
    startTransition(async () => {
      const res = await getPaymentMethodsAction()
      if (res.success) {
        setMethods(res.paymentMethods || [])
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadMethods()
  }, [])

  return (
    <LockedFeatureGuard featureName="Meios de Pagamento & Recebimento" requiredFeature="financeiro">
      {loading && methods.length === 0 ? (
        <div className="py-24 text-center text-xs text-muted-foreground">
          Carregando meios de pagamento configurados...
        </div>
      ) : (
        <PaymentMethodsManager
          initialMethods={methods}
          onRefresh={loadMethods}
        />
      )}
    </LockedFeatureGuard>
  )
}
