import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

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

    // 2. Notificar al backend de NestJS para invalidar la sesión en la base de datos/redis
    const response = await fetch(`${BACKEND_URL}/auth/sign-out`, {
      method: "POST",
      headers: headersToSend,
    });

    // 3. Crear la respuesta del proxy
    const responseData = response.ok ? { success: true } : await response.json();
    const res = NextResponse.json(responseData, { status: response.status });

    // 4. LIMPIEZA ABSOLUTA DE LAS COOKIES LOCALES
    // Esto destruye los identificadores de sesión en el navegador inmediatamente
    res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("session", "", { path: "/", maxAge: 0 });

    return res;
  } catch (error: any) {
    console.error("Logout proxy error:", error);
    return NextResponse.json(
      { error: "Error al procesar el cierre de sesión" },
      { status: 500 }
    );
  }
}
