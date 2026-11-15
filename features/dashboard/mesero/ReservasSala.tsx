"use client";

import { useMemo } from "react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EstadoError } from "@/components/ui/EstadoError";
import { Insignia } from "@/components/ui/Insignia";
import { useCarga } from "@/hooks/useCarga";
import { contar } from "@/lib/formato/plural";
import { pedirPanel } from "@/lib/paneles/api-panel";

/**
 * Reservaciones de hoy para sala (paridad con la móvil, donde el mesero tiene «Reservas»): solo
 * lectura, desde hace 2 horas hasta el fin del día, sin canceladas ni las que no llegaron.
 * `GET /reservations?fechaDesde&fechaHasta` (admin, cajero y mesero).
 */
interface Reserva {
	id: string;
	clienteNombre: string;
	fechaHora: string;
	numComensales: number;
	estatus: string;
	mesaNumero?: string | null;
}
const VIGENTES = new Set(["pendiente", "confirmada"]);
const hora = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });

export function ReservasSala() {
	const rango = useMemo(() => {
		const ahora = new Date();
		const fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
		return `fechaDesde=${encodeURIComponent(new Date(ahora.getTime() - 2 * 60 * 60 * 1000).toISOString())}&fechaHasta=${encodeURIComponent(fin.toISOString())}`;
	}, []);
	const [reservas, recargar] = useCarga(() => pedirPanel<Reserva[]>(`/reservations?${rango}`), "sala: reservaciones");
	const lista = (reservas.estado === "listo" && Array.isArray(reservas.datos) ? reservas.datos : [])
		.filter((r) => VIGENTES.has(r.estatus))
		.sort((a, b) => Date.parse(a.fechaHora) - Date.parse(b.fechaHora));

	return (
		<BloquePanel titulo="Reservaciones de hoy" descripcion={reservas.estado === "listo" && lista.length === 0 ? "No hay reservaciones por llegar hoy." : undefined}>
			{reservas.estado === "error" ? (
				<EstadoError titulo="No pudimos traer las reservaciones" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />
			) : (
				lista.length > 0 && (
					<ul className="m-0 flex list-none flex-col p-0" aria-label="Reservaciones de hoy">
						{lista.map((r) => (
							<li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-borde-sutil py-(--espacio-sm) last:border-b-0">
								<span className="font-semibold cifras-consola">{hora.format(new Date(r.fechaHora))}</span>
								<span className="min-w-0 flex-1 text-texto-principal [overflow-wrap:anywhere]">{r.clienteNombre}</span>
								<span className="text-texto-secundario">{`${contar(r.numComensales, "persona")}${r.mesaNumero ? ` · Mesa ${r.mesaNumero}` : " · sin mesa"}`}</span>
								<Insignia tono={r.estatus === "confirmada" ? "exito" : "aviso"}>{r.estatus === "confirmada" ? "Confirmada" : "Pendiente"}</Insignia>
							</li>
						))}
					</ul>
				)
			)}
		</BloquePanel>
	);
}
