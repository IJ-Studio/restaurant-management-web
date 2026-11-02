import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Contraetiqueta (DESIGN.md § Signature components): los datos se leen como la contraetiqueta
 * de un vino. Lista de definiciones (`<dl>`) con pares rótulo/valor separados por filetes
 * sutiles, a una o dos columnas (la segunda, desde 768 px).
 *
 * - Rótulo en versalitas (`--texto-etiqueta`, secundario); valor al final.
 * - `tipo: "cifra"` (por defecto): `--texto-cifra-tabla` con cifras tabulares (precios, horas).
 *   `tipo: "texto"`: el mismo tamaño en peso normal (origen, maridaje, mesa).
 * - Los filetes de rótulo y valor quedan siempre a la misma altura, aunque el valor ocupe dos líneas.
 */
export interface ParContraetiqueta {
	rotulo: string;
	valor: ReactNode;
	tipo?: "cifra" | "texto";
}

export interface ContraetiquetaProps {
	pares: ParContraetiqueta[];
	columnas?: 1 | 2;
	/** Sin filete bajo el último par (dentro de una tarjeta que ya cierra). */
	sinFileteFinal?: boolean;
	className?: string;
}

export function Contraetiqueta({ pares, columnas = 1, sinFileteFinal = false, className }: ContraetiquetaProps) {
	return (
		<dl className={cn("contraetiqueta", className)} data-columnas={columnas} data-sin-filete-final={sinFileteFinal || undefined}>
			{pares.map((p) => (
				// Sin envoltorio: `.contraetiqueta > dt/dd` necesita que sean hijos directos.
				<Fragment key={p.rotulo}>
					<dt>{p.rotulo}</dt>
					<dd data-tipo={p.tipo ?? "cifra"}>{p.valor}</dd>
				</Fragment>
			))}
		</dl>
	);
}
