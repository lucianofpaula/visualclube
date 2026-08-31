import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  identifier: z.string().min(3, "Informe um email ou número de WhatsApp válido"),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
})

// Utilitário para limpar telefone/whatsapp (remover caracteres não numéricos)
export function sanitizePhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "")
  if (digitsOnly.length === 10 || digitsOnly.length === 11) {
    return `55${digitsOnly}`
  }
  return digitsOnly
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Email ou WhatsApp",
      credentials: {
        identifier: { label: "Email ou WhatsApp", type: "text" },
        password: { label: "Senha ou Código", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { identifier, password } = parsedCredentials.data
        const isEmail = identifier.includes("@")
        const cleanEmail = identifier.trim().toLowerCase()

        let user = null

        if (isEmail) {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: cleanEmail },
                { email: identifier.trim() },
              ],
            },
          })
        } else {
          const formattedPhone = sanitizePhone(identifier)
          const rawDigits = identifier.replace(/\D/g, "")
          // Busca pelo telefone limpo ou por correspondência
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: formattedPhone },
                { phone: rawDigits },
                { phone: rawDigits.replace(/^55/, "") },
                { phone: identifier.trim() },
              ],
            },
          })
        }

        if (!user) {
          const rawDigits = identifier.replace(/\D/g, "")
          const cleanPhone = sanitizePhone(identifier)

          // Busca também na equipe de profissionais
          let pro = isEmail
            ? await prisma.professional.findFirst({
                where: {
                  OR: [
                    { email: cleanEmail },
                    { email: identifier.trim() },
                  ],
                },
              })
            : await prisma.professional.findFirst({
                where: {
                  OR: [
                    { phone: cleanPhone },
                    { phone: rawDigits },
                    { phone: rawDigits.replace(/^55/, "") },
                    { phone: identifier.trim() },
                  ],
                },
              })

          if (pro && pro.deletedAt) {
            pro = null
          }

          if (pro && pro.passwordHash && pro.isActive) {
            const passwordMatch = bcrypt.compareSync(password, pro.passwordHash)
            if (passwordMatch) {
              return {
                id: pro.id,
                name: pro.name,
                email: pro.email || `${pro.phone}@pro.visualclube`,
                image: pro.avatarUrl,
                role: "PROFESSIONAL" as any,
                phone: pro.phone,
                businessId: pro.businessId,
              }
            }
          }

          return null
        }

        // Se o usuário tem hash de senha salvo
        if (user.passwordHash) {
          const passwordMatch = bcrypt.compareSync(password, user.passwordHash)
          if (!passwordMatch) {
            return null
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
          businessId: user.businessId,
        }
      },
    }),
  ],
})
