"use client";

import { useMemo, useState } from "react";
import { Coins, Lock, Plus, ReceiptText, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Campo } from "@/components/ui/Campo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Pestanas } from "@/components/ui/Pestanas";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import {
	MOCK_MOVEMENTS,
	MOCK_SESSIONS,
	MOCK_TIPS,
	type CashMovement,
	type CashSession,
	type Tip,
} from "@/features/dashboard/admin/data/financeMock";
import { formatearDia } from "@/lib/formato/fecha";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { DialogoCerrarCaja, DialogoMovimiento, DialogoPropina, FORMAS_PAGO } from "./DialogosFinanzas";

/**
 * Caja y propinas (PLAN 5.4). La pantalla no tiene endpoint: trabaja con los datos de ejemplo de
 * `financeMock` en memoria, como antes, y ahora lo dice (D-13: insignia y aviso de que lo que se
 * registra no se guarda). Lo que cambia es la forma: indicadores, pestañas, tablas que pasan a
 * tarjetas, diálogos del catálogo y confirmación antes de marcar propinas como repartidas.
 *
 * Los indicadores «del día» toman el último día con movimientos: con datos de ejemplo de otra
 * fecha, «hoy» daría siempre cero.
 */

const importe = (n: number) => formatearImporte(n) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
const formaPago = (v: string) => FORMAS_PAGO.find((f) => f.valor === v)?.texto ?? v;

const columnasMovimientos: ColumnaTabla<CashMovement>[] = [
	{ clave: "concepto", titulo: "Concepto", principal: true, celda: (m) => m.concept },
	{ clave: "categoria", titulo: "Categoría", celda: (m) => m.category },
	{ clave: "responsable", titulo: "Responsable", celda: (m) => m.responsible || "—" },
	{ clave: "cuando", titulo: "Fecha", celda: (m) => `${formatearDia(m.date)}, ${m.time}` },
	{ clave: "forma", titulo: "Forma de pago", celda: (m) => formaPago(m.payMethod) },
	{
		clave: "importe",
		titulo: "Importe",
		numerica: true,
		celda: (m) =>
			m.type === "ingreso" ? (
				<span className="text-exito">{`+${importe(m.amount)}`}</span>
			) : (
				<span>{importe(-m.amount)}</span>
			),
	},
];

const ESTADO_SESION: Record<CashSession["status"], { texto: string; tono: "exito" | "neutro" | "aviso" }> = {
	abierta: { texto: "Abierta", tono: "exito" },
	cerrada: { texto: "Cerrada", tono: "neutro" },
	pendiente: { texto: "Pendiente", tono: "aviso" },
};

const columnasCierres: ColumnaTabla<CashSession>[] = [
	{ clave: "fecha", titulo: "Fecha", principal: true, celda: (s) => formatearDia(s.date) },
	{ clave: "horario", titulo: "Horario", celda: (s) => (s.closedAt ? `${s.openedAt} a ${s.closedAt}` : `Desde las ${s.openedAt}`) },
	{ clave: "apertura", titulo: "Apertura", numerica: true, celda: (s) => importe(s.openingBalance) },
	{ clave: "esperado", titulo: "Esperado", numerica: true, celda: (s) => importe(s.expectedBalance) },
	{ clave: "contado", titulo: "Contado", numerica: true, celda: (s) => (s.countedBalance === undefined ? "—" : importe(s.countedBalance)) },
	{
		clave: "diferencia",
		titulo: "Diferencia",
		numerica: true,
		celda: (s) => (s.difference === undefined ? "—" : s.difference === 0 ? "Cuadra" : s.difference > 0 ? `+${importe(s.difference)}` : importe(s.difference)),
	},
	{ clave: "estado", titulo: "Estado", celda: (s) => <Insignia tono={ESTADO_SESION[s.status].tono}>{ESTADO_SESION[s.status].texto}</Insignia> },
];

interface PropinasMesero {
	mesero: string;
	registros: number;
	total: number;
	pendiente: number;
}

export function Finanzas({ vistaInicial }: { vistaInicial?: string }) {
	const [movimientos, setMovimientos] = useState<CashMovement[]>(MOCK_MOVEMENTS);
	const [sesiones, setSesiones] = useState<CashSession[]>(MOCK_SESSIONS);
	const [propinas, setPropinas] = useState<Tip[]>(MOCK_TIPS);
	const [fecha, setFecha] = useState("");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	const ultimoDia = movimientos.reduce((max, m) => (m.date > max ? m.date : max), "");
	const delDia = movimientos.filter((m) => m.date === ultimoDia);
	const ingresos = delDia.filter((m) => m.type === "ingreso").reduce((a, m) => a + m.amount, 0);
	const egresos = delDia.filter((m) => m.type === "egreso").reduce((a, m) => a + m.amount, 0);
	const porRepartir = propinas.filter((t) => !t.distributed).reduce((a, t) => a + t.amount, 0);
	const abierta = sesiones.find((s) => s.status === "abierta");

	const visibles = useMemo(
		() => [...(fecha ? movimientos.filter((m) => m.date === fecha) : movimientos)].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)),
		[movimientos, fecha],
	);

	const porMesero = useMemo<PropinasMesero[]>(() => {
		const mapa = new Map<string, PropinasMesero>();
		for (const t of propinas) {
			const m = mapa.get(t.waiter) ?? { mesero: t.waiter, registros: 0, total: 0, pendiente: 0 };
			m.registros++;
			m.total += t.amount;
			if (!t.distributed) m.pendiente += t.amount;
			mapa.set(t.waiter, m);
		}
		return [...mapa.values()].sort((a, b) => b.total - a.total);
	}, [propinas]);

	function registrarMovimiento(m: CashMovement) {
		setMovimientos((ms) => [m, ...ms]);
		notificar({ tono: "exito", titulo: m.type === "ingreso" ? "Ingreso registrado" : "Egreso registrado", descripcion: `${m.concept}: ${importe(m.amount)}.` });
	}

	function cerrarCaja(contado: number, por: string) {
		if (!abierta) return;
		const cierre = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
		setSesiones((ss) =>
			ss.map((s) => (s.id !== abierta.id ? s : { ...s, status: "cerrada", closedAt: cierre, countedBalance: contado, difference: contado - s.expectedBalance, closedBy: por })),
		);
		notificar({ tono: "exito", titulo: "Caja cerrada", descripcion: `Contado: ${importe(contado)}.` });
	}

	async function repartir(mesero: string, pendiente: number) {
		const ok = await confirmar({
			titulo: `¿Marcar como repartidas las propinas de ${mesero}?`,
			descripcion: `Son ${importe(pendiente)}. Dejarán de contar como pendientes.`,
			textoConfirmar: "Marcar como repartidas",
		});
		if (!ok) return;
		setPropinas((ts) => ts.map((t) => (t.waiter === mesero && !t.distributed ? { ...t, distributed: true } : t)));
		notificar({ tono: "exito", titulo: "Propinas repartidas", descripcion: `${mesero}: ${importe(pendiente)}.` });
	}

	const columnasPropinas: ColumnaTabla<PropinasMesero>[] = [
		{ clave: "mesero", titulo: "Mesero", principal: true, celda: (p) => p.mesero },
		{ clave: "registros", titulo: "Registros", numerica: true, celda: (p) => entero.format(p.registros) },
		{ clave: "total", titulo: "Total", numerica: true, celda: (p) => importe(p.total) },
		{
			clave: "pendiente",
			titulo: "Por repartir",
			numerica: true,
			celda: (p) => (p.pendiente > 0 ? importe(p.pendiente) : <Insignia tono="exito">Repartido</Insignia>),
		},
	];

	const vistaCaja = (
		<BloquePanel
			titulo="Movimientos de caja chica"
			datosDeEjemplo
			acciones={
				<div className="flex flex-wrap items-end gap-3">
					<Campo etiqueta="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-44" />
					{fecha && (
						<Boton variante="fantasma" tamano="compacto" onClick={() => setFecha("")}>
							Ver todas las fechas
						</Boton>
					)}
					<DialogoMovimiento
						tipo="egreso"
						alGuardar={registrarMovimiento}
						disparador={
							<Boton variante="secundario" icono={<TrendingDown />}>
								Egreso
							</Boton>
						}
					/>
					<DialogoMovimiento
						tipo="ingreso"
						alGuardar={registrarMovimiento}
						disparador={<Boton icono={<TrendingUp />}>Ingreso</Boton>}
					/>
				</div>
			}
		>
			<Tabla
				leyenda="Movimientos de caja chica"
				columnas={columnasMovimientos}
				filas={visibles}
				claveFila={(m) => m.id}
				vacio={<EstadoVacio icono={<Wallet />} titulo="No hay movimientos ese día" descripcion="Elige otra fecha o quita el filtro." />}
			/>
		</BloquePanel>
	);

	const vistaCierres = (
		<BloquePanel titulo="Cierres de caja" datosDeEjemplo>
			<Tabla leyenda="Cierres de caja" columnas={columnasCierres} filas={sesiones} claveFila={(s) => s.id} />
		</BloquePanel>
	);

	const vistaPropinas = (
		<BloquePanel
			titulo="Propinas por mesero"
			datosDeEjemplo
			acciones={
				<DialogoPropina
					alGuardar={(t) => {
						setPropinas((ts) => [t, ...ts]);
						notificar({ tono: "exito", titulo: "Propina registrada", descripcion: `${t.waiter}: ${importe(t.amount)}.` });
					}}
					disparador={<Boton icono={<Plus />}>Registrar propina</Boton>}
				/>
			}
		>
			<Tabla
				leyenda="Propinas por mesero"
				columnas={columnasPropinas}
				filas={porMesero}
				claveFila={(p) => p.mesero}
				tituloAcciones="Reparto"
				acciones={(p) =>
					p.pendiente > 0 ? (
						<Boton variante="secundario" tamano="compacto" onClick={() => repartir(p.mesero, p.pendiente)}>
							{`Repartir ${importe(p.pendiente)}`}
						</Boton>
					) : null
				}
				vacio={<EstadoVacio icono={<Coins />} titulo="Todavía no hay propinas" descripcion="Las que registres aparecerán aquí, agrupadas por mesero." />}
			/>
		</BloquePanel>
	);

	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina
				antetitulo="Finanzas"
				titulo="Caja y propinas"
				descripcion="Caja chica, cierres y reparto de propinas."
				acciones={
					<BotonEnlace href="/dashboard/admin/finance/invoices" variante="secundario" icono={<ReceiptText />}>
						Facturas
					</BotonEnlace>
				}
			/>
			<Aviso tono="info" rol={null} titulo="Pantalla con datos de ejemplo.">
				Aún no está conectada al sistema: lo que registres aquí se ve en esta visita, pero no se guarda.
			</Aviso>

			<BloquePanel titulo={ultimoDia ? `Resumen del ${formatearDia(ultimoDia)}` : "Resumen del día"} datosDeEjemplo>
				<div className={REJILLA_INDICADORES}>
					<Indicador rotulo="Balance del día" valor={importe(ingresos - egresos)} detalle="Ingresos menos egresos" className={INDICADOR_PROTAGONISTA} />
					<Indicador rotulo="Ingresos" valor={importe(ingresos)} detalle={contar(delDia.filter((m) => m.type === "ingreso").length, "movimiento")} />
					<Indicador rotulo="Egresos" valor={importe(egresos)} detalle={contar(delDia.filter((m) => m.type === "egreso").length, "movimiento")} />
					<Indicador rotulo="Propinas por repartir" valor={importe(porRepartir)} />
				</div>
			</BloquePanel>

			{abierta && (
				<Aviso
					tono="exito"
					rol={null}
					titulo={`Caja abierta desde las ${abierta.openedAt}.`}
					accion={
						<DialogoCerrarCaja
							sesion={abierta}
							alCerrar={cerrarCaja}
							disparador={
								<Boton variante="secundario" tamano="compacto" icono={<Lock />}>
									Cerrar caja
								</Boton>
							}
						/>
					}
				>
					{`Saldo de apertura: ${importe(abierta.openingBalance)}. Esperado ahora: ${importe(abierta.expectedBalance)}.`}
				</Aviso>
			)}

			<Pestanas
				etiqueta="Secciones de finanzas"
				parametroUrl="vista"
				valorInicial={["caja", "cierres", "propinas"].includes(vistaInicial ?? "") ? vistaInicial : "caja"}
				pestanas={[
					{ valor: "caja", titulo: "Caja chica", contador: { valor: movimientos.length, descripcion: "movimientos" }, contenido: vistaCaja },
					{ valor: "cierres", titulo: "Cierres", contador: { valor: sesiones.length, descripcion: "cierres" }, contenido: vistaCierres },
					{ valor: "propinas", titulo: "Propinas", contador: { valor: porMesero.length, descripcion: "meseros" }, contenido: vistaPropinas },
				]}
			/>
			{dialogo}
		</div>
	);
}
