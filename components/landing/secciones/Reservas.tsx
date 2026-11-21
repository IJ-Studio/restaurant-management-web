import { SelloCasa } from "@/components/marca/SelloCasa";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { restaurantConfig } from "@/config/restaurant.config";
import { ReservarEnPanel } from "./ReservarEnPanel";
import { SeccionLanding } from "./SeccionLanding";

/**
 * «Reservas» (`#reservas`, PLAN 4.7, D-19): banda café con el sello de la casa (una vez por página),
 * el horario y el teléfono de la configuración, y el flujo real de reserva en un panel lateral.
 * `/reservations` sigue existiendo para quien llega por su URL. Se retira el formulario simulado
 * de `ReservationSection`, que confirmaba sin llamar al API.
 * Pulido: todo dentro de un marco de etiqueta centrado, con el ornamento axial sobre el sello.
 */
export function Reservas() {
	const { hours, contact } = restaurantConfig;
	return (
		<SeccionLanding
			id="reservas"
			lote={4}
			edicion="Mesa"
			rotulo="Reservas"
			fondo="cafe"
			alinear="centro"
			titulo="Tu mesa, a tu hora"
			entradilla="Elige el día, la hora y el número de comensales, y escoge tu mesa en el plano de la sala."
		>
			<div className="marco-etiqueta mx-auto w-full max-w-[36rem]">
				<div className="marco-etiqueta__interior esquinas-imprenta flex flex-col items-center gap-(--espacio-lg) px-(--espacio-lg) py-(--espacio-xl) sm:px-(--espacio-2xl)">
					<span aria-hidden="true" className="esquinas-imprenta__cruz" />
					<span aria-hidden="true" className="ornamento-axial">
						<span className="rombo-acento" />
					</span>
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
					</div>
				</div>
			</div>
		</SeccionLanding>
	);
}
