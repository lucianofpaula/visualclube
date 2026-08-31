import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/app/login",
    error: "/app/login",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".visualclube.com.br" : undefined,
      },
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      const hostname =
        (nextUrl as any).headers?.get?.("x-forwarded-host") ||
        (nextUrl as any).headers?.get?.("host") ||
        nextUrl.hostname ||
        ""

      // Detecta se a requisicao vem do subdominio app.*
      const isAppSubdomain =
        hostname.startsWith("app.") ||
        hostname.includes("app.visualclube.com.br") ||
        hostname.includes("app.localhost")

      // Rotas de login — sempre acessiveis
      const isAuthRoute =
        nextUrl.pathname.startsWith("/app/login") ||
        nextUrl.pathname === "/login"

      if (isAuthRoute) return true

      // Detecta se a rota requer login (subdominio do app ou /admin)
      const isAdminRoute = nextUrl.pathname.startsWith("/admin")

      // Se esta no subdominio do app ou rota /admin, exige autenticacao
      if ((isAppSubdomain || isAdminRoute) && !isLoggedIn) {
        return Response.redirect(new URL("/app/login", nextUrl))
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
        token.businessId = (user as any).businessId
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).phone = token.phone
        ;(session.user as any).businessId = token.businessId
      }
      return session
    },
  },
  providers: [], // Configurados em auth.ts
} satisfies NextAuthConfig
