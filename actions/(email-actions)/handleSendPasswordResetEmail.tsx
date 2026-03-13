// COMENTADO: Firebase Password Reset Email Handler - Migration to Supabase
// import { sendPasswordResetEmail } from 'firebase/auth';
//
// export async function handleSendEmail(auth, correo) {
//     try {
//         const actionCodeSettings = {
//             url: 'https://restaurant-management-platform-4tfe.vercel.app/reset',
//             handleCodeInApp: true,
//         };
//         await sendPasswordResetEmail(auth, correo, actionCodeSettings);
//         console.log(">> Correo enviado con éxito");
//         return { success: true, message: "Se ha enviado un enlace de recuperación a tu correo electrónico" };
//     } catch (error: any) {
//         console.error(">> Error en handleSendEmail:", error);
//         return { success: false, message: error.message || 'No se pudo enviar el correo. Verifica la dirección o inténtalo más tarde.' };
//     }
// }

// NOTA: Envío de correo de reset manejado por Supabase
export async function handleSendEmail() {
  console.log(
    "[DEPRECATED] Firebase send email removed - use Supabase instead",
  );
  return { success: false, message: "Firebase send email is disabled" };
}
