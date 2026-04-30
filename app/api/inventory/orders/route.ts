import { db } from "@/lib/db";
import { purchaseOrders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allOrders = await db.select().from(purchaseOrders);
    return NextResponse.json(allOrders);
  } catch (error) {
    console.error("GET /api/inventory/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...data } = body;
    
    const result = await db.insert(purchaseOrders).values({
      ...data,
      supplierId: data.supplierId ? Number(data.supplierId) : null,
      total: String(data.total ?? 0),
      status: data.status ?? "borrador"
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/inventory/orders error:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...data } = body;
    
    const numericId = Number(id);
    if (!id || isNaN(numericId) || numericId > 2147483647) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await db.update(purchaseOrders)
      .set({
        ...data,
        supplierId: data.supplierId ? Number(data.supplierId) : null,
        total: String(data.total ?? 0),
      })
      .where(eq(purchaseOrders.id, numericId))
      .returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/inventory/orders error:", error);
    return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const numericId = Number(id);
    if (!id || isNaN(numericId) || numericId > 2147483647) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, numericId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/inventory/orders error:", error);
    return NextResponse.json({ error: "Failed to delete purchase order" }, { status: 500 });
  }
}