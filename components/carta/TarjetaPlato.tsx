import Link from "next/link";
import { Imagen } from "@/components/ui/Imagen";
import { Insignia } from "@/components/ui/Insignia";
import { formatearPrecio } from "@/lib/formato/precio";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de un plato de la carta (PLAN 4.11): foto (o el respaldo), nombre en Fraunces,
 * descripción y precio tabular. La tarjeta entera lleva al detalle con el patrón de `Tarjeta`
 * (el enlace es el título y se extiende a toda la caja; el foco rodea la tarjeta). Agotado: con
 * la insignia y el motivo escrito, nunca solo atenuada.
 * Pulido: contraetiqueta de reserva, con «Partida 01…» (decorativo, numeración de lo que se ve),
 * lámina 4:3 y el precio en una cartela.
 */
export interface TarjetaPlatoProps {
	id: string | number;
	nombre: string;
	descripcion?: string;
	precio: number | null;
	imagen?: string;
	disponible?: boolean;
	nivelTitulo?: 2 | 3;
	/** Tamaños de la foto según la rejilla en la que va. */
	sizes?: string;
	/** Número de partida decorativo (posición en la lista que se muestra). */
	partida?: number;
	/** Rótulo junto a la partida (la sección real del plato). */
	seccion?: string;
}

export function TarjetaPlato({
	id,
	nombre,
	descripcion,
	precio,
	imagen,
	disponible = true,
	nivelTitulo = 2,
	sizes = "(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw",
	partida,
	seccion,
}: TarjetaPlatoProps) {
	const Titulo = `h${nivelTitulo}` as const;
	const cifra = formatearPrecio(precio);
	return (
		<article
			className={cn(
				"zocalo-interactivo group relative flex h-full flex-col gap-(--espacio-md) p-(--espacio-md) text-texto-principal",
				// Pulsado: la tarjeta cede un poco (transform, 100 ms); sin movimiento si se reduce.
				"active:scale-[0.985] motion-reduce:active:scale-100 in-data-[movimiento=reducido]:active:scale-100",
				"has-[.enlace-tarjeta:focus-visible]:outline-2 has-[.enlace-tarjeta:focus-visible]:outline-offset-3 has-[.enlace-tarjeta:focus-visible]:outline-solid has-[.enlace-tarjeta:focus-visible]:outline-foco",
			)}
		>
			{(partida !== undefined || seccion) && (
				<div aria-hidden="true" className="flex items-baseline justify-between gap-(--espacio-sm) border-b border-borde-sutil pb-(--espacio-xs)">
					{partida !== undefined && <span className="numero-lote shrink-0">Partida {String(partida).padStart(2, "0")}</span>}
					{seccion && <span className="texto-rotulo truncate text-texto-tenue">{seccion}</span>}
				</div>
			)}
			<div className="lamina-fotografia aspect-[4/3]">
				<Imagen src={imagen} alt={nombre} fill sizes={sizes} className="object-cover motion-reduce:transition-none" />
			</div>
			<div className="flex flex-1 flex-col gap-(--espacio-sm)">
				<Titulo className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.2] [text-wrap:balance]">
					<Link
						href={`/menu/producto/${id}`}
						className="enlace-tarjeta text-inherit no-underline focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
					>
						{nombre}
					</Link>
				</Titulo>
				{descripcion && <p className="m-0 line-clamp-3 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{descripcion}</p>}
				{(cifra || !disponible) && (
					<div className="mt-auto flex items-center justify-between gap-3 rounded-control border border-borde-acento bg-superficie-cartela px-(--espacio-sm) py-(--espacio-xs)">
						{!disponible ? <Insignia tono="aviso">Agotado</Insignia> : <span className="texto-rotulo text-texto-secundario">Precio</span>}
						{cifra && <span className="font-titulos text-(length:--texto-titulo-interfaz) text-acento numeros-tabulares">{cifra}</span>}
					</div>
				)}
			</div>
		</article>
	);
}
