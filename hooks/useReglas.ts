"use client";

import { useEffect, useState } from "react";
import { getReglas, type ReglasRestaurante } from "@/features/reservations/services/reservations.service";
import { registrarError } from "@/lib/registro/registrar-error";

// Una petición por carga de página: las reglas cambian muy de vez en cuando.
let pendiente: Promise<ReglasRestaurante> | null = null;

/** Reglas del restaurante desde el API; `null` mientras cargan, `fallo` si no se pudieron leer. */
export function useReglas() {
	const [reglas, setReglas] = useState<ReglasRestaurante | null>(null);
	const [fallo, setFallo] = useState(false);
	useEffect(() => {
		let vigente = true;
		(pendiente ??= getReglas())
			.then((r) => vigente && setReglas(r))
			.catch((error: unknown) => {
				pendiente = null;
				registrarError(error, "reglas del restaurante");
				if (vigente) setFallo(true);
			});
		return () => {
			vigente = false;
		};
	}, []);
	return { reglas, fallo };
}
