import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Etiqueta de sección (DESIGN.md § Signature components): el sello de identidad que abre cada
 * sección de la landing, como una etiqueta clásica de la casa. De arriba abajo: número de lote
 * («Nº 03», Fraunces itálica en acento), rótulo en versalitas espaciadas, filete doble de acento
 * de 3rem, título y entradilla opcional.
 *
 * El número de lote es ornamental y va oculto a los lectores; el rótulo y el título sí se leen.
 * El título lleva `id` para que la sección lo use en `aria-labelledby`.
 */
export interface EtiquetaSeccionProps {
	/** Número de lote: 3 se escribe «Nº 03». */
	lote?: number;
	rotulo: string;
	titulo: ReactNode;
	entradilla?: ReactNode;
	/** `id` del título, para `<section aria-labelledby>`. */
	idTitulo?: string;
	nivel?: 1 | 2 | 3;
	alinear?: "inicio" | "centro";
	className?: string;
}

export function EtiquetaSeccion({
	lote,
	rotulo,
	titulo,
	entradilla,
	idTitulo,
	nivel = 2,
	alinear = "inicio",
	className,
}: EtiquetaSeccionProps) {
	const Titulo = `h${nivel}` as const;
	return (
		<header className={cn("etiqueta-seccion", alinear === "centro" && "justify-items-center text-center", className)}>
			{lote !== undefined && (
				<span aria-hidden="true" className="font-titulos text-(length:--texto-numero-lote) leading-none text-acento italic">
					Nº {String(lote).padStart(2, "0")}
				</span>
			)}
			<p className="m-0 font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] text-texto-secundario">
				{rotulo}
			</p>
			<span aria-hidden="true" className="filete-doble" />
			<Titulo
				id={idTitulo}
				className="m-0 max-w-[24ch] font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.15] text-texto-principal [text-wrap:balance]"
			>
				{titulo}
			</Titulo>
			{entradilla && (
				<p className="m-0 max-w-[60ch] text-(length:--texto-entradilla) leading-[1.6] text-texto-secundario [text-wrap:pretty]">
					{entradilla}
				</p>
			)}
		</header>
	);
}
