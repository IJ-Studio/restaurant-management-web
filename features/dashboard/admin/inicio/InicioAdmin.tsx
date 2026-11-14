"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { api } from "@/lib/api";
import { registrarError } from "@/lib/registro/registrar-error";
import { Selector } from "@/components/ui/Campo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { GraficaBarras } from "@/components/ui/graficas/GraficaBarras";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { Pestanas } from "@/components/ui/Pestanas";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { PanelCaja } from "@/features/dashboard/admin/caja/PanelCaja";
import { Nomina } from "@/features/dashboard/admin/nomina/Nomina";
import { PanelReportes } from "@/features/dashboard/admin/reportes/Reportes";
import { getReservations } from "@/features/reservations/services/reservations.service";
import { useCarga } from "@/hooks/useCarga";
import { useEventosPedidos } from "@/hooks/useEventosPedidos";
import { formatearImporte } from "@/lib/formato/precio";
import { pedirPanel } from "@/lib/paneles/api-panel";
import { conteo } from "@/lib/paneles/calculo";
import type { Calculo } from "@/components/ui/VerCalculo";

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
	/** Desglose de cada cifra (P1.4), del API. */
	calculos?: Partial<Record<"totalVentas" | "pedidosPendientes" | "mesasOcupadas", Calculo>>;
}
interface ProductoInventario {
	stock: number | string | null;
	/** El API aún no da el mínimo (pendiente aditivo): sin él, el producto no se juzga. */
	minStock?: number | string | null;
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

/** Siguiente paso de un pedido para el admin (paridad con la móvil: mismos textos y mismas rutas). */
const SIGUIENTE: Record<string, { texto: string; estatus?: string }> = {
	pendiente: { texto: "Confirmar y enviar a cocina" },
	abierta: { texto: "Empezar a preparar", estatus: "en_preparacion" },
	en_preparacion: { texto: "Marcar como lista", estatus: "lista" },
	lista: { texto: "Entregar en la mesa", estatus: "entregada" },
};
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

function Alertas() {
	const [inventario, recargar] = useCarga(() => pedirPanel<ProductoInventario[]>("/inventario/productos"), "inicio admin: inventario");
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
	const cifra = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
	const conMinimo = productos.filter((p) => cifra(p.minStock) !== null && cifra(p.stock) !== null);
	const bajos = conMinimo.filter((p) => cifra(p.stock)! <= cifra(p.minStock)!);
	const criticos = bajos.filter((p) => cifra(p.stock)! <= cifra(p.minStock)! / 2);
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
		const lista: { estatus?: string; fechaHora?: string }[] = await getReservations({ fechaDesde: hoy, fechaHasta: hoy });
		const validas = (Array.isArray(lista) ? lista : []).filter((r) => r.estatus !== "cancelada" && r.estatus !== "no_show");
		return conteo(
			"reservas de hoy = reservaciones del día que no están canceladas ni marcadas como no llegó",
			validas,
			(r, i) => `Reserva ${i + 1}${r.fechaHora ? ` · ${r.fechaHora.slice(11, 16)}` : ""}`,
			(r) => r.estatus ?? "sin estatus",
			{ periodo: { inicio: hoy, fin: hoy }, filtros: { estatus: "distinto de cancelada y no llegó" } },
		);
	}, "inicio admin: reservas");

	const e = estadisticas.estado === "listo" ? estadisticas.datos : null;
	const estado = estadisticas.estado;
	const comun = { estado, alReintentar: recargarEstadisticas } as const;
	return (
		<div className={REJILLA_INDICADORES}>
			<Indicador
				{...comun}
				rotulo="Ventas de hoy"
				valor={e ? formatearImporte(num(e.totalVentas)) : undefined}
				detalle="Desde la apertura"
				calculo={e?.calculos?.totalVentas}
				valorCalculo={e ? num(e.totalVentas) : undefined}
				className={INDICADOR_PROTAGONISTA}
				data-prueba="indicador-ventas"
			/>
			<Indicador
				{...comun}
				rotulo="Pedidos pendientes"
				valor={e ? entero.format(num(e.pedidosPendientes)) : undefined}
				detalle={e ? `${entero.format(num(e.pedidosEnPreparacion))} en preparación` : undefined}
				calculo={e?.calculos?.pedidosPendientes}
				valorCalculo={e ? num(e.pedidosPendientes) : undefined}
			/>
			<Indicador
				{...comun}
				rotulo="Mesas ocupadas"
				valor={e ? `${entero.format(num(e.mesasOcupadas))} de ${entero.format(num(e.totalMesas))}` : undefined}
				detalle={e ? `${entero.format(num(e.mesasLibres))} libres` : undefined}
				calculo={e?.calculos?.mesasOcupadas}
				valorCalculo={e ? num(e.mesasOcupadas) : undefined}
			/>
			<Indicador
				rotulo="Reservas de hoy"
				estado={reservas.estado}
				alReintentar={recargarReservas}
				valor={reservas.estado === "listo" ? entero.format(reservas.datos.datos.length) : undefined}
				detalle="Sin contar las canceladas"
				calculo={reservas.estado === "listo" ? reservas.datos : undefined}
				valorCalculo={reservas.estado === "listo" ? reservas.datos.datos.length : undefined}
			/>
		</div>
	);
}

function PedidosRecientes() {
	const [pedidos, recargar] = useCarga(() => pedirPanel<Pedido[]>("/pedidos/admin/recent"), "inicio admin: pedidos");
	useEventosPedidos(() => void recargar({ silenciosa: true }));
	const [filtro, setFiltro] = useState("todas");
	const [visibles, setVisibles] = useState(POR_PAGINA);
	const [avanzando, setAvanzando] = useState<string | null>(null);
	const { notificar } = useNotificaciones();

	async function avanzar(p: Pedido) {
		const paso = SIGUIENTE[p.status];
		if (!paso) return;
		setAvanzando(p.id);
		try {
			const id = encodeURIComponent(p.id);
			if (paso.estatus) await api.patch(`/pedidos/${id}/estatus`, { estatus: paso.estatus });
			else await api.post(`/pedidos/confirmar/${id}`, {});
			notificar({ tono: "exito", titulo: `${p.table || "Pedido"}: ${paso.texto.toLowerCase()}` });
			await recargar({ silenciosa: true });
		} catch (e) {
			registrarError(e, "inicio admin: avanzar pedido");
			notificar({ tono: "error", titulo: "No se pudo actualizar el pedido", descripcion: e instanceof Error ? e.message : "Vuelve a intentarlo en un momento." });
		} finally {
			setAvanzando(null);
		}
	}
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
		<BloquePanel
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
				tituloAcciones="Atender"
				acciones={(p) =>
					SIGUIENTE[p.status] ? (
						<Boton tamano="compacto" variante="secundario" cargando={avanzando === p.id} deshabilitado={avanzando !== null} aria-label={`${SIGUIENTE[p.status].texto}: ${p.table || p.customer}`} onClick={() => void avanzar(p)}>
							{SIGUIENTE[p.status].texto}
						</Boton>
					) : null
				}
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
		</BloquePanel>
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

function ServicioDeHoy() {
	return (
		<div className="flex flex-col gap-(--espacio-xl)">
			<Indicadores />
			<Alertas />
			<div className="grid grid-cols-1 items-start gap-(--espacio-xl) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<PedidosRecientes />
				<VentasDelDia />
			</div>
		</div>
	);
}

const PANELES = ["hoy", "caja", "nomina", "reportes"] as const;

/**
 * Inicio de administración (D-27): el servicio de hoy y, en pestañas, los paneles que antes eran
 * pantallas propias (Caja y propinas, Nómina y Reportes). Cada pestaña solo pide sus datos cuando
 * se abre; la elegida va en la URL (`?panel=`), y las rutas antiguas redirigen aquí.
 */
export function InicioAdmin({ panelInicial }: { panelInicial?: string }) {
	const inicial = PANELES.find((p) => p === panelInicial) ?? "hoy";
	const [activo, setActivo] = useState<string>(inicial);
	return (
		<PlantillaPanel titulo="Inicio">
			<Pestanas
				etiqueta="Paneles del inicio"
				parametroUrl="panel"
				valorInicial={inicial}
				alCambiar={setActivo}
				pestanas={[
					{ valor: "hoy", titulo: "Servicio de hoy", contenido: activo === "hoy" ? <ServicioDeHoy /> : null },
					{ valor: "caja", titulo: "Caja y propinas", contenido: activo === "caja" ? <PanelCaja /> : null },
					{ valor: "nomina", titulo: "Nómina", contenido: activo === "nomina" ? <Nomina /> : null },
					{ valor: "reportes", titulo: "Reportes", contenido: activo === "reportes" ? <PanelReportes /> : null },
				]}
			/>
		</PlantillaPanel>
	);
}
