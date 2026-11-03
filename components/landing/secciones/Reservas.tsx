import { SelloCasa } from "@/components/marca/SelloCasa";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { restaurantConfig } from "@/config/restaurant.config";
import { ReservarEnPanel } from "./ReservarEnPanel";
import { SeccionLanding } from "./SeccionLanding";

/**
 * «Reservas» (`#reservas`, PLAN 4.7, D-19): banda café con el sello de la casa (una vez por página),
 * el horario y el teléfono de la configuración, y el flujo real de reserva en un panel lateral.
 * `/reservations` sigue existiendo para quien llega por su URL. Se retira el formulario simulado
 * de `ReservationSection`, que confirmaba sin llamar al API.
 */
export function Reservas() {
	const { hours, contact } = restaurantConfig;
	return (
		<SeccionLanding
			id="reservas"
			lote={4}
			rotulo="Reservas"
			fondo="cafe"
			alinear="centro"
			titulo="Tu mesa, a tu hora"
			entradilla="Elige el día, la hora y el número de comensales, y escoge tu mesa en el plano de la sala."
		>
			<div className="mx-auto flex w-full max-w-[32rem] flex-col items-center gap-(--espacio-xl)">
				<SelloCasa className="text-texto-principal" />
				<Contraetiqueta
					className="w-full"
					sinFileteFinal
					pares={[
						{ rotulo: "Horario", valor: hours.display, tipo: "texto" },
						{ rotulo: "Teléfono", valor: <a href={contact.phoneHref} className="enlace-subrayado">{contact.phone}</a> },
					]}
				/>
				<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<ReservarEnPanel telefono={contact.phone} telefonoHref={contact.phoneHref} />
					<BotonEnlace href="/reservations" variante="fantasma">
						Abrir en su propia página
					</BotonEnlace>
				</div>
			</div>
		</SeccionLanding>
	);
}
