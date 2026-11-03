import { Esqueleto, EsqueletoLineas, ZonaCargando } from "@/components/ui/Esqueleto";
import { cn } from "@/lib/utils";

/** Tarjetas en espera mientras llegan los datos de una sección (PLAN 4.10, D-20): mismo tamaño, sin texto de proceso. */
export function EsqueletoTarjetas({ columnas, cuantas = 4 }: { columnas: string; cuantas?: number }) {
	return (
		<ZonaCargando cargando texto="Preparando la sección…">
			<div className={cn("grid grid-cols-1 gap-(--espacio-xl)", columnas)}>
				{Array.from({ length: cuantas }, (_, i) => (
					<div key={i} className="flex flex-col gap-(--espacio-md)">
						<Esqueleto className="aspect-[4/5] w-full" />
						<Esqueleto className="h-6 w-2/3" />
						<EsqueletoLineas lineas={2} />
					</div>
				))}
			</div>
		</ZonaCargando>
	);
}
