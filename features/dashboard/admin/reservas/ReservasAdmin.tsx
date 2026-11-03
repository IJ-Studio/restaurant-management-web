"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { getNoShowRisk, getReservations, updateReservation } from "@/features/reservations/services/reservations.service";
import { tokenSesion } from "@/lib/paneles/api-panel";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";

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

function DialogoEstado({ reserva, alGuardar }: { reserva: Reserva; alGuardar: (id: string, estatus: string) => Promise<boolean> }) {
	const [abierto, setAbierto] = useState(false);
	const [valor, setValor] = useState(reserva.estatus);
	const [guardando, setGuardando] = useState(false);
	const nombre = reserva.clienteNombre || "la reserva";
	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) setValor(reserva.estatus);
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
							setGuardando(true);
							const ok = await alGuardar(reserva.id, valor);
							setGuardando(false);
							if (ok) setAbierto(false);
						}}
					>
						Guardar estado
					</Boton>
				</>
			}
		>
			<Selector etiqueta="Estado" opciones={ESTADOS.map(({ valor: v, texto }) => ({ valor: v, texto }))} value={valor} onChange={(e) => setValor(e.target.value)} />
		</Dialogo>
	);
}

export function ReservasAdmin() {
	const router = useRouter();
	const [verificada, setVerificada] = useState(false);
	const [reservas, setReservas] = useState<Reserva[]>([]);
	const [carga, setCarga] = useState<"cargando" | "error" | "listo">("cargando");
	const [filtros, setFiltros] = useState({ fechaDesde: "", fechaHasta: "", estatus: "", clienteNombre: "" });
	const [riesgos, setRiesgos] = useState<Record<string, Riesgo>>({});
	const { notificar } = useNotificaciones();

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
		const pendientes = reservas.filter((r) => r.estatus === "confirmada" && !(r.id in riesgos));
		if (pendientes.length === 0) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- marca las que se están pidiendo
		setRiesgos((prev) => ({ ...prev, ...Object.fromEntries(pendientes.map((r) => [r.id, "cargando" as const])) }));
		for (const r of pendientes)
			getNoShowRisk(r.id)
				.then((d) => setRiesgos((prev) => ({ ...prev, [r.id]: d })))
				.catch(() => setRiesgos((prev) => ({ ...prev, [r.id]: "error" })));
	}, [reservas, riesgos]);

	async function guardarEstado(id: string, estatus: string) {
		try {
			await updateReservation(id, { estatus });
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
		{ clave: "estado", titulo: "Estado", celda: (r) => <Insignia tono={estado(r.estatus).tono} className="whitespace-nowrap">{estado(r.estatus).texto}</Insignia> },
		{
			clave: "riesgo",
			titulo: "Riesgo de no venir",
			celda: (r) => {
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
	];

	if (!verificada) return <CargadorMarca pagina texto="Preparando las reservas…" />;

	const indicador = { estado: carga, alReintentar: cargar } as const;
	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina antetitulo="Servicio" titulo="Reservas" descripcion="Quién viene, cuándo y con qué mesa." />

			<div className={REJILLA_INDICADORES}>
				<Indicador {...indicador} rotulo="Reservas" valor={entero.format(reservas.length)} detalle="Con los filtros actuales" className={INDICADOR_PROTAGONISTA} />
				<Indicador {...indicador} rotulo="Comensales" valor={entero.format(resumen.comensales)} detalle="Sin canceladas ni ausencias" />
				<Indicador {...indicador} rotulo="Confirmadas" valor={entero.format(resumen.confirmadas)} />
				<Indicador {...indicador} rotulo="Pendientes" valor={entero.format(resumen.pendientes)} />
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
					tituloAcciones="Estado"
					acciones={(r) => <DialogoEstado reserva={r} alGuardar={guardarEstado} />}
					vacio={<EstadoVacio icono={<CalendarDays />} titulo="No hay reservas con esos filtros" descripcion="Cambia las fechas, el estado o el nombre." />}
				/>
			</BloquePanel>
		</div>
	);
}
