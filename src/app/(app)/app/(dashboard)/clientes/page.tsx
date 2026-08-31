import { Metadata } from "next"
import { ClientList } from "@/components/crm/client-list"

export const metadata: Metadata = {
  title: "CRM de Clientes & Rede VIP | Cluberize",
  description: "Gerencie sua base de clientes, histórico de serviços, LTV e rede multinível de indicações.",
}

export default function ClientesPage() {
  return <ClientList />
}
