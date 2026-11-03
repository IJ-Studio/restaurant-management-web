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
		<header className={cn("flex flex-col gap-(--espacio-lg) pt-(--espacio-xl) pb-(--espacio-2xl)", className)}>
			<div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
				<MigasDePan ruta={ruta} actual={actual} migas={migas} />
				<BotonVolver className="-ms-3 sm:ms-0" />
			</div>
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
	);
}
