import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

export async function handleResetPassword(auth, actionCode, newPassword ) {
    console.log("Intentando resetear contraseña con:", actionCode, newPassword);
    if (!actionCode || !newPassword) {
        return { success: false, message: "Código o nueva contraseña inválidos" };
    }
    try {
        const usr_email = await verifyPasswordResetCode(auth, actionCode);         
        await confirmPasswordReset(auth, actionCode, newPassword);    
        console.log("contraseña reseteada correctamente:");
        // Llamada al endpoint para actualizar en Drizzle
        await fetch("/api/auth/reset_password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: usr_email, password: newPassword }),
        });
        console.log("contraseña reseteada correctamente:");
        
        return { success: true, email: usr_email };

    } catch (error) {
        console.error("Error al resetear la contraseña:", error);
        return { success: false, message: error.message || "Error desconocido" };
    }

}