import type { Metadata } from "next";
import { Finanzas } from "@/features/dashboard/admin/finanzas/Finanzas";

export const metadata: Metadata = { title: "Caja y propinas · Administración" };

/** Finanzas (PLAN 5.4). La pestaña sale de `?vista=` para que la primera pintura ya sea la correcta. */
export default async function PaginaFinanzas({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
	const { vista } = await searchParams;
	return <Finanzas vistaInicial={vista} />;
}
