// COMENTADO: Firebase Email Verification Handler - Migration to Supabase
// import { applyActionCode } from "firebase/auth";
//
// export async function handleVerifyEmail(auth, actionCode) {
//     try {
//         await applyActionCode(auth, actionCode);
//         return { success: true };
//     } catch (error) {
//         console.error("Error verificando correo:", error);
//         return { success: false, message: error.message };
//     }
// }

<<<<<<< HEAD
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
=======
// NOTA: Verificación de email ya no requerida - usando Supabase
export async function handleVerifyEmail() {
  console.log("[DEPRECATED] Firebase email verification removed");
  return { success: false, message: "Firebase email verification is disabled" };
}
>>>>>>> feat/vistas-Usuarios
