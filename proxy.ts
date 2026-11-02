import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { CABECERA_CSP_INFORME, construirCsp, crearNonce } from "./config/seguridad/csp";

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

/**
 * CSP con nonce por petición (PLAN 2.3, D-02), de momento **solo en modo informe**: aplicarla es
 * el paso 2.5, pendiente de la aprobación del usuario. El nonce viaja a la aplicación en la
 * cabecera de la petición `x-nonce` (lo lee `app/layout.tsx`), y la política también se copia en
 * la petición: Next la lee de ahí para poner el nonce a sus propios scripts.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const nonce = crearNonce();
  const politica = construirCsp({ nonce, desarrollo: process.env.NODE_ENV === "development", aplicada: false });
  const cabecerasPeticion = new Headers(request.headers);
  cabecerasPeticion.set("x-nonce", nonce);
  cabecerasPeticion.set(CABECERA_CSP_INFORME, politica);
  const respuesta = await decidir(request, () =>
    NextResponse.next({ request: { headers: cabecerasPeticion } }),
  );
  respuesta.headers.set(CABECERA_CSP_INFORME, politica);
  return respuesta;
}

/** Control de acceso. `continuar` deja pasar la petición con las cabeceras del nonce. */
async function decidir(request: NextRequest, continuar: () => NextResponse): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas directamente
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    return continuar();
  }

  // Rutas especiales — siempre accesibles
  if (
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/forbidden") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api/")
  ) {
    return continuar();
  }

  // Verificar si es una ruta del dashboard
  if (!pathname.startsWith(DASHBOARD_PREFIX)) {
    return continuar();
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
    return continuar();
  }

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return continuar();
}

export const config = {
  /*
   * Excluir:
   * - Archivos estáticos (_next/static, _next/image, favicon, assets)
   * - Rutas de API internas de Next.js
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|icons/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
