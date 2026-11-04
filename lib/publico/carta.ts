/**
 * Carta del API normalizada (`GET /menu/categories/with-products`): categorías con sus platos,
 * descartando lo que no tenga id o nombre. Módulo puro, sin `server-only`: lo usan la landing (en el
 * servidor) y los paneles de sala y carta (en el navegador).
 */
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

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const cifra = (v: unknown) => {
	const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
	return Number.isFinite(n) ? n : null;
};

export function normalizarCarta(datos: unknown): CategoriaCarta[] {
	if (!Array.isArray(datos)) return [];
	return datos.flatMap((c): CategoriaCarta[] => {
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
}
