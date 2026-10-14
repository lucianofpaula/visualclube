import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "O nome deve ter pelo menos 3 caracteres")
      .max(80, "O nome deve ter no máximo 80 caracteres"),
    email: z
      .string()
      .trim()
      .email("Informe um endereço de e-mail válido")
      .toLowerCase(),
    whatsapp: z
      .string()
      .trim()
      .min(10, "Informe um WhatsApp válido com DDD (mínimo 10 dígitos)")
      .max(16, "WhatsApp inválido")
      .regex(
        /^[0-9()+\-\s]+$/,
        "WhatsApp deve conter apenas números e caracteres de formatação válidos"
      ),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido")
    .toLowerCase(),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;
