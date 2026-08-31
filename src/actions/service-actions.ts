"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ServiceSchema = z.object({
  name: z.string().min(2, "Nome do serviço deve ter pelo menos 2 caracteres"),
  description: z.string().optional().or(z.literal("")),
  price: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  durationMinutes: z.number().min(5, "Duração mínima de 5 minutos").default(30),
  customCommission: z.number().min(0).max(100).optional().nullable(),
  category: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
})

export type ServiceInput = z.infer<typeof ServiceSchema>

/**
 * Retorna todos os serviços do negócio do usuário autenticado
 */
export async function getBusinessServices() {
  const session = await auth()
  if (!session?.user?.id) return []

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) return []

  try {
    const services = await prisma.service.findMany({
      where: { businessId: user.businessId },
      orderBy: [
        { isActive: "desc" },
        { category: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: {
            appointments: true,
            orderItems: true,
          },
        },
      },
    })

    return services
  } catch (error) {
    console.error("Erro ao buscar serviços:", error)
    return []
  }
}

/**
 * Cria um novo serviço para o estabelecimento
 */
export async function createService(data: ServiceInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Você precisa ter um estabelecimento cadastrado." }
  }

  const parsed = ServiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dados inválidos." }
  }

  try {
    const newService = await prisma.service.create({
      data: {
        businessId: user.businessId,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        price: Number(parsed.data.price),
        durationMinutes: Number(parsed.data.durationMinutes) || 30,
        customCommission: parsed.data.customCommission !== undefined && parsed.data.customCommission !== null
          ? Number(parsed.data.customCommission)
          : null,
        category: parsed.data.category?.trim() || "Geral",
        isActive: parsed.data.isActive !== undefined ? parsed.data.isActive : true,
      },
    })

    revalidatePath("/app/servicos")
    revalidatePath("/app/website")
    revalidatePath("/app/agenda")
    revalidatePath("/app/comandas")

    return {
      success: true,
      service: newService,
      message: "Serviço cadastrado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao criar serviço:", error)
    return { success: false, error: "Falha ao cadastrar serviço." }
  }
}

/**
 * Cria múltiplos serviços em lote (usado pelo gerador de catálogo com IA)
 */
export async function createManyServices(services: ServiceInput[]) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessId: true },
  })

  if (!user?.businessId) {
    return { success: false, error: "Você precisa ter um estabelecimento cadastrado." }
  }

  if (!services || services.length === 0) {
    return { success: false, error: "Nenhum serviço informado para importação." }
  }

  try {
    // Valida e sanitiza cada serviço
    const validData = services
      .filter((s) => s.name && s.name.trim().length >= 2)
      .map((s) => ({
        businessId: user.businessId as string,
        name: s.name.trim(),
        description: s.description?.trim() || null,
        price: Number(s.price) || 0,
        durationMinutes: Number(s.durationMinutes) || 30,
        customCommission: s.customCommission !== undefined && s.customCommission !== null
          ? Number(s.customCommission)
          : null,
        category: s.category?.trim() || "Geral",
        isActive: s.isActive !== undefined ? s.isActive : true,
      }))

    if (validData.length === 0) {
      return { success: false, error: "Nenhum dado válido para importação." }
    }

    const created = await prisma.service.createMany({
      data: validData,
    })

    revalidatePath("/app/servicos")
    revalidatePath("/app/website")
    revalidatePath("/app/agenda")
    revalidatePath("/app/comandas")

    return {
      success: true,
      count: created.count,
      message: `${created.count} serviços importados com sucesso!`,
    }
  } catch (error: any) {
    console.error("Erro ao importar serviços em lote:", error)
    return { success: false, error: "Falha ao importar serviços com IA." }
  }
}

/**
 * Atualiza um serviço existente
 */
export async function updateService(id: string, data: Partial<ServiceInput>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const updatePayload: any = {}

    if (data.name !== undefined) updatePayload.name = data.name.trim()
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null
    if (data.price !== undefined) updatePayload.price = Number(data.price)
    if (data.durationMinutes !== undefined) updatePayload.durationMinutes = Number(data.durationMinutes)
    if (data.customCommission !== undefined) {
      updatePayload.customCommission = data.customCommission !== null ? Number(data.customCommission) : null
    }
    if (data.category !== undefined) updatePayload.category = data.category?.trim() || "Geral"
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive

    const updated = await prisma.service.update({
      where: { id },
      data: updatePayload,
    })

    revalidatePath("/app/servicos")
    revalidatePath("/app/website")
    revalidatePath("/app/agenda")
    revalidatePath("/app/comandas")

    return {
      success: true,
      service: updated,
      message: "Serviço atualizado com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar serviço:", error)
    return { success: false, error: "Falha ao salvar alterações do serviço." }
  }
}

/**
 * Exclui um serviço com verificação de vínculos
 */
export async function deleteService(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: true,
            orderItems: true,
          },
        },
      },
    })

    if (!service) {
      return { success: false, error: "Serviço não encontrado." }
    }

    const hasHistory = (service._count?.appointments || 0) > 0 || (service._count?.orderItems || 0) > 0

    // Se possui histórico, apenas desativa para não quebrar integridade das comandas e agendamentos
    if (hasHistory) {
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      })

      revalidatePath("/app/servicos")
      revalidatePath("/app/website")
      revalidatePath("/app/agenda")

      return {
        success: true,
        wasDeactivated: true,
        message: "O serviço possui histórico em comandas/agendamentos e foi pausado para preservar seus relatórios.",
      }
    }

    // Se não possui nenhum histórico, remove fisicamente
    await prisma.service.delete({
      where: { id },
    })

    revalidatePath("/app/servicos")
    revalidatePath("/app/website")
    revalidatePath("/app/agenda")

    return {
      success: true,
      wasDeactivated: false,
      message: "Serviço removido com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao deletar serviço:", error)
    return { success: false, error: "Falha ao remover serviço." }
  }
}

/**
 * Alterna status de ativação do serviço (Ativo / Pausado)
 */
export async function toggleServiceStatus(id: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const updated = await prisma.service.update({
      where: { id },
      data: { isActive },
    })

    revalidatePath("/app/servicos")
    revalidatePath("/app/website")
    revalidatePath("/app/agenda")

    return {
      success: true,
      service: updated,
      message: isActive ? "Serviço ativado no catálogo!" : "Serviço pausado.",
    }
  } catch (error: any) {
    console.error("Erro ao alternar status do serviço:", error)
    return { success: false, error: "Falha ao alterar status." }
  }
}
