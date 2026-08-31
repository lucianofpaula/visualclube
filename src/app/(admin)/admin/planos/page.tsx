import * as React from "react"
import { getAdminPlans, getAdminFeaturesTree } from "@/actions/admin-actions"
import { PlansManager } from "@/components/admin/plans-manager"

export const dynamic = "force-dynamic"

export default async function AdminPlansPage() {
  const [plans, featuresTree] = await Promise.all([
    getAdminPlans(),
    getAdminFeaturesTree(),
  ])

  return <PlansManager initialPlans={plans} featuresTree={featuresTree} />
}
