import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { correo, password } = body;

  if (!correo || !password) {
    return Response.json({ message: "Faltan credenciales" }, { status: 400 });
  }

  let firebaseUser;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      correo,
      password
    );
    await userCredential.user.reload();
    firebaseUser = userCredential.user;

    if (!firebaseUser.emailVerified) {
      return Response.json(
        {
          message:
            "Cuenta no verificada, revisa la bandeja de entrada de tu correo electronico, se ha enviado un correo de verificación",
          code: "UNVERIFIED",
        },
        { status: 403 }
      );
    }
  } catch (authError: any) {
    return Response.json(
      { message: "Credenciales inválidas" },
      { status: 401 }
    );
  }

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

  if (!usr)
    return Response.json({ message: "El usuario no existe" }, { status: 404 });

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

  if (!ok) {
    const newAttempts = usr.loginAttempts + 1;

    if (newAttempts >= 3) {
      const lockTimeMs = 30_000; // 30 segundos
      await db
        .update(users)
        .set({ loginAttempts: 0, loginLockUntil: now + lockTimeMs })
        .where(eq(users.id, usr.id));
      return Response.json(
        { message: "Demasiados intentos fallidos. Debes esperar 30 segundos." },
        { status: 429 }
      );
    }
    // Si aun no se llega al límite de intentos
    await db
      .update(users)
      .set({ loginAttempts: newAttempts })
      .where(eq(users.id, usr.id));

    return Response.json({ message: "Contraseña incorrecta" }, { status: 401 });
  }

  try {
    // 1. Separa la contraseña del resto de los datos del usuario
    // 'password: _' significa: toma la contraseña y ponla en una variable '_' (que ignoraremos)
    // '...userWithoutPass' significa: pon el resto (nombre, email, ROLE) en esta variable
    await db
      .update(users)
      .set({ loginAttempts: 0, loginLockUntil: 0 })
      .where(eq(users.id, usr.id));
    const { password: _, ...userWithoutPass } = usr;
    // 2. Devuelve el usuario limpio al frontend
    return Response.json({ ok: true, user: userWithoutPass });
  } catch (unexpectedError: any) {
    console.error("Error inesperado:", unexpectedError);
    return Response.json(
      { message: "Error inesperado en el servidor" },
      { status: 500 }
    );
  }
}
