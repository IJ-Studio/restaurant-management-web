// app/api/mesas/route.ts
import { NextResponse } from "next/server";
// IMPORTANTE: Ajusta estas rutas de importación según la estructura exacta de tu proyecto
import { db } from "@/lib/db"; // o "@/db", "@/database/connection", etc.
import { mesas } from "@/lib/public.schema"; // Ajusta a la ruta donde tienes tu public.schema.ts

export async function GET() {
  try {
    // Consultamos todas las mesas en la base de datos
    const listaMesas = await db.select().from(mesas);

    return NextResponse.json(listaMesas, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la lista de mesas:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno al consultar las mesas." },
      { status: 500 }
    );
  }
}
