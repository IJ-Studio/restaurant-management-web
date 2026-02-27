import { db } from "@/lib/db";
import { users, roles } from "@/lib/schema";
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

  try {
    const userCredential = await signInWithEmailAndPassword(auth, correo, password);
    await userCredential.user.reload();
    const firebaseUser = userCredential.user;

    if (!firebaseUser.emailVerified) {
      return Response.json(
        { message: "Cuenta no verificada, revisa tu correo", code: "UNVERIFIED" },
        { status: 403 }
      );
    }
  } catch {
    return Response.json({ message: "Credenciales inválidas" }, { status: 401 });
  }

  // JOIN con roles para traer roleName y permissions
  let usr: any;
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        lastname: users.lastname,
        email: users.email,
        phone: users.phone,
        password: users.password,
        roleId: users.roleId,
        roleName: roles.name,
        permissions: roles.permissions,
        isActive: users.isActive,
        isVerified: users.isVerified,
        loginAttempts: users.loginAttempts,
        loginLockUntil: users.loginLockUntil,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, correo));

    usr = result[0];
  } catch (dbError: any) {
    console.error("DB Error:", dbError);
    return Response.json({ message: "Error de base de datos" }, { status: 500 });
  }

  if (!usr) {
    return Response.json({ message: "El usuario no existe" }, { status: 404 });
  }

  const now = Date.now();
  if (usr.loginLockUntil > now) {
    const waitSeconds = Math.ceil((usr.loginLockUntil - now) / 1000);
    return Response.json(
      { message: `Demasiados intentos. Espera ${waitSeconds} segundos.` },
      { status: 429 }
    );
  }

  const ok = await compare(password, usr.password);

  if (!ok) {
    const newAttempts = usr.loginAttempts + 1;
    if (newAttempts >= 3) {
      await db.update(users)
        .set({ loginAttempts: 0, loginLockUntil: now + 30000 })
        .where(eq(users.id, usr.id));
      return Response.json({ message: "Demasiados intentos. Espera 30 segundos." }, { status: 429 });
    }
    await db.update(users)
      .set({ loginAttempts: newAttempts })
      .where(eq(users.id, usr.id));
    return Response.json({ message: "Contraseña incorrecta" }, { status: 401 });
  }

  await db.update(users)
    .set({ loginAttempts: 0, loginLockUntil: 0 })
    .where(eq(users.id, usr.id));

  const { password: _, ...userWithoutPass } = usr;
  await createSession(userWithoutPass);

  return Response.json({ ok: true, user: userWithoutPass });
}