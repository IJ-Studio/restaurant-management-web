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

  // --- Validación inicial ---
  if (!correo || !password) {
    return Response.json({ message: "Faltan credenciales" }, { status: 400 });
  }

  let firebaseUser;

  // --- Login con Firebase ---
  try {
    const userCredential = await signInWithEmailAndPassword(auth, correo, password);
    await userCredential.user.reload();
    firebaseUser = userCredential.user;

    if (!firebaseUser.emailVerified) {
      return Response.json(
        {
          message:
            "Cuenta no verificada, revisa la bandeja de entrada de tu correo, se ha enviado un correo de verificación",
          code: "UNVERIFIED",
        },
        { status: 403 }
      );
    }
  } catch {
    return Response.json(
      { message: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  // --- Usuario en la base de datos ---
  let usr;

  try {
    [usr] = await db.select().from(users).where(eq(users.email, correo));
  } catch (dbError: any) {
    console.error("DB Error (select):", dbError);
    return Response.json(
      { message: "Error de conexión a la base de datos" },
      { status: 500 }
    );
  }

  if (!usr) {
    return Response.json({ message: "El usuario no existe" }, { status: 404 });
  }

  // --- Bloqueo por intentos fallidos ---
  const now = Date.now();

  if (usr.loginLockUntil > now) {
    const waitSeconds = Math.ceil((usr.loginLockUntil - now) / 1000);
    return Response.json(
      {
        message: `Has superado el límite de intentos. Espera ${waitSeconds} segundos para volver a intentarlo.`,
      },
      { status: 429 }
    );
  }

  // --- Comparación de contraseña en BD ---
  let ok;
  try {
    ok = await compare(password, usr.password);
  } catch (bcryptError: any) {
    console.error("Error en bcrypt:", bcryptError);
    return Response.json(
      { message: "Error al verificar la contraseña" },
      { status: 500 }
    );
  }

  // --- Manejo de intentos fallidos ---
  if (!ok) {
    const newAttempts = usr.loginAttempts + 1;

    if (newAttempts >= 3) {
      const lockTimeMs = 30000; // 30 segundos
      await db
        .update(users)
        .set({ loginAttempts: 0, loginLockUntil: now + lockTimeMs })
        .where(eq(users.id, usr.id));

      return Response.json(
        { message: "Demasiados intentos fallidos. Debes esperar 30 segundos." },
        { status: 429 }
      );
    }

    await db
      .update(users)
      .set({ loginAttempts: newAttempts })
      .where(eq(users.id, usr.id));

    return Response.json({ message: "Contraseña incorrecta" }, { status: 401 });
  }

  // --- Reset de intentos fallidos ---
  try {
    await db
      .update(users)
      .set({ loginAttempts: 0, loginLockUntil: 0 })
      .where(eq(users.id, usr.id));
  } catch (unexpectedError: any) {
    console.error("Error inesperado:", unexpectedError);
  }

  // --- Crear sesión + retornar usuario sin contraseña ---
  try {
    const { password: _, ...userWithoutPass } = usr;

    // funcionalidad del archivo 1
    await createSession(userWithoutPass);

    return Response.json({ ok: true, user: userWithoutPass });
  } catch (unexpectedError: any) {
    console.error("Error inesperado al crear sesión:", unexpectedError);
    return Response.json(
      { message: "Error inesperado en el servidor" },
      { status: 500 }
    );
  }
}
