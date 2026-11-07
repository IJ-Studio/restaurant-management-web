import type { Metadata } from "next";
import { MesasAdmin } from "@/features/dashboard/admin/mesas/MesasAdmin";

export const metadata: Metadata = { title: "Mesas · Administración" };

/** Mesas del salón en administración (Prioridad 1.3). */
export default function PaginaMesasAdmin() {
	return <MesasAdmin />;
}
