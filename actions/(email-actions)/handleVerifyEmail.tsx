import { applyActionCode } from "firebase/auth";

export async function handleVerifyEmail(auth, actionCode) {
    try {
        await applyActionCode(auth, actionCode);
        await auth.currentUser?.reload();
        return { success: true };
    } catch (error) {
        console.error("Error verificando correo:", error);
        return { success: false, message: error.message };
    }
}