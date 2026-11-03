"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, RefreshCw, Sparkles } from "lucide-react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { GraficaDonut } from "@/components/ui/graficas/GraficaDonut";
import { GraficaLinea } from "@/components/ui/graficas/GraficaLinea";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Salud del sistema (PLAN 5.16, NP-24). Los mismos ocho endpoints de `/db-metrics/*`, pedidos a la
 * vez cada 10 s, y la limpieza manual (`POST /db-metrics/vacuum-manual`). Lo nuevo:
 * - **Semáforo:** un estado general (el peor de seis comprobaciones, con los umbrales que ya usaba la
 *   pantalla) y la lista de comprobaciones, cada una con su valor y su estado en texto.
 * - **Detalle desplegable** por área (`<details>`), con las gráficas y tablas del catálogo.
 * - Al refrescar no se borra lo que hay; la limpieza pide confirmación y avisa con notificaciones
 *   (antes, `alert()` con el error crudo).
 * - Sin hex, estilos en línea ni gráficas hechas a mano (antes, 1500 líneas con todo eso).
 */

const BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (BASE && BASE.length > 0 ? BASE : "/api").replace(/\/$/, "");
const INTERVALO_MS = 10_000;

interface Cpu {
	totalPct: number;
	postgresPct: number;
	loadAvg1m: number;
	iowaitPct: number;
	history: { ts: string; totalPct: number; postgresPct: number }[];
}
interface LecturaEscritura {
	reads: number;
	writes: number;
	readPct: number;
	writePct: number;
}
interface Limpieza {
	tableName: string;
	deadTuples: number;
	liveTuples: number;
	deadPct: number;
	vacuumRunning: boolean;
	minutesSinceVacuum: number | null;
}
interface Espacio {
	totalMB: number;
	tablesMB: number;
	indexesMB: number;
	toastMB: number;
	growth24hMB: number;
	history: { ts: string; totalMB: number }[];
}
interface TablaActiva {
	tableName: string;
	seqScan: number;
	idxScan: number;
	totalOps: number;
	sizeMB: number;
}
type Operacion = "SELECT" | "INSERT" | "UPDATE" | "DELETE";
type Latencia = Record<Operacion, { avgMs: number; p95Ms: number; p99Ms: number }> & { history: ({ ts: string } & Record<Operacion, number>)[] };
interface Conexiones {
	active: number;
	idle: number;
	idleInTx: number;
	waiting: number;
	total: number;
	maxConnections: number;
	usagePct: number;
	history: { ts: string; total: number; active: number }[];
}
interface Espera {
	category: string;
	pct: number;
	count: number;
}
interface Metricas {
	cpu: Cpu;
	rw: LecturaEscritura;
	limpieza: Limpieza[];
	espacio: Espacio;
	activas: TablaActiva[];
	latencia: Latencia;
	conexiones: Conexiones;
	esperas: Espera[];
}

const RUTAS = ["cpu", "rw-ratio", "autovacuum", "storage", "hot-tables", "latency", "connections", "wait-events"] as const;

function useMetricas() {
	const [datos, setDatos] = useState<Metricas | null>(null);
	const [estado, setEstado] = useState<"cargando" | "error" | "listo">("cargando");
	const [actualizado, setActualizado] = useState<Date | null>(null);
	const [refrescando, setRefrescando] = useState(false);
	const primera = useRef(true);

	const pedir = useCallback(async () => {
		setRefrescando(true);
		try {
			const respuestas = await Promise.all(RUTAS.map((r) => fetch(`${API}/db-metrics/${r}`, { cache: "no-store" })));
			if (respuestas.some((r) => !r.ok)) throw new Error("db-metrics: algún endpoint respondió con error");
			const [cpu, rw, limpieza, espacio, activas, latencia, conexiones, esperas] = await Promise.all(respuestas.map((r) => r.json()));
			setDatos({ cpu, rw, limpieza: limpieza ?? [], espacio, activas: activas ?? [], latencia, conexiones, esperas: esperas ?? [] });
			setActualizado(new Date());
			setEstado("listo");
		} catch (e) {
			if (primera.current) registrarError(e, "salud: métricas");
			// Si ya había datos, se conservan y solo se avisa en la cabecera.
			setEstado((s) => (s === "listo" ? "listo" : "error"));
		} finally {
			primera.current = false;
			setRefrescando(false);
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial y refresco periódico
		void pedir();
		const t = setInterval(() => void pedir(), INTERVALO_MS);
		return () => clearInterval(t);
	}, [pedir]);

	return { datos, estado, actualizado, refrescando, pedir };
}

type Nivel = "bien" | "atencion" | "alerta";
const NIVEL: Record<Nivel, { texto: string; tono: TonoInsignia }> = {
	bien: { texto: "Bien", tono: "exito" },
	atencion: { texto: "Conviene revisar", tono: "aviso" },
	alerta: { texto: "Necesita atención", tono: "error" },
};
const peor = (niveles: Nivel[]): Nivel => (niveles.includes("alerta") ? "alerta" : niveles.includes("atencion") ? "atencion" : "bien");

const decimal = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const entero = new Intl.NumberFormat("es-MX");
const pct = (n: number) => `${decimal.format(n)} %`;
const mb = (n: number) => (n >= 1024 ? `${decimal.format(n / 1024)} GB` : `${decimal.format(n)} MB`);
const hora = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const escribirHora = (iso: string) => {
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? iso : hora.format(d);
};

interface Comprobacion {
	clave: string;
	area: string;
	valor: string;
	nivel: Nivel;
	explicacion: string;
}

function comprobar(m: Metricas): Comprobacion[] {
	const bloqueos = m.esperas.find((e) => e.category === "Lock")?.pct ?? 0;
	const maxBasura = Math.max(0, ...m.limpieza.map((t) => t.deadPct));
	const sinLimpiar = Math.max(0, ...m.limpieza.map((t) => t.minutesSinceVacuum ?? 0));
	return [
		{ clave: "cpu", area: "Procesador", valor: pct(m.cpu.totalPct), nivel: m.cpu.totalPct >= 85 ? "alerta" : m.cpu.totalPct >= 60 ? "atencion" : "bien", explicacion: "Qué tan ocupado está el servidor." },
		{ clave: "conexiones", area: "Conexiones", valor: pct(m.conexiones.usagePct), nivel: m.conexiones.usagePct > 80 ? "alerta" : m.conexiones.usagePct > 60 ? "atencion" : "bien", explicacion: "Cuántas de las conexiones posibles están en uso." },
		{ clave: "respuesta", area: "Tiempo de respuesta", valor: `${decimal.format(m.latencia.SELECT.p95Ms)} ms`, nivel: m.latencia.SELECT.p95Ms > 100 ? "alerta" : m.latencia.SELECT.p95Ms > 50 ? "atencion" : "bien", explicacion: "Lo que tarda en contestar 95 de cada 100 consultas." },
		{ clave: "bloqueos", area: "Esperas por bloqueo", valor: pct(bloqueos), nivel: bloqueos > 20 ? "alerta" : bloqueos > 10 ? "atencion" : "bien", explicacion: "Tiempo perdido esperando a que otra operación termine." },
		{ clave: "limpieza", area: "Limpieza interna", valor: `${pct(maxBasura)} en la peor tabla`, nivel: sinLimpiar > 1440 ? "alerta" : maxBasura > 30 ? "atencion" : "bien", explicacion: "Datos viejos pendientes de limpiar; más de un día sin limpiar es alerta." },
		{ clave: "espacio", area: "Crecimiento del espacio", valor: `${mb(m.espacio.growth24hMB)} en 24 h`, nivel: m.espacio.growth24hMB > 100 ? "alerta" : "bien", explicacion: "Cuánto creció la base de datos en el último día." },
	];
}

function Desplegable({ titulo, resumen, children }: { titulo: string; resumen: string; children: ReactNode }) {
	return (
		<details className="group rounded-tarjeta border border-borde-sutil bg-superficie open:pb-(--espacio-md)">
			<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-tarjeta px-(--espacio-md) py-(--espacio-sm) text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco [&::-webkit-details-marker]:hidden">
				<span className="flex min-w-0 flex-col">
					<span className="font-semibold">{titulo}</span>
					<span className="text-(length:--texto-pequeno) text-texto-secundario">{resumen}</span>
				</span>
				<ChevronDown aria-hidden="true" className="size-5 shrink-0 stroke-[1.5] transition-transform duration-(--duracion-breve) group-open:rotate-180" />
			</summary>
			<div className="flex flex-col gap-(--espacio-md) px-(--espacio-md)">{children}</div>
		</details>
	);
}

export function SaludSistema() {
	const { datos: m, estado, actualizado, refrescando, pedir } = useMetricas();
	const [limpiando, setLimpiando] = useState(false);
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	async function limpiar() {
		const ok = await confirmar({
			titulo: "¿Limpiar ahora la base de datos?",
			descripcion: "Se ejecuta en segundo plano y recupera espacio y velocidad. Mientras dura, el sistema puede ir algo más lento.",
			textoConfirmar: "Limpiar ahora",
		});
		if (!ok) return;
		setLimpiando(true);
		try {
			const res = await fetch(`${API}/db-metrics/vacuum-manual`, { cache: "no-store", method: "POST" });
			if (!res.ok) throw new Error(`vacuum-manual respondió ${res.status}`);
			notificar({ tono: "exito", titulo: "Limpieza en marcha", descripcion: "Se hace en segundo plano." });
			void pedir();
		} catch (e) {
			registrarError(e, "salud: limpieza manual");
			notificar({ tono: "error", titulo: "No se pudo iniciar la limpieza", descripcion: "Vuelve a intentarlo en un momento." });
		} finally {
			setLimpiando(false);
		}
	}

	const comprobaciones = m ? comprobar(m) : [];
	const general = peor(comprobaciones.map((c) => c.nivel));
	const indicador = { estado: m ? ("listo" as const) : estado, alReintentar: pedir };

	const columnasComprobacion: ColumnaTabla<Comprobacion>[] = [
		{ clave: "area", titulo: "Área", principal: true, celda: (c) => c.area },
		{ clave: "valor", titulo: "Ahora", numerica: true, celda: (c) => c.valor },
		{ clave: "estado", titulo: "Estado", celda: (c) => <Insignia tono={NIVEL[c.nivel].tono} className="whitespace-nowrap">{NIVEL[c.nivel].texto}</Insignia> },
		{ clave: "que", titulo: "Qué mide", celda: (c) => c.explicacion },
	];

	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina
				antetitulo="Sistema"
				titulo="Salud del sistema"
				descripcion="Cómo va la base de datos que guarda pedidos, reservas y la carta. Se actualiza sola cada 10 segundos."
				acciones={
					<>
						<Boton variante="secundario" icono={<RefreshCw />} cargando={refrescando} textoCargando="Actualizando…" onClick={() => void pedir()}>
							Actualizar
						</Boton>
						<Boton variante="secundario" icono={<Sparkles />} cargando={limpiando} textoCargando="Iniciando…" onClick={limpiar}>
							Limpiar ahora
						</Boton>
					</>
				}
			/>

			{estado === "error" && !m ? (
				<EstadoError titulo="No pudimos leer el estado del sistema" descripcion="Vuelve a intentarlo en un momento." alReintentar={pedir} />
			) : (
				<>
					<section aria-labelledby="semaforo" className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-col gap-1">
								<h2 id="semaforo" className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.15] text-texto-principal">
									{!m ? "Comprobando…" : general === "bien" ? "Todo en orden" : general === "atencion" ? "Conviene revisar algo" : "Hay algo que necesita atención"}
								</h2>
								<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario" aria-live="polite">
									{actualizado ? `Última lectura a las ${hora.format(actualizado)}.` : "Leyendo las métricas…"}
								</p>
							</div>
							{m && <Insignia tono={NIVEL[general].tono}>{NIVEL[general].texto}</Insignia>}
						</div>
						<Tabla leyenda="Comprobaciones de salud" columnas={columnasComprobacion} filas={comprobaciones} claveFila={(c) => c.clave} estado={m ? "listo" : "cargando"} />
					</section>

					<div className={REJILLA_INDICADORES}>
						<Indicador {...indicador} rotulo="Procesador" valor={m ? pct(m.cpu.totalPct) : undefined} detalle={m ? `La base de datos usa ${pct(m.cpu.postgresPct)}` : undefined} className={INDICADOR_PROTAGONISTA} />
						<Indicador {...indicador} rotulo="Conexiones" valor={m ? `${entero.format(m.conexiones.total)} de ${entero.format(m.conexiones.maxConnections)}` : undefined} detalle={m ? `${entero.format(m.conexiones.active)} trabajando` : undefined} />
						<Indicador {...indicador} rotulo="Respuesta" valor={m ? `${decimal.format(m.latencia.SELECT.p95Ms)} ms` : undefined} detalle="95 de cada 100 consultas" />
						<Indicador {...indicador} rotulo="Espacio" valor={m ? mb(m.espacio.totalMB) : undefined} detalle={m ? `+${mb(m.espacio.growth24hMB)} en 24 h` : undefined} />
					</div>

					{m && (
						<BloquePanel titulo="Detalle por área" descripcion="Abre cada área para ver sus cifras.">
							<div className="flex flex-col gap-(--espacio-sm)">
								<Desplegable titulo="Procesador" resumen={`${pct(m.cpu.totalPct)} en uso`}>
									<Contraetiqueta
										columnas={2}
										pares={[
											{ rotulo: "Uso total", valor: pct(m.cpu.totalPct) },
											{ rotulo: "Base de datos", valor: pct(m.cpu.postgresPct) },
											{ rotulo: "Carga (1 min)", valor: decimal.format(m.cpu.loadAvg1m) },
											{ rotulo: "Espera de disco", valor: pct(m.cpu.iowaitPct) },
										]}
									/>
									<GraficaLinea
										titulo="Uso del procesador"
										categorias={m.cpu.history.map((h) => escribirHora(h.ts))}
										series={[
											{ clave: "total", nombre: "Total", valores: m.cpu.history.map((h) => h.totalPct) },
											{ clave: "bd", nombre: "Base de datos", valores: m.cpu.history.map((h) => h.postgresPct) },
										]}
										formatoValor={pct}
										tituloCategoria="Hora"
										textoVacio="Aún no hay historial."
									/>
								</Desplegable>

								<Desplegable titulo="Lecturas y escrituras" resumen={`${pct(m.rw.readPct)} lecturas`}>
									<GraficaDonut
										titulo="Qué se hace con los datos"
										porciones={[
											{ nombre: "Consultar", valor: m.rw.reads },
											{ nombre: "Guardar o cambiar", valor: m.rw.writes },
										]}
										formatoValor={(n) => entero.format(n)}
										formatoTotal={(n) => new Intl.NumberFormat("es-MX", { notation: "compact" }).format(n)}
										rotuloTotal="Operaciones"
										tituloCategoria="Tipo"
									/>
								</Desplegable>

								<Desplegable titulo="Limpieza interna" resumen={contarTablas(m.limpieza.length)}>
									<Tabla
										leyenda="Limpieza por tabla"
										columnas={[
											{ clave: "tabla", titulo: "Tabla", principal: true, celda: (t: Limpieza) => t.tableName },
											{ clave: "basura", titulo: "Datos viejos", numerica: true, celda: (t: Limpieza) => pct(t.deadPct) },
											{ clave: "filas", titulo: "Filas vivas", numerica: true, celda: (t: Limpieza) => entero.format(t.liveTuples) },
											{ clave: "hace", titulo: "Última limpieza", celda: (t: Limpieza) => (t.vacuumRunning ? "Limpiando ahora" : t.minutesSinceVacuum === null ? "Nunca" : t.minutesSinceVacuum < 60 ? `Hace ${t.minutesSinceVacuum} min` : `Hace ${decimal.format(t.minutesSinceVacuum / 60)} h`) },
										]}
										filas={[...m.limpieza].sort((a, b) => b.deadPct - a.deadPct)}
										claveFila={(t) => t.tableName}
									/>
								</Desplegable>

								<Desplegable titulo="Espacio en disco" resumen={mb(m.espacio.totalMB)}>
									<Contraetiqueta
										columnas={2}
										pares={[
											{ rotulo: "Tablas", valor: mb(m.espacio.tablesMB) },
											{ rotulo: "Índices", valor: mb(m.espacio.indexesMB) },
											{ rotulo: "Datos grandes", valor: mb(m.espacio.toastMB) },
											{ rotulo: "Últimas 24 h", valor: `+${mb(m.espacio.growth24hMB)}` },
										]}
									/>
									<GraficaLinea
										titulo="Tamaño total"
										categorias={m.espacio.history.map((h) => escribirHora(h.ts))}
										series={[{ clave: "total", nombre: "Tamaño", valores: m.espacio.history.map((h) => h.totalMB) }]}
										formatoValor={mb}
										tituloCategoria="Hora"
										textoVacio="Aún no hay historial."
									/>
								</Desplegable>

								<Desplegable titulo="Tablas con más movimiento" resumen={m.activas[0] ? `La primera: ${m.activas[0].tableName}` : "Sin datos"}>
									<Tabla
										leyenda="Tablas con más movimiento"
										columnas={[
											{ clave: "tabla", titulo: "Tabla", principal: true, celda: (t: TablaActiva) => t.tableName },
											{ clave: "ops", titulo: "Operaciones", numerica: true, celda: (t: TablaActiva) => entero.format(t.totalOps) },
											{ clave: "indice", titulo: "Por índice", numerica: true, celda: (t: TablaActiva) => entero.format(t.idxScan) },
											{ clave: "secuencial", titulo: "Recorrido completo", numerica: true, celda: (t: TablaActiva) => entero.format(t.seqScan) },
											{ clave: "tamano", titulo: "Tamaño", numerica: true, celda: (t: TablaActiva) => mb(t.sizeMB) },
										]}
										filas={[...m.activas].sort((a, b) => b.totalOps - a.totalOps)}
										claveFila={(t) => t.tableName}
									/>
								</Desplegable>

								<Desplegable titulo="Tiempos de respuesta" resumen={`Consultas: ${decimal.format(m.latencia.SELECT.p95Ms)} ms`}>
									<Tabla
										leyenda="Tiempos por tipo de operación"
										columnas={[
											{ clave: "op", titulo: "Operación", principal: true, celda: (o: { op: Operacion }) => ({ SELECT: "Consultar", INSERT: "Añadir", UPDATE: "Cambiar", DELETE: "Borrar" })[o.op] },
											{ clave: "media", titulo: "Media", numerica: true, celda: (o: { op: Operacion }) => `${decimal.format(m.latencia[o.op].avgMs)} ms` },
											{ clave: "p95", titulo: "95 de 100", numerica: true, celda: (o: { op: Operacion }) => `${decimal.format(m.latencia[o.op].p95Ms)} ms` },
											{ clave: "p99", titulo: "99 de 100", numerica: true, celda: (o: { op: Operacion }) => `${decimal.format(m.latencia[o.op].p99Ms)} ms` },
										]}
										filas={(["SELECT", "INSERT", "UPDATE", "DELETE"] as const).map((op) => ({ op }))}
										claveFila={(o) => o.op}
									/>
								</Desplegable>

								<Desplegable titulo="Conexiones" resumen={`${entero.format(m.conexiones.total)} abiertas`}>
									<Contraetiqueta
										columnas={2}
										pares={[
											{ rotulo: "Trabajando", valor: entero.format(m.conexiones.active) },
											{ rotulo: "En reposo", valor: entero.format(m.conexiones.idle) },
											{ rotulo: "Con trabajo a medias", valor: entero.format(m.conexiones.idleInTx) },
											{ rotulo: "Esperando", valor: entero.format(m.conexiones.waiting) },
										]}
									/>
									<GraficaLinea
										titulo="Conexiones abiertas"
										categorias={m.conexiones.history.map((h) => escribirHora(h.ts))}
										series={[
											{ clave: "total", nombre: "Abiertas", valores: m.conexiones.history.map((h) => h.total) },
											{ clave: "activas", nombre: "Trabajando", valores: m.conexiones.history.map((h) => h.active) },
										]}
										formatoValor={(n) => entero.format(n)}
										tituloCategoria="Hora"
										textoVacio="Aún no hay historial."
									/>
								</Desplegable>

								<Desplegable titulo="Por qué espera" resumen={m.esperas[0] ? `Sobre todo: ${(() => { const c = [...m.esperas].sort((a, b) => b.pct - a.pct)[0].category; return (CAUSAS[c] ?? c).toLowerCase(); })()}` : "Sin esperas"}>
									<Tabla
										leyenda="Causas de espera"
										columnas={[
											{ clave: "causa", titulo: "Causa", principal: true, celda: (e: Espera) => CAUSAS[e.category] ?? e.category },
											{ clave: "pct", titulo: "Del tiempo", numerica: true, celda: (e: Espera) => pct(e.pct) },
											{ clave: "veces", titulo: "Veces", numerica: true, celda: (e: Espera) => entero.format(e.count) },
										]}
										filas={[...m.esperas].sort((a, b) => b.pct - a.pct)}
										claveFila={(e) => e.category}
									/>
								</Desplegable>
							</div>
						</BloquePanel>
					)}
				</>
			)}
			{dialogo}
		</div>
	);
}

const CAUSAS: Record<string, string> = { CPU: "Procesador", IO: "Disco", Lock: "Bloqueos", LWLock: "Bloqueos internos", Client: "Esperando a la aplicación" };
const contarTablas = (n: number) => (n === 1 ? "1 tabla" : `${entero.format(n)} tablas`);
