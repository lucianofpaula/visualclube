import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { RESERVED_SUBDOMAINS } from "@/validations/barbershop";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "vc_session_token";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "visualclube-super-secret-key-change-in-production-2026-secure"
);

/**
 * Extrai o subdomínio da requisição levando em consideração produção e desenvolvimento local
 */
function extractSubdomain(hostHeader: string | null): string | null {
  if (!hostHeader) return null;

  // Remove porta (ex: localhost:3000 -> localhost)
  const host = hostHeader.split(":")[0].toLowerCase();

  // Ignora se for endereço IP direto
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return null;

  // Domínio raiz configurado no ambiente ou padrão oficial
  const rootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "visualclube.com.br"
  ).toLowerCase();

  // Cenário 1: Ambiente Local (ex: barbeariadoluciano.localhost)
  if (host.endsWith(".localhost")) {
    const candidate = host.replace(".localhost", "");
    return candidate || null;
  }

  // Cenário 2: Produção com domínio wildcard (ex: barbeariadoluciano.visualclube.com.br)
  if (host.endsWith(`.${rootDomain}`)) {
    const candidate = host.replace(`.${rootDomain}`, "");
    return candidate || null;
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostHeader = request.headers.get("host");
  const subdomain = extractSubdomain(hostHeader);

  // 1. Tratamento de Subdomínio Wildcard (ex: barbeariadoluciano.visualclube.com.br)
  if (
    subdomain &&
    !RESERVED_SUBDOMAINS.includes(subdomain as (typeof RESERVED_SUBDOMAINS)[number])
  ) {
    // Se a rota acessada no subdomínio não for interna do Next, reescreve para a pasta pública da barbearia
    const url = request.nextUrl.clone();
    url.pathname = `/b/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Tratamento de Autenticação para o Domínio Principal / Painel Administrativo
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Proteger rotas autenticadas (/painel e subpastas)
  if (pathname.startsWith("/painel")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Redirecionar usuários já logados que tentam acessar /login ou /cadastro
  if (pathname === "/login" || pathname === "/cadastro") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/painel", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto arquivos estáticos e rotas de sistema
     */
    "/((?!api/|_next/static|_next/image|favicon.ico).*)",
  ],
};
