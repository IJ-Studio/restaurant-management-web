import type { Metadata } from "next";
import { ReservasAdmin } from "@/features/dashboard/admin/reservas/ReservasAdmin";

export const metadata: Metadata = { title: "Reservas · Administración" };

/** Reservas en administración (PLAN 5.11). */
export default function PaginaReservasAdmin() {
	return <ReservasAdmin />;
}
