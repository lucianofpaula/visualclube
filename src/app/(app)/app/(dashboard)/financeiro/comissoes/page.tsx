import { Metadata } from "next"
import { CommissionDashboard } from "@/components/commissions/commission-dashboard"

export const metadata: Metadata = {
  title: "Comissões & Repasses da Equipe | VisualClube CRM",
  description: "Fechamento de repasses, cálculo de comissões por colaborador, vales e comprovantes WhatsApp",
}

export default function ComissoesPage() {
  return <CommissionDashboard />
}
