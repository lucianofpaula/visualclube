# 01 — Cadastro de Usuário (role: USER)

**Data:** 2026-08-26  
**Status:** ✅ Implementado

---

## Visão Geral

Implementação do fluxo completo de cadastro de usuário final (`role: USER`) com:
- Formulário com `react-hook-form` + Zod no frontend
- Validação em tempo real de e-mail e WhatsApp duplicados
- Geração automática de `referralCode` e `username`
- Login automático após cadastro + redirecionamento para `app.localhost`
- Proteção de rota do subdomínio `app.*` (login obrigatório)

---

## Arquivos Criados / Modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/lib/schemas/register-user.schema.ts` | NOVO | Zod schema de validação do formulário |
| `src/actions/auth-actions.ts` | MODIFICADO | Adicionou `registerUser`, `checkEmailExists`, `checkPhoneExists` |
| `src/components/auth/auth-modal.tsx` | MODIFICADO | Refatorado com react-hook-form + validação inline |
| `src/auth.config.ts` | MODIFICADO | Proteção do subdomínio `app.*` |
| `prisma/schema.prisma` | MODIFICADO | Adicionou campo `username` ao model `User` |

---

## Regras de Negócio

### referralCode
- Formato: `Primeira letra do nome (maiúscula) + 5 dígitos aleatórios`
- Exemplos: `L84291`, `M33910`, `A12345`
- Unicidade garantida com até 10 tentativas; fallback com timestamp

### username
Gerado com fallback progressivo:
1. Só o primeiro nome: `luciano`
2. Nome completo sem espaços: `lucianodepaula`
3. Primeiro nome + número: `luciano1`, `luciano2`, ...
- Normalização: lowercase, sem acentos, sem caracteres especiais

### Validação de duplicidade
- `checkEmailExists(email)` — Server Action, chamada no `onBlur` do campo e-mail
- `checkPhoneExists(phone)` — Server Action, chamada no `onBlur` do campo WhatsApp
- Retorna erro específico por campo (não global)
- Também validado novamente no servidor dentro de `registerUser()`

### Foto de perfil
- Upload de foto disponível no formulário (preview local)
- O campo `image` é salvo como `null` por enquanto (storage S3/R2 não configurado)
- Cloudinary está configurado no `.env` — integração futura

### Login automático pós-cadastro
- Após criar o usuário, chama `signIn("credentials", { identifier: email, password, redirect: false })`
- Frontend redireciona para `http://app.localhost:3000` (dev) ou `https://app.visualclube.com.br` (prod)

---

## Proteção de Rota — app.* Subdomain

### Como funciona
O callback `authorized` em `src/auth.config.ts` detecta se a requisição vem de `app.*`:

```
hostname.startsWith("app.")        → app.visualclube.com.br, app.localhost
hostname.includes("app.localhost") → app.localhost:3000
```

Se o usuário **não está autenticado** e está acessando o subdomínio do app:
- Retorna `Response.redirect(new URL("/app/login", nextUrl))`
- O `proxy.ts` reescreve `/app/login` → rota interna correta

Rotas sempre acessíveis (sem login):
- `/app/login`
- `/login`

---

## Schema Prisma — campo `username`

```prisma
model User {
  username     String?   @unique // Ex: luciano, lucianodepaula, luciano1
  ...
}
```

Comando executado: `npx prisma db push`

---

## Dependências Instaladas

```bash
npm install react-hook-form @hookform/resolvers
```

---

## Fluxo Completo

```
Usuario na landing page
  → Clica "Cadastre-se"
  → Modal abre no modo "register"
  → Preenche: foto (opt), nome, e-mail, WhatsApp, senha, confirmação
  → onBlur e-mail → checkEmailExists() → erro inline se duplicado
  → onBlur WhatsApp → checkPhoneExists() → erro inline se duplicado
  → Submit → zodResolver valida no cliente
  → registerUser() server action:
      1. Zod valida no servidor
      2. Checa email duplicado → retorna { field: "email" }
      3. Checa phone duplicado → retorna { field: "whatsapp" }
      4. Lê cookie visualclube_ref (referral)
      5. Calcula árvore multinível (sponsorId, uplineIds, path)
      6. Gera username + referralCode únicos
      7. Cria User no MongoDB
      8. signIn automático
  → Frontend redireciona para app.localhost
  → proxy.ts detecta subdomínio app.* e reescreve para /app
  → auth.config.ts verifica autenticação → deixa passar
  → Dashboard exibido
```

---

## Próximos Passos

- [ ] Integrar Cloudinary para upload real de foto de perfil
- [ ] Adicionar verificação de e-mail (envio de link via Resend)
- [ ] Adicionar verificação de WhatsApp (OTP via Twilio/Z-API)
- [ ] Tela de "esqueceu a senha"
