"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { z } from "zod"

/**
 * Utilitários para geração de username único do cliente
 */
function toUsernameSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

async function generateClientUsername(fullName: string): Promise<string> {
  const parts = fullName.trim().split(/\s+/)
  const first = toUsernameSlug(parts[0]) || "cliente"

  const existing1 = await prisma.user.findUnique({ where: { username: first } })
  if (!existing1) return first

  if (parts.length > 1) {
    const full = parts.map(toUsernameSlug).join("")
    if (full !== first) {
      const existing2 = await prisma.user.findUnique({ where: { username: full } })
      if (!existing2) return full
    }
  }

  for (let i = 1; i <= 9999; i++) {
    const candidate = `${first}${i}`
    const exists = await prisma.user.findUnique({ where: { username: candidate } })
    if (!exists) return candidate
  }

  return `${first}${Date.now().toString().slice(-6)}`
}

/**
 * 1. Buscar Lista de Clientes com Métricas e Filtros (CRM)
 */
export async function getClientsAction(params?: {
  search?: string
  status?: "all" | "new" | "recurrent" | "club" | "at_risk"
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado.", data: [], stats: null, total: 0 }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!currentUser?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado.", data: [], stats: null, total: 0 }
  }

  const businessId = currentUser.businessId
  const search = params?.search?.trim() || ""
  const status = params?.status || "all"
  const page = Math.max(1, params?.page || 1)
  const limit = Math.max(1, params?.limit || 20)
  const skip = (page - 1) * limit

  try {
    // Filtro base: usuários associados a este negócio com role USER
    const whereClause: any = {
      businessId,
      role: "USER",
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
        { referralCode: { contains: search, mode: "insensitive" } },
      ]
    }

    // Busca todos os clientes para calcular estatísticas rápidas
    const allClients = await prisma.user.findMany({
      where: { businessId, role: "USER" },
      select: {
        id: true,
        createdAt: true,
        appointments: {
          select: { id: true, date: true, status: true, price: true },
          orderBy: { date: "desc" },
        },
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
        },
      },
    })

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    let totalCount = allClients.length
    let newThisMonth = 0
    let recurrentCount = 0
    let atRiskCount = 0

    const clientMetricsMap = new Map<string, {
      totalSpent: number
      visitCount: number
      lastVisitDate: Date | null
      status: "new" | "recurrent" | "at_risk" | "club"
    }>()

    allClients.forEach((c) => {
      const isNew = c.createdAt >= thirtyDaysAgo
      if (isNew) newThisMonth++

      const validAppointments = c.appointments.filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED")
      const validOrders = c.orders.filter((o) => o.status === "PAID")
      
      const visitCount = validAppointments.length + validOrders.length
      const lastAppDate = c.appointments[0]?.date || null
      const lastOrderDate = c.orders[0]?.createdAt || null
      
      let lastVisitDate: Date | null = null
      if (lastAppDate && lastOrderDate) {
        lastVisitDate = lastAppDate > lastOrderDate ? lastAppDate : lastOrderDate
      } else {
        lastVisitDate = lastAppDate || lastOrderDate || null
      }

      const totalSpent = validAppointments.reduce((acc, a) => acc + (a.price || 0), 0) +
        validOrders.reduce((acc, o) => acc + (o.total || 0), 0)

      let clientStatus: "new" | "recurrent" | "at_risk" | "club" = "new"

      if (visitCount >= 3) {
        clientStatus = "recurrent"
        recurrentCount++
      } else if (!isNew && (!lastVisitDate || lastVisitDate < thirtyDaysAgo)) {
        clientStatus = "at_risk"
        atRiskCount++
      } else if (isNew) {
        clientStatus = "new"
      } else {
        clientStatus = "recurrent"
        recurrentCount++
      }

      clientMetricsMap.set(c.id, {
        totalSpent,
        visitCount,
        lastVisitDate,
        status: clientStatus,
      })
    })

    // Busca paginada com relações
    const clients = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        image: true,
        referralCode: true,
        birthDate: true,
        tags: true,
        notes: true,
        activationToken: true,
        createdAt: true,
        sponsor: {
          select: { id: true, name: true, phone: true, referralCode: true },
        },
        _count: {
          select: {
            directs: true,
            appointments: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Enriquecer os dados com as métricas calculadas
    const enrichedClients = clients.map((c) => {
      const metric = clientMetricsMap.get(c.id) || {
        totalSpent: 0,
        visitCount: 0,
        lastVisitDate: null,
        status: "new" as const,
      }

      return {
        ...c,
        totalSpent: metric.totalSpent,
        visitCount: metric.visitCount,
        lastVisitDate: metric.lastVisitDate,
        crmStatus: metric.status,
      }
    })

    // Filtro adicional por status se solicitado e não for 'all'
    const filteredClients = status === "all" 
      ? enrichedClients 
      : enrichedClients.filter(c => c.crmStatus === status)

    const totalFiltered = filteredClients.length
    const totalPages = Math.max(1, Math.ceil(totalFiltered / limit))
    const validPage = Math.min(page, totalPages)
    const paginatedClients = filteredClients.slice((validPage - 1) * limit, validPage * limit)

    return {
      success: true,
      data: paginatedClients,
      stats: {
        total: totalCount,
        newThisMonth,
        recurrent: recurrentCount,
        atRisk: atRiskCount,
      },
      total: totalFiltered,
      totalCount,
      page: validPage,
      limit,
      totalPages,
    }
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error)
    return { success: false, error: "Falha ao carregar lista de clientes.", data: [], stats: null, total: 0, totalPages: 1, page: 1, limit: 20 }
  }
}

/**
 * 2. Buscar Clientes para Autocomplete de Indicação (Sponsor)
 */
export async function getPotentialSponsorsAction(search: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) return []

  const cleanSearch = search.trim()
  if (!cleanSearch || cleanSearch.length < 2) return []

  const clients = await prisma.user.findMany({
    where: {
      businessId: user.businessId,
      OR: [
        { name: { contains: cleanSearch, mode: "insensitive" } },
        { phone: { contains: cleanSearch } },
        { referralCode: { contains: cleanSearch, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      referralCode: true,
    },
    take: 10,
  })

  return clients
}

/**
 * 3. Criar Novo Cliente no Balcão (com Indicação e Token de Ativação)
 */
const CreateClientSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos (DDD + Número)"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  preferredProfessionalId: z.string().optional().or(z.literal("")),
  sponsorId: z.string().optional().or(z.literal("")),
})

export async function createClientAction(data: z.infer<typeof CreateClientSchema>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          phone: true,
          defaultSponsorId: true,
        },
      },
    },
  })

  if (!currentUser?.businessId || !currentUser.business) {
    return { success: false, error: "Você precisa ter um estabelecimento cadastrado." }
  }

  const parsed = CreateClientSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const cleanPhone = data.phone.replace(/\D/g, "")
    const cleanEmail = data.email?.trim().toLowerCase() || null
    const business = currentUser.business

    // Verifica se já existe um usuário com esse telefone
    const existingByPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    })

    if (existingByPhone) {
      if (existingByPhone.businessId === business.id) {
        return {
          success: false,
          error: `Já existe um cliente cadastrado com este WhatsApp (${existingByPhone.name || "Sem nome"}).`,
        }
      }
    }

    if (cleanEmail) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      })
      if (existingByEmail && existingByEmail.businessId === business.id) {
        return {
          success: false,
          error: `Já existe um cliente cadastrado com este e-mail (${existingByEmail.name}).`,
        }
      }
    }

    // 1. Resolver o Patrocinador (Sponsor) da Rede Multinível
    let finalSponsorId: string | null = data.sponsorId?.trim() || null

    // Se não foi selecionado um patrocinador no balcão, usa o Indicador Padrão (Default Sponsor)
    if (!finalSponsorId) {
      finalSponsorId = business.defaultSponsorId || currentUser.id // Se não configurado, usa o próprio dono
    }

    let uplineIds: string[] = []
    let path = ""
    let treeLevel = 1

    if (finalSponsorId) {
      const sponsor = await prisma.user.findUnique({
        where: { id: finalSponsorId },
        select: { id: true, uplineIds: true, path: true, treeLevel: true },
      })

      if (sponsor) {
        uplineIds = [...(sponsor.uplineIds || []), sponsor.id]
        path = `${sponsor.path || ""}/${sponsor.id}`
        treeLevel = (sponsor.treeLevel || 1) + 1
      }
    }

    // 2. Gerar Código de Indicação Próprio Único
    const prefix = data.name.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5) || "VIP"
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    let referralCode = `${prefix}-${randomSuffix}`

    const existingCode = await prisma.user.findUnique({ where: { referralCode } })
    if (existingCode) {
      referralCode = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`
    }

    // 3. Gerar Username Único e Token de Ativação Seguro (7 dias de validade)
    const username = await generateClientUsername(data.name)
    const activationToken = crypto.randomBytes(24).toString("hex")
    const activationTokenExpires = new Date(Date.now() + 7 * 24 * 3600 * 1000)

    // 4. Criar o Cliente
    const newClient = await prisma.user.create({
      data: {
        name: data.name.trim(),
        username,
        phone: cleanPhone,
        email: cleanEmail,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes?.trim() || null,
        preferredProfessionalId: data.preferredProfessionalId || null,
        role: "USER",
        businessId: business.id,
        sponsorId: finalSponsorId,
        uplineIds,
        path,
        treeLevel,
        referralCode,
        activationToken,
        activationTokenExpires,
      },
    })

    // 5. Montar URLs e Mensagem do WhatsApp
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const activationUrl = `${baseUrl}/ativar/${activationToken}`
    
    const messageText = `Olá, *${data.name.trim().split(" ")[0]}*! 👋\n\nSeu cadastro VIP na *${business.name}* foi realizado com sucesso!\n\nAcesse o link exclusivo abaixo para criar sua senha de acesso e ver seus agendamentos e o seu link de *Indique & Ganhe* para acumular cashback:\n👉 ${activationUrl}\n\nSeja muito bem-vindo(a)! 💈✨`

    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`

    revalidatePath("/app/clientes")

    return {
      success: true,
      client: newClient,
      activationToken,
      activationUrl,
      whatsappUrl,
      whatsappMessage: messageText,
      message: "Cliente cadastrado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error)
    return { success: false, error: error?.message || "Falha ao cadastrar cliente." }
  }
}

/**
 * 4. Buscar Ficha 360º Completa do Cliente
 */
export async function getClientDetailsAction(clientId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado.", client: null }
  }

  try {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: {
        sponsor: {
          select: { id: true, name: true, phone: true, referralCode: true },
        },
        appointments: {
          include: {
            professional: { select: { id: true, name: true, specialty: true } },
            service: { select: { id: true, name: true, price: true } },
          },
          orderBy: { date: "desc" },
          take: 20,
        },
        orders: {
          include: {
            items: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        directs: {
          select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
            referralCode: true,
            directs: {
              select: {
                id: true,
                name: true,
                phone: true,
                createdAt: true,
                directs: {
                  select: { id: true, name: true, phone: true, createdAt: true },
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
          take: 30,
        },
      },
    })

    if (!client) {
      return { success: false, error: "Cliente não encontrado.", client: null }
    }

    // Calcular estatísticas da Rede Multinível (Nível 1, 2 e 3)
    const level1Count = client.directs.length
    let level2Count = 0
    let level3Count = 0

    client.directs.forEach((n1) => {
      level2Count += n1.directs.length
      n1.directs.forEach((n2) => {
        level3Count += n2.directs.length
      })
    })

    // Calcular Saldo de Comissões
    const totalCommissionsEarned = client.commissionsEarned.reduce((acc, c) => acc + (c.amount || 0), 0)
    const availableCommissions = client.commissionsEarned
      .filter((c) => c.status === "AVAILABLE")
      .reduce((acc, c) => acc + (c.amount || 0), 0)
    const paidCommissions = client.commissionsEarned
      .filter((c) => c.status === "PAID")
      .reduce((acc, c) => acc + (c.amount || 0), 0)

    // LTV Total
    const totalSpent = client.appointments
      .filter((a) => a.status === "COMPLETED")
      .reduce((acc, a) => acc + (a.price || 0), 0) +
      client.orders
        .filter((o) => o.status === "PAID")
        .reduce((acc, o) => acc + (o.total || 0), 0)

    return {
      success: true,
      client: {
        ...client,
        totalSpent,
        networkStats: {
          level1Count,
          level2Count,
          level3Count,
          totalNetwork: level1Count + level2Count + level3Count,
        },
        financialStats: {
          totalCommissionsEarned,
          availableCommissions,
          paidCommissions,
        },
      },
    }
  } catch (error) {
    console.error("Erro ao buscar detalhes do cliente:", error)
    return { success: false, error: "Erro ao carregar ficha do cliente.", client: null }
  }
}

/**
 * 5. Atualizar Dados do Cliente
 */
export async function updateClientAction(clientId: string, data: {
  name?: string
  phone?: string
  email?: string
  birthDate?: string | null
  notes?: string | null
  tags?: string[]
  preferredProfessionalId?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    const updateData: any = {}
    if (data.name) updateData.name = data.name.trim()
    if (data.phone) updateData.phone = data.phone.replace(/\D/g, "")
    if (data.email !== undefined) updateData.email = data.email?.trim().toLowerCase() || null
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.preferredProfessionalId !== undefined) updateData.preferredProfessionalId = data.preferredProfessionalId || null

    await prisma.user.update({
      where: { id: clientId },
      data: updateData,
    })

    revalidatePath("/app/clientes")

    return { success: true, message: "Cliente atualizado com sucesso." }
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return { success: false, error: "Falha ao salvar alterações." }
  }
}

/**
 * 6. Gerar / Reenviar Link de Ativação do Cliente via WhatsApp
 */
export async function generateClientActivationLinkAction(clientId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  try {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: {
        business: {
          select: { name: true },
        },
      },
    })

    if (!client || !client.phone) {
      return { success: false, error: "Cliente ou telefone não encontrado." }
    }

    const activationToken = crypto.randomBytes(24).toString("hex")
    const activationTokenExpires = new Date(Date.now() + 7 * 24 * 3600 * 1000)

    await prisma.user.update({
      where: { id: clientId },
      data: {
        activationToken,
        activationTokenExpires,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const activationUrl = `${baseUrl}/ativar/${activationToken}`
    const businessName = client.business?.name || "nossa barbearia"

    const messageText = `Olá, *${(client.name || "").split(" ")[0]}*! 👋\n\nAqui está o seu link seguro de acesso ao Portal VIP da *${businessName}*:\n👉 ${activationUrl}\n\nNele você acompanha seus agendamentos e o seu saldo de cashback do *Indique & Ganhe*! ✨`

    const whatsappUrl = `https://wa.me/55${client.phone}?text=${encodeURIComponent(messageText)}`

    return {
      success: true,
      activationUrl,
      whatsappUrl,
      whatsappMessage: messageText,
    }
  } catch (error) {
    console.error("Erro ao gerar link de ativação:", error)
    return { success: false, error: "Falha ao gerar link de ativação." }
  }
}

/**
 * 7. Validar Token de Ativação do Cliente (Pública)
 */
export async function validateClientActivationTokenAction(token: string) {
  if (!token) {
    return { valid: false, error: "Token não fornecido." }
  }

  try {
    const client = await (prisma.user as any).findFirst({
      where: { activationToken: token },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            bannerUrl: true,
            themeColor: true,
          },
        },
      },
    })

    if (!client) {
      return { valid: false, error: "Link de ativação inválido ou já utilizado." }
    }

    if (client.activationTokenExpires && client.activationTokenExpires < new Date()) {
      return { valid: false, error: "Este link de ativação expirou. Solicite um novo à recepção." }
    }

    return {
      valid: true,
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        business: client.business,
      },
    }
  } catch (error) {
    console.error("Erro ao validar token:", error)
    return { valid: false, error: "Erro ao validar link." }
  }
}

/**
 * 8. Definir Senha e Concluir Ativação do Cliente (Pública)
 */
export async function activateClientPasswordAction(token: string, password: string) {
  if (!token || !password || password.length < 6) {
    return { success: false, error: "A senha deve ter pelo menos 6 caracteres." }
  }

  try {
    const client = await (prisma.user as any).findFirst({
      where: { activationToken: token },
      include: {
        business: { select: { slug: true, name: true } },
      },
    })

    if (!client || (client.activationTokenExpires && client.activationTokenExpires < new Date())) {
      return { success: false, error: "Link de ativação inválido ou expirado." }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: client.id },
      data: {
        passwordHash,
        activationToken: null,
        activationTokenExpires: null,
        phoneVerified: new Date(),
      },
    })

    return {
      success: true,
      message: "Senha definida com sucesso!",
      redirectUrl: `/portal`,
      clientName: client.name,
    }
  } catch (error) {
    console.error("Erro ao ativar senha:", error)
    return { success: false, error: "Falha ao definir senha. Tente novamente." }
  }
}

/**
 * 9. Definir Indicador Padrão do Estabelecimento (Configuração)
 */
export async function setDefaultSponsorAction(defaultSponsorId: string | null) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Estabelecimento não encontrado." }
  }

  try {
    await prisma.business.update({
      where: { id: user.businessId },
      data: { defaultSponsorId },
    })

    revalidatePath("/app/configuracoes")
    revalidatePath("/app/clientes")

    return { success: true, message: "Indicador padrão atualizado com sucesso." }
  } catch (error) {
    console.error("Erro ao salvar indicador padrão:", error)
    return { success: false, error: "Falha ao atualizar indicador padrão." }
  }
}

/**
 * 10. Agendamento Público Online (Com Captura de Ref/Indicação Multinível)
 */
export async function createPublicBookingAction(data: {
  businessSlug: string
  serviceId: string
  professionalId: string
  date: string // ISO string ou formato de data
  clientName: string
  clientPhone: string
  clientEmail?: string
  refCode?: string | null
}) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: data.businessSlug },
      select: { id: true, name: true, defaultSponsorId: true },
    })

    if (!business) {
      return { success: false, error: "Estabelecimento não encontrado." }
    }

    const cleanPhone = data.clientPhone.replace(/\D/g, "")
    if (cleanPhone.length < 10) {
      return { success: false, error: "Telefone / WhatsApp inválido." }
    }

    // 1. Busca ou cria o usuário cliente
    let client = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    })

    if (!client) {
      // Resolver Patrocinador Multinível
      let finalSponsorId = business.defaultSponsorId || null

      if (data.refCode) {
        const sponsorByCode = await prisma.user.findFirst({
          where: {
            OR: [
              { referralCode: data.refCode.trim() },
              { id: data.refCode.trim().length === 24 ? data.refCode.trim() : undefined },
            ],
          },
          select: { id: true, uplineIds: true, path: true, treeLevel: true },
        })

        if (sponsorByCode) {
          finalSponsorId = sponsorByCode.id
        }
      }

      let uplineIds: string[] = []
      let path = ""
      let treeLevel = 1

      if (finalSponsorId) {
        const sponsor = await prisma.user.findUnique({
          where: { id: finalSponsorId },
          select: { id: true, uplineIds: true, path: true, treeLevel: true },
        })
        if (sponsor) {
          uplineIds = [...(sponsor.uplineIds || []), sponsor.id]
          path = `${sponsor.path || ""}/${sponsor.id}`
          treeLevel = (sponsor.treeLevel || 1) + 1
        }
      }

      const prefix = data.clientName.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5) || "VIP"
      const referralCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
      const username = await generateClientUsername(data.clientName)
      const activationToken = crypto.randomBytes(24).toString("hex")
      const activationTokenExpires = new Date(Date.now() + 7 * 24 * 3600 * 1000)

      client = await prisma.user.create({
        data: {
          name: data.clientName.trim(),
          username,
          phone: cleanPhone,
          email: data.clientEmail?.trim().toLowerCase() || null,
          businessId: business.id,
          role: "USER",
          sponsorId: finalSponsorId,
          uplineIds,
          path,
          treeLevel,
          referralCode,
          activationToken,
          activationTokenExpires,
        },
      })
    }

    // 2. Busca dados do serviço para calcular duração e valor
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    })

    const startDate = new Date(data.date)
    const durationMinutes = service?.durationMinutes || 30
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
    const price = service?.price || 0

    // 3. Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        clientName: data.clientName.trim(),
        clientPhone: cleanPhone,
        clientEmail: data.clientEmail?.trim().toLowerCase() || null,
        professionalId: data.professionalId,
        serviceId: data.serviceId,
        date: startDate,
        endDate,
        price,
        status: "SCHEDULED",
      },
    })

    revalidatePath("/app/agenda")
    revalidatePath("/app/clientes")

    return {
      success: true,
      appointment,
      clientId: client.id,
      activationToken: client.activationToken,
      message: "Agendamento realizado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao criar agendamento público:", error)
    return { success: false, error: error?.message || "Falha ao registrar agendamento." }
  }
}
