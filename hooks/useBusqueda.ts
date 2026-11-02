"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { normalizarParaComparar } from "@/lib/validacion/saneamiento";

/**
 * Búsquedas del `Buscador` (PLAN 3.14).
 *
 * - `useFiltroLocal`: filtra una lista que ya está en memoria con `useDeferredValue`. Lo que se
 *   escribe se pinta al momento y el filtrado va detrás, sin bloquear el teclado aunque la lista
 *   sea larga. Compara sin tildes ni mayúsculas.
 * - `useBusquedaRemota`: busca en el API cuando se deja de escribir 300 ms, con un mínimo de
 *   caracteres, y cancela con `AbortController` la petición anterior si llega otra consulta (o al
 *   desmontar), así que nunca pisa un resultado nuevo con uno viejo.
 */

/** Coincide si todas las palabras de la consulta aparecen en el texto (sin tildes ni mayúsculas). */
export function coincide(texto: string, consulta: string): boolean {
	const palabras = normalizarParaComparar(consulta).split(/\s+/).filter(Boolean);
	if (palabras.length === 0) return true;
	const donde = normalizarParaComparar(texto);
	return palabras.every((p) => donde.includes(p));
}

export function useFiltroLocal<T>(elementos: T[], consulta: string, textoDe: (elemento: T) => string) {
	const diferida = useDeferredValue(consulta);
	const filtrados = useMemo(() => elementos.filter((e) => coincide(textoDe(e), diferida)), [elementos, diferida, textoDe]);
	return { filtrados, pendiente: diferida !== consulta };
}

export type EstadoBusqueda = "inactiva" | "esperando" | "buscando" | "lista" | "error";

export interface OpcionesBusquedaRemota {
	/** Milisegundos sin teclear antes de buscar. */
	retrasoMs?: number;
	/** Caracteres mínimos (sin contar espacios) para buscar. */
	minimo?: number;
}

export function useBusquedaRemota<R>(
	consulta: string,
	buscar: (consulta: string, senal: AbortSignal) => Promise<R>,
	{ retrasoMs = 300, minimo = 2 }: OpcionesBusquedaRemota = {},
) {
	const [resultado, setResultado] = useState<{ consulta: string; datos: R | null; error: boolean } | null>(null);
	const [enCurso, setEnCurso] = useState<string | null>(null);
	// La función puede cambiar en cada render del padre; se usa siempre la última sin relanzar la búsqueda.
	const buscarRef = useRef(buscar);
	useEffect(() => {
		buscarRef.current = buscar;
	});

	const limpia = consulta.trim();
	const valida = limpia.replace(/\s/g, "").length >= minimo;

	useEffect(() => {
		if (!valida) return;
		const control = new AbortController();
		const espera = window.setTimeout(async () => {
			setEnCurso(limpia);
			try {
				const datos = await buscarRef.current(limpia, control.signal);
				if (!control.signal.aborted) setResultado({ consulta: limpia, datos, error: false });
			} catch (error) {
				if (control.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
				setResultado({ consulta: limpia, datos: null, error: true });
			} finally {
				if (!control.signal.aborted) setEnCurso(null);
			}
		}, retrasoMs);
		return () => {
			window.clearTimeout(espera);
			control.abort();
		};
	}, [limpia, valida, retrasoMs]);

	// El estado se deriva de la consulta actual: un resultado de otra consulta no cuenta.
	let estado: EstadoBusqueda;
	if (!valida) estado = "inactiva";
	else if (resultado?.consulta === limpia) estado = resultado.error ? "error" : "lista";
	else if (enCurso === limpia) estado = "buscando";
	else estado = "esperando";

	return {
		estado,
		datos: resultado?.consulta === limpia ? resultado.datos : null,
		/** El último resultado válido, para mantener la lista mientras llega el nuevo (sin parpadeo). */
		anteriores: resultado?.datos ?? null,
	};
}
