import type { Metadata } from "next";
import { CartaAdmin } from "@/features/dashboard/admin/carta/CartaAdmin";

export const metadata: Metadata = { title: "Carta · Administración" };

/** Carta en administración (PLAN 5.9). */
export default function PaginaCartaAdmin() {
	return <CartaAdmin />;
}
