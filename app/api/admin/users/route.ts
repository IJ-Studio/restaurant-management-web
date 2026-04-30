import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles, empleados } from "@/lib/schema";
import { eq } from "drizzle-orm";
// import bcrypt from "bcrypt"; // If available, otherwise simple hash

export async function GET() {
  try {
    const rawUsers = await db
      .select({
        id: users.id,
        name: users.name,
        lastname: users.lastname,
        email: users.email,
        phone: users.phone,
        active: users.isActive,
        roleName: roles.name,
        // Empleados fields
        empId: empleados.id,
        hireDate: empleados.fechaIngreso,
        shift: empleados.jornada,
        salary: empleados.salarioMensual,
        address: empleados.direccionEmpleado,
        // We will ignore perms for simplicity as they aren't fully modeled in DB for custom perms yet
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(empleados, eq(users.id, empleados.userId));

    const formatted = rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      lastname: u.lastname,
      email: u.email,
      phone: u.phone,
      role: u.roleName || "mesero", // Fallback
      active: u.active,
      hireDate: u.hireDate ? new Date(u.hireDate).toISOString().split('T')[0] : "",
      shift: u.shift || "mañana",
      salary: Number(u.salary) || 0,
      address: u.address || "",
      customPerms: [],
      revokedPerms: [],
    }));

    return NextResponse.json({ users: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      password,
    } = body;

    // 1. Get role ID
    let roleRow = await db.select().from(roles).where(eq(roles.name, role)).limit(1);
    let roleId = roleRow[0]?.id;

    if (!roleId) {
      // Create role if doesn't exist
      const res = await db.insert(roles).values({ name: role, permissions: [] }).returning();
      roleId = res[0].id;
    }

    // Hash logic placeholder (use real depending on package)
    const fixedPassword = password || "12345678"; // Basic fallback

    // 2. Transacción manual o inserción secuencial (users -> empleados)
    const newUser = await db.insert(users).values({
      name,
      lastname,
      email,
      phone,
      roleId,
      isActive: active,
      password: fixedPassword, // Store hashed pass optimally
    }).returning();

    const insertedUserId = newUser[0].id;

    // 3. Insert in empleados
    await db.insert(empleados).values({
      userId: insertedUserId,
      fechaIngreso: hireDate || null,
      jornada: shift,
      salarioMensual: salary ? String(salary) : null,
      direccionEmpleado: address,
      activo: active,
    });

    return NextResponse.json({ success: true, id: insertedUserId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
