import { CalendarDays, UtensilsCrossed } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Imagen } from "@/components/ui/Imagen";
import { restaurantConfig } from "@/config/restaurant.config";
import { CarruselPortada } from "./CarruselPortada";
import { TelefonoSitio } from "./ContactoSitio";
import { TextoSitio } from "./TextoSitio";

/**
 * Portada de la landing (`#inicio`, PLAN 4.3, DESIGN.md § Composición de la landing):
 * fotografía a sangre bajo la cabecera transparente, velo cálido, titular de portada, lema y
 * las dos acciones (reservar y ver la carta, ambas anclas de la propia página, D-19).
 * Pulido (Etiqueta Clásica de Reserva): marco perimetral fino con marcas de imprenta, bloque axial
 * centrado con cartela y filete doble, y pie tabular con los datos reales de la casa.
 *
 * La foto es de la nube de la casa (D-18). Mide 1584 × 672 y lleva la marca de agua de Gemini
 * abajo a la derecha: se recorta en la entrega (`c_crop` al 90 % desde arriba a la izquierda),
 * sin tocar el recurso, y nunca se amplía (`c_limit`). Su sustitución es NP-33.
 * Es la imagen LCP: `preload` y `fetchPriority="high"`, con `sizes="100vw"`.
 */
const FOTO = "Gemini_Generated_Image_2mv3sr2mv3sr2mv3_uciqpl.png";
const RECORTE = "c_crop,w_0.9,h_0.9,g_north_west";

// Datos reales de la configuración: la dirección hasta la colonia, y la ciudad con su estado.
const UBICACION = restaurantConfig.contact.address.split(", ").slice(0, 2).join(", ");
const CIUDAD = "Huejutla de Reyes · Hidalgo";

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
			{/* Marco perimetral de etiqueta de gran formato, con marcas de imprenta en las cuatro esquinas. */}
			<span aria-hidden="true" className="portada__marco esquinas-imprenta">
				<span className="esquinas-imprenta__cruz" />
			</span>
			<div className="contenedor-pagina flex flex-1 flex-col justify-between gap-(--espacio-2xl) self-stretch">
				<div className="mx-auto my-auto flex flex-col items-center gap-(--espacio-lg) text-center">
					<p className="cartela-metadato m-0">
						<span aria-hidden="true" className="rombo-acento" />
						{CIUDAD}
						<span aria-hidden="true" className="rombo-acento" />
					</p>
					<h1
						id="inicio-titulo"
						className="m-0 max-w-[16ch] font-titulos text-(length:--texto-portada) font-[380] leading-[1.02] tracking-[-0.015em] text-texto-principal [font-variation-settings:'SOFT'_30] [text-wrap:balance]"
					>
						<TextoSitio campo="titulo" porDefecto="Cocina mexicana con alma" />
					</h1>
					<span aria-hidden="true" className="filete-doble" />
					<p className="m-0 max-w-[48ch] text-(length:--texto-entradilla) leading-[1.6] text-texto-principal [text-wrap:pretty]">
						<TextoSitio campo="subtitulo" porDefecto="Comida mexicana en el centro de Huejutla, servida a su tiempo. Sabor con alma, sin prisa." />
					</p>
					<div className="flex w-full flex-col justify-center gap-3 pt-(--espacio-xs) sm:w-auto sm:flex-row">
						<BotonEnlace href="#reservas" variante="primario" icono={<CalendarDays />}>
							Reservar mesa
						</BotonEnlace>
						<BotonEnlace href="#menu" variante="secundario" icono={<UtensilsCrossed />} className="bg-[color-mix(in_oklab,var(--color-superficie-cartela)_60%,transparent)]">
							Ver la carta
						</BotonEnlace>
					</div>
				</div>
				{/* Pie tabular: solo datos reales (dirección y horario de la configuración, teléfono editable). */}
				<dl className="pie-portada-tabular m-0 w-full" data-prueba="pie-portada">
					<div>
						<dt className="texto-rotulo text-acento">Ubicación</dt>
						<dd className="m-0 mt-1 text-(length:--texto-pequeno) text-texto-principal">{UBICACION}</dd>
					</div>
					<div>
						<dt className="texto-rotulo text-acento">Servicio</dt>
						<dd className="m-0 mt-1 text-(length:--texto-pequeno) text-texto-principal">{restaurantConfig.hours.display}</dd>
					</div>
					<div>
						<dt className="texto-rotulo text-acento">Teléfono</dt>
						<dd className="m-0 mt-1 text-(length:--texto-pequeno) text-texto-principal numeros-tabulares">
							<TelefonoSitio porDefecto={restaurantConfig.contact.phone} />
						</dd>
					</div>
				</dl>
			</div>
		</section>
	);
}
