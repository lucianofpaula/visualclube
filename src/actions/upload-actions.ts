"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const PRO_COOKIE_NAME = "pro_session_token"

/**
 * Server Action genérica para upload de imagem para o Cloudinary
 */
export async function uploadImageAction(formData: FormData, folder: string = "visualclube/avatars") {
  const file = formData.get("file") as File | null
  if (!file) {
    return { success: false, error: "Nenhum arquivo enviado." }
  }

  // Validação de tipo de arquivo
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"]
  if (!validTypes.includes(file.type)) {
    return { success: false, error: "Formato inválido. Use JPG, PNG ou WEBP." }
  }

  // Validação de tamanho (máximo 8MB)
  if (file.size > 8 * 1024 * 1024) {
    return { success: false, error: "Arquivo muito grande. O limite máximo é 8MB." }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadImageToCloudinary(buffer, {
      folder,
    })

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
    }
  } catch (error: any) {
    console.error("Erro ao realizar upload no Cloudinary:", error)
    return {
      success: false,
      error: error?.message || "Falha ao enviar imagem para o Cloudinary. Verifique as credenciais.",
    }
  }
}

/**
 * Server Action para atualizar o avatar do usuário Gestor (Painel do Gestor /app)
 * Sincroniza bidirecionalmente com o perfil do Profissional no /pro
 */
export async function updateUserAvatarAction(imageUrl: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl || null },
    })

    // Sincroniza também no perfil do Profissional caso ele tenha um perfil vinculado
    if (updatedUser.businessId) {
      const cleanPhone = updatedUser.phone ? updatedUser.phone.replace(/\D/g, "") : ""
      await prisma.professional.updateMany({
        where: {
          businessId: updatedUser.businessId,
          OR: [
            ...(updatedUser.email ? [{ email: updatedUser.email.toLowerCase().trim() }] : []),
            ...(cleanPhone ? [{ phone: cleanPhone }, { phone: cleanPhone.replace(/^55/, "") }, { phone: `55${cleanPhone}` }] : []),
          ],
        },
        data: {
          avatarUrl: imageUrl || null,
        },
      })
    }

    revalidatePath("/app")
    revalidatePath("/app/configuracoes")
    revalidatePath("/app/equipe")
    revalidatePath("/pro")
    revalidatePath("/app/website")

    return {
      success: true,
      user: updatedUser,
      message: "Foto de perfil atualizada com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar avatar do usuário:", error)
    return { success: false, error: "Falha ao salvar foto do perfil." }
  }
}

/**
 * Server Action para atualizar o perfil do usuário do App (Nome, Telefone, Imagem)
 */
export async function updateUserProfileAction(data: {
  name?: string
  phone?: string
  image?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar autenticado." }
  }

  try {
    const updateData: any = {}
    if (data.name) updateData.name = data.name.trim()
    if (data.phone) updateData.phone = data.phone.replace(/\D/g, "")
    if (data.image !== undefined) updateData.image = data.image || null

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    // Sincroniza dados com o perfil profissional se houver
    if (updatedUser.businessId) {
      const cleanPhone = updatedUser.phone ? updatedUser.phone.replace(/\D/g, "") : ""
      await prisma.professional.updateMany({
        where: {
          businessId: updatedUser.businessId,
          OR: [
            ...(updatedUser.email ? [{ email: updatedUser.email.toLowerCase().trim() }] : []),
            ...(cleanPhone ? [{ phone: cleanPhone }, { phone: cleanPhone.replace(/^55/, "") }, { phone: `55${cleanPhone}` }] : []),
          ],
        },
        data: {
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.phone ? { phone: cleanPhone } : {}),
          ...(data.image !== undefined ? { avatarUrl: data.image || null } : {}),
        },
      })
    }

    revalidatePath("/app")
    revalidatePath("/app/configuracoes")
    revalidatePath("/app/equipe")
    revalidatePath("/pro")
    revalidatePath("/app/website")

    return {
      success: true,
      user: updatedUser,
      message: "Dados do perfil atualizados com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar perfil do usuário:", error)
    return { success: false, error: "Falha ao salvar dados do perfil." }
  }
}

/**
 * Server Action para upload e atualização direta do avatar do Profissional no portal /pro
 * Sincroniza bidirecionalmente com o usuário Dono/Gestor (/app)
 */
export async function updateProAvatarAction(imageUrl: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PRO_COOKIE_NAME)?.value
    if (!token) return { success: false, error: "Não autenticado." }

    const parsed = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
    if (!parsed?.proId) return { success: false, error: "Sessão inválida." }

    const updatedPro = await prisma.professional.update({
      where: { id: parsed.proId },
      data: { avatarUrl: imageUrl || null },
    })

    // 1. Sincroniza com a sessão do usuário Gestor logado se houver
    const session = await auth()
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl || null },
      }).catch(() => {})
    }

    // 2. Se o profissional for o dono/membro vinculado pelo businessId, sincroniza no User também
    if (updatedPro.businessId) {
      const cleanPhone = updatedPro.phone ? updatedPro.phone.replace(/\D/g, "") : ""
      const orConditions: any[] = []
      if (updatedPro.email) {
        orConditions.push({ email: updatedPro.email.toLowerCase().trim() })
      }
      if (cleanPhone) {
        orConditions.push({ phone: cleanPhone })
        orConditions.push({ phone: cleanPhone.replace(/^55/, "") })
        orConditions.push({ phone: `55${cleanPhone}` })
      }

      if (orConditions.length > 0) {
        await prisma.user.updateMany({
          where: {
            businessId: updatedPro.businessId,
            OR: orConditions,
          },
          data: {
            image: imageUrl || null,
          },
        }).catch(() => {})
      }
    }

    revalidatePath("/pro")
    revalidatePath("/app")
    revalidatePath("/app/configuracoes")
    revalidatePath("/app/equipe")
    revalidatePath("/app/website")

    return {
      success: true,
      professional: updatedPro,
      message: "Foto atualizada com sucesso no seu perfil!",
    }
  } catch (error: any) {
    console.error("Erro ao atualizar avatar do profissional:", error)
    return { success: false, error: "Falha ao salvar foto do perfil." }
  }
}
