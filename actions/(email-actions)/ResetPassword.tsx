import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

export async function handleResetPassword(auth, actionCode, newPassword ) {
    
    try {
        const usr_email = await verifyPasswordResetCode(auth, actionCode);         
        await confirmPasswordReset(auth, actionCode, newPassword);    
        return { success: true, email: usr_email };

    } catch (error) {
        return { success: false, message: error.message || "Error desconocido" };
    }

}