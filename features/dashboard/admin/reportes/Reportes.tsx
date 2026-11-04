"use client";

import dynamic from "next/dynamic";
import { Users } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { Boton } from "@/components/ui/Boton";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { Dialogo } from "@/components/ui/Dialogo";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { formatoPorcentaje } from "@/components/ui/graficas/formato";
import { Indicador } from "@/components/ui/Indicador";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import { formatearImporte } from "@/lib/formato/precio";
import { DialogoExportar } from "./DialogoExportar";
import type { PuntoCliente } from "./DispersionSegmentos";

/**
 * Reportes, panel del Inicio (PLAN 5.3; PLAN-AMPLIACION D-24, D-26 y D-27).
 * - Solo datos reales: la segmentación de clientes (`GET /reports/customer-segments`) y la
 *   exportación (`GET /export`). Las vistas de ventas y equipo eran datos de ejemplo (D-24): se
 *   retiran hasta que el API dé esas cifras.
 * - El mapa de clientes dibuja los puntos que ya calcula el API (D-26).
 */

const Dispersion = dynamic(() => import("./DispersionSegmentos"), {
	ssr: false,
	loading: () => <Esqueleto sobre="superficie" className="h-90 w-full" />,
});

/** Muestra de color de cada segmento, la misma que su serie en el mapa (`colorSerie`). */
const MUESTRA_SEGMENTO = ["bg-(--color-grafica-1)", "bg-(--color-grafica-2)", "bg-(--color-grafica-3)", "bg-(--color-grafica-4)"];

const entero = new Intl.NumberFormat("es-MX");
const decimal = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const importe = (n: number) => formatearImporte(n) ?? "—";

interface ClienteSegmento extends PuntoCliente {
	email: string;
	tipoDominante: string;
	recenciaDias: number;
}
interface Segmento {
	nombre: string;
	descripcion: string;
	tamano: number;
	tamanoPct: number;
	ticketPromedio: number;
	frecuenciaPromedio: number;
	tipoDominante: string;
	clientes: ClienteSegmento[];
}
type RespuestaSegmentos =
	| { disponible: true; segmentosDetectados: number; clientesAnalizados: number; indiceSilueta: number; segmentos: Segmento[] }
	| { disponible: false; motivo: string };

const columnasClientes: ColumnaTabla<ClienteSegmento>[] = [
	{ clave: "cliente", titulo: "Cliente", principal: true, celda: (c) => c.nombre },
	{ clave: "correo", titulo: "Correo", celda: (c) => <span className="[overflow-wrap:anywhere]">{c.email}</span> },
	{ clave: "pedidos", titulo: "Pedidos", numerica: true, celda: (c) => entero.format(c.frecuencia) },
	{ clave: "ticket", titulo: "Ticket medio", numerica: true, celda: (c) => importe(c.ticketPromedio) },
	{ clave: "canal", titulo: "Canal", celda: (c) => c.tipoDominante },
	{ clave: "ultimo", titulo: "Último pedido", numerica: true, celda: (c) => (c.recenciaDias === 1 ? "Hace 1 día" : `Hace ${entero.format(c.recenciaDias)} días`) },
];

function VistaClientes() {
	const [carga, recargar] = useCarga(() => api.get<RespuestaSegmentos>("/reports/customer-segments"), "reportes: segmentación");

	if (carga.estado === "cargando")
		return (
			<div className="flex flex-col gap-(--espacio-md)" aria-busy="true">
				<span role="status" className="solo-lectores">
					Cargando la segmentación de clientes
				</span>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-3">
					{[0, 1, 2].map((i) => (
						<Esqueleto key={i} sobre="fondo" className="h-32" />
					))}
				</div>
				<Esqueleto sobre="fondo" className="h-90" />
			</div>
		);
	if (carga.estado === "error")
		return <EstadoError titulo="No pudimos traer la segmentación" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />;
	const d = carga.datos;
	if (!d.disponible)
		return <EstadoVacio icono={<Users />} titulo="Aún no hay segmentos de clientes" descripcion={d.motivo} />;

	return (
		<div className="flex flex-col gap-(--espacio-xl)">
			<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-3">
				<Indicador rotulo="Clientes analizados" valor={entero.format(d.clientesAnalizados)} />
				<Indicador rotulo="Segmentos" valor={entero.format(d.segmentosDetectados)} />
				<Indicador rotulo="Separación entre segmentos" valor={decimal.format(d.indiceSilueta)} detalle="De −1 a 1: cuanto más alto, más distintos" />
			</div>

			<BloquePanel titulo="Mapa de clientes" descripcion="Cada punto es un cliente; los cercanos compran de forma parecida.">
				<Dispersion segmentos={d.segmentos} />
			</BloquePanel>

			<BloquePanel titulo="Segmentos">
				<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 sm:grid-cols-2 xl:grid-cols-4">
					{d.segmentos.map((s, i) => (
						<Tarjeta
							key={s.nombre}
							como="li"
							titulo={
								<span className="flex items-center gap-2">
									<span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${MUESTRA_SEGMENTO[Math.min(i, MUESTRA_SEGMENTO.length - 1)]}`} />
									{s.nombre}
								</span>
							}
							nivelTitulo={3}
							descripcion={s.descripcion}
							pie={
								<Dialogo
									ancho="amplio"
									titulo={s.nombre}
									descripcion={`${entero.format(s.tamano)} clientes, el ${formatoPorcentaje(s.tamanoPct / 100)} del total.`}
									disparador={
										<Boton variante="secundario" tamano="compacto">
											{`Ver ${entero.format(s.tamano)} clientes`}
										</Boton>
									}
								>
									<Tabla leyenda={`Clientes del segmento ${s.nombre}`} columnas={columnasClientes} filas={s.clientes} claveFila={(c) => c.id} />
								</Dialogo>
							}
						>
							<Contraetiqueta
								pares={[
									{ rotulo: "Del total", valor: formatoPorcentaje(s.tamanoPct / 100) },
									{ rotulo: "Ticket medio", valor: importe(s.ticketPromedio) },
									{ rotulo: "Pedidos de media", valor: decimal.format(s.frecuenciaPromedio) },
									{ rotulo: "Canal habitual", valor: s.tipoDominante },
								]}
							/>
						</Tarjeta>
					))}
				</ul>
			</BloquePanel>
		</div>
	);
}

/** Panel «Reportes» del Inicio: la exportación y la segmentación de clientes. */
export function PanelReportes() {
	return (
		<div className="flex flex-col gap-(--espacio-xl)">
			<div className="flex justify-end">
				<DialogoExportar />
			</div>
			<VistaClientes />
		</div>
	);
}
