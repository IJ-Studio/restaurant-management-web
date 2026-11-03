import type { Metadata } from "next";
import { CalendarDays, MapPin, UtensilsCrossed } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { SeccionLanding } from "@/components/landing/secciones/SeccionLanding";
import { ReintentarSeccion } from "@/components/landing/secciones/ReintentarSeccion";
import { obtenerCarta, obtenerPromociones } from "@/lib/publico/datos-landing";
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
	const llamar = (
		<BotonEnlace href={contact.phoneHref} variante="fantasma">
			Llamar al restaurante
		</BotonEnlace>
	);

	return (
		<>
			<section id="inicio" aria-labelledby="inicio-titulo" className="seccion-landing">
				<div className="contenedor-pagina flex flex-col items-start gap-(--espacio-lg)">
					<h1 id="inicio-titulo" className="m-0 max-w-[16ch] font-titulos text-(length:--texto-portada) font-[380] leading-[1.02] [text-wrap:balance]">
						Cocina española con alma
					</h1>
					<p className="m-0 max-w-[48ch] text-(length:--texto-entradilla) leading-[1.6] text-texto-secundario [text-wrap:pretty]">
						Mesa de alta gama y carta de vinos en el centro de Huejutla. Sabor con alma, sin prisa.
					</p>
					<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
						<BotonEnlace href="#reservas" variante="primario" icono={<CalendarDays />}>
							Reservar mesa
						</BotonEnlace>
						<BotonEnlace href="#menu" variante="secundario" icono={<UtensilsCrossed />}>
							Ver la carta
						</BotonEnlace>
					</div>
				</div>
			</section>

			<SeccionLanding
				id="nosotros"
				lote={1}
				rotulo="Nosotros"
				fondo="cafe"
				titulo="Una casa con nombre de caballero andante"
				entradilla="En El Quijote la cocina española se sirve sin prisa: técnica precisa, platos de la casa y una carta de vinos pensada para acompañarlos."
			>
				<div>
					<BotonEnlace href="/about" variante="secundario">
						Conoce la casa
					</BotonEnlace>
				</div>
			</SeccionLanding>

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
