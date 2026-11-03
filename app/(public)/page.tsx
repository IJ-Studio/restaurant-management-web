import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Nosotros } from "@/components/landing/secciones/Nosotros";
import { Portada } from "@/components/landing/secciones/Portada";
import { SeccionLanding } from "@/components/landing/secciones/SeccionLanding";
import { ReintentarSeccion } from "@/components/landing/secciones/ReintentarSeccion";
import { obtenerCarta, obtenerPromociones } from "@/lib/publico/datos-landing";
import { seleccionarPlatos } from "@/lib/publico/seleccion-platos";
import { restaurantConfig } from "@/config/restaurant.config";

// Metadatos de la portada (D-17): la propuesta de PRODUCT.md, sin datos que no estén en la configuración.
export const metadata: Metadata = {
	title: { absolute: `${restaurantConfig.name} · Cocina española de alta gama` },
	description: "Cocina española de alta gama y carta de vinos en el centro de Huejutla de Reyes. Consulta la carta, las promociones vigentes y reserva tu mesa.",
};

/**
 * Landing de una sola página (PLAN 4.2, D-19). Componente de servidor: pide la carta y las
 * promociones en paralelo y sin caché, y cada sección muestra su parte real o su error cálido.
 * Las anclas son las de `SECCIONES_LANDING`; la sección activa la marca la cabecera.
 */
export default async function Inicio() {
	const [carta, promociones] = await Promise.all([obtenerCarta(), obtenerPromociones()]);
	const { contact } = restaurantConfig;
	const seleccion = seleccionarPlatos(carta.estado === "ok" ? carta.datos : []);
	const llamar = (
		<BotonEnlace href={contact.phoneHref} variante="fantasma">
			Llamar al restaurante
		</BotonEnlace>
	);

	return (
		<>
			<Portada />

			<Nosotros galeria={seleccion.galeria} />

			<SeccionLanding id="menu" lote={2} rotulo="Menú" titulo="Platos de la casa" entradilla="Una selección de la carta. El resto te espera en la carta completa.">
				{carta.estado === "error" ? (
					<ReintentarSeccion titulo="No pudimos traer la carta" descripcion="A veces tarda un poco más de la cuenta. Vuelve a intentarlo o llámanos." accion={llamar} />
				) : null}
				<div>
					<BotonEnlace href="/menu" variante="secundario">
						Ver la carta completa
					</BotonEnlace>
				</div>
			</SeccionLanding>

			<SeccionLanding id="promociones" lote={3} rotulo="Promociones" fondo="cafe" titulo="Para esta temporada" entradilla="Las propuestas vigentes de la casa.">
				{promociones.estado === "error" ? (
					<ReintentarSeccion titulo="No pudimos traer las promociones" descripcion="Vuelve a intentarlo en un momento." />
				) : null}
			</SeccionLanding>

			<SeccionLanding
				id="reservas"
				lote={4}
				rotulo="Reservas"
				titulo="Tu mesa, a tu hora"
				entradilla="Elige el día, la hora y el número de comensales, y escoge tu mesa en el plano de la sala."
			>
				<div>
					<BotonEnlace href="/reservations" variante="primario" icono={<CalendarDays />}>
						Reservar mesa
					</BotonEnlace>
				</div>
			</SeccionLanding>

			<SeccionLanding id="pedir" lote={5} rotulo="Pedir" fondo="cafe" titulo="Pide en tu mesa o en tu casa" entradilla="Elige desde la carta y paga en línea." />

			<SeccionLanding id="visitanos" lote={6} rotulo="Visítanos" titulo="Te esperamos" entradilla={contact.address}>
				<div>
					<BotonEnlace href={contact.googleMaps} variante="secundario" icono={<MapPin />} target="_blank" rel="noopener noreferrer">
						Cómo llegar
					</BotonEnlace>
				</div>
			</SeccionLanding>
		</>
	);
}
