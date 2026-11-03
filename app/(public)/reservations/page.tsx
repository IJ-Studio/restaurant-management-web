"use client";

import { Phone } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import ReservationSidebar from "@/components/reservations/ReservationSidebar";
import OnlineOnly from "@/components/pwa/OnlineOnly";
import { restaurantConfig } from "@/config/restaurant.config";

/**
 * Reservar mesa (`/reservations`, PLAN 4.16). La misma página de acción de siempre, con el
 * formulario real (`ReservationSidebar`), que también se abre desde la landing en un panel (D-19).
 * Tras reservar, el propio formulario muestra la confirmación y vuelve al primer paso (antes, el
 * `key` que cambiaba en `onSuccess` lo volvía a montar y la confirmación no llegaba a verse). Sin
 * conexión, la salida es llamar; el
 * teléfono sale de `restaurant.config.ts`.
 */
export default function PaginaReservar() {
	const { contact } = restaurantConfig;
	return (
		<div className="contenedor-pagina max-w-[48rem] pb-(--espacio-entre-secciones)">
			<EncabezadoPublico
				ruta="/reservations"
				titulo="Reservar mesa"
				entradilla="Elige el día, la hora y tu mesa en el plano de la sala. Si lo prefieres, también puedes llamarnos."
			/>
			<div className="rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg) sm:p-(--espacio-xl)">
				<OnlineOnly
					what="el formulario de reservas"
					className="py-0"
					extra={
						<BotonEnlace href={contact.phoneHref} variante="secundario" icono={<Phone />}>
							{`Llamar al ${contact.phone}`}
						</BotonEnlace>
					}
				>
					<ReservationSidebar />
				</OnlineOnly>
			</div>
		</div>
	);
}
