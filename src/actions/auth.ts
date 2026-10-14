"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/password";
import {
  createSessionCookie,
  destroySessionCookie,
  getSession,
  type SessionPayload,
} from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from "@/validations/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function registerUserAction(
  data: RegisterInput
): Promise<ActionResult<{ userId: string }>> {
  // 1. Validação estrita no servidor com Zod
  const validationResult = registerSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Por favor, corrija os erros no formulário.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { name, email, whatsapp, password } = validationResult.data;

  try {
    // 2. Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Este endereço de e-mail já está cadastrado.",
      };
    }

    // 3. Hash seguro da senha
    const hashedPassword = await hashPassword(password);

    // 4. Criação do usuário no banco com enum USER
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        whatsapp,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    // 5. Criação do cookie de sessão assinado
    await createSessionCookie({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      success: true,
      message: "Cadastro realizado com sucesso!",
      data: { userId: newUser.id },
    };
  } catch (error: unknown) {
    console.error("Erro no registro do usuário:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbConnectionError =
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("Timed out") ||
      errorMessage.includes("Server selection timeout") ||
      errorMessage.includes("InitializationError");

    if (isDbConnectionError) {
      return {
        success: false,
        message:
          "Não foi possível conectar ao banco de dados MongoDB. Verifique se o MongoDB está rodando ou informe a connection string no arquivo .env.",
      };
    }

    return {
      success: false,
      message: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
    };
  }
}

export async function loginUserAction(
  data: LoginInput
): Promise<ActionResult<{ userId: string }>> {
  const validationResult = loginSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Dados de login inválidos.",
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validationResult.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "E-mail ou senha incorretos.",
      };
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "E-mail ou senha incorretos.",
      };
    }

    await createSessionCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: "Login efetuado com sucesso!",
      data: { userId: user.id },
    };
  } catch (error: unknown) {
    console.error("Erro no login:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbConnectionError =
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("Timed out") ||
      errorMessage.includes("Server selection timeout") ||
      errorMessage.includes("InitializationError");

    if (isDbConnectionError) {
      return {
        success: false,
        message:
          "Não foi possível conectar ao banco de dados MongoDB. Verifique se o MongoDB está rodando ou informe a connection string no arquivo .env.",
      };
    }

    return {
      success: false,
      message: "Ocorreu um erro ao processar o login.",
    };
  }
}

export async function logoutUserAction(): Promise<void> {
  await destroySessionCookie();
  redirect("/login");
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession();
}
