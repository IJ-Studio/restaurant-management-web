import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/firebaseConfig";
import { handleSendEmail } from "@/actions/(email-actions)/handleSendPasswordResetEmail";

export async function POST(req: Request) {
  const { correo } = await req.json();

  if (!correo) {
    return Response.json({ message: "Correo requerido" }, { status: 400 });
  }

  const [usr] = await db.select().from(users).where(eq(users.email, correo));

  if (!usr) {
    return Response.json({
      message: "Si el correo existe, se enviará un enlace.",
    });
  }

  const now = Date.now();

  // === 1. Bloqueo activo ===
  if (usr.recoveryLockUntil > now) {
    const waitMs = usr.recoveryLockUntil - now;
    const waitSeconds = Math.ceil(waitMs / 1000);

    return Response.json(
      {
        message: `Debes esperar ${waitSeconds} segundos.`,
        waitSeconds,
      },
      { status: 429 }
    );
  }

  // === 2. Enviar correo (tu lógica permanece intacta) ===
  const result = await handleSendEmail(auth, correo);

  if (!result.success) {
    // Primer intento fallido → NO bloqueo, solo error normal
    return Response.json(
      { message: "No se pudo enviar el correo." },
      { status: 400 }
    );
  }

  // === 3. Aplicar bloqueo de 70 segundos ===
  const lockDuration = 70000; // 70s

  await db
    .update(users)
    .set({
      recoveryLockUntil: now + lockDuration,
    })
    .where(eq(users.id, usr.id));

  return Response.json({
    ok: true,
    message: "Correo enviado correctamente.",
    waitSeconds: 70,
  });
}
