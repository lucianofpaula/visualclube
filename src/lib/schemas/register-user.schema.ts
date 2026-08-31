import { z } from "zod"

export const registerUserSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo")
      .trim(),
    email: z
      .string()
      .email("E-mail inválido")
      .toLowerCase()
      .trim(),
    whatsapp: z
      .string()
      .trim()
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v.length >= 10 && v.length <= 11, {
        message: "WhatsApp inválido. Use DDD + número (ex: 11999999999)",
      }),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(72, "Senha muito longa"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type RegisterUserInput = z.infer<typeof registerUserSchema>
