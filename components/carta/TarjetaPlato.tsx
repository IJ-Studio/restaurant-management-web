import Link from "next/link";
import { Imagen } from "@/components/ui/Imagen";
import { Insignia } from "@/components/ui/Insignia";
import { formatearPrecio } from "@/lib/formato/precio";
import { cn } from "@/lib/utils";

/**
 * Tarjeta de un plato de la carta (PLAN 4.11): foto 4:5 (o el respaldo), nombre en Fraunces,
 * descripción y precio tabular. La tarjeta entera lleva al detalle con el patrón de `Tarjeta`
 * (el enlace es el título y se extiende a toda la caja; el foco rodea la tarjeta). Agotado: con
 * la insignia y el motivo escrito, nunca solo atenuada.
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
}

export function TarjetaPlato({ id, nombre, descripcion, precio, imagen, disponible = true, nivelTitulo = 2, sizes = "(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw" }: TarjetaPlatoProps) {
	const Titulo = `h${nivelTitulo}` as const;
	const cifra = formatearPrecio(precio);
	return (
		<article
			className={cn(
				"relative flex h-full flex-col overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie text-texto-principal",
				"transition-[background-color,border-color] duration-(--duracion-breve) ease-estandar al-pasar:border-borde-control al-pasar:bg-superficie-elevada",
				"has-[.enlace-tarjeta:focus-visible]:outline-2 has-[.enlace-tarjeta:focus-visible]:outline-offset-3 has-[.enlace-tarjeta:focus-visible]:outline-solid has-[.enlace-tarjeta:focus-visible]:outline-foco",
			)}
		>
			<div className="relative aspect-[4/5] border-b border-borde-sutil bg-superficie">
				<Imagen src={imagen} alt={nombre} fill sizes={sizes} className="object-cover" />
			</div>
			<div className="flex flex-1 flex-col gap-(--espacio-sm) p-(--espacio-lg)">
				<div className="flex items-start justify-between gap-3">
					<Titulo className="m-0 font-titulos text-(length:--texto-titulo-3) font-medium leading-[1.2] [text-wrap:balance]">
						<Link
							href={`/menu/producto/${id}`}
							className="enlace-tarjeta text-inherit no-underline focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
						>
							{nombre}
						</Link>
					</Titulo>
					{cifra && <span className="shrink-0 pt-1 text-(length:--texto-cifra-tabla) font-medium numeros-tabulares">{cifra}</span>}
				</div>
				{descripcion && <p className="m-0 line-clamp-3 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{descripcion}</p>}
				{!disponible && (
					<div className="mt-auto pt-(--espacio-xs)">
						<Insignia tono="aviso">Agotado</Insignia>
					</div>
				)}
			</div>
		</article>
	);
}
