/**
 * lib/session.ts
 *
 * Auth session verification logic using purely standards/backend.
 * Next.js will use this to verify cookies inside server components / middleware.
 */
import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types/auth";
import { claveJwt } from "@/lib/seguridad/secreto-jwt";

export interface SessionPayload extends JWTPayload {
  id?: string;
  email?: string;
  roleId?: number;
  tokenId?: string;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;
    // Sin JWT_SECRET no hay sesión válida (PLAN 2.9).
    const clave = claveJwt();
    if (!clave) return null;

    const { payload } = await jwtVerify(token, clave);
    return payload as SessionPayload;
  } catch (err) {
    return null; /* Invalid token or no token */
  }
}

// RESTAURADO: Función limpia que extrae los datos del JWT para Server Components rápidos
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.id || !session.email || !session.roleId) return null;

  return {
    id: session.id,
    email: session.email,
    name: "",
    lastname: "",
    roleName: getRoleNameFromId(session.roleId),
  };
}

function getRoleNameFromId(roleId: number): SessionUser["roleName"] {
  const roleMap: Record<number, SessionUser["roleName"]> = {
    1: "admin",
    2: "cajero",
    3: "mesero",
    4: "cocina",
    5: "cliente",
  };
  return roleMap[roleId] || "cliente";
}
