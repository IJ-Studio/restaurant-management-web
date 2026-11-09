import type { Metadata } from "next";
import { Proveedores } from "@/features/dashboard/admin/proveedores/Proveedores";

export const metadata: Metadata = { title: "Proveedores · Administración" };

/** Proveedores (PLAN 5.8). La pestaña sale de `?vista=` para que la primera pintura ya sea la correcta. */
export default async function PaginaProveedores({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
	const { vista } = await searchParams;
	return <Proveedores vistaInicial={vista} />;
}
