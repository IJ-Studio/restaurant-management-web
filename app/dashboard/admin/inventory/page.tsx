import type { Metadata } from "next";
import { Inventario } from "@/features/dashboard/admin/inventario/Inventario";

export const metadata: Metadata = { title: "Inventario · Administración" };

/** Inventario (PLAN 5.7). La pestaña sale de `?vista=` para que la primera pintura ya sea la correcta. */
export default async function PaginaInventario({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
	const { vista } = await searchParams;
	return <Inventario vistaInicial={vista} />;
}
