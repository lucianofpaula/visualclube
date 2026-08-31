import * as React from "react"
import { LockedFeatureGuard } from "@/components/app/locked-feature-guard"
import { AgendaSettingsView } from "@/components/agenda/agenda-settings-view"
import { getAgendaSettingsAction } from "@/actions/agenda-actions"

export const metadata = {
  title: "Configurações da Agenda | Cluberize",
  description: "Configure horários padrão de funcionamento, slots e feriados/dias especiais da agenda.",
}

export default async function AgendaSettingsPage() {
  const res = await getAgendaSettingsAction()

  return (
    <LockedFeatureGuard featureName="Configurações da Agenda" requiredFeature="agenda">
      <AgendaSettingsView
        initialBusinessHours={res.success && res.businessHours ? res.businessHours : []}
        initialSpecialSchedules={res.success && res.specialSchedules ? res.specialSchedules : []}
      />
    </LockedFeatureGuard>
  )
}
