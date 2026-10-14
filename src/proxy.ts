import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "vc_session_token";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "visualclube-super-secret-key-change-in-production-2026-secure"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

  // 1. Proteger rotas autenticadas (/painel e subpastas)
  if (pathname.startsWith("/painel")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Redirecionar usuários já logados que tentam acessar /login ou /cadastro
  if (pathname === "/login" || pathname === "/cadastro") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/painel", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/login", "/cadastro"],
};
