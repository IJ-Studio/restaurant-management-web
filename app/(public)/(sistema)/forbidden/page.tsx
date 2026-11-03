import type { Metadata } from "next";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";

export const metadata: Metadata = { title: "Sin acceso", robots: { index: false, follow: false } };

// 403 (PLAN 4.23, D-21): la puerta de la bodega con candado. Las salidas son las de siempre: el panel y el inicio.
export default function PaginaProhibido() {
	return (
		<PaginaEstado
			{...TEXTOS_ESTADO.prohibido}
			acciones={
				<>
					<BotonEnlace href="/dashboard" variante="primario" icono={<LayoutDashboard />}>
						Ir a tu panel
					</BotonEnlace>
					<BotonEnlace href="/" variante="secundario" icono={<ArrowLeft />}>
						Volver al inicio
					</BotonEnlace>
				</>
			}
		/>
	);
}
