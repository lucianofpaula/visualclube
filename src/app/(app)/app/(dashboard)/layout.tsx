import * as React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { 
  getPlatformPlans, 
  getCurrentUserSubscription, 
  getPlatformFeaturesCatalog 
} from "@/actions/subscription-actions"
import { AppShell } from "@/components/app/app-shell"

export const dynamic = "force-dynamic"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth()

  // Se o usuário logado for um Profissional da equipe, redireciona para o Portal do Profissional
  if ((session?.user as any)?.role === "PROFESSIONAL") {
    redirect("/pro")
  }

  const [plans, subscription, featuresCatalog, dbUser] = await Promise.all([
    getPlatformPlans(),
    getCurrentUserSubscription(),
    getPlatformFeaturesCatalog(),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            business: true,
          },
        })
      : null,
  ])

  // Se o usuário não tem imagem definida mas possui perfil profissional na equipe com foto, sincroniza
  if (dbUser && !dbUser.image && dbUser.businessId) {
    const cleanPhone = dbUser.phone ? dbUser.phone.replace(/\D/g, "") : ""
    const pro = await prisma.professional.findFirst({
      where: {
        businessId: dbUser.businessId,
        avatarUrl: { not: null },
        OR: [
          ...(dbUser.email ? [{ email: dbUser.email.toLowerCase().trim() }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }, { phone: cleanPhone.replace(/^55/, "") }] : []),
        ],
      },
      select: { avatarUrl: true },
    })

    if (pro?.avatarUrl) {
      dbUser.image = pro.avatarUrl
      prisma.user.update({
        where: { id: dbUser.id },
        data: { image: pro.avatarUrl },
      }).catch(() => {})
    }
  }

  return (
    <AppShell
      plans={plans}
      subscription={subscription}
      featuresCatalog={featuresCatalog}
      currentUser={dbUser || session?.user || null}
    >
      {children}
    </AppShell>
  )
}
