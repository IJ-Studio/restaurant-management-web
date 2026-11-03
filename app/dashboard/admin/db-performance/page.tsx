import type { Metadata } from "next";
import { SaludSistema } from "@/features/dashboard/admin/salud/SaludSistema";

export const metadata: Metadata = { title: "Salud del sistema · Administración" };

/** Salud del sistema (PLAN 5.16, NP-24). */
export default function PaginaSaludSistema() {
	return <SaludSistema />;
}
