import type { Metadata } from "next";
import { Facturas } from "@/features/dashboard/admin/facturas/Facturas";

export const metadata: Metadata = { title: "Facturas · Administración" };

/** Facturas (PLAN 5.5). */
export default function PaginaFacturas() {
	return <Facturas />;
}
