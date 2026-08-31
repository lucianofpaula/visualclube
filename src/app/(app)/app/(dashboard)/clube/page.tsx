import * as React from "react"
import { getBusinessClubPlans } from "@/actions/club-actions"
import { ClubPlansView } from "@/components/club/club-plans-view"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Clube de Assinaturas | VisualClube",
  description: "Gerencie os planos de assinatura recorrente e comissionamento multinível de indicações.",
}

export default async function ClubePage() {
  const { plans, services, settings } = await getBusinessClubPlans()

  return (
    <LockedFeatureGuard featureName="Clube de Assinaturas" requiredFeature="clube_vip">
      <ClubPlansView
        initialPlans={plans}
        services={services}
        clubSettings={settings}
      />
    </LockedFeatureGuard>
  )
}
