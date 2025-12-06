import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  const body = await req.json();
  const { correo, password } = body;

  if (!correo || !password) {
    return Response.json({ message: "Faltan datos" }, { status: 400 });
  }

  let newpass;
  try {
    newpass = await hash(password, 10);
  } catch (err) {
    console.error("Hash Error:", err);
    return Response.json(
      { message: "Error al procesar la contraseña" },
      { status: 500 }
    );
  }

  try {
    await db
      .update(users)
      .set({ password: newpass })
      .where(eq(users.email, correo));
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DB Error (update):", err);
    return Response.json(
      { message: "Error al actualizar la contraseña" },
      { status: 500 }
    );
  }
}