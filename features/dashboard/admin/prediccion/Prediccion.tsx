"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { LineChart as IconoCurva } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { formatoPorcentaje } from "@/components/ui/graficas/formato";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import type { PuntoCurva } from "./CurvaPronostico";

/**
 * Predicción de demanda (PLAN 5.12). Mismas llamadas: el ranking
 * (`GET /inventory/predictive/ranking?dias=7`) al entrar y el detalle de un platillo
 * (`GET /inventory/predictive/:id?dias=7`) al elegirlo. Lo nuevo:
 * - Recharts se carga con `next/dynamic` y solo cuando se abre un platillo;
 * - el lenguaje del modelo pasa a palabras de la casa (D-20): «WAPE» es «margen de error» y el
 *   «baseline ingenuo», «la estimación simple»;
 * - cada bloque con su carga, su error con «Reintentar» y el motivo del API cuando no hay datos.
 */

const Curva = dynamic(() => import("./CurvaPronostico"), {
	ssr: false,
	loading: () => <Esqueleto sobre="superficie" className="h-64 w-full" />,
});

type Clasificacion = "Alta demanda" | "Demanda media" | "Baja demanda";
interface Platillo {
	platilloId: number;
	nombre: string;
	categoria: string;
	unidadesUltimos7: number;
	unidadesPredichas7: number;
	variacionPct: number;
	clasificacion: Clasificacion;
}
type Ranking =
	| {
			disponible: true;
			horizonteDias: number;
			wapeModelo: number;
			wapeBaseline: number;
			mejoraPct: number;
			platilloMayorCrecimiento: Platillo | null;
			platilloMayorDecrecimiento: Platillo | null;
			platillos: Platillo[];
	  }
	| { disponible: false; motivo: string };
type Detalle =
	| {
			disponible: true;
			platillo: { id: number; nombre: string; categoria: string; precio: number };
			wapeModelo: number;
			wapeBaseline: number;
			serieHistorica: { fecha: string; unidades: number }[];
			pronostico: { fecha: string; unidadesPredichas: number }[];
	  }
	| { disponible: false; motivo: string };

const DEMANDA: Record<Clasificacion, TonoInsignia> = { "Alta demanda": "exito", "Demanda media": "aviso", "Baja demanda": "error" };
const entero = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const dia = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
const escribirDia = (iso: string) => {
	const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
	return Number.isNaN(d.getTime()) ? iso : dia.format(d);
};
const variacion = (pct: number) => formatoPorcentaje(pct / 100, true);

function DetallePlatillo({ id }: { id: number }) {
	const [detalle, recargar] = useCarga(() => api.get<Detalle>(`/inventory/predictive/${id}?dias=7`), "predicción: detalle");
	const puntos = useMemo<PuntoCurva[]>(() => {
		if (detalle.estado !== "listo" || !detalle.datos.disponible) return [];
		const d = detalle.datos;
		return [
			...d.serieHistorica.map((h) => ({ dia: escribirDia(h.fecha), real: h.unidades, previsto: null })),
			...d.pronostico.map((p) => ({ dia: escribirDia(p.fecha), real: null, previsto: p.unidadesPredichas })),
		];
	}, [detalle]);

	if (detalle.estado === "cargando") return <Esqueleto sobre="fondo" className="h-80 w-full" />;
	if (detalle.estado === "error") return <EstadoError titulo="No pudimos traer la curva de este platillo" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />;
	if (!detalle.datos.disponible) return <EstadoVacio icono={<IconoCurva />} titulo="Aún no hay curva para este platillo" descripcion={detalle.datos.motivo} />;

	const d = detalle.datos;
	const columnas: ColumnaTabla<PuntoCurva>[] = [
		{ clave: "dia", titulo: "Día", principal: true, celda: (p) => p.dia },
		{ clave: "real", titulo: "Vendido", numerica: true, celda: (p) => (p.real === null ? "—" : entero.format(p.real)) },
		{ clave: "previsto", titulo: "Previsto", numerica: true, celda: (p) => (p.previsto === null ? "—" : entero.format(p.previsto)) },
	];
	return (
		<BloquePanel
			titulo={d.platillo.nombre}
			descripcion={`${d.platillo.categoria}. Margen de error de este platillo: ${formatoPorcentaje(d.wapeModelo)}; la estimación simple, ${formatoPorcentaje(d.wapeBaseline)}.`}
		>
			<div className="grid grid-cols-1 items-start gap-(--espacio-xl) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<figure className="m-0 flex flex-col gap-2 rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">
					<Curva puntos={puntos} />
					<figcaption className="flex flex-wrap gap-x-6 gap-y-1 text-(length:--texto-pequeno) text-texto-secundario">
						<span className="flex items-center gap-2">
							<span aria-hidden="true" className="h-0.5 w-6 bg-(--color-grafica-1)" />
							Vendido (línea continua)
						</span>
						<span className="flex items-center gap-2">
							<span aria-hidden="true" className="h-0.5 w-6 border-t-2 border-dashed border-(--color-grafica-2)" />
							Previsto (línea discontinua)
						</span>
					</figcaption>
				</figure>
				<Tabla leyenda={`Vendido y previsto de ${d.platillo.nombre}`} columnas={columnas} filas={puntos} claveFila={(p) => `${p.dia}-${p.real ?? "p"}`} />
			</div>
		</BloquePanel>
	);
}

export function Prediccion() {
	const [ranking, recargar] = useCarga(() => api.get<Ranking>("/inventory/predictive/ranking?dias=7"), "predicción: ranking");
	const [elegido, setElegido] = useState<number | null>(null);
	const r = ranking.estado === "listo" && ranking.datos.disponible ? ranking.datos : null;

	const columnas: ColumnaTabla<Platillo>[] = [
		{
			clave: "platillo",
			titulo: "Platillo",
			principal: true,
			celda: (p) => (
				<button
					type="button"
					aria-pressed={elegido === p.platilloId}
					onClick={() => setElegido(elegido === p.platilloId ? null : p.platilloId)}
					className="cursor-pointer rounded-control border-0 bg-transparent p-0 text-start font-semibold text-texto-principal underline decoration-borde-control underline-offset-4 al-pasar:decoration-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
				>
					<span className="solo-lectores">Ver la curva de </span>
					{p.nombre}
				</button>
			),
		},
		{ clave: "categoria", titulo: "Categoría", celda: (p) => p.categoria },
		{ clave: "antes", titulo: "Últimos 7 días", numerica: true, celda: (p) => entero.format(p.unidadesUltimos7) },
		{ clave: "despues", titulo: "Próximos 7 días", numerica: true, celda: (p) => entero.format(p.unidadesPredichas7) },
		{ clave: "variacion", titulo: "Cambio", numerica: true, celda: (p) => variacion(p.variacionPct) },
		{ clave: "demanda", titulo: "Demanda", celda: (p) => <Insignia tono={DEMANDA[p.clasificacion] ?? "neutro"} className="whitespace-nowrap">{p.clasificacion}</Insignia> },
	];

	const indicador = { estado: ranking.estado, alReintentar: recargar } as const;
	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina antetitulo="Análisis" titulo="Predicción de demanda" descripcion="Cuántas unidades de cada platillo se esperan en los próximos días, a partir de lo vendido." />

			{ranking.estado === "listo" && !ranking.datos.disponible ? (
				<EstadoVacio icono={<IconoCurva />} titulo="Aún no hay predicción" descripcion={ranking.datos.motivo} />
			) : (
				<>
					<div className={REJILLA_INDICADORES}>
						<Indicador
							{...indicador}
							rotulo="Margen de error"
							valor={r ? formatoPorcentaje(r.wapeModelo) : undefined}
							detalle={r ? `La estimación simple falla un ${formatoPorcentaje(r.wapeBaseline)}` : undefined}
							className={INDICADOR_PROTAGONISTA}
						/>
						<Indicador {...indicador} rotulo="Mejora sobre la estimación simple" valor={r ? variacion(r.mejoraPct) : undefined} />
						<Indicador {...indicador} rotulo="Crece más" valor={r?.platilloMayorCrecimiento ? variacion(r.platilloMayorCrecimiento.variacionPct) : r ? "—" : undefined} detalle={r?.platilloMayorCrecimiento?.nombre} />
						<Indicador {...indicador} rotulo="Cae más" valor={r?.platilloMayorDecrecimiento ? variacion(r.platilloMayorDecrecimiento.variacionPct) : r ? "—" : undefined} detalle={r?.platilloMayorDecrecimiento?.nombre} />
					</div>

					<BloquePanel titulo={r ? `Previsión a ${r.horizonteDias} días` : "Previsión"} descripcion="Elige un platillo para ver su curva.">
						<Tabla
							leyenda="Previsión por platillo"
							tablaDesde="lg"
							columnas={columnas}
							filas={r?.platillos ?? []}
							claveFila={(p) => p.platilloId}
							filaSeleccionada={elegido}
							estado={ranking.estado === "cargando" ? "cargando" : "listo"}
							error={ranking.estado === "error" ? <EstadoError titulo="No pudimos traer la predicción" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} /> : undefined}
							vacio={<EstadoVacio icono={<IconoCurva />} titulo="Sin platillos que prever" descripcion="Hace falta historial de ventas." />}
						/>
					</BloquePanel>

					{elegido !== null && <DetallePlatillo key={elegido} id={elegido} />}
				</>
			)}
		</div>
	);
}
