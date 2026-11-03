import type { Metadata } from "next";
import { PromocionesAdmin } from "@/features/dashboard/admin/promociones/PromocionesAdmin";

export const metadata: Metadata = { title: "Promociones · Administración" };

/** Promociones en administración (PLAN 5.10). */
export default function PaginaPromocionesAdmin() {
	return <PromocionesAdmin />;
}
