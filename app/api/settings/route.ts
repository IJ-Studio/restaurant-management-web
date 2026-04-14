import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allSettings = await db.select().from(settings);
    // Convert { key: 'foo', value: { x: 1 } } to { foo: { x: 1 } } or { foo: 1 }
    const config = allSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const updates = await req.json();

    // Upsert algorithm
    for (const [key, value] of Object.entries(updates)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      
      if (existing.length > 0) {
        await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
    }

    return NextResponse.json({ success: true, updatedKeys: Object.keys(updates) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
