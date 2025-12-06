import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  const { correo, password } = body;

  if (!correo || !password) {
    return Response.json({ message: "Faltan credenciales" }, { status: 400 });
  }

  // === 1. Obtener usuario desde DB ===
  const [usr] = await db.select().from(users).where(eq(users.email, correo));

  if (!usr) {
    return Response.json({ message: "El usuario no existe" }, { status: 404 });
  }

  const now = Date.now();

  // === 2. Bloqueo previo (si aún no expira) ===
  if (usr.loginLockUntil > now) {
    const waitMs = usr.loginLockUntil - now;
    const waitSeconds = Math.ceil(waitMs / 1000);

    return Response.json(
      {
        message: `Debes esperar ${waitSeconds} segundos.`,
        waitSeconds,
        max: 300,
      },
      { status: 429 }
    );
  }

  // === 3. Intento de login con Firebase ===
  let firebaseUser;
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      correo,
      password
    );
    await userCredential.user.reload();
    firebaseUser = userCredential.user;
  } catch {
    // --- Intento fallido → lógica progresiva ---
    const attempts = usr.loginAttempts + 1;

    // Si llegó a 3 intentos fallidos → activar bloqueo
    if (attempts >= 3) {
      const newLockStep = usr.lockStep + 1;

      const base = 30000; // 30s
      const lockDuration = Math.min(base * 2 ** (newLockStep - 1), 300000); // máx 5 min (300k ms)

      await db
        .update(users)
        .set({
          loginAttempts: 0,
          loginLockUntil: now + lockDuration,
          lockStep: newLockStep,
        })
        .where(eq(users.id, usr.id));

      return Response.json(
        {
          message: `Demasiados intentos fallidos. Espera ${Math.ceil(
            lockDuration / 1000
          )} segundos.`,
          waitSeconds: Math.ceil(lockDuration / 1000),
          max: 300,
        },
        { status: 429 }
      );
    }

    // Si NO llegó a 3 intentos → solo aumentar el contador
    await db
      .update(users)
      .set({ loginAttempts: attempts })
      .where(eq(users.id, usr.id));

    return Response.json(
      { message: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  // === 4. Email no verificado ===
  if (!firebaseUser.emailVerified) {
    return Response.json(
      {
        message: "Cuenta no verificada. Revisa tu correo.",
        code: "UNVERIFIED",
      },
      { status: 403 }
    );
  }

  // === 5. Reset total al iniciar sesión correctamente ===
  await db
    .update(users)
    .set({
      loginAttempts: 0,
      loginLockUntil: 0,
      lockStep: 0,
    })
    .where(eq(users.id, usr.id));

  // === 6. Crear sesión y retornar usuario ===
  const { password: _, ...userWithoutPass } = usr;
  await createSession(userWithoutPass);

  return Response.json({ ok: true, user: userWithoutPass });
}
