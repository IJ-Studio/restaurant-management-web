import type { ReactNode } from "react";
import { EtiquetaSeccion } from "@/components/marca/EtiquetaSeccion";
import { cn } from "@/lib/utils";

/**
 * Sección de la landing (DESIGN.md § Composición de la landing, D-19): ancla con margen para la
 * cabecera fija, alternancia de fondo (`fondo` o banda `cafe`) y la etiqueta de sección con su
 * número de lote. El título es el nombre accesible de la sección.
 */
export interface SeccionLandingProps {
	id: string;
	lote: number;
	rotulo: string;
	titulo: ReactNode;
	entradilla?: ReactNode;
	fondo?: "fondo" | "cafe";
	alinear?: "inicio" | "centro";
	children?: ReactNode;
	className?: string;
}

export function SeccionLanding({ id, lote, rotulo, titulo, entradilla, fondo = "fondo", alinear = "inicio", children, className }: SeccionLandingProps) {
	return (
		<section id={id} aria-labelledby={`${id}-titulo`} className={cn("seccion-landing", fondo === "cafe" && "bg-superficie-cafe", className)}>
			<div className="contenedor-pagina flex flex-col gap-(--espacio-2xl)">
				<EtiquetaSeccion lote={lote} rotulo={rotulo} titulo={titulo} entradilla={entradilla} idTitulo={`${id}-titulo`} alinear={alinear} />
				{children}
			</div>
		</section>
	);
}
