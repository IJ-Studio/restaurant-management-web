// COMENTADO: Firebase Email Verification - Migration to Supabase
// 'use client';
//
// import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// import { auth } from "@/lib/firebaseConfig";
//
// export async function registerWithEmail(nombre, apellido, correo, password) {
//     const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
//     await sendEmailVerification(userCredential.user, {
//         url: "https://restaurant-management-platform-4tfe.vercel.app/login"
//     });
//     return userCredential.user;
// }

// NOTA: El registro ahora usa API route /api/auth/register con Supabase + Drizzle
export async function registerWithEmail() {
  console.log(
    "[DEPRECATED] Firebase email verification removed - use /api/auth/register instead",
  );
  return null;
}
