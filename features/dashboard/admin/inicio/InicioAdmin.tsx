"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ClipboardList } from "lucide-react";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Selector } from "@/components/ui/Campo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { GraficaBarras } from "@/components/ui/graficas/GraficaBarras";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { getReservations } from "@/features/reservations/services/reservations.service";
import { useCarga } from "@/hooks/useCarga";
import { formatearImporte } from "@/lib/formato/precio";
import { pedirPanel } from "@/lib/paneles/api-panel";

/**
 * Inicio de administración (PLAN 5.2). Mismos endpoints que antes; cada bloque con sus estados de
 * carga, vacío y error, y nunca un cero en lugar de un error (NP-17).
 *
 * - **Indicadores:** ventas de hoy (la protagonista), pedidos pendientes, ocupación de mesas y
 *   reservas de hoy. El API no da la comparación con la semana anterior, ni los cubiertos, ni el
 *   ticket medio: no se inventan (NP-44).
 * - **Alertas accionables:** inventario bajo mínimo, con enlace a inventario.
 * - **Bloque principal:** pedidos recientes (tabla que pasa a tarjetas por debajo de 768 px).
 * - **Bloque secundario:** ventas de hoy por hora.
 */

interface Estadisticas {
	totalVentas: number;
	pedidosPendientes: number;
	pedidosEnPreparacion: number;
	mesasOcupadas: number;
	mesasLibres: number;
	totalMesas: number;
}
interface ProductoInventario {
	stock: number;
	minStock: number;
}
interface VentasPorHora {
	ventas: number[];
	totalDia: number;
}
interface Pedido {
	id: string;
	customer: string;
	time: string;
	item: string;
	table: string;
	status: string;
	total: number;
}

const entero = new Intl.NumberFormat("es-MX");
const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

/** Fecha local de hoy en `AAAA-MM-DD`, el formato del filtro de reservas. */
function hoyLocal(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ESTADOS_PEDIDO: Record<string, { texto: string; tono: TonoInsignia }> = {
	pendiente: { texto: "Pendiente", tono: "aviso" },
	abierta: { texto: "En preparación", tono: "info" },
	entregada: { texto: "Entregado", tono: "exito" },
	cancelada: { texto: "Cancelado", tono: "error" },
	completada: { texto: "Completado", tono: "neutro" },
};
const OPCIONES_FILTRO = [
	{ valor: "todas", texto: "Todos" },
	{ valor: "pendiente", texto: "Pendientes" },
	{ valor: "abierta", texto: "En preparación" },
	{ valor: "entregada", texto: "Entregados" },
	{ valor: "cancelada", texto: "Cancelados" },
];
const POR_PAGINA = 10;

function Bloque({ titulo, descripcion, acciones, children }: { titulo: string; descripcion?: string; acciones?: ReactNode; children: ReactNode }) {
	const id = useId();
	return (
		<section aria-labelledby={id} className="flex min-w-0 flex-col gap-(--espacio-md)">
			<div className="flex flex-wrap items-end justify-between gap-(--espacio-sm)">
				<div className="flex min-w-0 flex-col gap-1">
					<h2 id={id} className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.2] text-texto-principal">
						{titulo}
					</h2>
					{descripcion && <p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">{descripcion}</p>}
				</div>
				{acciones}
			</div>
			{children}
		</section>
	);
}

function Alertas() {
	const [inventario, recargar] = useCarga(() => pedirPanel<ProductoInventario[]>("/api/inventory/products"), "inicio admin: inventario");
	if (inventario.estado === "cargando") return null;
	if (inventario.estado === "error")
		return (
			<Aviso
				tono="error"
				rol={null}
				titulo="No pudimos comprobar el inventario."
				accion={
					<Boton variante="secundario" tamano="compacto" onClick={() => void recargar()}>
						Reintentar
					</Boton>
				}
			>
				Las alertas de existencias no están al día.
			</Aviso>
		);
	const productos = Array.isArray(inventario.datos) ? inventario.datos : [];
	const bajos = productos.filter((p) => num(p.stock) <= num(p.minStock));
	const criticos = bajos.filter((p) => num(p.stock) <= num(p.minStock) / 2);
	if (bajos.length === 0) return null;
	const accion = (
		<BotonEnlace href="/dashboard/admin/inventory" variante="secundario" tamano="compacto">
			Ver inventario
		</BotonEnlace>
	);
	return criticos.length > 0 ? (
		<Aviso tono="error" rol={null} titulo={`${criticos.length} ${criticos.length === 1 ? "producto está" : "productos están"} en nivel crítico.`} accion={accion}>
			Conviene pedirlos hoy. En total, {bajos.length} por debajo del mínimo.
		</Aviso>
	) : (
		<Aviso tono="aviso" rol={null} titulo={`${bajos.length} ${bajos.length === 1 ? "producto está" : "productos están"} por debajo del mínimo.`} accion={accion}>
			Revisa el inventario antes del próximo pedido a proveedores.
		</Aviso>
	);
}

function Indicadores() {
	const [estadisticas, recargarEstadisticas] = useCarga(() => pedirPanel<Estadisticas>("/dashboard/admin/stats"), "inicio admin: indicadores");
	const [reservas, recargarReservas] = useCarga(async () => {
		const hoy = hoyLocal();
		const lista: { estatus?: string }[] = await getReservations({ fechaDesde: hoy, fechaHasta: hoy });
		return (Array.isArray(lista) ? lista : []).filter((r) => r.estatus !== "cancelada" && r.estatus !== "no_show").length;
	}, "inicio admin: reservas");

	const e = estadisticas.estado === "listo" ? estadisticas.datos : null;
	const estado = estadisticas.estado;
	const comun = { estado, alReintentar: recargarEstadisticas } as const;
	return (
		<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
			<Indicador
				{...comun}
				rotulo="Ventas de hoy"
				valor={e ? formatearImporte(num(e.totalVentas)) : undefined}
				detalle="Desde la apertura"
				className="sm:col-span-2 xl:col-span-1"
				data-prueba="indicador-ventas"
			/>
			<Indicador
				{...comun}
				rotulo="Pedidos pendientes"
				valor={e ? entero.format(num(e.pedidosPendientes)) : undefined}
				detalle={e ? `${entero.format(num(e.pedidosEnPreparacion))} en preparación` : undefined}
			/>
			<Indicador
				{...comun}
				rotulo="Mesas ocupadas"
				valor={e ? `${entero.format(num(e.mesasOcupadas))} de ${entero.format(num(e.totalMesas))}` : undefined}
				detalle={e ? `${entero.format(num(e.mesasLibres))} libres` : undefined}
			/>
			<Indicador
				rotulo="Reservas de hoy"
				estado={reservas.estado}
				alReintentar={recargarReservas}
				valor={reservas.estado === "listo" ? entero.format(reservas.datos) : undefined}
				detalle="Sin contar las canceladas"
			/>
		</div>
	);
}

function PedidosRecientes() {
	const [pedidos, recargar] = useCarga(() => pedirPanel<Pedido[]>("/pedidos/admin/recent"), "inicio admin: pedidos");
	const [filtro, setFiltro] = useState("todas");
	const [visibles, setVisibles] = useState(POR_PAGINA);
	const filtrados = useMemo(() => {
		const lista = pedidos.estado === "listo" && Array.isArray(pedidos.datos) ? pedidos.datos : [];
		return filtro === "todas" ? lista : lista.filter((p) => p.status === filtro);
	}, [pedidos, filtro]);

	const columnas: ColumnaTabla<Pedido>[] = [
		{ clave: "cliente", titulo: "Cliente", principal: true, celda: (p) => p.customer || "Sin nombre" },
		{ clave: "platos", titulo: "Pedido", celda: (p) => p.item || "—" },
		{ clave: "mesa", titulo: "Mesa", celda: (p) => p.table || "Para llevar" },
		{ clave: "hora", titulo: "Hora", celda: (p) => p.time || "—" },
		{
			clave: "estado",
			titulo: "Estado",
			celda: (p) => {
				const e = ESTADOS_PEDIDO[p.status] ?? { texto: p.status || "Sin estado", tono: "neutro" as const };
				return <Insignia tono={e.tono}>{e.texto}</Insignia>;
			},
		},
		{ clave: "total", titulo: "Total", numerica: true, celda: (p) => formatearImporte(num(p.total)) ?? "—" },
	];

	return (
		<Bloque
			titulo="Pedidos recientes"
			acciones={
				<Selector
					etiqueta="Mostrar"
					opciones={OPCIONES_FILTRO}
					value={filtro}
					onChange={(ev) => {
						setFiltro(ev.target.value);
						setVisibles(POR_PAGINA);
					}}
				/>
			}
		>
			<Tabla
				leyenda="Pedidos recientes"
				columnas={columnas}
				filas={filtrados.slice(0, visibles)}
				claveFila={(p) => p.id}
				estado={pedidos.estado === "cargando" ? "cargando" : "listo"}
				error={
					pedidos.estado === "error" ? (
						<EstadoError titulo="No pudimos traer los pedidos" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />
					) : undefined
				}
				vacio={
					<EstadoVacio
						icono={<ClipboardList />}
						titulo={filtro === "todas" ? "Todavía no hay pedidos" : "No hay pedidos con este estado"}
						descripcion={filtro === "todas" ? "Los pedidos de hoy aparecerán aquí." : "Prueba con otro filtro."}
					/>
				}
			/>
			{visibles < filtrados.length && (
				<Boton variante="secundario" className="self-center" onClick={() => setVisibles((v) => v + POR_PAGINA)}>
					{`Mostrar ${Math.min(POR_PAGINA, filtrados.length - visibles)} más`}
				</Boton>
			)}
		</Bloque>
	);
}

function VentasDelDia() {
	const [ventas, recargar] = useCarga(() => pedirPanel<VentasPorHora>("/dashboard/admin/ventas-por-hora"), "inicio admin: ventas por hora");
	// Solo las horas con movimiento (al menos seis): 24 barras no se leen en un móvil.
	const { categorias, valores } = useMemo(() => {
		const lista = ventas.estado === "listo" && Array.isArray(ventas.datos.ventas) ? ventas.datos.ventas.map(num) : [];
		const conVentas = lista.map((v, h) => (v > 0 ? h : -1)).filter((h) => h >= 0);
		if (conVentas.length === 0) return { categorias: [], valores: [] };
		let desde = conVentas[0];
		let hasta = conVentas[conVentas.length - 1];
		while (hasta - desde < 5) {
			if (hasta < 23) hasta++;
			else desde--;
		}
		const horas = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
		return { categorias: horas.map((h) => `${h}:00`), valores: horas.map((h) => lista[h] ?? 0) };
	}, [ventas]);

	return (
		<GraficaBarras
			titulo="Ventas de hoy por hora"
			descripcion={ventas.estado === "listo" ? `Total del día: ${formatearImporte(num(ventas.datos.totalDia))}` : undefined}
			estado={ventas.estado}
			alReintentar={recargar}
			categorias={categorias}
			series={[{ clave: "ventas", nombre: "Ventas", valores }]}
			formatoValor={(n) => formatearImporte(n) ?? "—"}
			tituloCategoria="Hora"
			textoVacio="Aún no hay ventas registradas hoy."
		/>
	);
}

export function InicioAdmin({ nombre }: { nombre: string }) {
	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina antetitulo="Inicio" titulo={nombre ? `Hola, ${nombre}` : "Hola"} descripcion="Así va el servicio de hoy." />
			<Indicadores />
			<Alertas />
			<div className="grid grid-cols-1 items-start gap-(--espacio-xl) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<PedidosRecientes />
				<VentasDelDia />
			</div>
		</div>
	);
}
