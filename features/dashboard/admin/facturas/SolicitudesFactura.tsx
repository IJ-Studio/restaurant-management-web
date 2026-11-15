"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { api } from "@/lib/api";
import { primeraMayuscula } from "@/lib/formato/caja";
import { formatearDia } from "@/lib/formato/fecha";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";

/** Fila de GET /solicitudes-factura (Fase 4.1: solicitudes en cola). */
interface Solicitud {
	id: number;
	ordenId: string;
	rfc: string | null;
	razonSocial: string | null;
	email: string | null;
	cliente: string;
	totalOrden: string | null;
	estatusOrden: string | null;
	creadoEn: string;
}

interface Emitida {
	folio: string | null;
	correo: { enviado: boolean; motivo?: string };
}

const MOTIVO_MINIMO = 5;

function DialogoRechazo({ solicitud, alRechazar }: { solicitud: Solicitud; alRechazar: (id: number, motivo: string) => Promise<boolean> }) {
	const [abierto, setAbierto] = useState(false);
	const [motivo, setMotivo] = useState("");
	const [error, setError] = useState<string | undefined>();
	const [guardando, setGuardando] = useState(false);
	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) {
					setMotivo("");
					setError(undefined);
				}
			}}
			cerrable={!guardando}
			disparador={
				<Boton variante="secundario" tamano="compacto" aria-label={`Rechazar la factura de ${solicitud.cliente}`}>
					Rechazar
				</Boton>
			}
			titulo={`Rechazar la factura de ${solicitud.cliente}`}
			descripcion="El cliente verá el motivo al consultar su pedido."
			pie={
				<>
					<Boton variante="secundario" deshabilitado={guardando} onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton
						cargando={guardando}
						textoCargando="Guardando…"
						onClick={async () => {
							if (motivo.trim().length < MOTIVO_MINIMO) {
								setError("Escribe el motivo del rechazo (al menos 5 caracteres).");
								return;
							}
							setGuardando(true);
							const ok = await alRechazar(solicitud.id, motivo.trim());
							setGuardando(false);
							if (ok) setAbierto(false);
						}}
					>
						Rechazar solicitud
					</Boton>
				</>
			}
		>
			<Campo
				etiqueta="Motivo del rechazo"
				value={motivo}
				onChange={(e) => {
					setMotivo(e.target.value);
					if (error) setError(undefined);
				}}
				error={error}
				maxLength={300}
				autoComplete="off"
			/>
		</Dialogo>
	);
}

/** Bandeja del administrador: solicitudes de factura pendientes, las más antiguas primero. */
export function SolicitudesFactura({ alEmitir }: { alEmitir: () => void }) {
	const { notificar } = useNotificaciones();
	const [filas, setFilas] = useState<Solicitud[]>([]);
	const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
	const [emitiendo, setEmitiendo] = useState<number | null>(null);

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			setFilas(await api.get<Solicitud[]>("/solicitudes-factura?estatus=pendiente"));
			setEstado("listo");
		} catch (e) {
			registrarError(e, "solicitudes de factura: cargar");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void cargar();
	}, [cargar]);

	async function emitir(s: Solicitud) {
		setEmitiendo(s.id);
		try {
			const r = await api.post<Emitida>(`/solicitudes-factura/${s.id}/emitir`);
			notificar({
				tono: "exito",
				titulo: `Factura ${r.folio ?? ""} emitida`.replace("  ", " "),
				descripcion: r.correo.enviado ? "Se envió al correo del cliente." : (r.correo.motivo ?? "No se envió por correo."),
			});
			await cargar();
			alEmitir();
		} catch (e) {
			registrarError(e, "solicitudes de factura: emitir");
			notificar({ tono: "error", titulo: "No se pudo emitir la factura", descripcion: e instanceof Error ? e.message : "Vuelve a intentarlo en un momento." });
		} finally {
			setEmitiendo(null);
		}
	}

	async function rechazar(id: number, motivo: string) {
		try {
			await api.post(`/solicitudes-factura/${id}/rechazar`, { motivo });
			notificar({ tono: "exito", titulo: "Solicitud rechazada", descripcion: "El cliente verá el motivo." });
			await cargar();
			return true;
		} catch (e) {
			registrarError(e, "solicitudes de factura: rechazar");
			notificar({ tono: "error", titulo: "No se pudo rechazar", descripcion: e instanceof Error ? e.message : "Vuelve a intentarlo en un momento." });
			return false;
		}
	}

	const columnas: ColumnaTabla<Solicitud>[] = [
		{ clave: "cliente", titulo: "Cliente", principal: true, celda: (s) => primeraMayuscula(s.cliente) },
		{
			clave: "receptor",
			titulo: "Datos fiscales",
			celda: (s) => (
				<span className="flex flex-col gap-0.5">
					<span>{primeraMayuscula(s.razonSocial ?? "Sin razón social")}</span>
					<span className="text-(length:--texto-pequeno) font-normal text-texto-secundario">{s.rfc ?? "Sin RFC"}</span>
				</span>
			),
		},
		{ clave: "fecha", titulo: "Pedida", celda: (s) => formatearDia(s.creadoEn) ?? "—" },
		{ clave: "total", titulo: "Total", numerica: true, celda: (s) => (s.totalOrden ? formatearImporte(Number(s.totalOrden)) : "—") },
		{
			clave: "pago",
			titulo: "Pago",
			celda: (s) =>
				s.estatusOrden === "pagada" ? (
					<Insignia tono="exito" className="whitespace-nowrap">Pagado</Insignia>
				) : (
					<Insignia tono="aviso" className="whitespace-nowrap">Sin confirmar</Insignia>
				),
		},
		{
			clave: "acciones",
			titulo: "Acciones",
			celda: (s) => (
				<span className="flex flex-wrap gap-2">
					<Boton
						tamano="compacto"
						cargando={emitiendo === s.id}
						textoCargando="Emitiendo…"
						deshabilitado={s.estatusOrden !== "pagada" || emitiendo !== null}
						aria-label={`Emitir la factura de ${s.cliente}`}
						onClick={() => void emitir(s)}
					>
						Emitir
					</Boton>
					<DialogoRechazo solicitud={s} alRechazar={rechazar} />
				</span>
			),
		},
	];

	return (
		<BloquePanel titulo="Solicitudes pendientes">
			<Tabla
				leyenda="Solicitudes de factura pendientes"
				columnas={columnas}
				filas={filas}
				claveFila={(s) => String(s.id)}
				estado={estado === "cargando" ? "cargando" : "listo"}
				error={estado === "error" ? <EstadoError titulo="No pudimos traer las solicitudes" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
				vacio={<EstadoVacio icono={<Inbox />} nivelTitulo={3} titulo="Sin solicitudes pendientes" descripcion="Cuando un cliente pida su factura aparecerá aquí para emitirla." />}
			/>
		</BloquePanel>
	);
}
