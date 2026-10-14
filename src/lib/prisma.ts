import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Em desenvolvimento, se o singleton na memória não tiver os novos models (ex: professional), forçar recriação
  if (
    globalThis.prismaGlobal &&
    "professional" in globalThis.prismaGlobal
  ) {
    return globalThis.prismaGlobal;
  }

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = client;
  }

  return client;
}

export const prisma: PrismaClient = createPrismaClient();
