import { NextResponse } from "next/server";

import { pgClient } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pgClient.query(
      `select id, nombre, descripcion, precio, precio_regular, disponible
       from combos
       where disponible = true
       order by id asc`,
    );
    return NextResponse.json({ rows });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error)?.message ?? "Error cargando combos" },
      { status: 500 },
    );
  }
}

