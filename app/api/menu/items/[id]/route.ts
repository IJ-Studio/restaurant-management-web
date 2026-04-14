import { NextResponse } from "next/server";
import { pgClient } from "@/lib/db";

export async function DELETE(req: Request, context: { params?: { id?: string } }) {
  try {
    const rawId = context?.params?.id ?? new URL(req.url).pathname.split("/").pop();
    const itemId = Number(rawId ?? "");
    if (!Number.isFinite(itemId) || itemId <= 0) {
      return NextResponse.json({ error: "id inválido" }, { status: 400 });
    }

    const res = await pgClient.query(`delete from public.platillos where id = $1`, [itemId]);
    return NextResponse.json({ success: true, deleted: res.rowCount ?? 0 });
  } catch (e: any) {
    console.error("Menu item DELETE error:", e);
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}
