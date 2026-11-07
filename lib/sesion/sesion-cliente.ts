/**
 * Consulta de sesión deduplicada (PLAN 2.15). Todas las lecturas de `/api/auth/me` de una carga
 * de página comparten **una sola** petición: el store (`hydrateSession`) y las páginas que antes
 * hacían la suya.
 *
 * Devuelve un objeto con la forma mínima de `Response` que usaban esas páginas (`ok`, `status` y
 * `json()`), para no cambiar su lógica. `olvidarSesion()` descarta el resultado guardado: lo
 * llaman el inicio y el cierre de sesión, para que la siguiente lectura vuelva a preguntar.
 */
export interface RespuestaSesion {
	ok: boolean;
	status: number;
	// La misma firma que `Response.json()`, que devolvía `any` a quien la usaba.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json: () => Promise<any>;
}

let enCurso: Promise<RespuestaSesion> | null = null;

export function pedirSesion(): Promise<RespuestaSesion> {
	enCurso ??= fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
		.then(async (res) => {
			const datos: unknown = await res.json().catch(() => null);
			return { ok: res.ok, status: res.status, json: async () => datos };
		})
		.catch((error: unknown) => {
			// Sin red: no se guarda el fallo, la siguiente lectura lo intenta de nuevo.
			enCurso = null;
			throw error;
		});
	return enCurso;
}

export function olvidarSesion(): void {
	enCurso = null;
}
