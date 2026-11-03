import type { Metadata } from "next";
import { AjustesAdmin } from "@/features/dashboard/admin/ajustes/AjustesAdmin";

export const metadata: Metadata = { title: "Ajustes · Administración" };

/** Ajustes (PLAN 5.14, D-12). */
export default function PaginaAjustes() {
	return <AjustesAdmin />;
}
