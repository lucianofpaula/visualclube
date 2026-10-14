import { z } from "zod";

export const DEFAULT_SPECIALTIES = [
  "Corte Degradê / Fade",
  "Barba & Barboterapia",
  "Corte Clássico na Tesoura",
  "Pigmentação de Barba/Cabelo",
  "Design de Sobrancelha",
  "Platinado / Nevou",
  "Selagem / Alisamento",
  "Penteados & Freestyle",
  "Atendimento Infantil",
] as const;

export const ProfessionalStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING_REGISTRATION: "PENDING_REGISTRATION",
} as const;

export type ProfessionalStatus =
  (typeof ProfessionalStatus)[keyof typeof ProfessionalStatus];

export const createProfessionalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(80, "O nome deve ter no máximo 80 caracteres"),
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido")
    .toLowerCase(),
  whatsapp: z
    .string()
    .trim()
    .min(10, "Informe um WhatsApp válido com DDD (mínimo 10 dígitos)")
    .max(16, "WhatsApp inválido"),
  specialties: z
    .array(z.string())
    .min(1, "Selecione ou adicione pelo menos uma especialidade"),
  status: z.enum([
    ProfessionalStatus.ACTIVE,
    ProfessionalStatus.INACTIVE,
    ProfessionalStatus.PENDING_REGISTRATION,
  ]),
});

export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;

export const completeProfessionalRegistrationSchema = z
  .object({
    name: z.string().trim().min(3, "Nome obrigatório"),
    avatarUrl: z.string().trim().url("Informe uma URL de imagem válida").or(z.literal("")),
    bio: z
      .string()
      .trim()
      .max(400, "A biografia deve ter no máximo 400 caracteres")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Za-z]/, "A senha deve conter letras")
      .regex(/[0-9]/, "A senha deve conter números"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CompleteProfessionalRegistrationInput = z.infer<
  typeof completeProfessionalRegistrationSchema
>;
