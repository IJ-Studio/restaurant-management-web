import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const cookieStore = await cookies();
    const rawToken = cookieStore.get("session")?.value;

    const headersToSend: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (rawToken) {
      headersToSend["Authorization"] = `Bearer ${rawToken}`;
    }

    // Consultamos al microservicio NestJS de forma directa
    const response = await fetch(`${BACKEND_URL}/users/${session.id}`, {
      method: "GET",
      headers: headersToSend,
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userData = await response.json();

    const roleMap: Record<number, string> = {
      1: "admin", 2: "cajero", 3: "mesero", 4: "cocina", 5: "cliente",
    };

    // ─── MAPEO COMPLETO DEFINITIVO ───
    // Incluimos explícitamente "phone" mapeado desde userData (BD centralizada)
    return NextResponse.json({
      user: {
        id: String(userData.id),
        email: userData.email,
        name: userData.name || "",
        lastname: userData.lastname || "",
        phone: userData.phone || userData.telefono || "", // Mapeo camaleónico por si Drizzle usa "telefono"
        roleName: roleMap[userData.roleId] || "cliente",
      }
    });

  } catch (error: any) {
    console.error("Error en proxy /api/auth/me:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
