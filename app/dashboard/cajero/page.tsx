import type { Metadata } from "next";
import { CajaPanel } from "@/features/dashboard/cajero/CajaPanel";

export const metadata: Metadata = { title: "Caja" };

/** Panel de caja (PLAN 5.17). */
export default function PaginaCaja() {
	return <CajaPanel />;
}
