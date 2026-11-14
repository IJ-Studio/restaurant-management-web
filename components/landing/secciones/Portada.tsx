import { CalendarDays, UtensilsCrossed } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Imagen } from "@/components/ui/Imagen";
import { CarruselPortada } from "./CarruselPortada";

/**
 * Portada de la landing (`#inicio`, PLAN 4.3, DESIGN.md § Composición de la landing):
 * fotografía a sangre bajo la cabecera transparente, velo cálido, titular de portada, lema y
 * las dos acciones (reservar y ver la carta, ambas anclas de la propia página, D-19).
 *
 * La foto es de la nube de la casa (D-18). Mide 1584 × 672 y lleva la marca de agua de Gemini
 * abajo a la derecha: se recorta en la entrega (`c_crop` al 90 % desde arriba a la izquierda),
 * sin tocar el recurso, y nunca se amplía (`c_limit`). Su sustitución es NP-33.
 * Es la imagen LCP: `preload` y `fetchPriority="high"`, con `sizes="100vw"`.
 */
const FOTO = "Gemini_Generated_Image_2mv3sr2mv3sr2mv3_uciqpl.png";
const RECORTE = "c_crop,w_0.9,h_0.9,g_north_west";

export function Portada() {
	return (
		<section id="inicio" aria-labelledby="inicio-titulo" className="portada sobre-fotografia" data-portada="">
			<Imagen
				src={FOTO}
				recorte={RECORTE}
				decorativa
				fill
				preload
				fetchPriority="high"
				sizes="100vw"
				className="portada__foto object-cover object-[62%_center]"
			/>
			{/* P1.5: las fotos del administrador se funden encima al llegar del API. */}
			<CarruselPortada />
			<span aria-hidden="true" className="portada__velo" />
			<div className="contenedor-pagina flex flex-col items-start gap-(--espacio-lg)">
				<h1
					id="inicio-titulo"
					className="m-0 max-w-[14ch] font-titulos text-(length:--texto-portada) font-[380] leading-[1.02] text-texto-principal [font-variation-settings:'SOFT'_30] [text-wrap:balance]"
				>
					Cocina mexicana con alma
				</h1>
				<p className="m-0 max-w-[44ch] text-(length:--texto-entradilla) leading-[1.6] text-texto-principal [text-wrap:pretty]">
					Comida mexicana en el centro de Huejutla, servida a su tiempo. Sabor con alma, sin prisa.
				</p>
				<div className="flex w-full flex-col gap-3 pt-(--espacio-xs) sm:w-auto sm:flex-row">
					<BotonEnlace href="#reservas" variante="primario" icono={<CalendarDays />}>
						Reservar mesa
					</BotonEnlace>
					<BotonEnlace href="#menu" variante="secundario" icono={<UtensilsCrossed />}>
						Ver la carta
					</BotonEnlace>
				</div>
			</div>
		</section>
	);
}
