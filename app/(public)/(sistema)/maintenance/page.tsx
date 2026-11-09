import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";
import { restaurantConfig } from "@/config/restaurant.config";

export const metadata: Metadata = { title: "En preparación", robots: { index: false, follow: false } };

// Mantenimiento (PLAN 4.23, D-21): la mesa a medio preparar y el reloj de arena; la salida es llamar.
export default function PaginaMantenimiento() {
	const { contact } = restaurantConfig;
	return (
		<PaginaEstado
			{...TEXTOS_ESTADO.mantenimiento}
			acciones={
				<BotonEnlace href={contact.phoneHref} variante="primario" icono={<Phone />}>
					{`Llamar al ${contact.phone}`}
				</BotonEnlace>
			}
		/>
	);
}
