"use client";

import {
	COLOR_OTROS,
	MAXIMO_SERIES,
	MarcoGrafica,
	Tooltip,
	ZonaInteractiva,
	colorSerie,
	formatoPorDefecto,
	formatoPorcentaje,
	useAncho,
	useRecorrido,
	type MarcoGraficaProps,
} from "./comun";

/**
 * Donut de una sola magnitud repartida en partes: solo para ver de un vistazo cómo se reparte un
 * total con pocas partes, nunca para comparar valores parecidos (para eso, barras). Hasta 4 partes
 * con color propio; a partir de la 5.ª se agrupan en «Otros». 2 px de superficie entre partes. En
 * el centro, el total. La leyenda da nombre, valor y porcentaje, en el orden de las partes.
 */
export interface PorcionDonut {
	nombre: string;
	valor: number;
}

export interface GraficaDonutProps extends Pick<MarcoGraficaProps, "titulo" | "descripcion" | "estado" | "alReintentar" | "datosDeEjemplo" | "textoVacio" | "className"> {
	porciones: PorcionDonut[];
	formatoValor?: (n: number) => string;
	/** Rótulo del total, en el centro. */
	rotuloTotal?: string;
	tituloCategoria?: string;
}

const DIAMETRO = 176;
const GROSOR = 24;
const HUECO = 2;
const porcentaje = { format: (n: number) => formatoPorcentaje(Math.round(n * 100) / 100) };

/** Agrupa de la 5.ª parte en adelante en «Otros» (DESIGN.md § Gráficas), conservando el orden de las cuatro primeras. */
export function agruparPorciones(porciones: PorcionDonut[]): (PorcionDonut & { color: string })[] {
	const positivas = porciones.filter((p) => p.valor > 0);
	const propias = positivas.slice(0, MAXIMO_SERIES);
	const resto = positivas.slice(propias.length);
	return [
		...propias.map((p, i) => ({ ...p, color: colorSerie(i) })),
		...(resto.length ? [{ nombre: "Otros", valor: resto.reduce((s, p) => s + p.valor, 0), color: COLOR_OTROS }] : []),
	];
}

function arco(cx: number, cy: number, r: number, grosor: number, inicio: number, fin: number) {
	const punto = (radio: number, angulo: number) => [cx + radio * Math.sin(angulo), cy - radio * Math.cos(angulo)];
	const interior = r - grosor;
	const grande = fin - inicio > Math.PI ? 1 : 0;
	const [x1, y1] = punto(r, inicio);
	const [x2, y2] = punto(r, fin);
	const [x3, y3] = punto(interior, fin);
	const [x4, y4] = punto(interior, inicio);
	return `M${x1},${y1}A${r},${r} 0 ${grande} 1 ${x2},${y2}L${x3},${y3}A${interior},${interior} 0 ${grande} 0 ${x4},${y4}Z`;
}

export function GraficaDonut({
	porciones,
	formatoValor = formatoPorDefecto,
	rotuloTotal = "Total",
	tituloCategoria = "Parte",
	...marco
}: GraficaDonutProps) {
	const [ref, ancho] = useAncho<HTMLDivElement>();
	const partes = agruparPorciones(porciones);
	const total = partes.reduce((s, p) => s + p.valor, 0);
	const { activo, setActivo, alTeclear } = useRecorrido(partes.length);
	const r = DIAMETRO / 2;

	// Ángulos de cada parte, con el hueco de 2 px restado a ambos lados (en radianes sobre el radio medio).
	const hueco = HUECO / (r - GROSOR / 2);
	// Suma de las partes anteriores a cada una, sin reasignar variables durante el render.
	const previos = partes.map((_, i) => partes.slice(0, i).reduce((s, p) => s + p.valor, 0));
	const arcos = partes.map((p, i) => {
		const inicio = (previos[i] / total) * Math.PI * 2;
		const fin = ((previos[i] + p.valor) / total) * Math.PI * 2;
		const recorte = partes.length > 1 ? Math.min(hueco / 2, (fin - inicio) / 4) : 0;
		return { ...p, inicio: inicio + recorte, fin: fin - recorte, medio: (inicio + fin) / 2 };
	});

	const anuncio =
		activo === null ? "" : `${partes[activo].nombre}: ${formatoValor(partes[activo].valor)}, ${porcentaje.format(partes[activo].valor / total)}`;

	return (
		<MarcoGrafica
			{...marco}
			alto={DIAMETRO}
			vacia={total <= 0}
			tabla={{
				columnas: [
					{ clave: "nombre", titulo: tituloCategoria, celda: (f) => f.nombre, principal: true },
					{ clave: "valor", titulo: "Valor", celda: (f) => f.valor, numerica: true },
					{ clave: "parte", titulo: "Porcentaje", celda: (f) => f.parte, numerica: true },
				],
				filas: partes.map((p) => ({
					__clave: p.nombre,
					nombre: p.nombre,
					valor: formatoValor(p.valor),
					parte: porcentaje.format(p.valor / total),
				})),
			}}
		>
			<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
				<div className="w-44 shrink-0">
					<ZonaInteractiva
						refZona={ref}
						etiqueta={marco.titulo}
						anuncio={anuncio}
						alTeclear={alTeclear}
						alSalir={() => setActivo(null)}
						alMover={(px, py) => {
							const dx = px - r;
							const dy = py - r;
							const distancia = Math.hypot(dx, dy);
							if (distancia < r - GROSOR - 6 || distancia > r + 6) return setActivo(null);
							const angulo = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2);
							const indice = arcos.findIndex((a) => angulo >= a.inicio - hueco && angulo <= a.fin + hueco);
							setActivo(indice >= 0 ? indice : null);
						}}
						alto={DIAMETRO}
					>
						{ancho > 0 && (
							<svg width={DIAMETRO} height={DIAMETRO} aria-hidden="true" className="block font-texto">
								{/* Una sola parte es el anillo entero: un arco de 360° no se puede trazar con dos puntos iguales. */}
								{arcos.length === 1 && (
									<circle cx={r} cy={r} r={r - 2 - GROSOR / 2} fill="none" stroke={arcos[0].color} strokeWidth={GROSOR} />
								)}
								{arcos.length > 1 && arcos.map((a, i) => (
									<path
										key={a.nombre}
										d={arco(r, r, activo === i ? r : r - 2, activo === i ? GROSOR + 2 : GROSOR, a.inicio, a.fin)}
										fill={a.color}
									/>
								))}
								<text x={r} y={r - 6} textAnchor="middle" fontSize={20} fontWeight={600} fill="var(--color-texto-principal)" className="numeros-tabulares">
									{formatoValor(total)}
								</text>
								<text x={r} y={r + 14} textAnchor="middle" fontSize={12} fill="var(--color-texto-secundario)">
									{rotuloTotal}
								</text>
							</svg>
						)}
						{activo !== null && ancho > 0 && (
							<Tooltip
								x={r + Math.sin(arcos[activo].medio) * r}
								ancho={DIAMETRO}
								titulo={partes[activo].nombre}
								filas={[{ nombre: porcentaje.format(partes[activo].valor / total), valor: formatoValor(partes[activo].valor), color: partes[activo].color }]}
							/>
						)}
					</ZonaInteractiva>
				</div>
				{/* Leyenda: identidad y cifras, en el orden de las partes (empieza arriba y gira a la derecha). */}
				<ul aria-label="Leyenda" className="m-0 flex w-full list-none flex-col p-0 text-(length:--texto-pequeno)">
					{partes.map((p, i) => (
						<li
							key={p.nombre}
							data-activa={activo === i || undefined}
							className="flex items-center gap-3 border-b border-borde-sutil py-2 last:border-b-0 data-activa:text-texto-principal"
						>
							<span aria-hidden="true" className="size-2.5 shrink-0 rounded-[2px]" style={{ background: p.color }} />
							<span className="min-w-0 flex-1 text-texto-secundario">{p.nombre}</span>
							<span className="font-medium text-texto-principal numeros-tabulares">{formatoValor(p.valor)}</span>
							<span className="min-w-11 text-end whitespace-nowrap text-texto-secundario numeros-tabulares">{porcentaje.format(p.valor / total)}</span>
						</li>
					))}
				</ul>
			</div>
		</MarcoGrafica>
	);
}
