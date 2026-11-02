"use client";

import {
	MarcoGrafica,
	Leyenda,
	Tooltip,
	ZonaInteractiva,
	anchoTexto,
	colorSerie,
	formatoEje,
	formatoPorDefecto,
	marcasEje,
	tablaDeSeries,
	useAncho,
	useRecorrido,
	type MarcoGraficaProps,
	type SerieGrafica,
} from "./comun";

/**
 * Líneas de 2 px (hasta 4 series) sobre un eje de tiempo o de categorías ordenadas. Una sola
 * serie lleva un velo de su color al 10 % y su último valor rotulado. Una línea vertical sigue al
 * puntero y se ajusta al punto más cercano; el tooltip lista todas las series en ese punto. Los
 * puntos llevan un anillo de 2 px del color de la superficie para leerse donde se cruzan.
 */
export interface GraficaLineaProps extends Pick<MarcoGraficaProps, "titulo" | "descripcion" | "estado" | "alReintentar" | "datosDeEjemplo" | "textoVacio" | "className"> {
	categorias: string[];
	series: SerieGrafica[];
	formatoValor?: (n: number) => string;
	tituloCategoria?: string;
	alto?: number;
}

const MARGEN = { arriba: 20, abajo: 28 };
const ANILLO = "var(--color-superficie)";

export function GraficaLinea({
	categorias,
	series,
	formatoValor = formatoPorDefecto,
	tituloCategoria = "Periodo",
	alto = 220,
	...marco
}: GraficaLineaProps) {
	const [ref, ancho] = useAncho<HTMLDivElement>();
	const { activo, setActivo, alTeclear } = useRecorrido(categorias.length);
	const visibles = series.slice(0, 4);
	const una = visibles.length === 1;
	const maximo = Math.max(0, ...visibles.flatMap((s) => s.valores));
	const marcas = marcasEje(maximo);
	const tope = marcas[marcas.length - 1];
	const izquierda = Math.max(...marcas.map((m) => anchoTexto(formatoEje(m, tope)))) + 8;
	// Con una serie, el último valor se rotula a la derecha y necesita su hueco.
	const derecha = una && categorias.length ? anchoTexto(formatoValor(visibles[0].valores[categorias.length - 1] ?? 0)) + 8 : 8;
	const anchoPlot = Math.max(0, ancho - izquierda - derecha);
	const base = MARGEN.arriba + alto;
	const paso = categorias.length > 1 ? anchoPlot / (categorias.length - 1) : 0;
	const x = (i: number) => izquierda + (categorias.length > 1 ? paso * i : anchoPlot / 2);
	const y = (v: number) => base - (v / tope) * alto;
	const salto = Math.max(1, Math.ceil((Math.max(...categorias.map(anchoTexto), 1) + 8) / Math.max(paso, 1)));
	const trazo = (valores: number[]) => valores.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join("");

	const anuncio =
		activo === null ? "" : `${categorias[activo]}: ${visibles.map((s) => `${s.nombre} ${formatoValor(s.valores[activo] ?? 0)}`).join(", ")}`;
	const ultimo = categorias.length - 1;
	// Etiquetas del eje X: una de cada `salto` y siempre la última; si la última choca con la
	// anterior visible (la última se alinea al final y la anterior, centrada), se quita la anterior.
	const etiquetasX = categorias.map((_, i) => i).filter((i) => i % salto === 0);
	if (ultimo > 0 && etiquetasX[etiquetasX.length - 1] !== ultimo) {
		const previa = etiquetasX[etiquetasX.length - 1];
		const hueco = x(ultimo) - anchoTexto(categorias[ultimo]) - (x(previa) + anchoTexto(categorias[previa]) / 2);
		if (hueco < 8 && previa !== 0) etiquetasX.pop();
		etiquetasX.push(ultimo);
	}

	return (
		<MarcoGrafica
			{...marco}
			alto={alto}
			vacia={categorias.length === 0 || visibles.length === 0}
			leyenda={visibles.length >= 2 ? <Leyenda forma="linea" series={visibles.map((s, k) => ({ nombre: s.nombre, color: colorSerie(k) }))} /> : null}
			tabla={tablaDeSeries(categorias, visibles, formatoValor, tituloCategoria)}
		>
			<ZonaInteractiva
				refZona={ref}
				etiqueta={marco.titulo}
				anuncio={anuncio}
				alTeclear={alTeclear}
				alSalir={() => setActivo(null)}
				alMover={(px) => {
					if (categorias.length === 0) return;
					const indice = paso > 0 ? Math.round((px - izquierda) / paso) : 0;
					setActivo(Math.min(Math.max(indice, 0), ultimo));
				}}
				alto={base + MARGEN.abajo}
			>
				{ancho > 0 && (
					// Ancho al 100 % con viewBox del ancho medido, para que el texto no se escale. Va en posición
					// absoluta dentro de la zona (que ya tiene su alto): si no, su proporción daría a la rejilla un
					// ancho mínimo igual al medido y el contenedor no podría encogerse.
					<svg
						width="100%"
						height={base + MARGEN.abajo}
						viewBox={`0 0 ${ancho} ${base + MARGEN.abajo}`}
						aria-hidden="true"
						className="absolute inset-x-0 top-0 block overflow-visible font-texto"
					>
						{marcas.map((m) => (
							<g key={m}>
								<line x1={izquierda} x2={ancho - derecha} y1={y(m)} y2={y(m)} stroke="var(--color-borde-sutil)" strokeWidth={1} shapeRendering="crispEdges" />
								<text x={izquierda - 8} y={y(m)} dy="0.32em" textAnchor="end" fontSize={12} fill="var(--color-texto-secundario)" className="numeros-tabulares">
									{formatoEje(m, tope)}
								</text>
							</g>
						))}
						<line x1={izquierda} x2={ancho - derecha} y1={base} y2={base} stroke="var(--color-borde-control)" strokeWidth={1} shapeRendering="crispEdges" />
						{etiquetasX.map((i) => (
							<text key={categorias[i]} x={x(i)} y={base + 18} textAnchor={i === 0 ? "start" : i === ultimo ? "end" : "middle"} fontSize={12} fill="var(--color-texto-secundario)">
								{categorias[i]}
							</text>
						))}
						{activo !== null && (
							<line x1={x(activo)} x2={x(activo)} y1={MARGEN.arriba - 8} y2={base} stroke="var(--color-borde-control)" strokeWidth={1} shapeRendering="crispEdges" />
						)}
						{una && <path d={`${trazo(visibles[0].valores)}L${x(ultimo)},${base}L${x(0)},${base}Z`} fill={colorSerie(0)} fillOpacity={0.1} />}
						{visibles.map((s, k) => (
							<path key={s.clave} d={trazo(s.valores)} fill="none" stroke={colorSerie(k)} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
						))}
						{/* Punto final de cada serie y, si hay uno activo, sus puntos. */}
						{visibles.map((s, k) => (
							<circle key={`fin-${s.clave}`} cx={x(ultimo)} cy={y(s.valores[ultimo] ?? 0)} r={4} fill={colorSerie(k)} stroke={ANILLO} strokeWidth={2} />
						))}
						{activo !== null &&
							visibles.map((s, k) => (
								<circle key={`activo-${s.clave}`} cx={x(activo)} cy={y(s.valores[activo] ?? 0)} r={5} fill={colorSerie(k)} stroke={ANILLO} strokeWidth={2} />
							))}
						{una && (
							<text x={x(ultimo) + 8} y={y(visibles[0].valores[ultimo] ?? 0)} dy="0.32em" fontSize={12} fontWeight={600} fill="var(--color-texto-principal)" className="numeros-tabulares">
								{formatoValor(visibles[0].valores[ultimo] ?? 0)}
							</text>
						)}
					</svg>
				)}
				{activo !== null && ancho > 0 && (
					<Tooltip
						x={x(activo)}
						ancho={ancho}
						titulo={categorias[activo]}
						filas={visibles.map((s, k) => ({ nombre: s.nombre, valor: formatoValor(s.valores[activo] ?? 0), color: colorSerie(k) }))}
					/>
				)}
			</ZonaInteractiva>
		</MarcoGrafica>
	);
}
