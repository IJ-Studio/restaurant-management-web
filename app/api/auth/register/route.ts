import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();
  const { nombre, apellido, correo, telefono, password } = body;

  if (!nombre || !apellido || !correo || !telefono || !password) {
    return Response.json({ message: "Faltan campos obligatorios" }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ message: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const existingUser = await db.select().from(users).where(eq(users.email, correo));
  if (existingUser.length > 0) {
    return Response.json({ message: "El correo ya está registrado" }, { status: 400 });
  }

  // Buscar rol 'cliente' para asignarlo por defecto
  const [clienteRole] = await db.select().from(roles).where(eq(roles.name, "cliente"));
  if (!clienteRole) {
    return Response.json({ message: "Error de configuración del sistema" }, { status: 500 });
  }

  const newpass = await hash(password, 10);

  await db.insert(users).values({
    name: nombre,
    lastname: apellido,
    email: correo,
    phone: telefono,
    password: newpass,
    roleId: clienteRole.id,
  });

  return Response.json({ ok: true });
}