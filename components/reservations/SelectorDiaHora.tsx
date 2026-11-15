"use client";

import { useEffect, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { MensajeError } from "@/components/ui/Campo";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { getHoras, type HorasDelDia, type ReglasRestaurante } from "@/features/reservations/services/reservations.service";
import { mensajeDeError } from "@/lib/api";
import { registrarError } from "@/lib/registro/registrar-error";
import { cn } from "@/lib/utils";

/**
 * Día y hora de la reserva con las reglas del API (DV-06, DV-13): se ven todos los días del horizonte
 * y todas las horas del día; lo que no se puede elegir queda deshabilitado con su motivo («Cerrado»,
 * «Con menos de 1 h», «Sin disponibilidad»). Las fechas son las del restaurante, no las del navegador.
 */

/** «2026-11-15» del restaurante, con el desfase que publica `/reglas`. */
export const hoyDelRestaurante = (utcOffsetMin: number, ahora = Date.now()) =>
	new Date(ahora + utcOffsetMin * 60_000).toISOString().slice(0, 10);

const sumarDias = (fecha: string, n: number) => new Date(Date.parse(`${fecha}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** Motivo por el que el día no se puede elegir según el horario semanal y los días especiales. */
export function motivoDelDia(fecha: string, reglas: ReglasRestaurante): string | null {
	const especial = reglas.diasEspeciales.find((d) => d.fecha === fecha);
	if (especial) return especial.cerrado ? "Cerrado" : null;
	const dia = reglas.horario.find((h) => h.dia === new Date(`${fecha}T12:00:00Z`).getUTCDay());
	return !dia || dia.cerrado ? "Cerrado" : null;
}

/** Instante ISO de una fecha y hora del restaurante (no del navegador). */
export const instanteDelRestaurante = (fecha: string, hora: string, utcOffsetMin: number) =>
	new Date(Date.parse(`${fecha}T${hora}:00Z`) - utcOffsetMin * 60_000).toISOString();

export const textoAnticipacion = (min: number) =>
	`Las reservas se hacen con al menos ${min % 60 === 0 ? `${min / 60} ${min === 60 ? "hora" : "horas"}` : `${min} minutos`} de anticipación.`;

const etiqueta = (fecha: string, opciones: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat("es-MX", { ...opciones, timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));

interface Props {
	reglas: ReglasRestaurante;
	fecha: string;
	hora: string;
	numComensales: number;
	alCambiar: (cambio: { fecha?: string; hora?: string }) => void;
	errorFecha?: string;
	errorHora?: string;
}

export default function SelectorDiaHora({ reglas, fecha, hora, numComensales, alCambiar, errorFecha, errorHora }: Props) {
	const hoy = hoyDelRestaurante(reglas.utcOffsetMin);
	const dias = Array.from({ length: reglas.reservas.diasMaxAdelanto + 1 }, (_, i) => sumarDias(hoy, i));
	// El resultado se guarda con su clave: al cambiar el día o las personas, el anterior deja de valer.
	const clave = `${fecha}|${numComensales}`;
	const [resultado, setResultado] = useState<{ clave: string; horas?: HorasDelDia; fallo?: string } | null>(null);
	const vigente = resultado?.clave === clave ? resultado : null;
	const horas = vigente?.horas ?? null;
	const fallo = vigente?.fallo ?? null;

	useEffect(() => {
		if (!fecha || numComensales < 1 || numComensales > reglas.reservas.comensalesMax) return;
		let activo = true;
		getHoras(fecha, numComensales)
			.then((h) => {
				if (!activo) return;
				setResultado({ clave, horas: h });
				// Si la hora elegida dejó de estar libre (otro día u otro número de personas), se quita.
				if (hora && !h.horas.some((x) => x.hora === hora && x.disponible)) alCambiar({ hora: "" });
			})
			.catch((error: unknown) => {
				registrarError(error, "reserva: horas del día");
				if (activo) setResultado({ clave, fallo: mensajeDeError(error, "No pudimos ver las horas libres. Inténtalo de nuevo en un momento.") });
			});
		return () => {
			activo = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar el día o las personas
	}, [clave]);

	return (
		<div className="flex flex-col gap-(--espacio-md)">
			<fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0" aria-describedby={errorFecha ? "reserva-dia-error" : undefined}>
				<legend className="mb-1.5 text-(length:--texto-pequeno) font-semibold text-texto-principal">Día</legend>
				<div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
					{dias.map((d) => {
						const motivo = motivoDelDia(d, reglas);
						const elegido = d === fecha;
						return (
							<button
								key={d}
								type="button"
								aria-pressed={elegido}
								aria-label={`${etiqueta(d, { weekday: "long", day: "numeric", month: "long" })}${motivo ? `, ${motivo.toLowerCase()}` : ""}`}
								disabled={!!motivo}
								onClick={() => alCambiar({ fecha: d, hora: "" })}
								className={cn(
									"flex min-h-16 min-w-20 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-control border px-2 py-1.5 text-center",
									"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
									motivo && "cursor-not-allowed border-dashed border-borde-control text-texto-tenue",
									!motivo && !elegido && "border-borde-control al-pasar:bg-superficie-cafe",
									elegido && "border-acento bg-superficie-cafe",
								)}
							>
								<span className="text-(length:--texto-pequeno) capitalize">{d === hoy ? "Hoy" : etiqueta(d, { weekday: "short" })}</span>
								<span className="font-titulos text-(length:--texto-titulo-3) leading-none numeros-tabulares">{etiqueta(d, { day: "numeric" })}</span>
								<span className="text-(length:--texto-pequeno) text-texto-secundario">{motivo ?? etiqueta(d, { month: "short" })}</span>
							</button>
						);
					})}
				</div>
				{errorFecha && <MensajeError id="reserva-dia-error">{errorFecha}</MensajeError>}
			</fieldset>

			<fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0" aria-describedby={errorHora ? "reserva-hora-error" : undefined}>
				<legend className="mb-1.5 text-(length:--texto-pequeno) font-semibold text-texto-principal">Hora</legend>
				{!fecha ? (
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Elige primero el día.</p>
				) : fallo ? (
					<Aviso tono="error">{fallo}</Aviso>
				) : !horas ? (
					<CargadorMarca texto="Buscando horas libres…" className="py-6" />
				) : horas.motivo ? (
					<Aviso tono="info">Ese día no se puede reservar: {horas.motivo.toLowerCase()}.</Aviso>
				) : (
					<>
						{!horas.horas.some((h) => h.disponible) && <Aviso tono="info" titulo="No quedan horas libres ese día">Prueba con otro día o con menos personas.</Aviso>}
						<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
							{horas.horas.map((h) => {
								const elegida = h.hora === hora;
								return (
									<button
										key={h.hora}
										type="button"
										aria-pressed={elegida}
										disabled={!h.disponible}
										onClick={() => alCambiar({ hora: h.hora })}
										className={cn(
											"flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-control border p-1.5 text-center",
											"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
											!h.disponible && "cursor-not-allowed border-dashed border-borde-control text-texto-tenue",
											h.disponible && !elegida && "border-borde-control al-pasar:bg-superficie-cafe",
											elegida && "border-acento bg-superficie-cafe",
										)}
									>
										<span className="font-titulos text-(length:--texto-titulo-3) leading-none numeros-tabulares">{h.hora}</span>
										{h.motivo && <span className="text-(length:--texto-pequeno)">{h.motivo}</span>}
									</button>
								);
							})}
						</div>
					</>
				)}
				{errorHora && <MensajeError id="reserva-hora-error">{errorHora}</MensajeError>}
			</fieldset>
		</div>
	);
}
