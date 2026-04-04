/**
 * app/api/auth/register/route.ts
 *
 * Proxy to backend register endpoint
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Register proxy error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}
