"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Users } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { Boton } from "@/components/ui/Boton";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { Dialogo } from "@/components/ui/Dialogo";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { GraficaBarras } from "@/components/ui/graficas/GraficaBarras";
import { GraficaDonut } from "@/components/ui/graficas/GraficaDonut";
import { formatoPorcentaje } from "@/components/ui/graficas/formato";
import { Indicador } from "@/components/ui/Indicador";
import { Pestanas } from "@/components/ui/Pestanas";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { Tarjeta } from "@/components/ui/Tarjeta";
import {
	MONTHLY_TREND,
	PAYMENT_DIST,
	PERIOD_STATS,
	STAFF_METRICS,
	TOP_PRODUCTS,
	WEEKLY_SALES,
	type ProductMetric,
	type StaffMetric,
} from "@/features/dashboard/admin/data/reportsMock";
import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import { formatearImporte } from "@/lib/formato/precio";
import { DialogoExportar } from "./DialogoExportar";
import type { PuntoCliente } from "./DispersionSegmentos";

/**
 * Reportes (PLAN 5.3). Tres vistas en pestañas (`?vista=`):
 * - **Ventas:** datos de ejemplo de `reportsMock`, con su insignia (D-13). Las frases que antes
 *   venían escritas a mano («Mejor día: Sábado», «Proyección $148k», «+3.1% MoM») ahora se calculan
 *   de los mismos datos o se retiran; nada inventado.
 * - **Equipo:** datos de ejemplo.
 * - **Clientes:** la segmentación real (`GET /reports/customer-segments`), que solo se pide al
 *   abrir su pestaña, como antes. Se retiran los textos técnicos («K-Means», «PCA», D-20).
 */

const Dispersion = dynamic(() => import("./DispersionSegmentos"), {
	ssr: false,
	loading: () => <Esqueleto sobre="superficie" className="h-90 w-full" />,
});

const PERIODOS = [
	{ valor: "semana", texto: "Esta semana" },
	{ valor: "mes", texto: "Este mes" },
	{ valor: "año", texto: "Este año" },
] as const;
type Periodo = (typeof PERIODOS)[number]["valor"];

/** Muestra de color de cada segmento, la misma que su serie en el mapa (`colorSerie`). */
const MUESTRA_SEGMENTO = ["bg-(--color-grafica-1)", "bg-(--color-grafica-2)", "bg-(--color-grafica-3)", "bg-(--color-grafica-4)"];

const entero = new Intl.NumberFormat("es-MX");
const decimal = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const compacto = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 });
const ESPACIO_DURO = String.fromCharCode(160);
const importe = (n: number) => formatearImporte(n) ?? "—";

function SelectorPeriodo({ periodo, alCambiar }: { periodo: Periodo; alCambiar: (p: Periodo) => void }) {
	return (
		<div role="group" aria-label="Periodo de los indicadores" className="flex flex-wrap gap-2">
			{PERIODOS.map((p) => (
				<Boton key={p.valor} variante={p.valor === periodo ? "primario" : "secundario"} tamano="compacto" aria-pressed={p.valor === periodo} onClick={() => alCambiar(p.valor)}>
					{p.texto}
				</Boton>
			))}
		</div>
	);
}

function VistaVentas() {
	const [periodo, setPeriodo] = useState<Periodo>("semana");
	const s = PERIOD_STATS[periodo];
	const ventasDia = WEEKLY_SALES.map((d) => d.ventas ?? 0);
	const mejor = WEEKLY_SALES[ventasDia.indexOf(Math.max(...ventasDia))];
	const peor = WEEKLY_SALES[ventasDia.indexOf(Math.min(...ventasDia))];
	const totalSemana = ventasDia.reduce((a, b) => a + b, 0);
	const meses = MONTHLY_TREND.map((m) => m.total ?? 0);
	const [penultimo, ultimo] = meses.slice(-2);
	const mejorMes = MONTHLY_TREND[meses.indexOf(Math.max(...meses))];
	const pagoPrincipal = [...PAYMENT_DIST].sort((a, b) => b.pct - a.pct)[0];

	const columnasPlatos: ColumnaTabla<ProductMetric>[] = [
		{ clave: "plato", titulo: "Plato", principal: true, celda: (p) => p.name },
		{ clave: "unidades", titulo: "Unidades", numerica: true, celda: (p) => entero.format(p.ventas) },
		{ clave: "ingresos", titulo: "Ingresos", numerica: true, celda: (p) => importe(p.ingreso) },
		{ clave: "tendencia", titulo: "Tendencia", numerica: true, celda: (p) => formatoPorcentaje(p.trend / 100, true) },
	];

	return (
		<div className="flex flex-col gap-(--espacio-xl)">
			<BloquePanel titulo="Resumen del periodo" datosDeEjemplo acciones={<SelectorPeriodo periodo={periodo} alCambiar={setPeriodo} />}>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
					<Indicador
						rotulo="Ventas"
						valor={importe(s.ventas)}
						comparacion={{ cambio: s.growth / 100, referencia: "frente al periodo anterior" }}
						className="sm:col-span-2 xl:col-span-1"
					/>
					<Indicador rotulo="Pedidos" valor={entero.format(s.pedidos)} />
					<Indicador rotulo="Ticket medio" valor={importe(s.ticket)} />
					<Indicador rotulo="Clientes distintos" valor={entero.format(s.clientes)} />
				</div>
			</BloquePanel>

			<div className="grid grid-cols-1 gap-(--espacio-xl) xl:grid-cols-2">
				<div className="flex min-w-0 flex-col gap-(--espacio-md)">
					<GraficaBarras
						titulo="Ventas por día"
						descripcion={`Esta semana: ${importe(totalSemana)}`}
						datosDeEjemplo
						categorias={WEEKLY_SALES.map((d) => d.day ?? "")}
						series={[{ clave: "ventas", nombre: "Ventas", valores: ventasDia }]}
						formatoValor={importe}
						tituloCategoria="Día"
					/>
					<Contraetiqueta
						columnas={1}
						pares={[
							{ rotulo: "Mejor día", valor: `${mejor.day} · ${importe(mejor.ventas ?? 0)}` },
							{ rotulo: "Día más flojo", valor: `${peor.day} · ${importe(peor.ventas ?? 0)}` },
							{ rotulo: "Media diaria", valor: importe(totalSemana / ventasDia.length) },
						]}
					/>
				</div>
				<div className="flex min-w-0 flex-col gap-(--espacio-md)">
					<GraficaBarras
						titulo="Ingresos por mes"
						descripcion={`Últimos ${MONTHLY_TREND.length} meses`}
						datosDeEjemplo
						categorias={MONTHLY_TREND.map((m) => m.mes ?? "")}
						series={[{ clave: "ingresos", nombre: "Ingresos", valores: meses }]}
						formatoValor={importe}
						tituloCategoria="Mes"
					/>
					<Contraetiqueta
						columnas={1}
						pares={[
							{ rotulo: "Mejor mes", valor: `${mejorMes.mes} · ${importe(mejorMes.total ?? 0)}` },
							{ rotulo: "Último mes", valor: penultimo ? `${MONTHLY_TREND[MONTHLY_TREND.length - 1].mes} · ${formatoPorcentaje((ultimo - penultimo) / penultimo, true)} frente al anterior` : "—" },
						]}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 items-start gap-(--espacio-xl) xl:grid-cols-2">
				<GraficaDonut
					titulo="Formas de pago"
					descripcion={`${pagoPrincipal.method}, la más usada: ${formatoPorcentaje(pagoPrincipal.pct / 100)}`}
					datosDeEjemplo
					porciones={PAYMENT_DIST.map((p) => ({ nombre: p.method, valor: p.amount }))}
					formatoValor={importe}
					formatoTotal={(n) => `$${ESPACIO_DURO}${compacto.format(n)}`}
					rotuloTotal="Total"
					tituloCategoria="Forma de pago"
				/>
				<BloquePanel titulo="Platos más vendidos" datosDeEjemplo>
					<Tabla leyenda="Platos más vendidos" columnas={columnasPlatos} filas={TOP_PRODUCTS} claveFila={(p) => p.name} />
				</BloquePanel>
			</div>
		</div>
	);
}

function VistaEquipo() {
	const columnas: ColumnaTabla<StaffMetric>[] = [
		{ clave: "nombre", titulo: "Nombre", principal: true, celda: (p) => p.name },
		{ clave: "puesto", titulo: "Puesto", celda: (p) => p.rol },
		{ clave: "pedidos", titulo: "Pedidos", numerica: true, celda: (p) => entero.format(p.pedidos) },
		{ clave: "propinas", titulo: "Propinas", numerica: true, celda: (p) => importe(p.propinas) },
		{ clave: "satisfaccion", titulo: "Satisfacción", numerica: true, celda: (p) => `${decimal.format(p.satisfaccion)} de 5` },
	];
	return (
		<BloquePanel titulo="Desempeño del equipo" datosDeEjemplo>
			<Tabla leyenda="Desempeño del equipo" columnas={columnas} filas={STAFF_METRICS} claveFila={(p) => p.name} />
		</BloquePanel>
	);
}

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

const VISTAS = ["ventas", "equipo", "clientes"] as const;

export function Reportes({ vistaInicial }: { vistaInicial?: string }) {
	const inicial = VISTAS.find((v) => v === vistaInicial) ?? "ventas";
	const [activa, setActiva] = useState<string>(inicial);
	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina antetitulo="Análisis" titulo="Reportes" descripcion="Ventas, equipo y clientes, de un vistazo." acciones={<DialogoExportar />} />
			<Pestanas
				etiqueta="Vistas de los reportes"
				parametroUrl="vista"
				valorInicial={inicial}
				alCambiar={setActiva}
				pestanas={[
					{ valor: "ventas", titulo: "Ventas", contenido: activa === "ventas" ? <VistaVentas /> : null },
					{ valor: "equipo", titulo: "Equipo", contenido: activa === "equipo" ? <VistaEquipo /> : null },
					{ valor: "clientes", titulo: "Clientes", contenido: activa === "clientes" ? <VistaClientes /> : null },
				]}
			/>
		</div>
	);
}
