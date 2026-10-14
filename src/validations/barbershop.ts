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

export function sanitizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9-]/g, "-") // substitui caracteres especiais por hífen
    .replace(/-+/g, "-") // remove hifens duplicados
    .replace(/^-+|-+$/g, ""); // remove hifens no início e fim
}

export const subdomainSchema = z
  .string()
  .min(3, "O subdomínio deve ter no mínimo 3 caracteres")
  .max(30, "O subdomínio deve ter no máximo 30 caracteres")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use apenas letras minúsculas, números e hífens (sem hífens no início ou fim)"
  )
  .refine(
    (sub) => !RESERVED_SUBDOMAINS.includes(sub as (typeof RESERVED_SUBDOMAINS)[number]),
    {
      message: "Este subdomínio é reservado pelo sistema e não pode ser utilizado",
    }
  );

export const barbershopSchema = z.object({
  name: z
    .string()
    .min(2, "O nome da barbearia deve ter pelo menos 2 caracteres")
    .max(80, "O nome da barbearia não pode exceder 80 caracteres"),
  subdomain: subdomainSchema,
  customDomain: z
    .string()
    .regex(
      /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i,
      "Informe um domínio próprio válido (ex: barbeariadoluciano.com.br)"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  description: z.string().max(500, "Descrição muito longa").optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido com DDD").optional().nullable(),
  logoUrl: z.string().url("URL de logotipo inválida").optional().nullable().or(z.literal("")),
  bannerUrl: z.string().url("URL de banner inválida").optional().nullable().or(z.literal("")),

  // Endereço
  address: z.string().max(120, "Endereço muito longo").optional().nullable(),
  number: z.string().max(20, "Número muito longo").optional().nullable(),
  complement: z.string().max(60, "Complemento muito longo").optional().nullable(),
  neighborhood: z.string().max(60, "Bairro muito longo").optional().nullable(),
  city: z.string().max(60, "Cidade muito longa").optional().nullable(),
  state: z.string().length(2, "UF deve ter 2 letras (ex: SP)").optional().nullable().or(z.literal("")),
  postalCode: z.string().max(10, "CEP inválido").optional().nullable(),
});

export type BarbershopFormData = z.infer<typeof barbershopSchema>;
