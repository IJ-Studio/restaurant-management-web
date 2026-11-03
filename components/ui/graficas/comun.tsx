"use client";

import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Boton } from "../Boton";
import { Esqueleto } from "../Esqueleto";
import { EstadoError } from "../EstadoError";
import { EstadoVacio } from "../EstadoVacio";
import { Insignia } from "../Insignia";
import { Tabla, type ColumnaTabla } from "../Tabla";

/**
 * Piezas comunes de las gráficas (DESIGN.md § Gráficas y la guía de visualización):
 * marco con título, leyenda y vista de tabla; tooltip; escala; ancho medido.
 *
 * Reglas que cumplen todas:
 * - Color por serie en orden fijo (`--color-grafica-1` a `-4`), nunca rotado; a partir de la
 *   5.ª, «Otros» (solo en el donut, que es de una serie).
 * - El texto usa los tokens de texto, nunca el color de la serie.
 * - Leyenda a partir de 2 series. Vista de tabla siempre disponible: es la alternativa accesible
 *   y la que exige `--color-grafica-4` en claro (2,81:1).
 * - El tooltip mejora, no es la única vía: los mismos valores están en la tabla. El teclado
 *   recorre los valores con las flechas y un lector oye cada uno.
 */

export interface SerieGrafica {
	clave: string;
	nombre: string;
	valores: number[];
}

export const MAXIMO_SERIES = 4;
export const colorSerie = (indice: number) => `var(--color-grafica-${Math.min(indice, MAXIMO_SERIES - 1) + 1})`;
export const COLOR_OTROS = "var(--color-borde-control)";

export { formatoEje, formatoPorDefecto, formatoPorcentaje } from "./formato";

/** Marcas del eje: números redondos desde 0, unas 4 divisiones. Los valores negativos no se contemplan. */
export function marcasEje(maximo: number, divisiones = 4): number[] {
	if (!(maximo > 0)) return [0, 1];
	const pasoBruto = maximo / divisiones;
	const magnitud = 10 ** Math.floor(Math.log10(pasoBruto));
	const normal = pasoBruto / magnitud;
	const paso = (normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 2.5 ? 2.5 : normal <= 5 ? 5 : 10) * magnitud;
	const tope = Math.ceil(maximo / paso - 1e-9) * paso;
	return Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => Number((i * paso).toFixed(10)));
}


/**
 * Ancho del contenedor, medido; 0 hasta el primer pintado (en el servidor no se dibuja).
 * Devuelve una ref de callback: la zona puede montarse más tarde (la gráfica empieza en «cargando»
 * y la zona llega con los datos), y entonces se empieza a medir (PLAN 5.2).
 */
export function useAncho<T extends HTMLElement>() {
	const [elemento, setElemento] = useState<T | null>(null);
	const [ancho, setAncho] = useState(0);
	useEffect(() => {
		if (!elemento) return;
		const observador = new ResizeObserver(([entrada]) => setAncho(Math.floor(entrada.contentRect.width)));
		observador.observe(elemento);
		return () => observador.disconnect();
	}, [elemento]);
	return [setElemento, ancho] as const;
}

/** Ancho aproximado de un texto de 12 px en DM Sans, para reservar el margen del eje. */
export const anchoTexto = (texto: string) => texto.length * 7 + 4;

/**
 * Muestra de color de una serie: un SVG con `fill`, sin estilos en línea (PLAN 5.20). El color es
 * una variable de token (`var(--color-grafica-N)`), que el atributo de presentación acepta.
 */
export function Muestra({ color, forma }: { color: string; forma: "linea" | "bloque" | "corta" }) {
	const [ancho, alto] = forma === "linea" ? [16, 2] : forma === "corta" ? [12, 2] : [10, 10];
	return (
		<svg aria-hidden="true" width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} className="shrink-0">
			<rect width={ancho} height={alto} rx={forma === "bloque" ? 2 : 1} fill={color} />
		</svg>
	);
}

/** Reserva un alto que llega como número (la zona de la gráfica) sin estilos en línea. */
export function Espaciador({ alto }: { alto: number }) {
	return <svg aria-hidden="true" width="1" height={alto} className="block" />;
}

export function Leyenda({ series, forma }: { series: { nombre: string; color: string }[]; forma: "linea" | "bloque" }) {
	return (
		<ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0 text-(length:--texto-pequeno) text-texto-secundario" aria-label="Leyenda">
			{series.map((s) => (
				<li key={s.nombre} className="inline-flex items-center gap-2">
					<Muestra color={s.color} forma={forma} />
					{s.nombre}
				</li>
			))}
		</ul>
	);
}

export interface FilaTooltip {
	nombre: string;
	valor: string;
	color: string;
}

/**
 * Tooltip: la categoría arriba y, por fila, el valor en negrita y el nombre después, con una
 * línea del color de la serie. Se coloca al lado del punto que queda más lejos del borde.
 */
export function Tooltip({ x, ancho, titulo, filas }: { x: number; ancho: number; titulo: string; filas: FilaTooltip[] }) {
	const aLaDerecha = x < ancho / 2;
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute top-0 z-10 flex min-w-36 flex-col gap-1 rounded-control border border-borde-sutil bg-superficie-elevada px-3 py-2 text-(length:--texto-pequeno) leading-[1.4] shadow-flotante"
			style={aLaDerecha ? { left: x + 12 } : { right: ancho - x + 12 }}
		>
			<span className="text-texto-secundario">{titulo}</span>
			{filas.map((f) => (
				<span key={f.nombre} className="flex items-center gap-2 whitespace-nowrap">
					<Muestra color={f.color} forma="corta" />
					<strong className="font-semibold text-texto-principal numeros-tabulares">{f.valor}</strong>
					<span className="text-texto-secundario">{f.nombre}</span>
				</span>
			))}
		</div>
	);
}

/**
 * Zona interactiva de la gráfica: un solo tabulador; las flechas, Inicio y Fin recorren los
 * puntos, y un texto para lectores dice cada uno. El dibujo va oculto a los lectores.
 */
export function useRecorrido(total: number) {
	const [activo, setActivo] = useState<number | null>(null);
	const alTeclear = (evento: KeyboardEvent) => {
		if (total === 0) return;
		const actual = activo ?? -1;
		const destino = { ArrowRight: actual + 1, ArrowDown: actual + 1, ArrowLeft: actual - 1, ArrowUp: actual - 1, Home: 0, End: total - 1 }[
			evento.key
		];
		if (destino === undefined) return;
		evento.preventDefault();
		setActivo(Math.min(Math.max(destino, 0), total - 1));
	};
	return { activo, setActivo, alTeclear };
}

export interface MarcoGraficaProps {
	titulo: string;
	descripcion?: string;
	estado?: "listo" | "cargando" | "error";
	alReintentar?: () => void | Promise<unknown>;
	/** Muestra la insignia «Datos de ejemplo» (DESIGN.md § Indicador). */
	datosDeEjemplo?: boolean;
	/** Alto del dibujo, sin el eje X: el esqueleto ocupa lo mismo para que nada salte. */
	alto: number;
	vacia: boolean;
	textoVacio?: string;
	leyenda?: ReactNode;
	/** Filas y columnas de la vista de tabla. */
	tabla: { columnas: ColumnaTabla<Record<string, ReactNode>>[]; filas: Record<string, ReactNode>[] };
	className?: string;
	children: ReactNode;
}

/** Marco de toda gráfica: título, conmutador gráfica/tabla, leyenda y estados. */
export function MarcoGrafica({
	titulo,
	descripcion,
	estado = "listo",
	alReintentar,
	datosDeEjemplo = false,
	alto,
	vacia,
	textoVacio = "No hay datos para este periodo.",
	leyenda,
	tabla,
	className,
	children,
}: MarcoGraficaProps) {
	const id = useId();
	const [vista, setVista] = useState<"grafica" | "tabla">("grafica");
	const lista = estado === "listo" && !vacia;

	return (
		<section
			aria-labelledby={`${id}-titulo`}
			aria-busy={estado === "cargando" || undefined}
			className={cn("flex min-w-0 flex-col gap-4 rounded-tarjeta border border-borde-sutil bg-superficie p-6", className)}
		>
			<div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
				<div className="flex min-w-0 flex-col gap-1">
					<h3 id={`${id}-titulo`} className="m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35]">
						{titulo}
					</h3>
					{descripcion && <p className="m-0 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario">{descripcion}</p>}
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{datosDeEjemplo && <Insignia tono="aviso">Datos de ejemplo</Insignia>}
					{lista && (
						<Boton variante="fantasma" tamano="compacto" onClick={() => setVista((v) => (v === "grafica" ? "tabla" : "grafica"))}>
							{vista === "grafica" ? "Ver tabla" : "Ver gráfica"}
						</Boton>
					)}
				</div>
			</div>

			{estado === "cargando" ? (
				<>
					<span role="status" className="solo-lectores">
						Cargando…
					</span>
					<div className="relative w-full">
						<Espaciador alto={alto + 28} />
						<Esqueleto sobre="superficie" className="absolute inset-0 h-full w-full" />
					</div>
				</>
			) : estado === "error" ? (
				<EstadoError sinMarco nivelTitulo={4} titulo="No se pudo cargar la gráfica" alReintentar={alReintentar} className="py-6" />
			) : vacia ? (
				<EstadoVacio sinMarco nivelTitulo={4} titulo={textoVacio} className="py-6" />
			) : vista === "tabla" ? (
				<Tabla leyenda={titulo} columnas={tabla.columnas} filas={tabla.filas} claveFila={(f) => String(f.__clave)} />
			) : (
				<>
					{leyenda}
					{children}
				</>
			)}
		</section>
	);
}

/** Columnas y filas de la tabla a partir de categorías y series. */
export function tablaDeSeries(
	categorias: string[],
	series: SerieGrafica[],
	formato: (n: number) => string,
	tituloCategoria: string,
): MarcoGraficaProps["tabla"] {
	return {
		columnas: [
			{ clave: "categoria", titulo: tituloCategoria, celda: (f) => f.categoria, principal: true },
			...series.map((s) => ({ clave: s.clave, titulo: s.nombre, celda: (f: Record<string, ReactNode>) => f[s.clave], numerica: true })),
		],
		filas: categorias.map((c, i) => ({
			__clave: c,
			categoria: c,
			...Object.fromEntries(series.map((s) => [s.clave, formato(s.valores[i] ?? 0)])),
		})),
	};
}

/** Zona enfocable con su anuncio para lectores. */
export function ZonaInteractiva({
	etiqueta,
	anuncio,
	alTeclear,
	alSalir,
	alMover,
	alto,
	children,
	refZona,
}: {
	etiqueta: string;
	anuncio: string;
	alTeclear: (e: KeyboardEvent) => void;
	alSalir: () => void;
	alMover: (x: number, y: number) => void;
	alto: number;
	children: ReactNode;
	refZona: React.Ref<HTMLDivElement>;
}) {
	return (
		<div
			ref={refZona}
			role="group"
			tabIndex={0}
			aria-label={`${etiqueta}. Usa las flechas para recorrer los valores.`}
			onKeyDown={alTeclear}
			onBlur={alSalir}
			onPointerLeave={alSalir}
			onPointerMove={(e) => {
				const caja = e.currentTarget.getBoundingClientRect();
				alMover(e.clientX - caja.left, e.clientY - caja.top);
			}}
			className="relative w-full rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foco"
		>
			<Espaciador alto={alto} />
			{children}
			<p aria-live="polite" aria-atomic="true" className="solo-lectores">
				{anuncio}
			</p>
		</div>
	);
}
