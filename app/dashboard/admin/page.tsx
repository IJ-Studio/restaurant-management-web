import type { Metadata } from "next";
import { InicioAdmin } from "@/features/dashboard/admin/inicio/InicioAdmin";
import { verificarSesion } from "@/lib/sesion/dal";

export const metadata: Metadata = { title: "Inicio · Administración" };

/** Inicio de administración (PLAN 5.2). El saludo usa el nombre del DTO de la sesión (2.11). */
export default async function PaginaInicioAdmin() {
	const sesion = await verificarSesion();
	return <InicioAdmin nombre={sesion?.nombre ?? ""} />;
}
