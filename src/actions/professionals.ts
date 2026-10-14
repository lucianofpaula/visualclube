"use server";

import { prisma } from "@/lib/prisma";
import { PrismaClient, ProfessionalStatus, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/actions/auth";
import { hashPassword } from "@/lib/password";
import {
  createProfessionalSchema,
  completeProfessionalRegistrationSchema,
  type CreateProfessionalInput,
  type CompleteProfessionalRegistrationInput,
} from "@/validations/professional";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function getDb(): PrismaClient {
  if (prisma && "professional" in prisma && prisma.professional) {
    return prisma;
  }
  return new PrismaClient();
}

export interface ProfessionalActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// 1. Cadastrar Profissional pelo Dono / Administrador
export async function createProfessionalAction(
  data: CreateProfessionalInput
): Promise<ProfessionalActionResult<{ id: string; inviteUrl: string; inviteToken: string }>> {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      message: "Você precisa estar autenticado para realizar esta ação.",
    };
  }

  const validation = createProfessionalSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: "Dados inválidos. Verifique os campos.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { name, email, whatsapp, specialties, status } = validation.data;

  try {
    // Verificar se o e-mail já está cadastrado como profissional
    const existingProfessional = await getDb().professional.findUnique({
      where: { email },
    });

    if (existingProfessional) {
      return {
        success: false,
        message: "Já existe um profissional cadastrado com este e-mail.",
      };
    }

    // Gerar token único e seguro de convite
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // Válido por 7 dias

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/convite/profissional/${inviteToken}`;

    const newProfessional = await getDb().professional.create({
      data: {
        name,
        email,
        whatsapp,
        specialties,
        status,
        inviteToken,
        inviteExpiresAt,
        createdById: session.userId,
      },
    });

    revalidatePath("/painel/profissionais");

    return {
      success: true,
      message: "Profissional cadastrado com sucesso!",
      data: {
        id: newProfessional.id,
        inviteUrl,
        inviteToken,
      },
    };
  } catch (error) {
    console.error("Erro ao cadastrar profissional:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao salvar o profissional. Tente novamente.",
    };
  }
}

// 2. Listar Profissionais
export async function getProfessionalsAction() {
  const session = await getCurrentUser();

  if (!session) {
    return [];
  }

  try {
    return await getDb().professional.findMany({
      where: {
        createdById: session.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return [];
  }
}

// 3. Alterar Status do Profissional
export async function updateProfessionalStatusAction(
  id: string,
  newStatus: ProfessionalStatus
): Promise<ProfessionalActionResult> {
  const session = await getCurrentUser();

  if (!session) {
    return { success: false, message: "Não autorizado." };
  }

  try {
    await getDb().professional.update({
      where: { id, createdById: session.userId },
      data: { status: newStatus },
    });

    revalidatePath("/painel/profissionais");
    return { success: true, message: "Status atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, message: "Erro ao atualizar status." };
  }
}

// 4. Renovar Link de Convite
export async function regenerateInviteAction(
  id: string
): Promise<ProfessionalActionResult<{ inviteUrl: string }>> {
  const session = await getCurrentUser();

  if (!session) {
    return { success: false, message: "Não autorizado." };
  }

  try {
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/convite/profissional/${inviteToken}`;

    await getDb().professional.update({
      where: { id, createdById: session.userId },
      data: {
        inviteToken,
        inviteExpiresAt,
        status: ProfessionalStatus.PENDING_REGISTRATION,
      },
    });

    revalidatePath("/painel/profissionais");

    return {
      success: true,
      message: "Novo link gerado com sucesso!",
      data: { inviteUrl },
    };
  } catch (error) {
    console.error("Erro ao regenerar convite:", error);
    return { success: false, message: "Erro ao gerar novo convite." };
  }
}

// 5. Excluir Profissional
export async function deleteProfessionalAction(
  id: string
): Promise<ProfessionalActionResult> {
  const session = await getCurrentUser();

  if (!session) {
    return { success: false, message: "Não autorizado." };
  }

  try {
    await getDb().professional.delete({
      where: { id, createdById: session.userId },
    });

    revalidatePath("/painel/profissionais");
    return { success: true, message: "Profissional excluído com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir profissional:", error);
    return { success: false, message: "Erro ao excluir profissional." };
  }
}

// 6. Buscar Profissional pelo Token de Convite (Público)
export async function getProfessionalByInviteToken(token: string) {
  try {
    const professional = await getDb().professional.findUnique({
      where: { inviteToken: token },
    });

    if (!professional) {
      return { valid: false, message: "Convite inválido ou expirado." };
    }

    if (
      professional.inviteExpiresAt &&
      new Date() > professional.inviteExpiresAt
    ) {
      return { valid: false, message: "Este link de convite expirou." };
    }

    if (professional.status === ProfessionalStatus.ACTIVE && !professional.inviteToken) {
      return {
        valid: false,
        message: "O cadastro para este convite já foi concluído anteriormente.",
      };
    }

    return {
      valid: true,
      data: {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        whatsapp: professional.whatsapp,
        specialties: professional.specialties,
        bio: professional.bio || "",
        avatarUrl: professional.avatarUrl || "",
      },
    };
  } catch (error) {
    console.error("Erro ao validar convite:", error);
    return { valid: false, message: "Erro ao validar o convite." };
  }
}

// 7. Concluir Cadastro do Profissional (Público, via link do WhatsApp)
export async function completeProfessionalRegistrationAction(
  token: string,
  data: CompleteProfessionalRegistrationInput
): Promise<ProfessionalActionResult> {
  const validation = completeProfessionalRegistrationSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: "Verifique os dados informados.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const professional = await getDb().professional.findUnique({
      where: { inviteToken: token },
    });

    if (!professional) {
      return { success: false, message: "Convite inválido ou já utilizado." };
    }

    if (
      professional.inviteExpiresAt &&
      new Date() > professional.inviteExpiresAt
    ) {
      return { success: false, message: "Este link de convite expirou." };
    }

    const { name, avatarUrl, bio, password } = validation.data;
    const hashedPassword = await hashPassword(password);

    // 1. Criar ou atualizar conta de usuário User com role BARBER
    let userId = professional.userId;

    if (!userId) {
      const existingUser = await getDb().user.findUnique({
        where: { email: professional.email },
      });

      if (existingUser) {
        userId = existingUser.id;
        await getDb().user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            role: UserRole.BARBER,
          },
        });
      } else {
        const newUser = await getDb().user.create({
          data: {
            name,
            email: professional.email,
            whatsapp: professional.whatsapp,
            password: hashedPassword,
            role: UserRole.BARBER,
          },
        });
        userId = newUser.id;
      }
    }

    // 2. Atualizar o cadastro do profissional para ACTIVE e limpar o token
    await getDb().professional.update({
      where: { id: professional.id },
      data: {
        name,
        avatarUrl: avatarUrl || null,
        bio: bio || null,
        status: ProfessionalStatus.ACTIVE,
        inviteToken: null, // Invalidar o token após uso
        userId,
      },
    });

    return {
      success: true,
      message: "Seu cadastro foi concluído com sucesso! Agora você faz parte da equipe.",
    };
  } catch (error) {
    console.error("Erro ao concluir cadastro do profissional:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao finalizar seu cadastro. Tente novamente.",
    };
  }
}
