import { db } from "@/lib/db";
import { suppliers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allSuppliers = await db.select().from(suppliers);
    return NextResponse.json(allSuppliers);
  } catch (error) {
    console.error("GET /api/inventory/suppliers error:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...data } = body;
    
    const result = await db.insert(suppliers).values({
      ...data,
      deliveryDays: Number(data.deliveryDays ?? 1),
      active: data.active ?? true
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/inventory/suppliers error:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, ...data } = body;
    
    // Explicitly validate ID to prevent 'out of range' errors if frontend sends junk
    const numericId = Number(id);
    if (!id || isNaN(numericId) || numericId > 2147483647) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await db.update(suppliers)
      .set({
        ...data,
        deliveryDays: Number(data.deliveryDays ?? 1),
      })
      .where(eq(suppliers.id, numericId))
      .returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/inventory/suppliers error:", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
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

    await db.delete(suppliers).where(eq(suppliers.id, numericId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/inventory/suppliers error:", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}