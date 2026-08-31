import * as React from "react"
import { getClubSettings } from "@/actions/club-actions"
import { ClubSettingsView } from "@/components/club/club-settings-view"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Configuração do Clube | VisualClube",
  description: "Configure o clube de assinaturas e o programa de indicação direta e multinível.",
}

export default async function ClubeConfiguracoesPage() {
  const settings = await getClubSettings()

  return (
    <LockedFeatureGuard featureName="Configuração do Clube" requiredFeature="clube_vip">
      <ClubSettingsView initialSettings={settings} />
    </LockedFeatureGuard>
  )
}
