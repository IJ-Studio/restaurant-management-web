import { redirect } from "next/navigation";
import { MarcoPanel } from "@/components/paneles/MarcoPanel";
import { verificarSesion } from "@/lib/sesion/dal";

// Datos privados: siempre se renderiza por petición, nunca se guarda (PLAN 2.6).
export const dynamic = "force-dynamic";

/**
 * Layout de los paneles (PLAN 5.1). El DTO mínimo de la DAL (PLAN 2.11) da el rol, que decide la
 * navegación, y el nombre, que pinta la cuenta de la barra superior.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const sesion = await verificarSesion();
	if (!sesion) redirect("/login");

	return (
		<MarcoPanel rol={sesion.rol} nombre={sesion.nombre} apellidos={sesion.apellidos}>
			{children}
		</MarcoPanel>
	);
}
