/**
 * app/api/auth/logout/route.ts
 *
 * Proxy to backend logout endpoint
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/auth/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Logout proxy error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}
