import { NextResponse } from "next/server";

import { pgClient } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pgClient.query(
      `select codigo, nombre, descripcion, tipo, valor, usos_maximos, fecha_inicio, activo
       from cupones
       where activo = true
       order by fecha_inicio desc nulls last, codigo asc`,
    );
    return NextResponse.json({ rows });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error)?.message ?? "Error cargando cupones" },
      { status: 500 },
    );
  }
}
