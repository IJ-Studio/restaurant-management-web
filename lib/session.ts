/**
 * lib/session.ts
 *
 * Auth session verification logic using purely standards/backend.
 * Next.js will use this to verify cookies inside server components / middleware.
 */
import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types/auth";

export interface SessionPayload extends JWTPayload {
  userId?:   string;
  email?:    string;
  roleName?: string;
  name?:     string;
  lastname?: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || "fallback_secret_key_for_development";
  return new TextEncoder().encode(secret);
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch (err) {
    return null; /* Invalid token or no token */
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.userId || !session.email || !session.roleName) return null;

  return {
    id:       session.userId,
    email:    session.email,
    name:     session.name     ?? "",
    lastname: session.lastname ?? "",
    roleName: session.roleName as SessionUser["roleName"],
  };
}
