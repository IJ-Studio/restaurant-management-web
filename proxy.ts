import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ─── Rutas públicas (no requieren autenticación) ───────────────────────────
const PUBLIC_ROUTES = ["/", "/login", "/register", "/reset", "/frm_reset"];

// ─── Rutas protegidas por rol ──────────────────────────────────────────────
const ROLE_ROUTES: Record<number, string[]> = {
  1: ["/dashboard/admin"], // admin
  2: ["/dashboard/cajero"], // cajero
  3: ["/dashboard/mesero"], // mesero
  4: ["/dashboard/cocina"], // cocina
  5: ["/dashboard/cliente"], // cliente
};

// ─── Rutas del dashboard que siempre requieren auth ───────────────────────
const DASHBOARD_PREFIX = "/dashboard";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "dc42c5800a5e9ac2570f0ffdd3ead5af403fc4dcd3b22137cbc8cbf4067a9215";
  return new TextEncoder().encode(secret);
}

async function getSessionFromRequest(request: NextRequest): Promise<{
  id: string;
  email: string;
  roleId: number;
  tokenId: string;
} | null> {
  // Intentar desde cookie primero, luego header Authorization
  const token =
    request.cookies.get("session")?.value ??
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as {
      id: string;
      email: string;
      roleId: number;
      tokenId: string;
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas directamente
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    return NextResponse.next();
  }

  // Rutas especiales — siempre accesibles
  if (
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/forbidden") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Verificar si es una ruta del dashboard
  if (!pathname.startsWith(DASHBOARD_PREFIX)) {
    return NextResponse.next();
  }

  // ── Validar sesión ────────────────────────────────────────────────────────
  const session = await getSessionFromRequest(request);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roleId = session.roleId;

  if (!roleId) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ── Verificar acceso por rol ──────────────────────────────────────────────
  const allowedRoutes = ROLE_ROUTES[roleId] ?? [];
  const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

  // El path /dashboard base redirige según rol (manejado en app/dashboard/page.tsx)
  if (pathname === DASHBOARD_PREFIX || pathname === DASHBOARD_PREFIX + "/") {
    return NextResponse.next();
  }

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Excluir:
   * - Archivos estáticos (_next/static, _next/image, favicon, assets)
   * - Rutas de API internas de Next.js
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
