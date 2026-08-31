"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { AccountsManager } from "@/components/financial/accounts-manager"
import { getFinancialAccountsAction, getAccountTransactionsAction } from "@/actions/account-actions"

export default function ContasPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadData = () => {
    setLoading(true)
    startTransition(async () => {
      const [accRes, transRes] = await Promise.all([
        getFinancialAccountsAction(),
        getAccountTransactionsAction(),
      ])

      if (accRes.success) {
        setAccounts(accRes.accounts || [])
        setStats(accRes.stats || null)
      }

      if (transRes.success) {
        setTransactions(transRes.transactions || [])
      }

      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <LockedFeatureGuard featureName="Contas Bancárias & Carteiras" requiredFeature="financeiro">
      {loading && accounts.length === 0 ? (
        <div className="py-24 text-center text-xs text-muted-foreground">
          Carregando contas correntes e carteiras...
        </div>
      ) : (
        <AccountsManager
          accounts={accounts}
          stats={stats}
          transactions={transactions}
          onRefresh={loadData}
        />
      )}
    </LockedFeatureGuard>
  )
}
