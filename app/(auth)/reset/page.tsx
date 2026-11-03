import type { Metadata } from "next";
import { RecuperacionNoDisponible } from "@/components/auth/RecuperacionNoDisponible";

export const metadata: Metadata = { title: "Nueva contraseña" };

// El enlace del correo de recuperación llegaba aquí; la funcionalidad sigue desactivada (NP-16, PLAN 4.19).
export default function PaginaNuevaContrasena() {
	return <RecuperacionNoDisponible ruta="/reset" titulo="Nueva contraseña" />;
}
