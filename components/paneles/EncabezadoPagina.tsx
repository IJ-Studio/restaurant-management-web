import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Encabezado de una página de panel (PLAN 3.13): el `h1`, una descripción opcional y las acciones
 * de la página (como mucho una primaria). En móvil las acciones pasan debajo del título y ocupan
 * todo el ancho; desde 768 px van a la derecha.
 *
 * El título usa `--texto-titulo-1` (Fraunces), el del `h1` de página en la jerarquía de DESIGN.md.
 */
export interface EncabezadoPaginaProps {
	titulo: ReactNode;
	descripcion?: ReactNode;
	/** Botones de la página; el primario, al final. */
	acciones?: ReactNode;
	/** Encima del título: migas o el periodo («Semana del 27 de octubre»). */
	antetitulo?: ReactNode;
	className?: string;
}

export function EncabezadoPagina({ titulo, descripcion, acciones, antetitulo, className }: EncabezadoPaginaProps) {
	return (
		<header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8", className)}>
			<div className="flex min-w-0 flex-col gap-2">
				{antetitulo && <div className="text-(length:--texto-pequeno) text-texto-secundario">{antetitulo}</div>}
				<h1 className="m-0 font-titulos text-(length:--texto-titulo-1) font-normal leading-[1.08] text-texto-principal [text-wrap:balance]">
					{titulo}
				</h1>
				{descripcion && (
					<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-cuerpo) leading-[1.5] text-texto-secundario [text-wrap:pretty]">
						{descripcion}
					</p>
				)}
			</div>
			{acciones && <div className="flex flex-col-reverse gap-3 max-md:[&>*]:w-full md:shrink-0 md:flex-row md:flex-wrap md:items-center md:justify-end">{acciones}</div>}
		</header>
	);
}
