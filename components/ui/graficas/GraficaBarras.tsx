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
 * Columnas verticales, agrupadas si hay varias series (hasta 4). Marcas finas (≤ 24 px), extremo
 * de datos redondeado a 4 px y recto en la base, 2 px de superficie entre columnas vecinas,
 * cuadrícula de 1 px recesiva. La categoría activa se resalta con una banda café; el tooltip
 * lista todas sus series. Solo se rotula el valor más alto.
 */
export interface GraficaBarrasProps extends Pick<MarcoGraficaProps, "titulo" | "descripcion" | "estado" | "alReintentar" | "textoVacio" | "className"> {
	categorias: string[];
	series: SerieGrafica[];
	formatoValor?: (n: number) => string;
	/** Encabezado de la primera columna en la vista de tabla. */
	tituloCategoria?: string;
	alto?: number;
}

const GROSOR_MAXIMO = 24;
const HUECO = 2;
const MARGEN = { arriba: 20, derecha: 4, abajo: 28 };

/** Columna con las esquinas de arriba redondeadas y la base recta. */
function columna(x: number, y: number, ancho: number, base: number) {
	const alto = base - y;
	if (alto <= 0) return "";
	const r = Math.min(4, ancho / 2, alto);
	return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + ancho - r}Q${x + ancho},${y} ${x + ancho},${y + r}V${base}Z`;
}

export function GraficaBarras({
	categorias,
	series,
	formatoValor = formatoPorDefecto,
	tituloCategoria = "Categoría",
	alto = 220,
	...marco
}: GraficaBarrasProps) {
	const [ref, ancho] = useAncho<HTMLDivElement>();
	const { activo, setActivo, alTeclear } = useRecorrido(categorias.length);
	const visibles = series.slice(0, 4);
	const maximo = Math.max(0, ...visibles.flatMap((s) => s.valores));
	const marcas = marcasEje(maximo);
	const tope = marcas[marcas.length - 1];
	const izquierda = Math.max(...marcas.map((m) => anchoTexto(formatoEje(m, tope)))) + 8;
	const anchoPlot = Math.max(0, ancho - izquierda - MARGEN.derecha);
	const base = MARGEN.arriba + alto;
	const y = (v: number) => base - (v / tope) * alto;
	const banda = categorias.length ? anchoPlot / categorias.length : 0;
	const grosor = Math.min(GROSOR_MAXIMO, (banda * 0.7 - HUECO * (visibles.length - 1)) / visibles.length);
	const anchoGrupo = grosor * visibles.length + HUECO * (visibles.length - 1);
	// Etiquetas del eje X: una de cada `salto` si no caben todas.
	const salto = Math.max(1, Math.ceil(Math.max(...categorias.map(anchoTexto), 1) / Math.max(banda, 1)));
	let mayor: { serie: number; indice: number } | null = null;
	visibles.forEach((s, i) =>
		s.valores.forEach((v, j) => {
			if (!mayor || v > visibles[mayor.serie].valores[mayor.indice]) mayor = { serie: i, indice: j };
		}),
	);
	const destacado = mayor as { serie: number; indice: number } | null;

	const filasTooltip = (i: number) => visibles.map((s, k) => ({ nombre: s.nombre, valor: formatoValor(s.valores[i] ?? 0), color: colorSerie(k) }));
	const anuncio =
		activo === null ? "" : `${categorias[activo]}: ${visibles.map((s) => `${s.nombre} ${formatoValor(s.valores[activo] ?? 0)}`).join(", ")}`;

	return (
		<MarcoGrafica
			{...marco}
			alto={alto}
			vacia={categorias.length === 0 || visibles.length === 0}
			leyenda={visibles.length >= 2 ? <Leyenda forma="bloque" series={visibles.map((s, k) => ({ nombre: s.nombre, color: colorSerie(k) }))} /> : null}
			tabla={tablaDeSeries(categorias, visibles, formatoValor, tituloCategoria)}
		>
			<ZonaInteractiva
				refZona={ref}
				etiqueta={marco.titulo}
				anuncio={anuncio}
				alTeclear={alTeclear}
				alSalir={() => setActivo(null)}
				alMover={(x) => {
					if (banda > 0 && x >= izquierda) setActivo(Math.min(categorias.length - 1, Math.floor((x - izquierda) / banda)));
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
						{activo !== null && (
							<rect x={izquierda + banda * activo} y={MARGEN.arriba - 8} width={banda} height={alto + 8} fill="var(--color-superficie-cafe)" />
						)}
						{marcas.map((m) => (
							<g key={m}>
								<line x1={izquierda} x2={ancho - MARGEN.derecha} y1={y(m)} y2={y(m)} stroke="var(--color-borde-sutil)" strokeWidth={1} shapeRendering="crispEdges" />
								<text x={izquierda - 8} y={y(m)} dy="0.32em" textAnchor="end" fontSize={12} fill="var(--color-texto-secundario)" className="numeros-tabulares">
									{formatoEje(m, tope)}
								</text>
							</g>
						))}
						{categorias.map((c, i) => {
							const inicio = izquierda + banda * i + (banda - anchoGrupo) / 2;
							return (
								<g key={c}>
									{visibles.map((s, k) => (
										<path key={s.clave} d={columna(inicio + k * (grosor + HUECO), y(s.valores[i] ?? 0), grosor, base)} fill={colorSerie(k)} />
									))}
									{i % salto === 0 && (
										<text x={izquierda + banda * (i + 0.5)} y={base + 18} textAnchor="middle" fontSize={12} fill="var(--color-texto-secundario)">
											{c}
										</text>
									)}
								</g>
							);
						})}
						{/* La base, un poco más marcada que la cuadrícula. */}
						<line x1={izquierda} x2={ancho - MARGEN.derecha} y1={base} y2={base} stroke="var(--color-borde-control)" strokeWidth={1} shapeRendering="crispEdges" />
						{destacado && (
							<text
								x={izquierda + banda * destacado.indice + (banda - anchoGrupo) / 2 + destacado.serie * (grosor + HUECO) + grosor / 2}
								y={y(visibles[destacado.serie].valores[destacado.indice]) - 6}
								textAnchor="middle"
								fontSize={12}
								fontWeight={600}
								fill="var(--color-texto-principal)"
								className="numeros-tabulares"
							>
								{formatoValor(visibles[destacado.serie].valores[destacado.indice])}
							</text>
						)}
					</svg>
				)}
				{activo !== null && ancho > 0 && (
					<Tooltip x={izquierda + banda * (activo + 0.5)} ancho={ancho} titulo={categorias[activo]} filas={filasTooltip(activo)} />
				)}
			</ZonaInteractiva>
		</MarcoGrafica>
	);
}
