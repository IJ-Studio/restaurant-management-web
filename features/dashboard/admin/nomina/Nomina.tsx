"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Campo } from "@/components/ui/Campo";
import { Interruptor } from "@/components/ui/Casilla";
import { Dialogo } from "@/components/ui/Dialogo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import type { PayrollEntry } from "@/features/dashboard/admin/types/payroll";
import { api } from "@/lib/api";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { MovimientosNomina } from "./MovimientosNomina";
import { cociente, conteo, suma } from "@/lib/paneles/calculo";

/**
 * Nómina (PLAN 5.6). Mismas llamadas que antes (`GET`, `POST`, `PATCH` y `DELETE` sobre
 * `/payroll`, con los mismos cuerpos) y la misma actualización optimista al activar o eliminar.
 * Panel del Inicio (D-27), sin gráfica (D-26: el gasto por área no se muestra como dato). Forma: indicadores, `Tabla` con buscador, diálogo
 * del catálogo, confirmación del sistema al eliminar y notificaciones en lugar de `alert()`. Los
 * errores ya no muestran el texto del API (D-20).
 */

const importe = (n: number) => formatearImporte(n) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
/** «Chef 1», «Mesero 3» → «Chef», «Mesero»; deja igual los puestos sin número (Gerente…). */

type Datos = { role: string; name: string; weeklyPay: number; active: boolean };

function DialogoEmpleado({
	empleado,
	disparador,
	alGuardar,
}: {
	empleado?: PayrollEntry;
	disparador: ReactNode;
	alGuardar: (datos: Datos, id?: string) => Promise<boolean>;
}) {
	const inicial = () => ({ role: empleado?.role ?? "", name: empleado?.name ?? "", pago: empleado ? String(empleado.weeklyPay) : "", active: empleado?.active ?? true });
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(inicial);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [guardando, setGuardando] = useState(false);
	const id = empleado ? `empleado-${empleado.id}` : "empleado-nuevo";

	async function guardar() {
		const e: Record<string, string> = {};
		if (!f.name.trim()) e.name = "Escribe el nombre.";
		if (!f.role.trim()) e.role = "Escribe el puesto.";
		const pago = f.pago.trim() === "" ? Number.NaN : Number(f.pago);
		if (!(pago > 0)) e.pago = "Escribe un pago mayor que cero.";
		setErrores(e);
		if (Object.keys(e).length) return;
		setGuardando(true);
		const ok = await alGuardar({ role: f.role.trim(), name: f.name.trim(), weeklyPay: pago, active: f.active }, empleado?.id);
		setGuardando(false);
		if (ok) setAbierto(false);
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) setF(inicial());
				else setErrores({});
			}}
			cerrable={!guardando}
			disparador={disparador}
			titulo={empleado ? `Editar a ${empleado.name}` : "Añadir a la nómina"}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={guardando} onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton type="submit" form={id} cargando={guardando} textoCargando="Guardando…">
						{empleado ? "Guardar cambios" : "Añadir"}
					</Boton>
				</>
			}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					void guardar();
				}}
			>
				<Campo etiqueta="Nombre" value={f.name} onChange={(ev) => setF({ ...f, name: ev.target.value })} error={errores.name} maxLength={120} autoComplete="off" />
				<Campo
					etiqueta="Puesto"
					value={f.role}
					onChange={(ev) => setF({ ...f, role: ev.target.value })}
					error={errores.role}
					maxLength={60}
					ayuda="Como se registra en la nómina: «Chef 1», «Mesero 2», «Gerente»."
					autoComplete="off"
				/>
				<Campo etiqueta="Pago semanal" type="number" inputMode="decimal" min={0} step="0.01" value={f.pago} onChange={(ev) => setF({ ...f, pago: ev.target.value })} error={errores.pago} ayuda="En pesos." />
				<Interruptor etiqueta="Activo en la nómina" checked={f.active} onChange={(ev) => setF({ ...f, active: ev.target.checked })} ayuda="Los inactivos no cuentan en los totales." />
			</form>
		</Dialogo>
	);
}

export function Nomina() {
	const [empleados, setEmpleados] = useState<PayrollEntry[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "listo">("cargando");
	const [busqueda, setBusqueda] = useState("");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const datos = await api.get<PayrollEntry[]>("/payroll");
			setEmpleados(Array.isArray(datos) ? datos : []);
			setEstado("listo");
		} catch (e) {
			registrarError(e, "nómina: cargar");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void cargar();
	}, [cargar]);

	async function guardar(datos: Datos, id?: string) {
		try {
			if (id) {
				const actualizado = await api.patch<PayrollEntry>(`/payroll/${id}`, datos);
				setEmpleados((es) => es.map((e) => (e.id === actualizado.id ? actualizado : e)));
			} else {
				const creado = await api.post<PayrollEntry>("/payroll", datos);
				setEmpleados((es) => [...es, creado]);
			}
			notificar({ tono: "exito", titulo: id ? "Cambios guardados" : "Añadido a la nómina", descripcion: datos.name });
			return true;
		} catch (e) {
			registrarError(e, "nómina: guardar");
			notificar({ tono: "error", titulo: "No se pudo guardar", descripcion: "Revisa los datos y vuelve a intentarlo." });
			return false;
		}
	}

	async function eliminar(e: PayrollEntry) {
		const ok = await confirmar({
			titulo: `¿Quitar a ${e.name} de la nómina?`,
			descripcion: "Se borra su registro de pagos. No se puede deshacer.",
			textoConfirmar: "Quitar de la nómina",
			destructiva: true,
		});
		if (!ok) return;
		const antes = empleados;
		setEmpleados((es) => es.filter((x) => x.id !== e.id));
		try {
			await api.delete(`/payroll/${e.id}`);
			notificar({ tono: "exito", titulo: `${e.name} ya no está en la nómina` });
		} catch (err) {
			registrarError(err, "nómina: eliminar");
			setEmpleados(antes);
			notificar({ tono: "error", titulo: "No se pudo quitar", descripcion: "Vuelve a intentarlo en un momento." });
		}
	}

	async function alternar(e: PayrollEntry) {
		const antes = empleados;
		setEmpleados((es) => es.map((x) => (x.id === e.id ? { ...x, active: !x.active } : x)));
		try {
			const actualizado = await api.patch<PayrollEntry>(`/payroll/${e.id}`, { active: !e.active });
			setEmpleados((es) => es.map((x) => (x.id === e.id ? actualizado : x)));
		} catch (err) {
			registrarError(err, "nómina: activar");
			setEmpleados(antes);
			notificar({ tono: "error", titulo: "No se pudo cambiar el estado", descripcion: e.name });
		}
	}

	const activos = useMemo(() => empleados.filter((e) => e.active), [empleados]);
	const semanal = activos.reduce((a, e) => a + e.weeklyPay, 0);
	const filtrados = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return q ? empleados.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) : empleados;
	}, [empleados, busqueda]);

	const columnas: ColumnaTabla<PayrollEntry>[] = [
		{ clave: "nombre", titulo: "Nombre", principal: true, celda: (e) => e.name },
		{ clave: "puesto", titulo: "Puesto", celda: (e) => e.role },
		{ clave: "pago", titulo: "Pago semanal", numerica: true, celda: (e) => importe(e.weeklyPay) },
		{ clave: "estado", titulo: "Estado", celda: (e) => (e.active ? <Insignia tono="exito">Activo</Insignia> : <Insignia tono="neutro">Inactivo</Insignia>) },
	];

	const cargando = estado === "cargando";
	const indicador = { estado, alReintentar: cargar } as const;

	return (
		<div className="flex flex-col gap-(--espacio-xl)">
			<div className="flex justify-end max-sm:[&>*]:w-full">
				<DialogoEmpleado alGuardar={guardar} disparador={<Boton icono={<Plus />}>Añadir a la nómina</Boton>} />
			</div>

			<div className={REJILLA_INDICADORES}>
				<Indicador {...indicador} rotulo="Nómina semanal" calculo={suma("nómina semanal = suma del pago semanal de cada persona activa", activos, (e) => e.name, (e) => e.weeklyPay, { filtros: { estado: "activo" } })} valorCalculo={semanal} valor={cargando ? undefined : importe(semanal)} detalle="Solo el personal activo" className={INDICADOR_PROTAGONISTA} />
				<Indicador {...indicador} rotulo="Al mes, aproximado" calculo={{ formula: "al mes = nómina semanal × 4 (cuatro semanas)", operacion: "suma", datos: [1, 2, 3, 4].map((n) => ({ clave: `semana ${n}`, valor: semanal })) }} valorCalculo={semanal * 4} valor={cargando ? undefined : importe(semanal * 4)} detalle="Cuatro semanas" />
				<Indicador {...indicador} rotulo="Personal activo" calculo={conteo("personal activo = personas de la nómina marcadas como activas", activos, (e) => e.name, (e) => e.role)} valorCalculo={activos.length} valor={cargando ? undefined : entero.format(activos.length)} detalle={cargando ? undefined : `De ${entero.format(empleados.length)} en la nómina`} />
				<Indicador {...indicador} rotulo="Pago medio" calculo={cociente("pago medio = nómina semanal / personal activo", ["nómina semanal", semanal], ["personal activo", activos.length])} valorCalculo={activos.length ? semanal / activos.length : 0} valor={cargando ? undefined : importe(activos.length ? semanal / activos.length : 0)} detalle="Por semana" />
			</div>

			<BloquePanel
					titulo="Personal"
					acciones={<Buscador etiqueta="Buscar por nombre o puesto" valor={busqueda} alCambiar={setBusqueda} marcador="Nombre o puesto" />}
				>
					<Tabla
						leyenda="Personal en la nómina"
						columnas={columnas}
						filas={filtrados}
						claveFila={(e) => e.id}
						estado={cargando ? "cargando" : "listo"}
						error={estado === "error" ? <EstadoError titulo="No pudimos traer la nómina" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
						tituloAcciones="Acciones"
						acciones={(e) => (
							<>
								<Boton variante="fantasma" tamano="compacto" aria-label={e.active ? `Desactivar a ${e.name}` : `Activar a ${e.name}`} onClick={() => alternar(e)}>
									{e.active ? "Desactivar" : "Activar"}
								</Boton>
								<DialogoEmpleado
									empleado={e}
									alGuardar={guardar}
									disparador={
										<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
											{`Editar a ${e.name}`}
										</Boton>
									}
								/>
								<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminar(e)}>
									{`Quitar a ${e.name}`}
								</Boton>
							</>
						)}
						vacio={
							<EstadoVacio
								icono={<Users />}
								titulo={busqueda ? "Nadie coincide con la búsqueda" : "La nómina está vacía"}
								descripcion={busqueda ? "Prueba con otro nombre o puesto." : "Añade al personal con su pago semanal."}
							/>
						}
					/>
				</BloquePanel>
			<MovimientosNomina />
			{dialogo}
		</div>
	);
}
