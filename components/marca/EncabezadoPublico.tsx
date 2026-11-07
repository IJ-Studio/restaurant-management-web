import type { ReactNode } from "react";
import { MigasDePan } from "@/components/ui/MigasDePan";
import { BotonVolver } from "@/components/ui/BotonVolver";
import type { Miga } from "@/config/navegacion-publica";
import { cn } from "@/lib/utils";

/**
 * Encabezado de las páginas públicas de acción (PLAN 4.10 en adelante, DESIGN.md § Navegación
 * pública): migas de pan y «Volver» a la sección de origen, el `h1` en Fraunces con el filete
 * doble y una entradilla. Las rutas con parámetros pasan su nombre (`actual`) y sus migas.
 */
export interface EncabezadoPublicoProps {
	ruta: string;
	titulo: ReactNode;
	entradilla?: ReactNode;
	/** Nombre de la página en la última miga (la categoría o el plato). */
	actual?: string;
	migas?: Miga[];
	/** Acciones a la derecha desde 768 px (p. ej., el carrito). */
	acciones?: ReactNode;
	className?: string;
}

export function EncabezadoPublico({ ruta, titulo, entradilla, actual, migas, acciones, className }: EncabezadoPublicoProps) {
	return (
		<>
			{/* Migas y «Volver» quedan a la vista al bajar (Prioridad 4.2): van fuera del <header> para que
			    el sticky dure toda la página, con el fondo de la página debajo. */}
			<div
				className={cn("sticky top-[calc(var(--alto-cabecera)+env(safe-area-inset-top,0px))] z-30 flex flex-col-reverse items-start gap-2 bg-fondo pt-(--espacio-xl) pb-1 sm:flex-row sm:items-center sm:justify-between", className)}
				data-migas-fijas
			>
				<MigasDePan ruta={ruta} actual={actual} migas={migas} />
				<BotonVolver className="-ms-3 sm:ms-0" />
			</div>
			<header className="flex flex-col gap-(--espacio-lg) pt-(--espacio-lg) pb-(--espacio-2xl)">
				<div className="flex flex-col gap-(--espacio-md) md:flex-row md:items-end md:justify-between">
					<div className="flex flex-col gap-(--espacio-sm)">
						<span aria-hidden="true" className="filete-doble" />
						<h1 className="m-0 max-w-[20ch] font-titulos text-(length:--texto-titulo-1) font-normal leading-[1.08] [text-wrap:balance]">{titulo}</h1>
						{entradilla && (
							<p className="m-0 max-w-[60ch] text-(length:--texto-entradilla) leading-[1.6] text-texto-secundario [text-wrap:pretty]">{entradilla}</p>
						)}
					</div>
					{acciones && <div className="flex shrink-0 flex-wrap gap-3">{acciones}</div>}
				</div>
			</header>
		</>
	);
}
