"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { enlaceWhatsApp } from "@/lib/contacto/whatsapp";
import { Buscador } from "@/components/ui/Buscador";
import { Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { getNoShowEstado, getNoShowRisk, getReservations, updateReservation } from "@/features/reservations/services/reservations.service";
import { primeraMayuscula } from "@/lib/formato/caja";
import { tokenSesion } from "@/lib/paneles/api-panel";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { conteo, suma } from "@/lib/paneles/calculo";

/**
 * Reservas en administración (PLAN 5.11). Mismos servicios (`getReservations` con sus filtros,
 * `updateReservation({ estatus })`, `getNoShowRisk` para cada confirmada) y la misma comprobación
 * de token en el cliente. Cambia la forma: indicadores, filtros del catálogo, `Tabla` que pasa a
 * tarjetas (el patrón de reservas que cita DESIGN.md), el cambio de estado en un diálogo con su
 * confirmación (antes, un `<select>` dentro de la fila que guardaba al instante) y el riesgo con
 * texto. Sin `alert()`.
 */

interface Reserva {
	id: string;
	clienteNombre?: string;
	clienteEmail?: string;
	clienteTelefono?: string;
	fechaHora: string;
	numComensales?: number;
	mesaNumero?: string | number;
	canal?: string;
	ocasion?: string;
	peticionesEspeciales?: string;
	depositoPagado?: number | string | null;
	estatus: string;
	motivoCancelacion?: string | null;
}
type Riesgo = { probabilidad: number; clasificacion: "Alto" | "Medio" | "Bajo" } | "cargando" | "error";

const ESTADOS: { valor: string; texto: string; tono: TonoInsignia }[] = [
	{ valor: "pendiente", texto: "Pendiente", tono: "aviso" },
	{ valor: "confirmada", texto: "Confirmada", tono: "exito" },
	{ valor: "completada", texto: "Completada", tono: "neutro" },
	{ valor: "cancelada", texto: "Cancelada", tono: "error" },
	{ valor: "no_show", texto: "No se presentó", tono: "error" },
];
const estado = (v: string) => ESTADOS.find((e) => e.valor === v) ?? { valor: v, texto: v, tono: "neutro" as const };
const RIESGO: Record<"Alto" | "Medio" | "Bajo", TonoInsignia> = { Alto: "error", Medio: "aviso", Bajo: "exito" };
const entero = new Intl.NumberFormat("es-MX");
const fechaHora = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const escribirFecha = (iso: string) => {
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? "—" : fechaHora.format(d);
};

function DialogoEstado({ reserva, alGuardar }: { reserva: Reserva; alGuardar: (id: string, estatus: string, motivo?: string) => Promise<boolean> }) {
	const [abierto, setAbierto] = useState(false);
	const [valor, setValor] = useState(reserva.estatus);
	// Cancelar exige motivo (Prioridad 3.3): lo pide el API y lo ve el administrador.
	const [motivo, setMotivo] = useState("");
	const [errorMotivo, setErrorMotivo] = useState<string | undefined>();
	const cancela = valor === "cancelada";
	const [guardando, setGuardando] = useState(false);
	const nombre = reserva.clienteNombre || "la reserva";
	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) {
					setValor(reserva.estatus);
					setMotivo("");
					setErrorMotivo(undefined);
				}
			}}
			cerrable={!guardando}
			disparador={
				<Boton variante="secundario" tamano="compacto" aria-label={`Cambiar estado de ${nombre}`}>
					Cambiar estado
				</Boton>
			}
			titulo={`Estado de ${nombre}`}
			descripcion={`${escribirFecha(reserva.fechaHora)} · ${entero.format(Number(reserva.numComensales ?? 0))} comensales.`}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={guardando} onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton
						cargando={guardando}
						textoCargando="Guardando…"
						deshabilitado={valor === reserva.estatus}
						onClick={async () => {
							if (cancela && motivo.trim().length < 3) {
								setErrorMotivo("Escribe el motivo de la cancelación.");
								return;
							}
							setGuardando(true);
							const ok = await alGuardar(reserva.id, valor, cancela ? motivo.trim() : undefined);
							setGuardando(false);
							if (ok) setAbierto(false);
						}}
					>
						Guardar estado
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-md)">
				<Selector etiqueta="Estado" opciones={ESTADOS.map(({ valor: v, texto }) => ({ valor: v, texto }))} value={valor} onChange={(e) => setValor(e.target.value)} />
				{cancela && (
					<Campo
						etiqueta="Motivo de la cancelación"
						value={motivo}
						onChange={(e) => {
							setMotivo(e.target.value);
							if (errorMotivo) setErrorMotivo(undefined);
						}}
						error={errorMotivo}
						maxLength={300}
						autoComplete="off"
					/>
				)}
			</div>
		</Dialogo>
	);
}

/** Escribir al cliente por WhatsApp (Prioridad 3.4); sin teléfono válido, desactivado y con el motivo. */
function BotonWhatsApp({ reserva }: { reserva: Reserva }) {
	const nombre = reserva.clienteNombre || "el cliente";
	const enlace = enlaceWhatsApp(reserva.clienteTelefono, `Hola, ${nombre}. Te escribimos de El Quijote por tu reserva del ${escribirFecha(reserva.fechaHora)}.`);
	if (!enlace)
		return (
			<Boton variante="fantasma" tamano="compacto" deshabilitado aria-label={`Sin WhatsApp: no hay un teléfono válido de ${nombre}`}>
				Sin WhatsApp
			</Boton>
		);
	return (
		<BotonEnlace href={enlace} target="_blank" rel="noopener noreferrer" variante="fantasma" tamano="compacto" aria-label={`Escribir a ${nombre} por WhatsApp (se abre en otra pestaña)`}>
			WhatsApp
		</BotonEnlace>
	);
}

/** Escribir al cliente por correo (Fase 4.6): abre el programa de correo con asunto y mensaje. */
function BotonCorreo({ reserva }: { reserva: Reserva }) {
	const nombre = reserva.clienteNombre || "el cliente";
	const correo = reserva.clienteEmail?.trim() ?? "";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
		return (
			<Boton variante="fantasma" tamano="compacto" deshabilitado aria-label={`Sin correo: no hay un correo válido de ${nombre}`}>
				Sin correo
			</Boton>
		);
	const asunto = `Tu reserva en El Quijote del ${escribirFecha(reserva.fechaHora)}`;
	const cuerpo = `Hola, ${nombre}.\n\nTe escribimos de El Quijote por tu reserva del ${escribirFecha(reserva.fechaHora)}.\n\n`;
	return (
		<BotonEnlace
			href={`mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`}
			variante="fantasma"
			tamano="compacto"
			aria-label={`Escribir a ${nombre} por correo`}
		>
			Correo
		</BotonEnlace>
	);
}

export function ReservasAdmin() {
	const router = useRouter();
	const [verificada, setVerificada] = useState(false);
	const [reservas, setReservas] = useState<Reserva[]>([]);
	const [carga, setCarga] = useState<"cargando" | "error" | "listo">("cargando");
	const [filtros, setFiltros] = useState({ fechaDesde: "", fechaHasta: "", estatus: "", clienteNombre: "" });
	const [riesgos, setRiesgos] = useState<Record<string, Riesgo>>({});
	// La predicción de ausencias puede estar desactivada en el API: entonces no hay columna ni peticiones.
	const [prediccion, setPrediccion] = useState(false);
	const { notificar } = useNotificaciones();

	useEffect(() => {
		void getNoShowEstado().then(setPrediccion);
	}, []);

	// Misma comprobación que antes: sin token legible, a iniciar sesión.
	useEffect(() => {
		if (!tokenSesion()) router.push("/login?redirect=/dashboard/admin/reservations");
		// eslint-disable-next-line react-hooks/set-state-in-effect -- se comprueba al montar
		else setVerificada(true);
	}, [router]);

	const cargar = useCallback(async () => {
		setCarga("cargando");
		try {
			const datos = await getReservations(filtros);
			setReservas(Array.isArray(datos) ? datos : []);
			setCarga("listo");
		} catch (e) {
			registrarError(e, "reservas admin: cargar");
			setCarga("error");
		}
	}, [filtros]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga al cambiar los filtros
		if (verificada) void cargar();
	}, [verificada, cargar]);

	// Riesgo de no presentarse: solo para las confirmadas, una vez por reserva, como antes.
	useEffect(() => {
		if (!prediccion) return;
		const pendientes = reservas.filter((r) => r.estatus === "confirmada" && !(r.id in riesgos));
		if (pendientes.length === 0) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- marca las que se están pidiendo
		setRiesgos((prev) => ({ ...prev, ...Object.fromEntries(pendientes.map((r) => [r.id, "cargando" as const])) }));
		for (const r of pendientes)
			getNoShowRisk(r.id)
				.then((d) => setRiesgos((prev) => ({ ...prev, [r.id]: d })))
				.catch(() => setRiesgos((prev) => ({ ...prev, [r.id]: "error" })));
	}, [reservas, riesgos, prediccion]);

	async function guardarEstado(id: string, estatus: string, motivo?: string) {
		try {
			await updateReservation(id, motivo ? { estatus, motivoCancelacion: motivo } : { estatus });
			notificar({ tono: "exito", titulo: "Estado guardado", descripcion: estado(estatus).texto });
			void cargar();
			return true;
		} catch (e) {
			registrarError(e, "reservas admin: estado");
			notificar({ tono: "error", titulo: "No se pudo cambiar el estado", descripcion: "Vuelve a intentarlo en un momento." });
			return false;
		}
	}

	const resumen = useMemo(
		() => ({
			comensales: reservas.filter((r) => r.estatus !== "cancelada" && r.estatus !== "no_show").reduce((a, r) => a + Number(r.numComensales ?? 0), 0),
			confirmadas: reservas.filter((r) => r.estatus === "confirmada").length,
			pendientes: reservas.filter((r) => r.estatus === "pendiente").length,
		}),
		[reservas],
	);

	const columnas: ColumnaTabla<Reserva>[] = [
		{
			clave: "cliente",
			titulo: "Cliente",
			principal: true,
			celda: (r) => (
				<span className="flex flex-col gap-0.5">
					<span>{r.clienteNombre || "Sin nombre"}</span>
					{r.clienteEmail && <span className="text-(length:--texto-pequeno) font-normal text-texto-secundario [overflow-wrap:anywhere] xl:whitespace-nowrap">{r.clienteEmail}</span>}
					{r.clienteTelefono && <span className="text-(length:--texto-pequeno) font-normal text-texto-secundario">{r.clienteTelefono}</span>}
				</span>
			),
		},
		{ clave: "cuando", titulo: "Cuándo", celda: (r) => escribirFecha(r.fechaHora) },
		{
			clave: "mesa",
			titulo: "Comensales y mesa",
			celda: (r) => `${entero.format(Number(r.numComensales ?? 0))} · ${r.mesaNumero ? `mesa ${r.mesaNumero}` : "sin mesa"}`,
		},
		{
			clave: "detalles",
			titulo: "Detalles",
			// Canal, ocasión y peticiones juntos: diez columnas no caben junto a la barra lateral.
			celda: (r) => {
				const partes = [r.ocasion, r.peticionesEspeciales, r.canal ? `Por ${r.canal}` : ""].filter(Boolean);
				return partes.length ? (
					<span className="flex flex-col gap-0.5">
						{partes.map((t) => (
							<span key={t}>{t}</span>
						))}
					</span>
				) : (
					"—"
				);
			},
		},
		{ clave: "deposito", titulo: "Depósito", numerica: true, celda: (r) => (r.depositoPagado != null ? (formatearImporte(Number(r.depositoPagado)) ?? "—") : "—") },
		{
			clave: "estado",
			titulo: "Estado",
			celda: (r) => (
				<span className="flex flex-col items-start gap-1">
					<Insignia tono={estado(r.estatus).tono} className="whitespace-nowrap">{estado(r.estatus).texto}</Insignia>
					{r.estatus === "cancelada" && r.motivoCancelacion && <span className="text-(length:--texto-pequeno) text-texto-secundario">{primeraMayuscula(r.motivoCancelacion)}</span>}
				</span>
			),
		},
		// Solo si la predicción de ausencias está activa en el API (Prioridad 3.5).
		...(prediccion
			? [
		{
			clave: "riesgo",
			titulo: "Riesgo de no venir",
			celda: (r: Reserva) => {
				const x = riesgos[r.id];
				if (r.estatus !== "confirmada" || !x) return "—";
				if (x === "cargando") return <span className="text-texto-secundario">Calculando…</span>;
				if (x === "error") return <span className="text-texto-secundario">Sin dato</span>;
				return (
					<Insignia tono={RIESGO[x.clasificacion]} className="whitespace-nowrap">
						{`${x.clasificacion} · ${Math.round(x.probabilidad * 100)} %`}
					</Insignia>
				);
			},
		},
				] satisfies ColumnaTabla<Reserva>[]
			: []),
	];

	if (!verificada) return <CargadorMarca pagina texto="Preparando las reservas…" />;

	const indicador = { estado: carga, alReintentar: cargar } as const;
	return (
		<PlantillaPanel titulo="Reservas" descripcion="Quién viene, cuándo y con qué mesa.">

			<div className={REJILLA_INDICADORES}>
				<Indicador {...indicador} rotulo="Reservas" calculo={conteo("reservas = reservaciones con los filtros actuales", reservas, (r) => `${r.clienteNombre ?? "Sin nombre"} · ${r.fechaHora.slice(0, 16).replace("T", " ")}`, (r) => r.estatus ?? "")} valorCalculo={reservas.length} valor={entero.format(reservas.length)} detalle="Con los filtros actuales" className={INDICADOR_PROTAGONISTA} />
				<Indicador {...indicador} rotulo="Comensales" calculo={suma("comensales = suma de los comensales de cada reserva no cancelada ni ausente", reservas.filter((r) => r.estatus !== "cancelada" && r.estatus !== "no_show"), (r) => `${r.clienteNombre ?? "Sin nombre"} · ${r.fechaHora.slice(0, 16).replace("T", " ")}`, (r) => Number(r.numComensales ?? 0))} valorCalculo={resumen.comensales} valor={entero.format(resumen.comensales)} detalle="Sin canceladas ni ausencias" />
				<Indicador {...indicador} rotulo="Confirmadas" calculo={conteo("confirmadas = reservas en estado confirmada", reservas.filter((r) => r.estatus === "confirmada"), (r) => `${r.clienteNombre ?? "Sin nombre"} · ${r.fechaHora.slice(0, 16).replace("T", " ")}`, () => "confirmada")} valorCalculo={resumen.confirmadas} valor={entero.format(resumen.confirmadas)} />
				<Indicador {...indicador} rotulo="Pendientes" calculo={conteo("pendientes = reservas en estado pendiente", reservas.filter((r) => r.estatus === "pendiente"), (r) => `${r.clienteNombre ?? "Sin nombre"} · ${r.fechaHora.slice(0, 16).replace("T", " ")}`, () => "pendiente")} valorCalculo={resumen.pendientes} valor={entero.format(resumen.pendientes)} />
			</div>

			<BloquePanel
				titulo="Lista de reservas"
				acciones={
					<div className="flex w-full flex-wrap items-end gap-3">
						<Campo etiqueta="Desde" type="date" value={filtros.fechaDesde} max={filtros.fechaHasta || undefined} onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })} className="w-44" />
						<Campo etiqueta="Hasta" type="date" value={filtros.fechaHasta} min={filtros.fechaDesde || undefined} onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })} className="w-44" />
						<Selector etiqueta="Estado" opciones={[{ valor: "", texto: "Todos" }, ...ESTADOS.map(({ valor, texto }) => ({ valor, texto }))]} value={filtros.estatus} onChange={(e) => setFiltros({ ...filtros, estatus: e.target.value })} />
						<Buscador etiqueta="Buscar por cliente" valor={filtros.clienteNombre} alCambiar={(v) => setFiltros({ ...filtros, clienteNombre: v })} marcador="Nombre del cliente" />
					</div>
				}
			>
				<Tabla
					leyenda="Reservas"
					tablaDesde="xl"
					columnas={columnas}
					filas={reservas}
					claveFila={(r) => r.id}
					estado={carga === "cargando" ? "cargando" : "listo"}
					error={carga === "error" ? <EstadoError titulo="No pudimos traer las reservas" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
					tituloAcciones="Acciones"
					acciones={(r) => (
						<>
							<BotonWhatsApp reserva={r} />
							<BotonCorreo reserva={r} />
							<DialogoEstado reserva={r} alGuardar={guardarEstado} />
						</>
					)}
					vacio={<EstadoVacio icono={<CalendarDays />} titulo="No hay reservas con esos filtros" descripcion="Cambia las fechas, el estado o el nombre." />}
				/>
			</BloquePanel>
		</PlantillaPanel>
	);
}
