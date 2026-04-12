import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, stock } = body;

    if (!id || stock === undefined) {
      return NextResponse.json({ error: "ID and stock are required" }, { status: 400 });
    }

    const result = await db.update(products)
      .set({ 
        stock: String(stock),
        lastUpdated: new Date()
      })
      .where(eq(products.id, Number(id)))
      .returning();

    return NextResponse.json(result[0] || { success: true });
  } catch (error) {
    console.error("POST /api/inventory/products/adjust error:", error);
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}
