import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al recuperar sesión: " + error.message },
      { status: 500 }
    );
  }
}
