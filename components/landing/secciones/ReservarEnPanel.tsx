"use client";

import dynamic from "next/dynamic";
import { CalendarDays, Phone } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { PanelLateral } from "@/components/ui/Dialogo";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import OnlineOnly from "@/components/pwa/OnlineOnly";

// El flujo real de reserva, sin cambiar su lógica ni su payload (D-19). Se carga al abrir el panel:
// la landing no lo descarga si nadie reserva. Mientras llega, el cargador de marca (D-20).
const FormularioReserva = dynamic(() => import("@/components/reservations/ReservationSidebar"), {
	ssr: false,
	loading: () => <CargadorMarca texto="Preparando tu reserva…" className="py-16" />,
});

/**
 * «Reservar mesa» de la landing (PLAN 4.7, D-19): abre `ReservationSidebar` en un `PanelLateral`
 * amplio dentro de la misma página. Tras reservar, el formulario muestra la confirmación y vuelve
 * al primer paso. Sin conexión, la salida es llamar.
 */
export function ReservarEnPanel({ telefono, telefonoHref }: { telefono: string; telefonoHref: string }) {
	return (
		<PanelLateral
			ancho="amplio"
			titulo="Reservar mesa"
			descripcion="Elige el día, la hora y tu mesa en el plano de la sala."
			disparador={
				<Boton variante="primario" icono={<CalendarDays />} data-prueba="abrir-reserva">
					Reservar mesa
				</Boton>
			}
		>
			<OnlineOnly
				what="el formulario de reservaciones"
				extra={
					<BotonEnlace href={telefonoHref} variante="secundario" icono={<Phone />}>
						{`Llamar al ${telefono}`}
					</BotonEnlace>
				}
			>
				<FormularioReserva />
			</OnlineOnly>
		</PanelLateral>
	);
}
