import type { Metadata } from "next";
import { MeseroPanel } from "@/features/dashboard/mesero/MeseroPanel";

export const metadata: Metadata = { title: "Sala" };

/** Panel del mesero (PLAN 5.18). */
export default function PaginaMesero() {
	return <MeseroPanel />;
}
