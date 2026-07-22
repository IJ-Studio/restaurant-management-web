import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles, empleados } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const {
      name,
      lastname,
      email,
      phone,
      role,
      active,
      hireDate,
      shift,
      salary,
      address,
    } = body;

    // Resolve Role ID
    let roleRow = await db.select().from(roles).where(eq(roles.name, role)).limit(1);
    let roleId = roleRow[0]?.id;

    if (!roleId) {
      const res = await db.insert(roles).values({ name: role, permissions: [] }).returning();
      roleId = res[0].id;
    }

    // 1. Update users table
    await db.update(users)
      .set({
        name,
        lastname,
        email,
        phone,
        roleId,
        isActive: active,
      })
      .where(eq(users.id, id));

    // 2. Update empleados table (upsert-like behavior depending on if it exists)
    const existingEmp = await db.select().from(empleados).where(eq(empleados.userId, id)).limit(1);

    if (existingEmp.length > 0) {
      await db.update(empleados)
        .set({
          fechaIngreso: hireDate || null,
          jornada: shift,
          salarioMensual: salary ? String(salary) : null,
          direccionEmpleado: address,
          activo: active,
          updatedAt: new Date(),
        })
        .where(eq(empleados.userId, id));
    } else {
      await db.insert(empleados).values({
        userId: id,
        fechaIngreso: hireDate || null,
        jornada: shift,
        salarioMensual: salary ? String(salary) : null,
        direccionEmpleado: address,
        activo: active,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // Soft delete
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));
    await db.update(empleados).set({ activo: false }).where(eq(empleados.userId, id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
