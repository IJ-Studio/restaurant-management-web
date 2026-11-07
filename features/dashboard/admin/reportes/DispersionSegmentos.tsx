"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { colorSerie } from "@/components/ui/graficas/comun";

/**
 * Dispersión de clientes por segmento (PLAN 5.3). Recharts no tiene equivalente propio para una
 * nube de puntos, así que se queda, pero se carga aparte con `next/dynamic` (como pide 5.12 para la
 * predicción) y toma los colores de los tokens `--color-grafica-*`, sin hex.
 *
 * Es un dibujo de apoyo, oculto a los lectores: los mismos datos están en las tarjetas de cada
 * segmento y en su lista de clientes.
 */
export interface PuntoCliente {
	id: string;
	nombre: string;
	frecuencia: number;
	ticketPromedio: number;
	pcaX: number;
	pcaY: number;
}

const EJE = { fill: "var(--color-texto-secundario)", fontSize: 12, fontFamily: "var(--font-texto)" };

function Globo({ active, payload }: { active?: boolean; payload?: { payload: PuntoCliente }[] }) {
	if (!active || !payload?.length) return null;
	const p = payload[0].payload;
	return (
		<div className="rounded-control border border-borde-sutil bg-superficie-elevada px-3 py-2 text-(length:--texto-pequeno) text-texto-principal shadow-flotante">
			<p className="m-0 font-semibold">{p.nombre}</p>
			<p className="m-0 text-texto-secundario">{`${p.frecuencia} pedidos · ticket medio $ ${p.ticketPromedio}`}</p>
		</div>
	);
}

export default function DispersionSegmentos({ segmentos }: { segmentos: { nombre: string; clientes: PuntoCliente[] }[] }) {
	return (
		<div aria-hidden="true" className="h-90 w-full">
			<ResponsiveContainer width="100%" height="100%">
				{/* Sin la capa de teclado de Recharts: el dibujo está oculto a los lectores y no debe recibir el foco. */}
				<ScatterChart accessibilityLayer={false} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
					<CartesianGrid stroke="var(--color-borde-sutil)" />
					<XAxis type="number" dataKey="pcaX" tick={EJE} stroke="var(--color-borde-control)" padding={{ left: 16, right: 16 }} />
					<YAxis type="number" dataKey="pcaY" tick={EJE} stroke="var(--color-borde-control)" width={40} padding={{ top: 16, bottom: 16 }} />
					<ZAxis range={[56, 56]} />
					<Tooltip content={<Globo />} cursor={{ stroke: "var(--color-borde-control)" }} />
					{segmentos.map((s, i) => (
						<Scatter key={s.nombre} name={s.nombre} data={s.clientes} fill={colorSerie(i)} stroke="var(--color-superficie)" strokeWidth={2} isAnimationActive={false} />
					))}
				</ScatterChart>
			</ResponsiveContainer>
		</div>
	);
}
