"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Curva de un platillo: lo vendido y lo que se espera (PLAN 5.12). Recharts, cargado aparte con
 * `next/dynamic`: la gráfica propia (`GraficaLinea`) no admite huecos y aquí cada serie ocupa solo
 * su tramo. Colores de los tokens `--color-grafica-*` y la previsión discontinua, para que no
 * dependa solo del color. Es un dibujo de apoyo: los datos están en la tabla de al lado.
 */
export interface PuntoCurva {
	dia: string;
	real: number | null;
	previsto: number | null;
}

const EJE = { fill: "var(--color-texto-secundario)", fontSize: 12, fontFamily: "var(--font-texto)" };

function Globo({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number | null }[]; label?: string }) {
	const filas = (payload ?? []).filter((p) => p.value !== null && p.value !== undefined);
	if (!active || filas.length === 0) return null;
	return (
		<div className="rounded-control border border-borde-sutil bg-superficie-elevada px-3 py-2 text-(length:--texto-pequeno) text-texto-principal shadow-flotante">
			<p className="m-0 text-texto-secundario">{label}</p>
			{filas.map((p) => (
				<p key={p.name} className="m-0 font-semibold numeros-tabulares">{`${p.name}: ${p.value}`}</p>
			))}
		</div>
	);
}

export default function CurvaPronostico({ puntos }: { puntos: PuntoCurva[] }) {
	return (
		<div aria-hidden="true" className="h-64 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart accessibilityLayer={false} data={puntos} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
					<CartesianGrid stroke="var(--color-borde-sutil)" vertical={false} />
					<XAxis dataKey="dia" tick={EJE} stroke="var(--color-borde-control)" />
					<YAxis tick={EJE} stroke="var(--color-borde-control)" width={40} allowDecimals={false} />
					<Tooltip content={<Globo />} cursor={{ stroke: "var(--color-borde-control)" }} />
					<Line type="monotone" dataKey="real" name="Vendido" stroke="var(--color-grafica-1)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
					<Line type="monotone" dataKey="previsto" name="Previsto" stroke="var(--color-grafica-2)" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls={false} isAnimationActive={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
