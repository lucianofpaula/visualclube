"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Buscar Dados Completos do Portal do Cliente
 */
export async function getClientPortalDataAction() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar conectado.", data: null }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            logoUrl: true,
            bannerUrl: true,
            address: true,
            city: true,
          },
        },
        appointments: {
          include: {
            professional: { select: { id: true, name: true, specialty: true } },
            service: { select: { id: true, name: true, price: true } },
          },
          orderBy: { date: "desc" },
          take: 10,
        },
        directs: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            directs: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                directs: {
                  select: { id: true, name: true, createdAt: true },
                },
              },
            },
          },
        },
        commissionsEarned: {
          include: {
            originUser: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!user) {
      return { success: false, error: "Usuário não encontrado.", data: null }
    }

    // Calcular estatísticas da Rede Multinível (Nível 1, 2 e 3)
    const level1Count = user.directs.length
    let level2Count = 0
    let level3Count = 0

    user.directs.forEach((n1) => {
      level2Count += n1.directs.length
      n1.directs.forEach((n2) => {
        level3Count += n2.directs.length
      })
    })

    // Calcular Saldo de Cashback / Comissões
    const totalCommissions = user.commissionsEarned.reduce((acc, c) => acc + (c.amount || 0), 0)
    const availableCommissions = user.commissionsEarned
      .filter((c) => c.status === "AVAILABLE")
      .reduce((acc, c) => acc + (c.amount || 0), 0)
    const paidCommissions = user.commissionsEarned
      .filter((c) => c.status === "PAID")
      .reduce((acc, c) => acc + (c.amount || 0), 0)

    // Próximo agendamento futuro
    const now = new Date()
    const upcomingAppointments = user.appointments.filter(
      (a) => new Date(a.date) >= now && a.status !== "CANCELED"
    )

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const businessSlug = user.business?.slug || "vip"
    const referralLink = `${baseUrl}/b/${businessSlug}?ref=${user.referralCode || user.id}`

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          referralCode: user.referralCode,
          referralLink,
        },
        business: user.business,
        upcomingAppointments,
        pastAppointments: user.appointments.filter((a) => new Date(a.date) < now),
        network: {
          level1Count,
          level2Count,
          level3Count,
          totalNetwork: level1Count + level2Count + level3Count,
          directs: user.directs.map((d) => ({
            id: d.id,
            name: d.name,
            createdAt: d.createdAt,
            level2Count: d.directs.length,
          })),
        },
        wallet: {
          totalEarned: totalCommissions,
          available: availableCommissions,
          redeemed: paidCommissions,
          recentExtract: user.commissionsEarned.slice(0, 10),
        },
      },
    }
  } catch (error) {
    console.error("Erro ao carregar dados do portal:", error)
    return { success: false, error: "Falha ao carregar informações.", data: null }
  }
}
