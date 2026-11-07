"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Carga de un bloque de pantalla con sus tres estados (fase 5: «estados de carga, vacío y error en
 * cada bloque»). `pedir` se lee de una referencia, así que puede ser una función nueva en cada
 * render sin repetir la petición. Devuelve el estado y `recargar`, para el botón «Reintentar».
 * `recargar({ silenciosa: true })` (sondeos) conserva los datos a la vista mientras llega la
 * respuesta y, si falla, no los sustituye por el error.
 */
export type Carga<T> = { estado: "cargando" } | { estado: "error" } | { estado: "listo"; datos: T };

export type Recargar = (opciones?: { silenciosa?: boolean }) => Promise<void>;

export function useCarga<T>(pedir: () => Promise<T>, contexto: string): [Carga<T>, Recargar] {
	const [carga, setCarga] = useState<Carga<T>>({ estado: "cargando" });
	const pedirRef = useRef(pedir);
	useEffect(() => {
		pedirRef.current = pedir;
	});

	const recargar = useCallback<Recargar>(
		async ({ silenciosa = false } = {}) => {
			if (!silenciosa) setCarga({ estado: "cargando" });
			try {
				setCarga({ estado: "listo", datos: await pedirRef.current() });
			} catch (error) {
				registrarError(error, contexto);
				setCarga((actual) => (silenciosa && actual.estado === "listo" ? actual : { estado: "error" }));
			}
		},
		[contexto],
	);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void recargar();
	}, [recargar]);

	return [carga, recargar];
}
