"use server"

import { auth, signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sanitizePhone } from "@/auth"
import { AuthError } from "next-auth"
import { cookies } from "next/headers"
import { registerUserSchema } from "@/lib/schemas/register-user.schema"

// ----------------------------------------------------
// Utilitários internos
// ----------------------------------------------------

/**
 * Gera o referralCode: primeira letra do nome (maiúscula) + 5 dígitos aleatórios.
 * Ex: "Luciano" → "L84291"
 * Garante unicidade tentando novamente até 10 vezes.
 */
async function generateReferralCode(name: string): Promise<string> {
  const firstLetter = name.trim().charAt(0).toUpperCase()
  for (let i = 0; i < 10; i++) {
    const digits = Math.floor(10000 + Math.random() * 90000).toString()
    const code = `${firstLetter}${digits}`
    const exists = await prisma.user.findUnique({ where: { referralCode: code } })
    if (!exists) return code
  }
  // Fallback com timestamp
  return `${firstLetter}${Date.now().toString().slice(-5)}`
}

/**
 * Normaliza uma string para ser usada como username:
 * - Lowercase
 * - Remove acentos
 * - Remove caracteres especiais (mantém letras e números)
 */
function toUsernameSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

/**
 * Gera o username com fallback progressivo:
 * 1. "luciano"
 * 2. "lucianodepaula" (primeiro + segundo nome)
 * 3. "luciano1", "luciano2", ... (primeiro nome + número)
 */
async function generateUsername(fullName: string): Promise<string> {
  const parts = fullName.trim().split(/\s+/)
  const first = toUsernameSlug(parts[0])

  // Tentativa 1: só o primeiro nome
  const existing1 = await prisma.user.findUnique({ where: { username: first } })
  if (!existing1) return first

  // Tentativa 2: primeiro + todos os outros nomes juntos
  if (parts.length > 1) {
    const full = parts.map(toUsernameSlug).join("")
    if (full !== first) {
      const existing2 = await prisma.user.findUnique({ where: { username: full } })
      if (!existing2) return full
    }
  }

  // Tentativa 3: primeiro nome + número incremental (luciano1, luciano2, ...)
  for (let i = 1; i <= 999; i++) {
    const candidate = `${first}${i}`
    const existing = await prisma.user.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
  }

  return `${first}${Date.now().toString().slice(-4)}`
}

// ----------------------------------------------------
// Login
// ----------------------------------------------------

export async function loginWithCredentials(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim() || ""
  const password = formData.get("password") as string

  if (!identifier || !password) {
    return { success: false, error: "Preencha todos os campos obrigatórios." }
  }

  try {
    const isEmail = identifier.includes("@")
    const cleanPhone = sanitizePhone(identifier)
    const rawDigits = identifier.replace(/\D/g, "")

    // 1. Verifica se é um profissional da equipe
    let pro = isEmail
      ? await prisma.professional.findFirst({
          where: {
            OR: [
              { email: identifier.toLowerCase() },
              { email: identifier },
            ],
          },
        })
      : await prisma.professional.findFirst({
          where: {
            OR: [
              { phone: cleanPhone },
              { phone: rawDigits },
              { phone: rawDigits.replace(/^55/, "") },
              { phone: identifier },
            ],
          },
        })

    if (pro && pro.deletedAt) {
      pro = null
    }

    const isProfessional = !!pro
    const targetRedirect = isProfessional ? "/pro" : "/app"

    // Se for profissional, grava a sessão em cookie do /pro
    if (pro && pro.passwordHash) {
      const isPassValid = await bcrypt.compare(password, pro.passwordHash)
      if (isPassValid) {
        const { setProSessionDirectly } = await import("./pro-auth-actions")
        await setProSessionDirectly(pro.id, pro.businessId, pro.name)
      }
    }

    await signIn("credentials", {
      identifier,
      password,
      redirectTo: targetRedirect,
    })
    return { success: true, redirectUrl: targetRedirect, isProfessional }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Identificador (Email/WhatsApp) ou senha incorretos." }
        default:
          return { success: false, error: "Ocorreu um erro ao fazer login. Tente novamente." }
      }
    }
    // Next.js redirect errors need to be rethrown
    throw error
  }
}

// ----------------------------------------------------
// Validações em tempo real (para o frontend)
// ----------------------------------------------------

/** Verifica se um e-mail já está cadastrado. */
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!email || !email.includes("@")) return false
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  })
  return !!user
}

/** Verifica se um número de WhatsApp já está cadastrado. */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  if (!phone) return false
  const sanitized = sanitizePhone(phone)
  if (sanitized.length < 12) return false // Mínimo DDI+DDD+número
  const user = await prisma.user.findFirst({
    where: { phone: sanitized },
    select: { id: true },
  })
  return !!user
}

// ----------------------------------------------------
// Cadastro de Usuário (role: USER)
// ----------------------------------------------------

export async function registerUser(data: {
  fullName: string
  email: string
  whatsapp: string
  password: string
  confirmPassword: string
}) {
  // 1. Validação Zod no servidor
  const parsed = registerUserSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const firstError = Object.values(fieldErrors).flat()[0]
    return { success: false, error: firstError ?? "Dados inválidos." }
  }

  const { fullName, email, password } = parsed.data
  // `whatsapp` já foi transformado pelo Zod (só dígitos)
  const whatsappRaw = (data.whatsapp ?? "").replace(/\D/g, "")
  const phone = sanitizePhone(whatsappRaw)

  // 2. Verificar duplicidade de e-mail
  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (existingEmail) {
    return { success: false, error: "Este e-mail já está cadastrado.", field: "email" }
  }

  // 3. Verificar duplicidade de WhatsApp
  const existingPhone = await prisma.user.findFirst({
    where: { phone },
    select: { id: true },
  })
  if (existingPhone) {
    return { success: false, error: "Este WhatsApp já está cadastrado.", field: "whatsapp" }
  }

  // 4. Ler cookie de indicação
  const cookieStore = await cookies()
  const refCookie = cookieStore.get("visualclube_ref")?.value

  type ReferrerUser = { id: string; treeLevel: number; uplineIds: string[]; path: string }
  let referrerUser: ReferrerUser | null = null
  if (refCookie) {
    const found = await prisma.user.findFirst({
      where: { referralCode: refCookie.toUpperCase() },
      select: { id: true, treeLevel: true, uplineIds: true, path: true },
    })
    if (found) {
      referrerUser = {
        id: found.id,
        treeLevel: found.treeLevel,
        uplineIds: found.uplineIds as string[],
        path: found.path,
      }
    }
  }

  // 5. Calcular árvore de indicação
  const sponsorId = referrerUser?.id ?? null
  const treeLevel = referrerUser ? (referrerUser.treeLevel + 1) : 1
  const uplineIds: string[] = referrerUser
    ? [...referrerUser.uplineIds, referrerUser.id]
    : []
  const path = referrerUser
    ? `${referrerUser.path}/${referrerUser.id}`
    : ""

  // 6. Gerar username e referralCode únicos
  const [username, referralCode, passwordHash] = await Promise.all([
    generateUsername(fullName),
    generateReferralCode(fullName),
    Promise.resolve(bcrypt.hashSync(password, 10)),
  ])

  // 7. Criar o usuário
  try {
    await prisma.user.create({
      data: {
        name: fullName,
        email,
        phone,
        passwordHash,
        role: "USER",
        username,
        referralCode,
        sponsorId,
        treeLevel,
        uplineIds,
        path,
        image: null, // Upload de foto será implementado futuramente
      },
    })
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    return { success: false, error: "Falha ao criar conta. Tente novamente." }
  }

  // 8. Fazer login automático após o cadastro
  try {
    await signIn("credentials", {
      identifier: email,
      password,
      redirect: false,
    })
  } catch (error: any) {
    // Se o signIn redirecionar (NEXT_REDIRECT), é esperado
    if (!error?.message?.includes("NEXT_REDIRECT")) {
      console.error("Erro no login automático após cadastro:", error)
    }
  }

  return {
    success: true,
    username,
    referralCode,
    message: "Conta criada com sucesso! Bem-vindo ao VisualClube.",
  }
}

// ----------------------------------------------------
// Cadastro de Estabelecimento (role: OWNER)
// ----------------------------------------------------

export async function registerEstablishment(data: {
  businessName: string
  businessType: "BARBERSHOP" | "HAIR_SALON" | "NAIL_SALON" | "ESTHETICS_CLINIC" | "SPA" | "OTHER"
  ownerName: string
  identifierType: "email" | "whatsapp"
  identifierValue: string
  password: string
}) {
  try {
    const isEmail = data.identifierType === "email" || data.identifierValue.includes("@")
    const email = isEmail ? data.identifierValue.trim().toLowerCase() : null
    const phone = !isEmail ? sanitizePhone(data.identifierValue) : null

    // 1. Ler o cookie de indicação de forma silenciosa
    const cookieStore = await cookies()
    const refCookie = cookieStore.get("visualclube_ref")?.value

    let referrerUser = null
    if (refCookie) {
      referrerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { referralCode: refCookie.toUpperCase() },
            { referralCode: refCookie.toLowerCase() },
          ],
        },
      })
    }

    // 2. Verificar se já existe conta com o email ou whatsapp
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return { success: false, error: "Já existe uma conta com este e-mail." }
      }
    }

    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } })
      if (existing) {
        return { success: false, error: "Já existe uma conta com este número de WhatsApp." }
      }
    }

    const hashedPassword = bcrypt.hashSync(data.password, 10)
    const baseSlug = data.businessName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const uniqueSlug = `${baseSlug}-${randomSuffix.toLowerCase()}`

    // Gera código de indicação único para o novo dono
    const newReferralCode = `${baseSlug.substring(0, 8).toUpperCase()}-${randomSuffix}`

    // 3. Calcular árvore de indicação (Materialized Path e Uplines)
    const sponsorId = referrerUser ? referrerUser.id : null
    const sponsorTreeLevel = referrerUser ? ((referrerUser as any).treeLevel || 1) : 0
    const sponsorUplineIds = referrerUser ? ((referrerUser as any).uplineIds || []) : []
    const sponsorPath = referrerUser ? ((referrerUser as any).path || "") : ""

    const treeLevel = referrerUser ? sponsorTreeLevel + 1 : 1
    const uplineIds = referrerUser ? [...sponsorUplineIds, referrerUser.id] : []
    const path = referrerUser ? `${sponsorPath}/${referrerUser.id}` : ""

    // Criar estabelecimento e usuário proprietário com vínculo de indicação
    const business = await prisma.business.create({
      data: {
        name: data.businessName,
        slug: uniqueSlug,
        type: data.businessType,
        phone: phone || undefined,
        email: email || undefined,
        users: {
          create: {
            name: data.ownerName,
            email: email,
            phone: phone,
            passwordHash: hashedPassword,
            role: "OWNER",
            referralCode: newReferralCode,
            sponsorId: sponsorId,
            treeLevel: treeLevel,
            uplineIds: uplineIds,
            path: path,
          },
        },
        services: {
          create: [
            {
              name: data.businessType === "BARBERSHOP" ? "Corte Degradê / Social" : "Corte & Escova",
              price: 50.0,
              durationMinutes: 40,
              category: "Cabelo",
            },
            {
              name: data.businessType === "BARBERSHOP" ? "Barba Terapia" : "Manicure Completa",
              price: 35.0,
              durationMinutes: 30,
              category: data.businessType === "BARBERSHOP" ? "Barba" : "Unhas",
            },
          ],
        },
      },
      include: {
        users: true,
      },
    })

    return {
      success: true,
      businessId: business.id,
      slug: business.slug,
      referralCode: newReferralCode,
      message: "Estabelecimento e conta criados com sucesso!",
    }
  } catch (error: any) {
    console.error("Erro ao registrar estabelecimento:", error)
    return { success: false, error: "Falha ao criar conta. Verifique sua conexão com o MongoDB." }
  }
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}

/**
 * Retorna os dados do usuário autenticado no momento (com dados do estabelecimento)
 */
export async function getCurrentUserAction() {
  try {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        businessId: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            type: true,
          },
        },
      },
    })

    return user
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error)
    return null
  }
}



