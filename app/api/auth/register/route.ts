import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {

  const body = await req.json(); 

  const { nombre, apellido, correo, telefono, password } = body;
  
  if (!nombre || !apellido || !correo || !telefono || !password) {
    return Response.json(
      { message: "Faltan campos obligatorios" },
      { status: 400 }
    );
  }

  // Longitud mínima de 8 caracteres
  if (password.length < 8) {
    return Response.json(
      { message: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  /* Opcional: Validar complejidad (Mayúscula, número, especial) según tu PDF
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-])/;
  if (!complexityRegex.test(password)) {
     return Response.json(
      { message: "La contraseña debe incluir mayúsculas, números y símbolos." },
      { status: 400 }
    );
  }
*/
  let existingUser: any[];
  
  try {
    existingUser = await db.select().from(users).where(eq(users.email, correo));
  } catch (dbErr) {
    console.error("DB Error (select):", dbErr);
    return Response.json(
      { message: "Error al verificar usuario existente" },
      { status: 500 }
    );
  }

  if (existingUser.length > 0) {
    return Response.json(
      { message: "El correo ya está registrado" },
      { status: 400 }
    );
  }

  let newpass;
  try {
    newpass = await hash(password, 10);
  } catch (hashErr) {
    console.error("Hash Error:", hashErr);
    return Response.json(
      { message: "Error al procesar la contraseña" },
      { status: 500 }
    );
  }

  try {
    await db.insert(users).values({
      name: nombre,
      lastname: apellido,
      email: correo,
      phone: telefono,
      password: newpass,
    });
    // await adminAuth.createUser({
    //   email: correo,
    //   password: password,
    //   displayName: `${nombre} ${apellido}`,
    // });
    
  } catch (insertErr) {
    console.error("DB Error (insert):", insertErr);
    return Response.json(
      { message: "Error al crear usuario en la base de datos" },
      { status: 500 }
    );
  }
  try {
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error inesperado:", error);
    return Response.json(
      { message: "Error inesperado en el servidor" },
      { status: 500 }
    );
  }
}
