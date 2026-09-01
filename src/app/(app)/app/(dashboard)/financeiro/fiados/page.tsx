import { Metadata } from "next"
import { DebtsDashboard } from "@/components/debts/debts-dashboard"

export const metadata: Metadata = {
  title: "Contas a Receber (Pagar Depois) | VisualClube CRM",
  description: "Gestão completa de pagamentos a prazo, conta cliente, contas a receber e cobranças automáticas via WhatsApp",
}

export default function ContasAReceberPage() {
  return <DebtsDashboard />
}
