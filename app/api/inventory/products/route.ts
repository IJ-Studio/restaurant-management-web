import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, lastUpdated, createdAt, ...data } = body;
    
    // Convert numeric fields to strings to ensure compatibility with Drizzle's numeric column
    const formattedData = {
      ...data,
      stock: String(data.stock ?? 0),
      minStock: String(data.minStock ?? 0),
      maxStock: String(data.maxStock ?? 100),
      costPerUnit: String(data.costPerUnit ?? 0),
      lastUpdated: new Date(),
    };

    const result = await db.insert(products).values(formattedData).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("POST /api/inventory/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, lastUpdated, createdAt, ...data } = body;
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const formattedData = {
      ...data,
      stock: String(data.stock ?? 0),
      minStock: String(data.minStock ?? 0),
      maxStock: String(data.maxStock ?? 100),
      costPerUnit: String(data.costPerUnit ?? 0),
      lastUpdated: new Date(),
    };

    const result = await db.update(products)
      .set(formattedData)
      .where(eq(products.id, Number(id)))
      .returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/inventory/products error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.delete(products).where(eq(products.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}