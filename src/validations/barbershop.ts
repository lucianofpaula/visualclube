import { z } from "zod";

export const RESERVED_SUBDOMAINS = [
  "www",
  "app",
  "painel",
  "admin",
  "api",
  "auth",
  "mail",
  "smtp",
  "pop",
  "blog",
  "suporte",
  "dev",
  "staging",
  "teste",
  "test",
  "visualclube",
  "static",
  "assets",
  "cdn",
] as const;

/**
 * Gera o subdomínio padrão a partir do nome da barbearia
 * Regra do usuário: sem traços por padrão (ex: 'Barbearia do Luciano' -> 'barbeariadoluciano')
 */
export function generateSubdomainFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]/g, "") // remove espaços, pontuações e traços (tudo junto!)
    .slice(0, 30);
}

/**
 * Higieniza o subdomínio caso o usuário queira digitar ou incluir traços manualmente
 */
export function sanitizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9-]/g, "") // permite traço apenas se digitado
    .replace(/-+/g, "-") // remove hifens duplicados
    .replace(/^-+|-+$/g, ""); // remove hifens no início e fim
}

export const subdomainSchema = z
  .string()
  .min(3, "O subdomínio deve ter no mínimo 3 caracteres")
  .max(30, "O subdomínio deve ter no máximo 30 caracteres")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use apenas letras minúsculas e números (hífen permitido no meio se necessário)"
  )
  .refine(
    (sub) => !RESERVED_SUBDOMAINS.includes(sub as (typeof RESERVED_SUBDOMAINS)[number]),
    {
      message: "Este subdomínio é reservado pelo sistema e não pode ser utilizado",
    }
  );

export const dayScheduleSchema = z.object({
  dayKey: z.string(),
  dayLabel: z.string(),
  isOpen: z.boolean(),
  openTime: z.string().default("09:00"),
  closeTime: z.string().default("19:00"),
});

export type DaySchedule = z.infer<typeof dayScheduleSchema>;

export const DEFAULT_WEEK_SCHEDULE: DaySchedule[] = [
  { dayKey: "monday", dayLabel: "Segunda-feira", isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayKey: "tuesday", dayLabel: "Terça-feira", isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayKey: "wednesday", dayLabel: "Quarta-feira", isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayKey: "thursday", dayLabel: "Quinta-feira", isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayKey: "friday", dayLabel: "Sexta-feira", isOpen: true, openTime: "09:00", closeTime: "20:00" },
  { dayKey: "saturday", dayLabel: "Sábado", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { dayKey: "sunday", dayLabel: "Domingo", isOpen: false, openTime: "09:00", closeTime: "14:00" },
];

export const barbershopSchema = z.object({
  // Passo 1: Dados Gerais
  name: z
    .string()
    .min(2, "O nome da barbearia deve ter pelo menos 2 caracteres")
    .max(80, "O nome da barbearia não pode exceder 80 caracteres"),
  subdomain: subdomainSchema,
  phone: z.string().optional().nullable(),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido com DDD").optional().nullable(),
  description: z.string().max(500, "Descrição muito longa").optional().nullable(),

  // Passo 2: Endereço & Localização
  postalCode: z.string().min(8, "Informe um CEP válido (8 dígitos)").optional().nullable(),
  address: z.string().min(2, "Logradouro/Rua obrigatório").optional().nullable(),
  number: z.string().min(1, "Número é obrigatório").max(20, "Número muito longo"),
  complement: z.string().max(60, "Complemento muito longo").optional().nullable(),
  neighborhood: z.string().min(2, "Bairro obrigatório").optional().nullable(),
  city: z.string().min(2, "Cidade obrigatória").optional().nullable(),
  state: z.string().length(2, "UF deve ter 2 letras (ex: SP)").optional().nullable(),

  // Passo 3: Horários de Atendimento
  openingHours: z.array(dayScheduleSchema).optional().nullable(),

  // Passo 4: Opcionais / Domínio & Identidade
  customDomain: z
    .string()
    .regex(
      /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i,
      "Informe um domínio próprio válido (ex: barbeariadoluciano.com.br)"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  logoUrl: z.string().url("URL de logotipo inválida").optional().nullable().or(z.literal("")),
  bannerUrl: z.string().url("URL de banner inválida").optional().nullable().or(z.literal("")),
});

export type BarbershopFormData = z.infer<typeof barbershopSchema>;
