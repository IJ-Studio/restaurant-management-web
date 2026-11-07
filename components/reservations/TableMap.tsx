"use client";

import { useEffect, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { getTableMap } from "@/features/reservations/services/reservations.service";
import { registrarError } from "@/lib/registro/registrar-error";
import { cn } from "@/lib/utils";

/**
 * Plano de mesas de la reserva (PLAN 4.16). La lógica no cambia: `getTableMap(fechaHora)`, las
 * mesas por área y solo las disponibles se pueden elegir.
 *
 * Cada mesa es un botón con `aria-pressed`; la ocupada queda deshabilitada y lo dice con texto.
 * Mientras busca, el cargador de marca; si falla, un aviso cálido sin el mensaje del servidor (D-20).
 */
interface Mesa {
	id: number;
	numero: string;
	capacidad: number;
	areaId: number;
	areaNombre: string;
	estado: "disponible" | "ocupada";
}

interface Props {
	selectedTableId?: number;
	onSelectTable: (tableId: number) => void;
	fechaHora?: string;
}

export default function TableMap({ selectedTableId, onSelectTable, fechaHora }: Props) {
	const [mesas, setMesas] = useState<Mesa[]>([]);
	const [cargando, setCargando] = useState(true);
	const [fallo, setFallo] = useState(false);

	useEffect(() => {
		if (!fechaHora) return;
		(async () => {
			try {
				setCargando(true);
				setFallo(false);
				setMesas(await getTableMap(fechaHora));
			} catch (err) {
				registrarError(err, "reserva: plano de mesas");
				setFallo(true);
			} finally {
				setCargando(false);
			}
		})();
	}, [fechaHora]);

	if (cargando) return <CargadorMarca texto="Buscando mesas libres…" className="py-12" />;
	if (fallo)
		return (
			<Aviso tono="error" titulo="No pudimos ver las mesas libres">
				Vuelve atrás y elige otra hora, o inténtalo de nuevo en un momento.
			</Aviso>
		);
	if (mesas.length === 0)
		return (
			<Aviso tono="info" titulo="No hay mesas libres a esa hora">
				Vuelve atrás y prueba con otra hora o con otro día.
			</Aviso>
		);

	const areas = mesas.reduce(
		(acc, m) => {
			(acc[m.areaId] ??= { nombre: m.areaNombre, mesas: [] }).mesas.push(m);
			return acc;
		},
		{} as Record<number, { nombre: string; mesas: Mesa[] }>,
	);

	return (
		<div className="flex flex-col gap-(--espacio-lg)">
			{Object.entries(areas).map(([areaId, area]) => (
				<section key={areaId} aria-labelledby={`area-${areaId}`} className="flex flex-col gap-(--espacio-sm)">
					<h3 id={`area-${areaId}`} className="m-0 border-b border-borde-sutil pb-1 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">
						{area.nombre}
					</h3>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{area.mesas.map((m) => {
							const libre = m.estado === "disponible";
							const elegida = selectedTableId === m.id;
							return (
								<button
									key={m.id}
									type="button"
									aria-pressed={elegida}
									disabled={!libre}
									onClick={() => libre && onSelectTable(m.id)}
									className={cn(
										"flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-control border p-2 text-center",
										"transition-[background-color,border-color] duration-(--duracion-breve) ease-estandar",
										"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
										!libre && "cursor-not-allowed border-dashed border-borde-control text-texto-tenue",
										libre && !elegida && "border-borde-control al-pasar:bg-superficie-cafe",
										elegida && "border-acento bg-superficie-cafe",
									)}
								>
									<span className="font-titulos text-(length:--texto-titulo-3) leading-none numeros-tabulares">Mesa {m.numero}</span>
									<span className="text-(length:--texto-pequeno) text-texto-secundario">
										{m.capacidad} {m.capacidad === 1 ? "persona" : "personas"}
									</span>
									<span className={cn("text-(length:--texto-pequeno)", libre ? "text-texto-secundario" : "text-texto-tenue")}>{libre ? (elegida ? "Elegida" : "Libre") : "Ocupada"}</span>
								</button>
							);
						})}
					</div>
				</section>
			))}
		</div>
	);
}
