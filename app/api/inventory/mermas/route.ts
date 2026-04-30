import { db } from "@/lib/db";
import { mermas, products } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allMermas = await db.select().from(mermas);
    return NextResponse.json(allMermas);
  } catch (error) {
    console.error("GET /api/inventory/mermas error:", error);
    return NextResponse.json({ error: "Failed to fetch mermas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, date, createdAt, ...data } = body;

    if (!data.productId || data.quantity === undefined) {
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 });
    }

    // Insert merma record
    const result = await db.insert(mermas).values({
      ...data,
      productId: Number(data.productId),
      quantity: String(data.quantity),
      cost: String(data.cost ?? 0),
      date: new Date(),
    }).returning();

    // Automatically subtract from product stock
    await db.update(products)
      .set({
        stock: sql`${products.stock} - ${String(data.quantity)}`,
        lastUpdated: new Date()
      })
      .where(eq(products.id, Number(data.productId)));

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/inventory/mermas error:", error);
    return NextResponse.json({ error: "Failed to create merma record" }, { status: 500 });
  }
}