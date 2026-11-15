"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { EstadoError } from "@/components/ui/EstadoError";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import { pedirPanel } from "@/lib/paneles/api-panel";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Incidencias de cocina (paridad con la móvil): `GET /cocina/incidencias` (las de hoy) y
 * `POST /cocina/incidencias`. Mismos tipos, minutos sugeridos, reglas y textos que la app.
 */

const TIPOS = [
	{ valor: "retraso", texto: "Retraso" },
	{ valor: "falta_insumo", texto: "Falta insumo" },
	{ valor: "equipo", texto: "Falla de equipo" },
	{ valor: "devolucion", texto: "Devolución" },
	{ valor: "otro", texto: "Otro" },
];
const MINUTOS = [5, 10, 15, 20, 30];
const textoTipo = (t: string) => TIPOS.find((x) => x.valor === t)?.texto ?? "Incidencia";

interface Incidencia {
	id: string;
	tipo: string;
	mensaje: string | null;
	minutos: number | null;
	mesa: string | null;
	reportadoPor: string | null;
	creadoEn: string;
}

const hora = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });

function DialogoIncidencia({ alGuardar }: { alGuardar: () => void }) {
	const [abierto, setAbierto] = useState(false);
	const [tipo, setTipo] = useState("retraso");
	const [minutos, setMinutos] = useState("");
	const [mensaje, setMensaje] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [enviando, setEnviando] = useState(false);
	const { notificar } = useNotificaciones();

	async function enviar() {
		const texto = mensaje.trim();
		if (tipo === "retraso" && !minutos) return setError("Elige cuántos minutos más va a tardar.");
		if (tipo === "otro" && !texto) return setError("Describe qué pasó.");
		setError(null);
		setEnviando(true);
		try {
			await api.post("/cocina/incidencias", {
				tipo,
				...(texto ? { mensaje: texto } : {}),
				...(tipo === "retraso" ? { minutos: Number(minutos) } : {}),
			});
			notificar({ tono: "exito", titulo: "Incidencia reportada", descripcion: textoTipo(tipo) });
			setAbierto(false);
			alGuardar();
		} catch (e) {
			registrarError(e, "cocina: reportar incidencia");
			setError("No se pudo enviar el reporte. Vuelve a intentarlo en un momento.");
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
					setTipo("retraso");
					setMinutos("");
					setMensaje("");
					setError(null);
				}
			}}
			disparador={
				<Boton variante="secundario" icono={<TriangleAlert />} className="min-h-12">
					Reportar incidencia
				</Boton>
			}
			titulo="Reportar incidencia"
			descripcion="Queda en las incidencias de hoy para el resto del personal."
			pie={
				<>
					<Boton variante="secundario" className="min-h-12" onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton className="min-h-12" cargando={enviando} onClick={() => void enviar()}>
						Enviar reporte
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-md)">
				<Selector etiqueta="¿Qué pasó?" opciones={TIPOS} value={tipo} onChange={(e) => setTipo(e.target.value)} />
				{tipo === "retraso" && (
					<Selector
						etiqueta="¿Cuánto más va a tardar?"
						marcador="Elige los minutos"
						opciones={MINUTOS.map((m) => ({ valor: String(m), texto: `${m} min` }))}
						value={minutos}
						onChange={(e) => setMinutos(e.target.value)}
					/>
				)}
				<AreaTexto
					etiqueta={tipo === "otro" ? "Describe qué pasó" : "Detalle (opcional)"}
					value={mensaje}
					onChange={(e) => setMensaje(e.target.value)}
					maxLength={300}
					rows={3}
				/>
				{error && (
					<p role="alert" className="m-0 text-error">
						{error}
					</p>
				)}
			</div>
		</Dialogo>
	);
}

export function IncidenciasCocina() {
	const [incidencias, recargar] = useCarga(() => pedirPanel<Incidencia[]>("/cocina/incidencias"), "cocina: incidencias");
	const lista = incidencias.estado === "listo" && Array.isArray(incidencias.datos) ? incidencias.datos : [];

	return (
		<BloquePanel
			titulo="Incidencias de hoy"
			descripcion={lista.length ? undefined : "Sin incidencias hoy."}
			acciones={<DialogoIncidencia alGuardar={() => void recargar({ silenciosa: true })} />}
		>
			{incidencias.estado === "error" ? (
				<EstadoError titulo="No pudimos traer las incidencias" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />
			) : (
				lista.length > 0 && (
					<ul className="m-0 flex list-none flex-col p-0" aria-label="Incidencias de hoy">
						{lista.map((i) => (
							<li key={i.id} className="flex flex-col gap-1 border-b border-borde-sutil py-(--espacio-sm) last:border-b-0">
								<span className="flex flex-wrap items-center gap-2">
									<Insignia tono="aviso">{textoTipo(i.tipo)}</Insignia>
									{i.minutos ? <span className="font-semibold">{`+${i.minutos} min`}</span> : null}
									{i.mesa && <span className="text-texto-secundario">{i.mesa}</span>}
									<span className="ms-auto text-(length:--texto-pequeno) text-texto-secundario cifras-consola">{hora.format(new Date(i.creadoEn))}</span>
								</span>
								{i.mensaje && <span className="text-texto-principal">{i.mensaje}</span>}
								{i.reportadoPor && <span className="text-(length:--texto-pequeno) text-texto-secundario">{`Reportó: ${i.reportadoPor}`}</span>}
							</li>
						))}
					</ul>
				)
			)}
		</BloquePanel>
	);
}
