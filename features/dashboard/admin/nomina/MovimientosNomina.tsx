"use client";

import { useCallback, useEffect, useState } from "react";
import { History, PlusCircle } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { DialogoMotivo } from "@/components/ui/DialogoMotivo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { VerCalculo, type Calculo } from "@/components/ui/VerCalculo";
import { api } from "@/lib/api";
import { nombrePropio, primeraMayuscula } from "@/lib/formato/caja";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Sumas y restas a la nómina (Prioridad 3.1): neto del periodo con su cálculo, acción rápida para
 * sumar o restar con justificación obligatoria e historial auditable. El historial no se edita ni
 * se borra: «Corregir» registra el movimiento inverso. Solo controla la nómina; no paga.
 */
interface Resumen {
	empleadoId: string;
	nombre: string | null;
	puesto: string | null;
	base: number;
	sumas: number;
	restas: number;
	neto: number;
	calculo: Calculo;
}
interface Movimiento {
	id: number;
	empleado: string | null;
	tipo: "suma" | "resta";
	concepto: string;
	monto: number;
	periodoInicio: string;
	periodoFin: string;
	fecha: string;
	justificacion: string;
	autor: string;
	corrigeId: number | null;
	corregidoPor: number | null;
}

export const CONCEPTOS: Record<string, string> = {
	bono: "Bono",
	horas_extra: "Horas extra",
	propina: "Propina",
	reembolso: "Reembolso",
	objeto_roto: "Objeto roto",
	danio: "Daño",
	reparacion: "Reparación",
	consumo: "Consumo",
	anticipo: "Anticipo",
	faltante_caja: "Faltante de caja",
	otro: "Otro",
	correccion: "Corrección",
};
const importe = (n: number) => formatearImporte(n) ?? "—";
const isoDia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** Semana actual, de lunes a domingo. */
export function semanaActual(hoy = new Date()) {
	const lunes = new Date(hoy);
	lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
	const domingo = new Date(lunes);
	domingo.setDate(lunes.getDate() + 6);
	return { desde: isoDia(lunes), hasta: isoDia(domingo) };
}

function DialogoMovimiento({ persona, periodo, alGuardar }: { persona: Resumen; periodo: { desde: string; hasta: string }; alGuardar: () => void }) {
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState({ tipo: "resta", concepto: "objeto_roto", monto: "", justificacion: "" });
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [guardando, setGuardando] = useState(false);
	const { notificar } = useNotificaciones();
	const nombre = nombrePropio(persona.nombre ?? "");

	async function guardar() {
		const e: Record<string, string> = {};
		const monto = Number(f.monto);
		if (!(monto > 0)) e.monto = "Escribe un monto mayor que cero.";
		if (f.justificacion.trim().length < 5) e.justificacion = "Explica el motivo (al menos 5 letras).";
		setErrores(e);
		if (Object.keys(e).length) return;
		setGuardando(true);
		try {
			await api.post("/payroll/movimientos", {
				empleadoId: persona.empleadoId,
				tipo: f.tipo,
				concepto: f.concepto,
				monto,
				periodoInicio: periodo.desde,
				periodoFin: periodo.hasta,
				justificacion: f.justificacion.trim(),
			});
			notificar({ tono: "exito", titulo: f.tipo === "suma" ? "Suma registrada" : "Resta registrada", descripcion: `${nombre}: ${importe(monto)}` });
			setAbierto(false);
			alGuardar();
		} catch (error) {
			registrarError(error, "nómina: movimiento");
			notificar({ tono: "error", titulo: "No se pudo registrar", descripcion: "Vuelve a intentarlo en un momento." });
		} finally {
			setGuardando(false);
		}
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) {
					setF({ tipo: "resta", concepto: "objeto_roto", monto: "", justificacion: "" });
					setErrores({});
				}
			}}
			cerrable={!guardando}
			disparador={
				<Boton variante="secundario" tamano="compacto" icono={<PlusCircle />} aria-label={`Sumar o restar a ${nombre}`}>
					Sumar o restar
				</Boton>
			}
			titulo={`Sumar o restar a ${nombre}`}
			descripcion={`Periodo del ${periodo.desde} al ${periodo.hasta}. Queda en el historial; no se paga nada.`}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={guardando} onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton type="submit" form="movimiento-nomina" cargando={guardando} textoCargando="Guardando…">
						Registrar
					</Boton>
				</>
			}
		>
			<form
				id="movimiento-nomina"
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					void guardar();
				}}
			>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Selector
						etiqueta="Tipo"
						opciones={[
							{ valor: "resta", texto: "Restar" },
							{ valor: "suma", texto: "Sumar" },
						]}
						value={f.tipo}
						onChange={(e) => setF({ ...f, tipo: e.target.value })}
					/>
					<Selector
						etiqueta="Concepto"
						opciones={Object.entries(CONCEPTOS)
							.filter(([valor]) => valor !== "correccion")
							.map(([valor, texto]) => ({ valor, texto }))}
						value={f.concepto}
						onChange={(e) => setF({ ...f, concepto: e.target.value })}
					/>
				</div>
				<Campo etiqueta="Monto" type="number" inputMode="decimal" min={0} step="0.01" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} error={errores.monto} />
				<AreaTexto etiqueta="Justificación" value={f.justificacion} onChange={(e) => setF({ ...f, justificacion: e.target.value })} error={errores.justificacion} maxLength={500} ayuda="Qué pasó y por qué se suma o se resta." />
			</form>
		</Dialogo>
	);
}

export function MovimientosNomina() {
	const [periodo, setPeriodo] = useState(semanaActual);
	const [resumen, setResumen] = useState<Resumen[]>([]);
	const [historial, setHistorial] = useState<Movimiento[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "listo">("cargando");
	const [corrigiendo, setCorrigiendo] = useState<Movimiento | null>(null);
	const { notificar } = useNotificaciones();

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const q = `desde=${periodo.desde}&hasta=${periodo.hasta}`;
			const [r, h] = await Promise.all([
				api.get<Resumen[]>(`/payroll/movimientos/resumen?${q}`),
				api.get<{ movimientos: Movimiento[] }>(`/payroll/movimientos?${q}`),
			]);
			setResumen(Array.isArray(r) ? r : []);
			setHistorial(h?.movimientos ?? []);
			setEstado("listo");
		} catch (e) {
			registrarError(e, "nómina: movimientos");
			setEstado("error");
		}
	}, [periodo]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial y al cambiar el periodo
		void cargar();
	}, [cargar]);

	async function corregir(justificacion: string) {
		if (!corrigiendo) return false;
		try {
			await api.post(`/payroll/movimientos/${corrigiendo.id}/corregir`, { justificacion });
			notificar({ tono: "exito", titulo: "Corrección registrada", descripcion: "Se añadió el movimiento inverso al historial." });
			void cargar();
			return true;
		} catch (e) {
			registrarError(e, "nómina: corregir");
			notificar({ tono: "error", titulo: "No se pudo corregir", descripcion: "Puede que ya estuviera corregido." });
			return false;
		}
	}

	const columnasResumen: ColumnaTabla<Resumen>[] = [
		{ clave: "nombre", titulo: "Persona", principal: true, celda: (p) => nombrePropio(p.nombre ?? "") },
		{ clave: "base", titulo: "Base", numerica: true, celda: (p) => importe(p.base) },
		{ clave: "sumas", titulo: "Sumas", numerica: true, celda: (p) => importe(p.sumas) },
		{ clave: "restas", titulo: "Restas", numerica: true, celda: (p) => importe(p.restas) },
		{
			clave: "neto",
			titulo: "Neto",
			numerica: true,
			celda: (p) => (
				<span className="inline-flex items-center gap-1">
					<span className="font-semibold">{importe(p.neto)}</span>
					<VerCalculo titulo={`neto de ${nombrePropio(p.nombre ?? "")}`} resultado={String(p.neto)} valor={Number(p.neto)} calculo={p.calculo} />
				</span>
			),
		},
	];
	const columnasHistorial: ColumnaTabla<Movimiento>[] = [
		{ clave: "fecha", titulo: "Fecha", celda: (m) => <span className="cifras-consola">{m.fecha}</span> },
		{ clave: "persona", titulo: "Persona", principal: true, celda: (m) => nombrePropio(m.empleado ?? "") },
		{
			clave: "movimiento",
			titulo: "Movimiento",
			celda: (m) => (
				<span className="flex flex-col gap-0.5">
					<span>{`${m.tipo === "suma" ? "Suma" : "Resta"} · ${CONCEPTOS[m.concepto] ?? m.concepto}`}</span>
					<span className="text-(length:--texto-pequeno) text-texto-secundario">{primeraMayuscula(m.justificacion)}</span>
				</span>
			),
		},
		{ clave: "monto", titulo: "Monto", numerica: true, celda: (m) => `${m.tipo === "resta" ? "−" : "+"}${importe(m.monto)}` },
		{ clave: "autor", titulo: "Registró", celda: (m) => nombrePropio(m.autor) },
		{
			clave: "estado",
			titulo: "Estado",
			celda: (m) =>
				m.corrigeId ? <Insignia tono="info">{`Corrige #${m.corrigeId}`}</Insignia> : m.corregidoPor ? <Insignia tono="neutro">Corregido</Insignia> : <Insignia tono="exito">Vigente</Insignia>,
		},
	];

	return (
		<>
			<BloquePanel
				titulo="Sumas y restas del periodo"
				acciones={
					<div className="flex flex-wrap items-end gap-3">
						<Campo etiqueta="Desde" type="date" value={periodo.desde} onChange={(e) => e.target.value && setPeriodo((p) => ({ ...p, desde: e.target.value }))} />
						<Campo etiqueta="Hasta" type="date" value={periodo.hasta} onChange={(e) => e.target.value && setPeriodo((p) => ({ ...p, hasta: e.target.value }))} />
					</div>
				}
			>
				<Tabla
					leyenda="Neto del periodo por persona"
					columnas={columnasResumen}
					filas={resumen}
					claveFila={(p) => p.empleadoId}
					estado={estado === "cargando" ? "cargando" : "listo"}
					error={estado === "error" ? <EstadoError titulo="No pudimos traer los movimientos" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
					tituloAcciones="Acción"
					acciones={(p) => <DialogoMovimiento persona={p} periodo={periodo} alGuardar={cargar} />}
					vacio={<EstadoVacio icono={<PlusCircle />} titulo="No hay personal activo" descripcion="Añade al personal en la nómina." />}
				/>
			</BloquePanel>
			<BloquePanel titulo="Historial del periodo">
				<Tabla
					leyenda="Historial de sumas y restas"
					columnas={columnasHistorial}
					filas={historial}
					claveFila={(m) => m.id}
					estado={estado === "cargando" ? "cargando" : "listo"}
					tituloAcciones="Acción"
					acciones={(m) =>
						!m.corrigeId && !m.corregidoPor ? (
							<Boton variante="fantasma" tamano="compacto" onClick={() => setCorrigiendo(m)} aria-label={`Corregir el movimiento ${m.id}`}>
								Corregir
							</Boton>
						) : null
					}
					vacio={<EstadoVacio icono={<History />} titulo="Sin movimientos en el periodo" descripcion="Las sumas y restas que registres aparecerán aquí." />}
				/>
			</BloquePanel>
			<DialogoMotivo
				abierto={corrigiendo !== null}
				alCambiarAbierto={(a) => !a && setCorrigiendo(null)}
				titulo="Corregir un movimiento"
				descripcion="No se borra: se registra el movimiento inverso y los dos quedan en el historial."
				etiqueta="¿Por qué se corrige?"
				textoConfirmar="Registrar corrección"
				alConfirmar={corregir}
			/>
		</>
	);
}
