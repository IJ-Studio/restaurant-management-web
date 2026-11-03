import { useId, type ReactNode } from "react";
import { Insignia } from "@/components/ui/Insignia";

/**
 * Bloque de una pantalla de panel (fase 5): `section` con su `h2` en Fraunces, una descripción
 * breve, acciones al final de la fila (filtros, «Exportar») y, si sus cifras vienen de un mock, la
 * insignia «Datos de ejemplo» junto al título (D-13).
 */
export interface BloquePanelProps {
	titulo: string;
	descripcion?: ReactNode;
	acciones?: ReactNode;
	datosDeEjemplo?: boolean;
	className?: string;
	children: ReactNode;
}

export function BloquePanel({ titulo, descripcion, acciones, datosDeEjemplo = false, className, children }: BloquePanelProps) {
	const id = useId();
	return (
		<section aria-labelledby={id} className={["flex min-w-0 flex-col gap-(--espacio-md)", className].filter(Boolean).join(" ")}>
			<div className="flex flex-wrap items-end justify-between gap-(--espacio-sm)">
				<div className="flex min-w-0 flex-col gap-1">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
						<h2 id={id} className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.2] text-texto-principal">
							{titulo}
						</h2>
						{datosDeEjemplo && <Insignia tono="neutro">Datos de ejemplo</Insignia>}
					</div>
					{descripcion && <p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">{descripcion}</p>}
				</div>
				{acciones}
			</div>
			{children}
		</section>
	);
}
