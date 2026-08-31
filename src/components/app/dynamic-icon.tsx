import * as React from "react"
import { 
  Calendar, 
  Receipt, 
  Scissors, 
  Users, 
  Wallet, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  Layers, 
  Settings,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Crown,
  Lock,
  Boxes,
  Store,
  Package,
  LucideProps
} from "lucide-react"

export const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  calendar: Calendar,
  agenda: Calendar,
  receipt: Receipt,
  comandas: Receipt,
  scissors: Scissors,
  servicos: Scissors,
  users: Users,
  equipe: Users,
  wallet: Wallet,
  financeiro: Wallet,
  sparkles: Sparkles,
  clube: Sparkles,
  clube_vip: Sparkles,
  messagesquare: MessageSquare,
  message_square: MessageSquare,
  robo_whatsapp: MessageSquare,
  building: Building2,
  building2: Building2,
  multi_unidades: Building2,
  settings: Settings,
  configuracoes: Settings,
  layers: Layers,
  boxes: Boxes,
  store: Store,
  produtos: Package,
  produto: Package,
  package: Package,
  estoque: Package,
  shield: ShieldCheck,
  creditcard: CreditCard,
  crown: Crown,
}

export const COLOR_MAP: Record<string, { iconColor: string; bgClass: string }> = {
  agenda: { iconColor: "text-indigo-500", bgClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500" },
  comandas: { iconColor: "text-amber-500", bgClass: "bg-amber-500/10 border-amber-500/20 text-amber-500" },
  produtos: { iconColor: "text-emerald-500", bgClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" },
  servicos: { iconColor: "text-emerald-500", bgClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" },
  equipe: { iconColor: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-500/20 text-blue-500" },
  financeiro: { iconColor: "text-teal-500", bgClass: "bg-teal-500/10 border-teal-500/20 text-teal-500" },
  clube_vip: { iconColor: "text-purple-500", bgClass: "bg-purple-500/10 border-purple-500/20 text-purple-500" },
  robo_whatsapp: { iconColor: "text-green-500", bgClass: "bg-green-500/10 border-green-500/20 text-green-500" },
  multi_unidades: { iconColor: "text-cyan-500", bgClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500" },
}

export function getFeatureIcon(iconNameOrCode?: string | null): React.ComponentType<LucideProps> {
  if (!iconNameOrCode) return Layers
  const key = iconNameOrCode.toLowerCase().replace(/[^a-z0-9_]/g, "")
  return ICON_MAP[key] || Layers
}

export function getFeatureColors(code?: string | null) {
  if (!code) return { iconColor: "text-primary", bgClass: "bg-primary/10 border-primary/20 text-primary" }
  const key = code.toLowerCase().split(".")[0]
  return COLOR_MAP[key] || { iconColor: "text-indigo-500", bgClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500" }
}
