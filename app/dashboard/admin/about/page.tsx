import type { Metadata } from "next";
import { AcercaAdmin } from "@/features/dashboard/admin/acerca/AcercaAdmin";

export const metadata: Metadata = { title: "Acerca del restaurante · Administración" };

/** Acerca del restaurante en el panel (PLAN 5.15). */
export default function PaginaAcercaAdmin() {
	return <AcercaAdmin />;
}
