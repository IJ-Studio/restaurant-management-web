import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EncabezadoPagina } from "./EncabezadoPagina";

/**
 * Plantilla única de panel (PLAN-AMPLIACION D-28): el mismo orden en todas las pantallas de
 * administración y operación, para que el personal sepa dónde mirar.
 *
 * 1. Migas (solo en las pantallas que cuelgan de otra).
 * 2. Encabezado: título (`h1`), una frase si aporta algo y las acciones (la primaria al final).
 * 3. Indicadores: como mucho cuatro, el primero protagonista (`REJILLA_INDICADORES`).
 * 4. Contenido: bloques (`BloquePanel`) con sus estados de carga, vacío y error, o pestañas.
 *
 * Sin antetítulos sobre el `h1`: la navegación y las migas ya dicen dónde se está.
 */
export interface PlantillaPanelProps {
	titulo: ReactNode;
	descripcion?: ReactNode;
	acciones?: ReactNode;
	migas?: ReactNode;
	indicadores?: ReactNode;
	/** Avisos de la pantalla (alertas accionables), entre los indicadores y el contenido. */
	avisos?: ReactNode;
	className?: string;
	children: ReactNode;
}

export function PlantillaPanel({ titulo, descripcion, acciones, migas, indicadores, avisos, className, children }: PlantillaPanelProps) {
	return (
		<div className={cn("mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)", className)}>
			{migas}
			<EncabezadoPagina titulo={titulo} descripcion={descripcion} acciones={acciones} />
			{indicadores}
			{avisos}
			{children}
		</div>
	);
}
