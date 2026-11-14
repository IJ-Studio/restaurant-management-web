"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Lock, LockOpen, Receipt } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { AppOperaciones } from "@/components/paneles/AppOperaciones";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Campo } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { pedirPanel } from "@/lib/paneles/api-panel";
import { registrarError } from "@/lib/registro/registrar-error";
import { cn } from "@/lib/utils";
import { presentarCarta } from "@/lib/formato/caja";
import { suma } from "@/lib/paneles/calculo";
import type { Calculo } from "@/components/ui/VerCalculo";

/**
 * Panel de caja (PLAN 5.17; PLAN-AMPLIACION D-24). Pensado primero para tableta: cifras grandes y
 * objetivos de 48 px. Datos del API, los mismos que usa la app móvil del personal:
 * - la caja de quien cobra: `GET /caja/actual`, `POST /caja/abrir` (fondo) y `POST /caja/cerrar`
 *   (efectivo contado); las cuentas las hace el API;
 * - cuentas por cobrar: las entregadas de `GET /pedidos/admin/recent`, cada 20 s;
 * - cobro: métodos de `GET /pedidos/metodos-pago` y `POST /pedidos/:id/cobrar`. El monto sale del
 *   pedido en el servidor; aquí solo se elige el método, la propina y, en efectivo, lo recibido.
 */

interface Cuenta {
	id: string;
	customer: string;
	table: string;
	time: string;
	status: string | null;
	total: number;
	items: { nombre: string; cantidad: number }[];
}
interface Metodo {
	id: number;
	nombre: string;
	aplicaPropina: boolean;
	esEfectivo: boolean;
}
type Caja =
	| { abierta: false }
	| {
			abierta: true;
			fechaApertura: string;
			fondoInicial: number;
			totalVentas: number;
			propinas: number;
			numPagos: number;
			efectivoEsperado: number;
			/** Desglose de cada cifra (P1.4), del API. */
			calculos?: Partial<Record<"totalVentas" | "propinas" | "efectivoEsperado", Calculo>>;
	  };

const importe = (n: unknown) => formatearImporte(Number(n) || 0) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
const hora = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const folio = (id: string) => id.slice(0, 6).toUpperCase();
const numeroCampo = (t: string) => (t.trim() === "" ? Number.NaN : Number(t));
/** Igual que la móvil (`TIP_PERCENTAGES`, `tipFromPercent`): porcentajes sobre el total, en centavos. */
const PORCENTAJES_PROPINA = [0, 10, 15, 20] as const;
const propinaDe = (total: number, pct: number) => Math.round((Math.round(total * 100) * pct) / 100) / 100;

function DialogoCobro({ cuenta, metodos, alCobrado }: { cuenta: Cuenta; metodos: Metodo[]; alCobrado: () => void }) {
	const [abierto, setAbierto] = useState(false);
	const [metodoId, setMetodoId] = useState<number | null>(null);
	const [recibido, setRecibido] = useState("");
	const [propina, setPropina] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [enviando, setEnviando] = useState(false);
	const { notificar } = useNotificaciones();
	const metodo = metodos.find((m) => m.id === metodoId) ?? null;
	const montoPropina = propina.trim() === "" ? 0 : numeroCampo(propina);
	const aCobrar = cuenta.total + (Number.isFinite(montoPropina) ? montoPropina : 0);
	const cantidad = numeroCampo(recibido);
	const diferencia = Number.isFinite(cantidad) ? cantidad - aCobrar : null;

	async function cobrar() {
		if (!metodo) return setError("Elige la forma de pago.");
		if (!Number.isFinite(montoPropina) || montoPropina < 0) return setError("La propina tiene que ser una cantidad en pesos.");
		if (metodo.esEfectivo && !(cantidad >= aCobrar)) return setError(Number.isFinite(cantidad) ? `Faltan ${importe(aCobrar - cantidad)}.` : "Escribe cuánto te dan.");
		setEnviando(true);
		try {
			const respuesta = await api.post<{ cambio?: string }>(`/pedidos/${encodeURIComponent(cuenta.id)}/cobrar`, {
				metodoPagoId: metodo.id,
				...(metodo.aplicaPropina && montoPropina > 0 ? { propina: montoPropina } : {}),
				...(metodo.esEfectivo ? { montoRecibido: cantidad } : {}),
			});
			const cambio = Number(respuesta?.cambio ?? 0);
			notificar({ tono: "exito", titulo: `${cuenta.table} cobrada`, descripcion: cambio > 0 ? `Cambio: ${importe(cambio)}.` : `${importe(aCobrar)} en ${metodo.nombre.toLowerCase()}.` });
			setAbierto(false);
			alCobrado();
		} catch (err) {
			registrarError(err, "caja: cobrar");
			setError("No se pudo registrar el cobro. Revisa los datos y vuelve a intentarlo.");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) {
					setMetodoId(metodos[0]?.id ?? null);
					setRecibido("");
					setPropina("");
					setError(null);
				}
			}}
			disparador={
				<Boton className="min-h-12 w-full" aria-label={`Cobrar ${importe(cuenta.total)} de ${cuenta.table}`}>
					{`Cobrar ${importe(cuenta.total)}`}
				</Boton>
			}
			titulo={`Cobrar ${cuenta.table}`}
			descripcion={`Cuenta ${folio(cuenta.id)} · ${cuenta.customer} · ${contar(cuenta.items.length, "plato")}.`}
			pie={
				<>
					<Boton variante="secundario" className="min-h-12" onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton className="min-h-12" cargando={enviando} onClick={() => void cobrar()}>
						{`Cobrar ${importe(aCobrar)}`}
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-lg)">
				<p className="m-0 flex items-baseline justify-between gap-3">
					<span className="text-texto-secundario">Consumo</span>
					<span className="texto-cifra-destacada">{importe(cuenta.total)}</span>
				</p>
				{metodos.length === 0 ? (
					<Aviso tono="error" rol={null} titulo="No hay formas de pago disponibles.">
						Pide a administración que las active en el sistema.
					</Aviso>
				) : (
					<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-sm) border-0 p-0">
						<legend className="mb-(--espacio-xs) p-0 font-semibold text-texto-principal">Forma de pago</legend>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{metodos.map((m) => {
								const Icono = m.esEfectivo ? Banknote : CreditCard;
								return (
									<label
										key={m.id}
										className={cn(
											"flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-4 text-texto-principal has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco",
											metodoId === m.id ? "border-acento bg-superficie-cafe font-semibold" : "border-borde-control bg-superficie",
										)}
									>
										<input type="radio" name={`metodo-${cuenta.id}`} value={m.id} checked={metodoId === m.id} onChange={() => setMetodoId(m.id)} className="solo-lectores" />
										<Icono aria-hidden="true" className="size-5 shrink-0 stroke-[1.5]" />
										{m.nombre}
									</label>
								);
							})}
						</div>
					</fieldset>
				)}
				{metodo?.aplicaPropina && (
					<div role="group" aria-label="Propina sugerida" className="flex flex-wrap gap-2">
						{PORCENTAJES_PROPINA.map((pct) => {
							const valor = pct === 0 ? "" : propinaDe(cuenta.total, pct).toFixed(2);
							return (
								<Boton key={pct} variante={propina === valor ? "primario" : "secundario"} tamano="compacto" aria-pressed={propina === valor} onClick={() => setPropina(valor)}>
									{pct === 0 ? "Sin propina" : `${pct} %`}
								</Boton>
							);
						})}
					</div>
				)}
				{metodo?.aplicaPropina && (
					<Campo etiqueta="Propina" opcional type="number" inputMode="decimal" min={0} step="0.01" value={propina} onChange={(e) => setPropina(e.target.value)} ayuda="En pesos. Elige un porcentaje o escribe otra cantidad." />
				)}
				{metodo?.esEfectivo && (
					<div className="flex flex-col gap-(--espacio-sm)">
						<Campo etiqueta="Recibido" type="number" inputMode="decimal" min={0} step="0.01" value={recibido} onChange={(e) => setRecibido(e.target.value)} ayuda="En pesos." />
						<p aria-live="polite" className="m-0 flex items-baseline justify-between gap-3">
							<span className="text-texto-secundario">{diferencia !== null && diferencia < 0 ? "Faltan" : "Cambio"}</span>
							<span className="font-titulos text-(length:--texto-titulo-2) numeros-tabulares">{diferencia === null ? "—" : importe(Math.abs(diferencia))}</span>
						</p>
					</div>
				)}
				{error && (
					<p role="alert" className="m-0 text-error">
						{error}
					</p>
				)}
			</div>
		</Dialogo>
	);
}

/** Diferencia del corte en vivo, como la móvil: en centavos para no arrastrar errores de redondeo. */
function diferenciaCorte(esperado: number, contado: number): number {
	return (Math.round(contado * 100) - Math.round(esperado * 100)) / 100;
}

function DiferenciaCorte({ esperado, contado }: { esperado: number; contado: number }) {
	if (!Number.isFinite(contado)) return null;
	const d = diferenciaCorte(esperado, contado);
	const texto = d === 0 ? "Cuadra" : d > 0 ? `Sobran ${importe(d)}` : `Faltan ${importe(-d)}`;
	return (
		<p role="status" className={cn("m-0 font-semibold", d === 0 ? "text-exito" : "text-aviso")}>
			{texto}
		</p>
	);
}

function DialogoCaja({ abierta, esperado, alHecho }: { abierta: boolean; esperado?: number; alHecho: () => void }) {
	const [abierto, setAbierto] = useState(false);
	const [monto, setMonto] = useState("");
	const [notas, setNotas] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [enviando, setEnviando] = useState(false);
	const { notificar } = useNotificaciones();

	async function enviar() {
		const n = numeroCampo(monto);
		if (!Number.isFinite(n) || n < 0) return setError(abierta ? "Escribe el efectivo que hay en la caja." : "Escribe el fondo con el que abres.");
		setEnviando(true);
		try {
			if (abierta) await api.post("/caja/cerrar", { efectivoContado: n, ...(notas.trim() ? { notas: notas.trim() } : {}) });
			else await api.post("/caja/abrir", { fondoInicial: n });
			notificar({ tono: "exito", titulo: abierta ? "Caja cerrada" : "Caja abierta" });
			setAbierto(false);
			alHecho();
		} catch (err) {
			registrarError(err, abierta ? "caja: cerrar" : "caja: abrir");
			setError("No se pudo guardar. Vuelve a intentarlo en un momento.");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) {
					setMonto("");
					setNotas("");
					setError(null);
				}
			}}
			disparador={
				<Boton variante={abierta ? "secundario" : "primario"} className="min-h-12" icono={abierta ? <Lock /> : <LockOpen />}>
					{abierta ? "Cerrar caja" : "Abrir caja"}
				</Boton>
			}
			titulo={abierta ? "Cerrar caja" : "Abrir caja"}
			descripcion={abierta ? `Efectivo esperado: ${importe(esperado)}.` : "Cuenta el fondo antes de empezar a cobrar."}
			pie={
				<>
					<Boton variante="secundario" className="min-h-12" onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton className="min-h-12" cargando={enviando} onClick={() => void enviar()}>
						{abierta ? "Cerrar caja" : "Abrir caja"}
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-md)">
				<Campo etiqueta={abierta ? "Efectivo contado" : "Fondo inicial"} type="number" inputMode="decimal" min={0} step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} error={error} ayuda="En pesos." />
				{abierta && esperado !== undefined && <DiferenciaCorte esperado={esperado} contado={numeroCampo(monto)} />}
				{abierta && <Campo etiqueta="Notas" opcional value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={300} />}
			</div>
		</Dialogo>
	);
}

const POR_COBRAR = ["entregada", "para_cobrar"];
const EN_SERVICIO = ["abierta", "en_preparacion", "lista"];
const ESTADO_CUENTA: Record<string, string> = { abierta: "Abierta", en_preparacion: "En preparación", lista: "Lista" };

function TarjetaCuenta({ cuenta: c, metodos, alCobrado, conEstado = false }: { cuenta: Cuenta; metodos: Metodo[]; alCobrado: () => void; conEstado?: boolean }) {
	return (
		<li className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-1">
					<h3 className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.15] text-texto-principal">{c.table}</h3>
					<p className="m-0 text-texto-secundario">{`${c.customer} · cuenta ${folio(c.id)}`}</p>
				</div>
				<p className="m-0 texto-cifra-destacada whitespace-nowrap">{importe(c.total)}</p>
			</div>
			<p className="m-0 flex flex-wrap items-center gap-2 text-(length:--texto-pequeno) text-texto-secundario">
				{conEstado && c.status && <Insignia tono="info">{ESTADO_CUENTA[c.status] ?? c.status}</Insignia>}
				{`${contar(c.items.length, "plato")} · abierta a las ${c.time}`}
			</p>
			<DialogoCobro cuenta={c} metodos={metodos} alCobrado={alCobrado} />
		</li>
	);
}

export function CajaPanel() {
	const [caja, recargarCaja] = useCarga(() => pedirPanel<Caja>("/caja/actual"), "caja: estado de la caja");
	const [cuentas, recargarCuentas] = useCarga(() => pedirPanel<Cuenta[]>("/pedidos/admin/recent").then(presentarCarta), "caja: cuentas por cobrar");
	const [metodos] = useCarga(() => pedirPanel<Metodo[]>("/pedidos/metodos-pago"), "caja: formas de pago");
	const [busqueda, setBusqueda] = useState("");

	useEffect(() => {
		const t = setInterval(() => void recargarCuentas({ silenciosa: true }), 20000);
		return () => clearInterval(t);
	}, [recargarCuentas]);

	const lista = useMemo(() => (cuentas.estado === "listo" && Array.isArray(cuentas.datos) ? cuentas.datos : []), [cuentas]);
	const porCobrar = useMemo(() => lista.filter((c) => POR_COBRAR.includes(c.status ?? "")), [lista]);
	// Paridad con la móvil: el API deja cobrar desde que la cuenta está abierta (pago por adelantado).
	const enServicio = useMemo(() => lista.filter((c) => EN_SERVICIO.includes(c.status ?? "")), [lista]);
	const coincide = useCallback(
		(c: Cuenta) => {
			const q = busqueda.trim().toLowerCase();
			return !q || `${folio(c.id)} ${c.table} ${c.customer}`.toLowerCase().includes(q);
		},
		[busqueda],
	);
	const filtradas = useMemo(() => porCobrar.filter(coincide), [porCobrar, coincide]);
	const enServicioFiltradas = useMemo(() => enServicio.filter(coincide), [enServicio, coincide]);
	const actual = caja.estado === "listo" ? caja.datos : null;
	const abierta = actual?.abierta === true ? actual : null;
	const listaMetodos = metodos.estado === "listo" && Array.isArray(metodos.datos) ? metodos.datos : [];
	const alCobrado = () => {
		void recargarCuentas({ silenciosa: true });
		void recargarCaja({ silenciosa: true });
	};

	return (
		<PlantillaPanel
			titulo="Cobros"
			descripcion="Las cuentas entregadas que faltan por cobrar y tu caja."
			acciones={
				<>
					<Buscador etiqueta="Buscar por cuenta, mesa o cliente" valor={busqueda} alCambiar={setBusqueda} marcador="Cuenta, mesa o cliente" />
					{actual && <DialogoCaja abierta={!!abierta} esperado={abierta ? Number(abierta.efectivoEsperado) : undefined} alHecho={() => void recargarCaja()} />}
				</>
			}
		>
			{caja.estado === "listo" && !abierta && (
				<Aviso tono="aviso" rol={null} titulo="Tu caja está cerrada.">
					Ábrela con el fondo inicial para que tus cobros cuenten en el corte.
				</Aviso>
			)}

			<div className={REJILLA_INDICADORES}>
				<Indicador
					estado={cuentas.estado}
					alReintentar={recargarCuentas}
					rotulo="Por cobrar"
					valor={importe(porCobrar.reduce((a, c) => a + (Number(c.total) || 0), 0))}
					calculo={suma("por cobrar = suma del total de cada cuenta entregada sin cobrar", porCobrar, (c) => `Cuenta ${folio(c.id)} · ${c.table}`, (c) => Number(c.total) || 0, { filtros: { estatus: "entregada" } })}
					valorCalculo={porCobrar.reduce((a, c) => a + (Number(c.total) || 0), 0)}
					detalle={contar(porCobrar.length, "cuenta entregada", "cuentas entregadas")}
					className={INDICADOR_PROTAGONISTA}
				/>
				<Indicador estado={caja.estado} alReintentar={recargarCaja} rotulo="Cobrado en tu caja" calculo={abierta ? abierta.calculos?.totalVentas : undefined} valorCalculo={abierta ? Number(abierta.totalVentas) : undefined} valor={abierta ? importe(abierta.totalVentas) : "—"} detalle={abierta ? `${entero.format(abierta.numPagos)} pagos` : "Caja cerrada"} />
				<Indicador estado={caja.estado} alReintentar={recargarCaja} rotulo="Propinas" calculo={abierta ? abierta.calculos?.propinas : undefined} valorCalculo={abierta ? Number(abierta.propinas) : undefined} valor={abierta ? importe(abierta.propinas) : "—"} />
				<Indicador
					estado={caja.estado}
					alReintentar={recargarCaja}
					rotulo="Efectivo esperado"
					valor={abierta ? importe(abierta.efectivoEsperado) : "—"}
					calculo={abierta ? abierta.calculos?.efectivoEsperado : undefined}
					valorCalculo={abierta ? Number(abierta.efectivoEsperado) : undefined}
					detalle={abierta ? `Desde las ${hora.format(new Date(abierta.fechaApertura))}` : undefined}
				/>
			</div>

			<BloquePanel titulo="Por cobrar" descripcion={busqueda ? `${contar(filtradas.length, "resultado")}.` : undefined}>
				{cuentas.estado === "error" ? (
					<EstadoError titulo="No pudimos traer las cuentas" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargarCuentas} />
				) : cuentas.estado === "cargando" ? null : filtradas.length === 0 ? (
					<EstadoVacio icono={<Receipt />} titulo={busqueda ? "Nada coincide" : "Todo cobrado"} descripcion={busqueda ? "Prueba con otra mesa, cuenta o nombre." : "No hay cuentas entregadas pendientes de cobro."} />
				) : (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 md:grid-cols-2 2xl:grid-cols-3" aria-label="Cuentas por cobrar">
						{filtradas.map((c) => (
							<TarjetaCuenta key={c.id} cuenta={c} metodos={listaMetodos} alCobrado={alCobrado} />
						))}
					</ul>
				)}
			</BloquePanel>

			{enServicioFiltradas.length > 0 && (
				<BloquePanel titulo="En servicio" descripcion="Cuentas que aún se preparan o están en la mesa. Se pueden cobrar por adelantado.">
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 md:grid-cols-2 2xl:grid-cols-3" aria-label="Cuentas en servicio">
						{enServicioFiltradas.map((c) => (
							<TarjetaCuenta key={c.id} cuenta={c} metodos={listaMetodos} alCobrado={alCobrado} conEstado />
						))}
					</ul>
				</BloquePanel>
			)}
			<AppOperaciones />
		</PlantillaPanel>
	);
}
