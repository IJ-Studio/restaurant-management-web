import "server-only";
import { registrarError } from "@/lib/registro/registrar-error";
import { mapPromotionRow, type Promotion, type PromotionRow } from "@/features/shared/data/promotions";
import { promocionesVigentes } from "./promociones-vigentes";

/**
 * Datos de la landing (PLAN 4.2): las peticiones que ya hacían `/menu` y `/promociones`, desde el
 * servidor, sin caché y en paralelo. Nunca lanzan: devuelven `{ estado: "error" }` y la sección
 * muestra su `EstadoError` (D-20), nunca una lista vacía haciéndose pasar por «no hay».
 */
export type Resultado<T> = { estado: "ok"; datos: T } | { estado: "error" };

export interface PlatoCarta {
	id: number;
	nombre: string;
	descripcion?: string;
	precio: number | null;
	imagenUrl?: string;
}

export interface CategoriaCarta {
	id: number;
	nombre: string;
	platillos: PlatoCarta[];
}

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

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const cifra = (v: unknown) => {
	const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
	return Number.isFinite(n) ? n : null;
};

/** Categorías con sus platos: el mismo endpoint que usa la ruta `/api/menu/categories`. */
export async function obtenerCarta(): Promise<Resultado<CategoriaCarta[]>> {
	const r = await pedirJson("/menu/categories/with-products", "landing: carta");
	if (r.estado === "error" || !Array.isArray(r.datos)) return { estado: "error" };
	const categorias = r.datos.flatMap((c): CategoriaCarta[] => {
		if (!c || typeof c !== "object") return [];
		const categoria = c as Record<string, unknown>;
		const platillos = (Array.isArray(categoria.platillos) ? categoria.platillos : []).flatMap((p): PlatoCarta[] => {
			if (!p || typeof p !== "object") return [];
			const plato = p as Record<string, unknown>;
			const nombre = texto(plato.nombre);
			const id = cifra(plato.id);
			if (!nombre || id === null) return [];
			return [{ id, nombre, descripcion: texto(plato.descripcion) || undefined, precio: cifra(plato.precio), imagenUrl: texto(plato.imagenUrl) || undefined }];
		});
		const id = cifra(categoria.id);
		const nombre = texto(categoria.nombre);
		return id === null || !nombre ? [] : [{ id, nombre, platillos }];
	});
	return { estado: "ok", datos: categorias };
}

/** Promociones vigentes: activas y dentro de sus fechas, en el orden que fija el admin. */
export async function obtenerPromociones(ahora = new Date()): Promise<Resultado<Promotion[]>> {
	const r = await pedirJson("/promociones", "landing: promociones");
	if (r.estado === "error" || !Array.isArray(r.datos)) return { estado: "error" };
	return { estado: "ok", datos: promocionesVigentes((r.datos as PromotionRow[]).map(mapPromotionRow), ahora) };
}
