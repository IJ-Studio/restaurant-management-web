import type { Metadata } from "next";
import { CocinaPanel } from "@/features/dashboard/cocina/CocinaPanel";

export const metadata: Metadata = { title: "Cocina" };

/** Panel de cocina (PLAN 5.19). */
export default function PaginaCocina() {
	return <CocinaPanel />;
}
