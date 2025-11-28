import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    let usr, ok;
 
    const body = await req.json(); 

    const {correo, password } = body;
    
    if (!correo || !password) {
        return Response.json(
            { message: "Faltan credenciales" },
            { status: 400 }
        );
    }
    
    try {
        [usr] = await db.select().from(users).where(eq(users.email, correo));
    } catch (dbError: any) {
        console.error("DB Error (select):", dbError);
        return Response.json(
            { message: "Error de conexión a la base de datos" },
            { status: 500 }
        );
    }
    
    if (!usr) return Response.json(
        { message: "El usuario no existe" },
        { status: 404 }
    );

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
        return Response.json(
            { message: "Contraseña incorrecta" },
            { status: 401 }
        );     
    }

  try {
        // 1. Separa la contraseña del resto de los datos del usuario
        // 'password: _' significa: toma la contraseña y ponla en una variable '_' (que ignoraremos)
        // '...userWithoutPass' significa: pon el resto (nombre, email, ROLE) en esta variable
        const { password: _, ...userWithoutPass } = usr;
        
        // 2. Devuelve el usuario limpio al frontend
        return Response.json({ 
            ok: true, 
            user: userWithoutPass 
        });        
    } catch (unexpectedError: any) {
        console.error("Error inesperado:", unexpectedError);
        return Response.json(
            { message: "Error inesperado en el servidor" },
            { status: 500 }
        );
    }


}