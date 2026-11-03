import type { Metadata } from "next";
import { Reportes } from "@/features/dashboard/admin/reportes/Reportes";

export const metadata: Metadata = { title: "Reportes · Administración" };

/** Reportes (PLAN 5.3). La vista sale de `?vista=` para que la primera pintura ya sea la correcta. */
export default async function PaginaReportes({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
	const { vista } = await searchParams;
	return <Reportes vistaInicial={vista} />;
}
