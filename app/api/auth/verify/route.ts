import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ message: "Falta el email." }, { status: 400 });
    }

    const [usr] = await db.select().from(users).where(eq(users.email, email));

    if (!usr) {
      return Response.json(
        { message: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // Actualizar estado de verificación
    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, usr.id));

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error en verify-email:", error);
    return Response.json({ message: "Error interno." }, { status: 500 });
  }
}
