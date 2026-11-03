import type { Metadata } from "next";
import { Nomina } from "@/features/dashboard/admin/nomina/Nomina";

export const metadata: Metadata = { title: "Nómina · Administración" };

/** Nómina (PLAN 5.6). */
export default function PaginaNomina() {
	return <Nomina />;
}
