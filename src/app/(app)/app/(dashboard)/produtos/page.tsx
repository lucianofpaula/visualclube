"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { ProductList } from "@/components/products/product-list"
import { getProductsAction } from "@/actions/product-actions"

export default function ProdutosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadProducts = () => {
    setLoading(true)
    startTransition(async () => {
      const res = await getProductsAction()
      if (res.success) {
        setProducts(res.products || [])
        setStats(res.stats || null)
        setCategories(res.categories || [])
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <LockedFeatureGuard featureName="Produtos & Estoque" requiredFeature="produtos">
      {loading && products.length === 0 ? (
        <div className="py-24 text-center text-xs text-muted-foreground">
          Carregando produtos e estoque...
        </div>
      ) : (
        <ProductList
          initialProducts={products}
          initialStats={stats}
          categories={categories}
          onRefresh={loadProducts}
        />
      )}
    </LockedFeatureGuard>
  )
}
