import type { Metadata } from "next";
import { InicioAdmin } from "@/features/dashboard/admin/inicio/InicioAdmin";

export const metadata: Metadata = { title: "Inicio · Administración" };

/** Inicio de administración (PLAN 5.2, D-27). El panel abierto sale de `?panel=` para pintar ya el correcto. */
export default async function PaginaInicioAdmin({ searchParams }: { searchParams: Promise<{ panel?: string }> }) {
	const { panel } = await searchParams;
	return <InicioAdmin panelInicial={panel} />;
}
