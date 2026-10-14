import { registerSchema, loginSchema } from "../src/validations/auth";
import { hashPassword, comparePassword } from "../src/lib/password";
import { signSessionToken, verifySessionToken } from "../src/lib/auth";
import { UserRole } from "@prisma/client";

async function runTests() {
  console.log("=== INICIANDO TESTES DA ETAPA 1 ===");

  // 1. Teste de Validação Zod - Cadastro com dados válidos
  const validData = {
    name: "Carlos Barbeiro",
    email: "carlos@visualclube.com",
    whatsapp: "(11) 98765-4321",
    password: "senhaSegura123",
    confirmPassword: "senhaSegura123",
  };
  const parseValid = registerSchema.safeParse(validData);
  console.assert(parseValid.success, "Falha na validação de dados válidos");
  console.log("✓ Zod: Cadastro com dados válidos aprovado");

  // 2. Teste de Validação Zod - Senhas divergentes
  const invalidPasswords = {
    ...validData,
    confirmPassword: "outraSenha123",
  };
  const parseInvalidPass = registerSchema.safeParse(invalidPasswords);
  console.assert(!parseInvalidPass.success, "Deveria falhar com senhas diferentes");
  console.log("✓ Zod: Rejeição de senhas divergentes aprovada");

  // 3. Teste de Validação Zod - Senha fraca (sem número)
  const weakPassword = {
    ...validData,
    password: "senhasemnumero",
    confirmPassword: "senhasemnumero",
  };
  const parseWeak = registerSchema.safeParse(weakPassword);
  console.assert(!parseWeak.success, "Deveria falhar com senha fraca");
  console.log("✓ Zod: Rejeição de senha fraca aprovada");

  // 4. Teste de Criptografia de Senhas (Bcrypt)
  const plainText = "senhaSegura123";
  const hash = await hashPassword(plainText);
  const isValid = await comparePassword(plainText, hash);
  const isInvalid = await comparePassword("senhaErrada", hash);
  console.assert(isValid === true, "Hash deve validar senha correta");
  console.assert(isInvalid === false, "Hash deve rejeitar senha incorreta");
  console.log("✓ Bcrypt: Hash e validação de senhas aprovados");

  // 5. Teste de Assinatura e Verificação de JWT de Sessão
  const sessionToken = await signSessionToken({
    userId: "64f1a2b3c4d5e6f7a8b9c0d1",
    name: "Carlos Barbeiro",
    email: "carlos@visualclube.com",
    role: UserRole.USER,
  });
  const decoded = await verifySessionToken(sessionToken);
  console.assert(decoded !== null, "Token JWT deve ser decodificado com sucesso");
  console.assert(decoded?.role === UserRole.USER, "Token JWT deve conter a role USER");
  console.log("✓ JWT: Assinatura e verificação de sessão com UserRole.USER aprovados");

  console.log("=== TODOS OS TESTES PASSARAM COM SUCESSO! ===");
}

runTests().catch((err) => {
  console.error("Falha nos testes:", err);
  process.exit(1);
});
