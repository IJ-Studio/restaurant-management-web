/**
 * app/api/auth/login/route.ts
 *
 * Proxy to backend login endpoint
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Backend error:", response.status, errorData);
      return NextResponse.json(
        errorData || { error: "Error en la autenticación" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Si el backend retorna una cookie, pasarla al cliente
    if (response.headers.get("set-cookie")) {
      const setCookieHeader = response.headers.get("set-cookie");
      const proxyResponse = NextResponse.json(data, {
        status: response.status,
      });
      if (setCookieHeader) {
        proxyResponse.headers.set("set-cookie", setCookieHeader);
      }
      return proxyResponse;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Login proxy error:", error.message);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}
