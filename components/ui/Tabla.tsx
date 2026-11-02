import type { Key, ReactNode } from "react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { cn } from "@/lib/utils";
import { Esqueleto } from "./Esqueleto";
import { RegionDesplazable } from "./RegionDesplazable";

/**
 * Tabla responsiva (DESIGN.md § Otros componentes base y § Paneles).
 *
 * - Desde 768 px: `<table>` semántica con `<caption>` para lectores, cabeceras con `scope` y
 *   desplazamiento horizontal en un contenedor que se enfoca si desborda.
 * - Por debajo: una lista de tarjetas, cada una con su columna principal como título y el resto
 *   como contraetiqueta (rótulo y valor).
 *
 * Las dos vistas se pintan en el servidor y el CSS muestra una; la oculta sale del árbol de
 * accesibilidad (`display: none`). No necesita JavaScript salvo para el desplazamiento.
 */

export interface ColumnaTabla<T> {
	clave: string;
	titulo: string;
	celda: (fila: T) => ReactNode;
	/** Cifras: alineadas al final y con números tabulares. */
	numerica?: boolean;
	/** Es el título de la tarjeta en móvil y la cabecera de fila (`<th scope="row">`) en la tabla. */
	principal?: boolean;
	/** No se repite en la tarjeta (p. ej., un dato que ya va en el título). */
	ocultarEnTarjeta?: boolean;
}

export interface TablaProps<T> {
	/** Describe la tabla; es el `<caption>` y el nombre de la región. */
	leyenda: string;
	/** Muestra la leyenda también a la vista. */
	leyendaVisible?: boolean;
	columnas: ColumnaTabla<T>[];
	filas: T[];
	claveFila: (fila: T) => Key;
	/** Acciones de cada fila: última columna en la tabla y pie de la tarjeta. */
	acciones?: (fila: T) => ReactNode;
	tituloAcciones?: string;
	/** Fila resaltada (relleno café); se anuncia con un texto para lectores. */
	filaSeleccionada?: Key | null;
	estado?: "listo" | "cargando";
	/** Lo que se muestra si no hay filas (un `EstadoVacio`). */
	vacio?: ReactNode;
	/** Sustituye el contenido si la carga falló (un `EstadoError`). */
	error?: ReactNode;
	className?: string;
}

const CLASE_CABECERA =
	"px-4 py-3 text-start align-bottom font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] text-texto-secundario";

const FILAS_ESQUELETO = 3;

export function Tabla<T>({
	leyenda,
	leyendaVisible = false,
	columnas,
	filas,
	claveFila,
	acciones,
	tituloAcciones = "Acciones",
	filaSeleccionada = null,
	estado = "listo",
	vacio,
	error,
	className,
}: TablaProps<T>) {
	const cargando = estado === "cargando";
	const principal = columnas.find((c) => c.principal) ?? columnas[0];
	const enTarjeta = columnas.filter((c) => c !== principal && !c.ocultarEnTarjeta);

	const titulo = leyendaVisible && (
		<p className="m-0 mb-3 font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35]" aria-hidden="true">
			{leyenda}
		</p>
	);

	if (error) {
		return (
			<div className={className}>
				{titulo}
				{error}
			</div>
		);
	}
	if (!cargando && filas.length === 0 && vacio) {
		return (
			<div className={className}>
				{titulo}
				{vacio}
			</div>
		);
	}

	const marca = (fila: T) => (filaSeleccionada !== null && claveFila(fila) === filaSeleccionada ? true : undefined);

	return (
		<div className={className} aria-busy={cargando || undefined}>
			{titulo}
			{cargando && <span className="solo-lectores">Cargando…</span>}

			{/* Desde 768 px: tabla. */}
			<RegionDesplazable aria-label={leyenda} className="hidden rounded-tarjeta border border-borde-sutil bg-superficie md:block">
				<table className="w-full border-collapse text-(length:--texto-pequeno) leading-[1.5]">
					<caption className="solo-lectores">{leyenda}</caption>
					<thead>
						<tr className="border-b border-borde-sutil">
							{columnas.map((c) => (
								<th key={c.clave} scope="col" className={cn(CLASE_CABECERA, c.numerica && "text-end")}>
									{c.titulo}
								</th>
							))}
							{acciones && (
								<th scope="col" className={cn(CLASE_CABECERA, "text-end")}>
									<span className="solo-lectores">{tituloAcciones}</span>
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{cargando
							? Array.from({ length: FILAS_ESQUELETO }, (_, i) => (
									<tr key={i} className="border-b border-borde-sutil last:border-b-0" aria-hidden="true">
										{columnas.map((c) => (
											<td key={c.clave} className="px-4 py-4">
												<Esqueleto sobre="superficie" className={c.numerica ? "ms-auto w-16" : "w-4/5"} />
											</td>
										))}
										{acciones && <td className="px-4 py-4" />}
									</tr>
								))
							: filas.map((fila) => (
									<tr
										key={claveFila(fila)}
										data-seleccionada={marca(fila)}
										className="border-b border-borde-sutil last:border-b-0 data-seleccionada:bg-superficie-cafe"
									>
										{columnas.map((c) => {
											const contenido = c.celda(fila);
											const clase = cn(
												"px-4 py-3 align-middle text-texto-principal",
												c.numerica && "text-end text-(length:--texto-cifra-tabla) font-medium whitespace-nowrap numeros-tabulares",
											);
											return c === principal ? (
												<th key={c.clave} scope="row" className={cn(clase, "text-start font-semibold")}>
													{contenido}
													{marca(fila) && <span className="solo-lectores"> (seleccionada)</span>}
												</th>
											) : (
												<td key={c.clave} className={clase}>
													{contenido}
												</td>
											);
										})}
										{acciones && (
											<td className="px-4 py-2 text-end align-middle">
												<div className="flex justify-end gap-2">{acciones(fila)}</div>
											</td>
										)}
									</tr>
								))}
					</tbody>
				</table>
			</RegionDesplazable>

			{/* Por debajo de 768 px: tarjetas con contraetiqueta. */}
			<ul aria-label={leyenda} className="m-0 flex list-none flex-col gap-3 p-0 md:hidden">
				{cargando
					? Array.from({ length: FILAS_ESQUELETO }, (_, i) => (
							<li key={i} aria-hidden="true" className="flex flex-col gap-3 rounded-tarjeta border border-borde-sutil bg-superficie p-4">
								{["w-1/2", "w-full", "w-3/4"].map((ancho) => (
									<Esqueleto key={ancho} sobre="superficie" className={ancho} />
								))}
							</li>
						))
					: filas.map((fila) => (
							<li
								key={claveFila(fila)}
								data-seleccionada={marca(fila)}
								className="flex flex-col gap-2 rounded-tarjeta border border-borde-sutil bg-superficie px-4 pt-4 pb-3 data-seleccionada:border-borde-control data-seleccionada:bg-superficie-cafe"
							>
								<p className="m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35] text-texto-principal">
									{principal.celda(fila)}
									{marca(fila) && <span className="solo-lectores"> (seleccionada)</span>}
								</p>
								{enTarjeta.length > 0 && (
									<Contraetiqueta
										sinFileteFinal
										pares={enTarjeta.map((c) => ({ rotulo: c.titulo, valor: c.celda(fila), tipo: c.numerica ? "cifra" : "texto" }))}
									/>
								)}
								{acciones && <div className="flex flex-wrap gap-2 pt-1">{acciones(fila)}</div>}
							</li>
						))}
			</ul>
		</div>
	);
}
