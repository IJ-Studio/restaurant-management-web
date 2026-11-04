import "server-only";
import { registrarError } from "@/lib/registro/registrar-error";
import { mapPromotionRow, type Promotion, type PromotionRow } from "@/features/shared/data/promotions";
import { normalizarCarta, type CategoriaCarta } from "./carta";
import { promocionesVigentes } from "./promociones-vigentes";

/**
 * Datos de la landing (PLAN 4.2): las peticiones que ya hacían `/menu` y `/promociones`, desde el
 * servidor, sin caché y en paralelo. Nunca lanzan: devuelven `{ estado: "error" }` y la sección
 * muestra su `EstadoError` (D-20), nunca una lista vacía haciéndose pasar por «no hay».
 */
export type Resultado<T> = { estado: "ok"; datos: T } | { estado: "error" };

export type { CategoriaCarta, PlatoCarta } from "./carta";

// Sin respaldo a localhost: el build exige la variable (PLAN 2.16).
const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const ESPERA_MAXIMA_MS = 8000;

async function pedirJson(ruta: string, contexto: string): Promise<Resultado<unknown>> {
	if (!API) return { estado: "error" };
	try {
		const respuesta = await fetch(`${API}${ruta}`, {
			cache: "no-store",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
		});
		if (!respuesta.ok || !respuesta.headers.get("content-type")?.includes("json")) return { estado: "error" };
		return { estado: "ok", datos: await respuesta.json() };
	} catch (error) {
		registrarError(error, contexto);
		return { estado: "error" };
	}
}


/** Categorías con sus platos: el mismo endpoint que usa la carta (`/menu`). */
export async function obtenerCarta(): Promise<Resultado<CategoriaCarta[]>> {
	const r = await pedirJson("/menu/categories/with-products", "landing: carta");
	if (r.estado === "error" || !Array.isArray(r.datos)) return { estado: "error" };
	const categorias = normalizarCarta(r.datos);
	return { estado: "ok", datos: categorias };
}

/** Promociones vigentes: activas y dentro de sus fechas, en el orden que fija el admin. */
export async function obtenerPromociones(ahora = new Date()): Promise<Resultado<Promotion[]>> {
	const r = await pedirJson("/promociones", "landing: promociones");
	if (r.estado === "error" || !Array.isArray(r.datos)) return { estado: "error" };
	return { estado: "ok", datos: promocionesVigentes((r.datos as PromotionRow[]).map(mapPromotionRow), ahora) };
}
