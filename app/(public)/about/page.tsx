import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { MolinoAnimado } from "@/components/marca/MolinoAnimado";
import DistanceToRestaurant from "@/components/pwa/DistanceToRestaurant";
import { restaurantConfig } from "@/config/restaurant.config";

export const metadata: Metadata = {
	title: "Nosotros",
	description: "El Quijote: cocina española de alta gama y carta de vinos en el centro de Huejutla de Reyes.",
};

/**
 * Nosotros (`/about`, PLAN 4.21, D-08 y D-17): la página se conserva con su URL y sus migas.
 *
 * - Textos reescritos (D-17): la propuesta de PRODUCT.md sin afirmaciones que nadie ha confirmado.
 *   Fuera la misión y la visión de plantilla («líder e innovador en la región»).
 * - **Sin las opiniones** del carrusel: eran inventadas (nombres, estrellas y fuentes), y PRODUCT.md
 *   prohíbe inventar testimonios.
 * - **Sin la foto de la fachada de Google** (D-18) ni el mapa incrustado: el mapa se enlaza
 *   (DESIGN.md § Visítanos), así no se cargan terceros sin pedirlos.
 * - Componente de servidor; la distancia al restaurante (geolocalización) es su isla de cliente.
 */
export default function PaginaNosotros() {
	const { contact, hours } = restaurantConfig;
	return (
		<div className="contenedor-pagina pb-(--espacio-entre-secciones)">
			<EncabezadoPublico
				ruta="/about"
				titulo="Una casa con nombre de caballero andante"
				entradilla="Cocina española de alta gama en el centro de Huejutla de Reyes, servida sin prisa."
			/>
			<div className="grid items-center gap-(--espacio-2xl) md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
				<div className="flex max-w-(--ancho-lectura) flex-col gap-(--espacio-md) text-(length:--texto-entradilla) leading-[1.6] text-texto-secundario [text-wrap:pretty]">
					<p className="m-0">
						En El Quijote cocinamos con calma y servimos con cuidado. La carta reúne platos de la tradición española, y la carta de
						vinos está pensada para acompañarlos.
					</p>
					<p className="m-0">Queremos que cada visita sea una sobremesa que apetezca alargar: la mesa bien puesta, el plato a su tiempo y una copa para cada ocasión.</p>
				</div>
				<MolinoAnimado className="mx-auto max-w-[20rem] text-acento md:max-w-[24rem]" />
			</div>

			<section aria-labelledby="visitanos-titulo" className="mt-(--espacio-entre-secciones) grid gap-(--espacio-2xl) border-t border-borde-sutil pt-(--espacio-2xl) md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
				<div className="flex flex-col gap-(--espacio-lg)">
					<h2 id="visitanos-titulo" className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.15]">
						Visítanos
					</h2>
					<Contraetiqueta
						pares={[
							{ rotulo: "Dirección", valor: contact.address, tipo: "texto" },
							{ rotulo: "Horario", valor: hours.display, tipo: "texto" },
							{ rotulo: "Teléfono", valor: <a href={contact.phoneHref} className="enlace-subrayado">{contact.phone}</a> },
						]}
					/>
				</div>
				<div className="flex flex-col items-start gap-(--espacio-md)">
					<BotonEnlace href={contact.googleMaps} target="_blank" rel="noopener noreferrer" variante="secundario" icono={<MapPin />}>
						Cómo llegar<span className="solo-lectores"> (abre el mapa en otra pestaña)</span>
					</BotonEnlace>
					<BotonEnlace href="/reservations" variante="fantasma" icono={<CalendarDays />} className="-ms-3">
						Reservar mesa
					</BotonEnlace>
					<DistanceToRestaurant />
				</div>
			</section>
		</div>
	);
}
