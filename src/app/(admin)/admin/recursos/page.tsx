import * as React from "react"
import { getAdminFeaturesTree } from "@/actions/admin-actions"
import { FeaturesManager } from "@/components/admin/features-manager"

export const dynamic = "force-dynamic"

export default async function AdminFeaturesPage() {
  const features = await getAdminFeaturesTree()

  return <FeaturesManager initialFeatures={features} />
}
