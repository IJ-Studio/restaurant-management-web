import type { Metadata } from "next";
import { Prediccion } from "@/features/dashboard/admin/prediccion/Prediccion";

export const metadata: Metadata = { title: "Predicción de demanda · Administración" };

/** Predicción de demanda (PLAN 5.12). */
export default function PaginaPrediccion() {
	return <Prediccion />;
}
