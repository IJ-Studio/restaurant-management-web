"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Armchair, Pencil, Plus, Trash2 } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { PROTAGONISTA_DE_TRES, REJILLA_TRES_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { api, APIError } from "@/lib/api";
import { primeraMayuscula } from "@/lib/formato/caja";
import { registrarError } from "@/lib/registro/registrar-error";
import { conteo, suma } from "@/lib/paneles/calculo";

/**
 * Mesas del salón en administración (Prioridad 1.3): `GET /mesas/admin`, `GET /mesas/admin/areas`,
 * `POST /mesas/admin`, `PATCH /mesas/admin/:id` y `DELETE /mesas/admin/:id`. La baja la decide el
 * API: si la mesa tiene historial o reservas activas, la desactiva y lo dice; si no, la borra
 * (queda archivada).
 */

export interface Mesa {
	id: number;
	numero: string;
	nombre: string | null;
	capacidad: number;
	forma: string | null;
	areaId: number | null;
	areaNombre: string | null;
	activa: boolean | null;
	conHistorial: boolean;
	reservasActivas: number;
}
interface Area {
	id: number;
	nombre: string;
}
type DatosMesa = Pick<Mesa, "numero" | "nombre" | "capacidad" | "forma" | "areaId">;

const FORMAS: Record<string, string> = { cuadrada: "Cuadrada", redonda: "Redonda", rectangular: "Rectangular", barra: "Barra" };
const entero = new Intl.NumberFormat("es-MX");
const mensaje = (e: unknown, otro: string) => (e instanceof APIError && e.statusCode < 500 ? e.message : otro);

function DialogoMesa({ mesa, areas, disparador, alGuardar }: { mesa?: Mesa; areas: Area[]; disparador: ReactNode; alGuardar: (d: DatosMesa) => Promise<boolean> }) {
	const inicial = () => ({
		numero: mesa?.numero ?? "",
		nombre: mesa?.nombre ?? "",
		capacidad: String(mesa?.capacidad ?? 4),
		forma: mesa?.forma ?? "cuadrada",
		areaId: mesa?.areaId ? String(mesa.areaId) : "",
	});
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(inicial);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [guardando, setGuardando] = useState(false);
	const id = mesa ? `mesa-${mesa.id}` : "mesa-nueva";

	async function guardar() {
		const capacidad = Number(f.capacidad);
		const e: Record<string, string> = {};
		if (!f.numero.trim()) e.numero = "Escribe el número de la mesa.";
		if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 30) e.capacidad = "Escribe un número de 1 a 30.";
		setErrores(e);
		if (Object.keys(e).length) return;
		setGuardando(true);
		const ok = await alGuardar({ numero: f.numero.trim(), nombre: f.nombre.trim() || null, capacidad, forma: f.forma, areaId: f.areaId ? Number(f.areaId) : null });
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
			titulo={mesa ? `Editar la mesa ${mesa.numero}` : "Mesa nueva"}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={guardando} onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton type="submit" form={id} cargando={guardando} textoCargando="Guardando…">
						{mesa ? "Guardar cambios" : "Añadir mesa"}
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
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Número" value={f.numero} onChange={(e) => setF({ ...f, numero: e.target.value })} error={errores.numero} maxLength={10} autoComplete="off" ayuda="Como se ve en la mesa: S01, T3…" />
					<Campo etiqueta="Capacidad" type="number" inputMode="numeric" min={1} max={30} step={1} value={f.capacidad} onChange={(e) => setF({ ...f, capacidad: e.target.value })} error={errores.capacidad} ayuda="Personas." />
				</div>
				<Campo etiqueta="Nombre" opcional value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} maxLength={50} autoComplete="off" />
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Selector etiqueta="Área" opciones={[{ valor: "", texto: "Sin área" }, ...areas.map((a) => ({ valor: String(a.id), texto: a.nombre }))]} value={f.areaId} onChange={(e) => setF({ ...f, areaId: e.target.value })} />
					<Selector etiqueta="Forma" opciones={Object.entries(FORMAS).map(([valor, texto]) => ({ valor, texto }))} value={f.forma} onChange={(e) => setF({ ...f, forma: e.target.value })} />
				</div>
			</form>
		</Dialogo>
	);
}

export function MesasAdmin() {
	const [mesas, setMesas] = useState<Mesa[]>([]);
	const [areas, setAreas] = useState<Area[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "listo">("cargando");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const [m, a] = await Promise.all([api.get<Mesa[]>("/mesas/admin"), api.get<Area[]>("/mesas/admin/areas")]);
			setMesas(m.map((x) => ({ ...x, nombre: x.nombre ? primeraMayuscula(x.nombre) : null })));
			setAreas(a);
			setEstado("listo");
		} catch (e) {
			registrarError(e, "mesas admin: cargar");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void cargar();
	}, [cargar]);

	async function guardar(d: DatosMesa, mesa?: Mesa) {
		try {
			if (mesa) await api.patch(`/mesas/admin/${mesa.id}`, d);
			else await api.post("/mesas/admin", d);
			notificar({ tono: "exito", titulo: mesa ? "Mesa guardada" : "Mesa añadida", descripcion: d.numero });
			await cargar();
			return true;
		} catch (e) {
			registrarError(e, "mesas admin: guardar");
			notificar({ tono: "error", titulo: "No se pudo guardar la mesa", descripcion: mensaje(e, "Vuelve a intentarlo en un momento.") });
			return false;
		}
	}

	async function alternar(m: Mesa) {
		try {
			await api.patch(`/mesas/admin/${m.id}`, { activa: !m.activa });
			notificar({ tono: "exito", titulo: m.activa ? `Mesa ${m.numero} desactivada` : `Mesa ${m.numero} activada` });
			await cargar();
		} catch (e) {
			registrarError(e, "mesas admin: activar");
			notificar({ tono: "error", titulo: "No se pudo cambiar el estado", descripcion: m.numero });
		}
	}

	async function eliminar(m: Mesa) {
		const conserva = m.conHistorial || m.reservasActivas > 0;
		const ok = await confirmar({
			titulo: `¿Dar de baja la mesa ${m.numero}?`,
			descripcion: conserva
				? "Tiene historial o reservas activas: se desactivará y se conserva todo."
				: "No tiene historial: se borrará (queda archivada).",
			textoConfirmar: conserva ? "Desactivar mesa" : "Eliminar mesa",
			destructiva: true,
		});
		if (!ok) return;
		try {
			const r = await api.delete<{ resultado: string; message: string }>(`/mesas/admin/${m.id}`);
			notificar({ tono: "exito", titulo: r.resultado === "eliminada" ? `Mesa ${m.numero} eliminada` : `Mesa ${m.numero} desactivada`, descripcion: r.message });
			await cargar();
		} catch (e) {
			registrarError(e, "mesas admin: eliminar");
			notificar({ tono: "error", titulo: "No se pudo dar de baja la mesa", descripcion: mensaje(e, "Vuelve a intentarlo en un momento.") });
		}
	}

	const activas = mesas.filter((m) => m.activa);
	const columnas: ColumnaTabla<Mesa>[] = [
		{
			clave: "mesa",
			titulo: "Mesa",
			principal: true,
			celda: (m) => (
				<span className="flex flex-col gap-0.5">
					<span>{m.numero}</span>
					{m.nombre && <span className="text-(length:--texto-pequeno) font-normal text-texto-secundario">{m.nombre}</span>}
				</span>
			),
		},
		{ clave: "area", titulo: "Área", celda: (m) => m.areaNombre ?? "Sin área" },
		{ clave: "capacidad", titulo: "Capacidad", numerica: true, celda: (m) => `${entero.format(m.capacidad)} pers.` },
		{ clave: "forma", titulo: "Forma", celda: (m) => (m.forma ? (FORMAS[m.forma] ?? m.forma) : "—") },
		{ clave: "reservas", titulo: "Reservas por venir", numerica: true, celda: (m) => entero.format(m.reservasActivas) },
		{
			clave: "estado",
			titulo: "Estado",
			celda: (m) =>
				m.activa ? (
					<Insignia tono="exito" className="whitespace-nowrap">
						Activa
					</Insignia>
				) : (
					<Insignia tono="neutro" className="whitespace-nowrap">
						Inactiva
					</Insignia>
				),
		},
	];

	return (
		<PlantillaPanel
			titulo="Mesas"
			descripcion="Las mesas del salón, su área y su capacidad. Las que tienen historial se desactivan en lugar de borrarse."
			acciones={<DialogoMesa areas={areas} alGuardar={(d) => guardar(d)} disparador={<Boton icono={<Plus />}>Mesa nueva</Boton>} />}
		>
			<div className={REJILLA_TRES_INDICADORES}>
				<Indicador estado={estado} alReintentar={cargar} rotulo="Mesas activas" calculo={conteo("mesas activas = mesas marcadas como activas", activas, (m) => m.numero, () => "activa")} valorCalculo={activas.length} valor={entero.format(activas.length)} className={PROTAGONISTA_DE_TRES} />
				<Indicador estado={estado} alReintentar={cargar} rotulo="Lugares" calculo={suma("lugares = suma de la capacidad de cada mesa activa", activas, (m) => m.numero, (m) => m.capacidad)} valorCalculo={activas.reduce((s, m) => s + m.capacidad, 0)} valor={entero.format(activas.reduce((s, m) => s + m.capacidad, 0))} detalle="Suma de la capacidad de las activas" />
				<Indicador estado={estado} alReintentar={cargar} rotulo="Inactivas" calculo={conteo("inactivas = mesas desactivadas", mesas.filter((m) => !m.activa), (m) => m.numero, () => "inactiva")} valorCalculo={mesas.length - activas.length} valor={entero.format(mesas.length - activas.length)} />
			</div>

			<BloquePanel titulo="Todas las mesas">
				<Tabla
					leyenda="Mesas"
					tablaDesde="lg"
					columnas={columnas}
					filas={mesas}
					claveFila={(m) => m.id}
					estado={estado === "cargando" ? "cargando" : "listo"}
					error={estado === "error" ? <EstadoError titulo="No pudimos traer las mesas" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
					tituloAcciones="Acciones"
					acciones={(m) => (
						<>
							<Boton variante="fantasma" tamano="compacto" aria-label={m.activa ? `Desactivar la mesa ${m.numero}` : `Activar la mesa ${m.numero}`} onClick={() => alternar(m)}>
								{m.activa ? "Desactivar" : "Activar"}
							</Boton>
							<DialogoMesa
								mesa={m}
								areas={areas}
								alGuardar={(d) => guardar(d, m)}
								disparador={
									<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
										{`Editar la mesa ${m.numero}`}
									</Boton>
								}
							/>
							<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminar(m)}>
								{`Dar de baja la mesa ${m.numero}`}
							</Boton>
						</>
					)}
					vacio={<EstadoVacio icono={<Armchair />} titulo="Todavía no hay mesas" descripcion="Añade la primera para poder asignarla a reservas y pedidos." />}
				/>
			</BloquePanel>
			{dialogo}
		</PlantillaPanel>
	);
}
