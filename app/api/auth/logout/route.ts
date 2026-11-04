import { NextRequest, NextResponse } from "next/server";

import { resultadoCierre } from "@/lib/sesion/resultado-cierre";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Caduca las cookies de sesión en la respuesta. Se aplica en todas las salidas de la ruta, también
 * cuando el backend falla o no responde: la limpieza local no depende de la invalidación remota
 * (NP-41, excepción autorizada por el usuario el 2026-11-03).
 */
function caducarCookiesDeSesion(res: NextResponse) {
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
  return res;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Extraer de forma limpia el token de los headers o de las cookies de la petición entrante
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const cookieToken = req.cookies.get("access_token")?.value;

    const headersToSend: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headersToSend["Authorization"] = authHeader;
    } else if (cookieToken) {
      headersToSend["Authorization"] = `Bearer ${cookieToken}`;
    }

    // Sin token no hay sesión que invalidar en el backend (estado null): solo se limpian las cookies.
    const response = headersToSend["Authorization"]
      ? await fetch(`${BACKEND_URL}/auth/sign-out`, { method: "POST", headers: headersToSend })
      : null;
    const { status, cuerpo } = resultadoCierre(response?.status ?? null);
    return caducarCookiesDeSesion(NextResponse.json(cuerpo, { status }));
  } catch (error: unknown) {
    console.error("Logout proxy error:", error instanceof Error ? error.name : "desconocido");
    // Aunque el backend falle, el navegador queda sin sesión.
    return caducarCookiesDeSesion(
      NextResponse.json({ error: "Error al procesar el cierre de sesión" }, { status: 500 }),
    );
  }
}
