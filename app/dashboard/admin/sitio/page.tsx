import type { Metadata } from "next";
import { SitioAdmin } from "@/features/dashboard/admin/sitio/SitioAdmin";

export const metadata: Metadata = { title: "Sitio web · Administración" };

/** Imágenes de la landing y datos de contacto (P1.5). */
export default function PaginaSitioAdmin() {
	return <SitioAdmin />;
}
