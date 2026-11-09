/**
 * Peticiones de los paneles al API (fase 5). Reúne la lógica que cada pantalla copiaba
 * (`getAuthToken` + `fetch`) sin cambiarla: la misma URL (`NEXT_PUBLIC_API_URL` + ruta), sin caché
 * y con el token de siempre (cookie `session` o `authToken` en el almacenamiento) en `Authorization`.
 * Los endpoints no cambian (regla 6 del PLAN).
 *
 * A diferencia de antes, una respuesta que no es 2xx **lanza**: la pantalla muestra un error con
 * «Reintentar» en lugar de un cero en silencio (NP-17).
 */
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export function tokenSesion(): string | null {
	if (typeof window === "undefined") return null;
	const coincidencia = document.cookie.match(/(?:^|;\s*)session=([^;]+)/);
	if (coincidencia) return coincidencia[1];
	return localStorage.getItem("authToken");
}

export function cabecerasPanel(): Record<string, string> {
	const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
	const token = tokenSesion();
	if (token) cabeceras.Authorization = `Bearer ${token}`;
	return cabeceras;
}

export async function pedirPanel<T>(ruta: string): Promise<T> {
	const res = await fetch(`${API}${ruta}`, { cache: "no-store", headers: cabecerasPanel() });
	if (!res.ok) throw new Error(`${ruta} respondió ${res.status}`);
	return (await res.json()) as T;
}
