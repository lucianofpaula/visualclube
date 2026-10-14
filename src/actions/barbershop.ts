"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  barbershopSchema,
  BarbershopFormData,
  sanitizeSubdomain,
} from "@/validations/barbershop";
import { revalidatePath } from "next/cache";

export type BarbershopActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  barbershop?: {
    id: string;
    name: string;
    subdomain: string;
    customDomain?: string | null;
  };
};

/**
 * Busca a barbearia do usuário logado (geralmente uma barbearia principal por administrador)
 */
export async function getCurrentUserBarbershopAction() {
  const session = await getSession();

  if (!session || !session.userId) {
    return null;
  }

  try {
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        userId: session.userId,
      },
      include: {
        professionals: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
            avatarUrl: true,
            specialties: true,
            status: true,
          },
        },
      },
    });

    return barbershop;
  } catch (error) {
    console.error("Erro ao buscar barbearia do usuário:", error);
    return null;
  }
}

/**
 * Busca dados públicos de uma barbearia pelo subdomínio (usado na rota pública do site da barbearia)
 */
export async function getBarbershopBySubdomainAction(subdomain: string) {
  try {
    const cleanSub = sanitizeSubdomain(subdomain);
    const barbershop = await prisma.barbershop.findUnique({
      where: {
        subdomain: cleanSub,
      },
      include: {
        professionals: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            specialties: true,
          },
        },
      },
    });

    return barbershop;
  } catch (error) {
    console.error("Erro ao buscar barbearia por subdomínio:", error);
    return null;
  }
}

/**
 * Cria ou atualiza os dados da barbearia do usuário logado
 */
export async function saveBarbershopAction(
  prevState: BarbershopActionState | null,
  data: BarbershopFormData
): Promise<BarbershopActionState> {
  const session = await getSession();

  if (!session || !session.userId) {
    return {
      success: false,
      message: "Você precisa estar autenticado para configurar sua barbearia.",
    };
  }

  const validation = barbershopSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: "Verifique os campos preenchidos.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const {
    name,
    subdomain,
    customDomain,
    description,
    phone,
    whatsapp,
    logoUrl,
    bannerUrl,
    address,
    number,
    complement,
    neighborhood,
    city,
    state,
    postalCode,
  } = validation.data;

  const cleanSub = sanitizeSubdomain(subdomain);

  try {
    // 1. Verificar se o subdomínio já está em uso por outra barbearia
    const existingWithSubdomain = await prisma.barbershop.findUnique({
      where: { subdomain: cleanSub },
    });

    // 2. Verificar se o usuário já possui barbearia cadastrada
    const userBarbershop = await prisma.barbershop.findFirst({
      where: { userId: session.userId },
    });

    if (
      existingWithSubdomain &&
      (!userBarbershop || existingWithSubdomain.id !== userBarbershop.id)
    ) {
      return {
        success: false,
        message: "Este subdomínio já está em uso por outra barbearia. Escolha outro.",
        errors: {
          subdomain: ["Subdomínio já em uso"],
        },
      };
    }

    // 3. Se informou domínio próprio, verificar duplicidade
    if (customDomain) {
      const existingWithCustom = await prisma.barbershop.findUnique({
        where: { customDomain },
      });

      if (
        existingWithCustom &&
        (!userBarbershop || existingWithCustom.id !== userBarbershop.id)
      ) {
        return {
          success: false,
          message: "Este domínio próprio já está cadastrado em outra barbearia.",
          errors: {
            customDomain: ["Domínio próprio já cadastrado"],
          },
        };
      }
    }

    let saved;

    if (userBarbershop) {
      // Atualizar barbearia existente
      saved = await prisma.barbershop.update({
        where: { id: userBarbershop.id },
        data: {
          name,
          subdomain: cleanSub,
          customDomain: customDomain || null,
          description: description || null,
          phone: phone || null,
          whatsapp: whatsapp || null,
          logoUrl: logoUrl || null,
          bannerUrl: bannerUrl || null,
          address: address || null,
          number: number || null,
          complement: complement || null,
          neighborhood: neighborhood || null,
          city: city || null,
          state: state || null,
          postalCode: postalCode || null,
        },
      });
    } else {
      // Criar nova barbearia
      saved = await prisma.barbershop.create({
        data: {
          name,
          subdomain: cleanSub,
          customDomain: customDomain || null,
          description: description || null,
          phone: phone || null,
          whatsapp: whatsapp || null,
          logoUrl: logoUrl || null,
          bannerUrl: bannerUrl || null,
          address: address || null,
          number: number || null,
          complement: complement || null,
          neighborhood: neighborhood || null,
          city: city || null,
          state: state || null,
          postalCode: postalCode || null,
          userId: session.userId,
        },
      });
    }

    revalidatePath("/painel");
    revalidatePath(`/b/${cleanSub}`);

    return {
      success: true,
      message: "Dados da barbearia salvos com sucesso!",
      barbershop: {
        id: saved.id,
        name: saved.name,
        subdomain: saved.subdomain,
        customDomain: saved.customDomain,
      },
    };
  } catch (error) {
    console.error("Erro ao salvar dados da barbearia:", error);
    return {
      success: false,
      message: "Ocorreu um erro interno ao salvar as informações da barbearia.",
    };
  }
}
