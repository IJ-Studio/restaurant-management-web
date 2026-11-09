import type { Metadata } from "next";
import { RecuperacionNoDisponible } from "@/components/auth/RecuperacionNoDisponible";

export const metadata: Metadata = { title: "Recuperar contraseña" };

// La recuperación por correo sigue desactivada (NP-16): aviso en español con salidas reales (PLAN 4.19).
export default function PaginaRecuperar() {
	return <RecuperacionNoDisponible ruta="/frm_reset" titulo="Recuperar contraseña" />;
}
