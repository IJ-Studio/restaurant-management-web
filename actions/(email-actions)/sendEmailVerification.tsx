import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export async function registerWithEmail(nombre, apellido, correo, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
    await sendEmailVerification(userCredential.user, {
        url: "https://restaurant-management-platform-4tfe.vercel.app/login"
    });
    return userCredential.user;
}