import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { createSession } from "@/lib/session"; 

export async function POST(req: Request) {
    let usr, ok;
 
    const body = await req.json(); 

    const { correo, password } = body;
    
    // 1. Validación de campos vacíos
    if (!correo || !password) {
        return Response.json(
            { message: "Faltan credenciales" },
            { status: 400 }
        );
    }
    
    // 2. Buscar usuario en la Base de Datos
    try {
        [usr] = await db.select().from(users).where(eq(users.email, correo));
    } catch (dbError: any) {
        console.error("DB Error (select):", dbError);
        return Response.json(
            { message: "Error de conexión a la base de datos" },
            { status: 500 }
        );
    }
    
    // 3. Verificar si el usuario existe
    if (!usr) return Response.json(
        { message: "El usuario no existe" },
        { status: 404 }
    );

    // 4. Verificar la contraseña (bcrypt)
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

    // 5. Crear Sesión y Responder
    try {
        // Separamos la contraseña para no enviarla al cliente ni guardarla en sesión
        const { password: _, ...userWithoutPass } = usr;
        
        // ---PARTE DE LAS COOKIES ---
        // Esto crea una cookie HttpOnly en el navegador del usuario automáticamente
        await createSession(userWithoutPass);
        
        // Devolvemos el usuario (id, email, role) para que el frontend sepa a dónde redirigir
        return Response.json({ 
            ok: true, 
            user: userWithoutPass 
        });        

    } catch (unexpectedError: any) {
        console.error("Error inesperado al crear sesión:", unexpectedError);
        return Response.json(
            { message: "Error inesperado en el servidor" },
            { status: 500 }
        );
    }
}