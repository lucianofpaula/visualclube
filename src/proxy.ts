import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Subdomínios reservados do sistema que NÃO são estabelecimentos
const RESERVED_SUBDOMAINS = [
  "app",
  "admin",
  "api",
  "www",
  "mail",
  "cdn",
  "staging",
  "auth",
  "assets",
  "static",
]

/**
 * Extrai o subdomínio a partir do Host da requisição
 * Suporta produção (*.visualclube.com.br) e desenvolvimento local (*.localhost:3000)
 */
function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase().trim()

  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return null
  }

  // Localhost (ex: barbeariadoluciano.localhost)
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.replace(".localhost", "").split(".")
    const sub = parts[parts.length - 1]
    return sub && sub !== "www" ? sub : null
  }

  // Domínios principais da plataforma
  const rootDomains = ["visualclube.com.br", "cluberize.com.br"]
  for (const root of rootDomains) {
    if (hostname.endsWith(`.${root}`)) {
      const parts = hostname.replace(`.${root}`, "").split(".")
      const sub = parts[parts.length - 1]
      if (sub && sub !== "www") {
        return sub
      }
    }
  }

  return null
}

export async function proxy(req: NextRequest) {
  const { searchParams, pathname } = req.nextUrl
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.hostname || ""

  // 1. Programa de indicação (?ref= ou ?ind=)
  const refCode = searchParams.get("ref") || searchParams.get("ind")
  if (refCode && refCode.trim().length > 0) {
    const cleanUrl = req.nextUrl.clone()
    cleanUrl.searchParams.delete("ref")
    cleanUrl.searchParams.delete("ind")

    const response = NextResponse.redirect(cleanUrl)
    response.cookies.set({
      name: "visualclube_ref",
      value: refCode.trim().toUpperCase(),
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".visualclube.com.br" : undefined,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    return response
  }

  // 2. Ignorar arquivos estáticos, rotas internas do Next.js e endpoints de API
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // 3. Detecção de Subdomínio
  const subdomain = extractSubdomain(rawHost)

  if (subdomain) {
    // 3.1 Subdomínio de Gestão / App (app.visualclube.com.br ou app.localhost)
    if (subdomain === "app") {
      if (
        !pathname.startsWith("/app") &&
        !pathname.startsWith("/admin") &&
        !pathname.startsWith("/painel-teste") &&
        !pathname.startsWith("/b/")
      ) {
        const targetPath = pathname === "/" ? "/app" : `/app${pathname}`
        const url = req.nextUrl.clone()
        url.pathname = targetPath
        return NextResponse.rewrite(url)
      }
      return NextResponse.next()
    }

    // 3.2 Subdomínio de Administração (admin.visualclube.com.br)
    if (subdomain === "admin") {
      if (!pathname.startsWith("/admin")) {
        const targetPath = pathname === "/" ? "/admin" : `/admin${pathname}`
        const url = req.nextUrl.clone()
        url.pathname = targetPath
        return NextResponse.rewrite(url)
      }
      return NextResponse.next()
    }

    // 3.3 Subdomínios reservados (não são tenants)
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return NextResponse.next()
    }

    // 3.4 Subdomínio do Estabelecimento (ex: barbeariadoluciano.visualclube.com.br)
    // Reescreve internamente para a rota pública do negócio (/b/[slug])
    if (!pathname.startsWith("/b/")) {
      const targetPath = `/b/${subdomain}${pathname === "/" ? "" : pathname}`
      const url = req.nextUrl.clone()
      url.pathname = targetPath
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
