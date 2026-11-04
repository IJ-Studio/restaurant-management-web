"use client";

import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import { normalizarCarta } from "@/lib/publico/carta";
import { registrarError } from "@/lib/registro/registrar-error";
import { csvEscape, downloadAsFile, parseBool, parseNumber } from "@/features/dashboard/admin/utils/menuUtils";
import type { MenuCategory, MenuItem } from "./tipos";

/**
 * Lógica de la carta en administración (PLAN 5.9; PLAN-AMPLIACION D-24 y D-31). La fuente es solo
 * el API, sin copia en el navegador:
 * - carga: `GET /platillos/export.json` (todos los campos) y los nombres de las categorías de
 *   `GET /menu/categories/with-products`;
 * - alta `POST /platillos`, edición `PATCH /platillos/:id`, agotar u ofrecer `PATCH /platillos/:id`
 *   con `disponible`, y eliminar `DELETE /platillos/:id`; tras cada cambio se vuelve a leer;
 * - exportar a CSV o JSON usa lo cargado; a Excel y las plantillas, el API.
 * Cada operación devuelve si salió bien; la pantalla avisa con notificaciones.
 */

export const API = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");

/** Colores de categoría: tokens de las gráficas en lugar de hex. */
const COLORES = ["var(--color-grafica-1)", "var(--color-grafica-2)", "var(--color-grafica-3)", "var(--color-grafica-4)"];

export function filasDe(datos: unknown): Record<string, unknown>[] {
	if (Array.isArray(datos)) return datos;
	const filas = (datos as { rows?: unknown } | null)?.rows;
	return Array.isArray(filas) ? filas : [];
}

function deFilasBd(filas: Record<string, unknown>[], nombres: Map<string, string>): MenuCategory[] {
	const porCategoria = new Map<string, MenuCategory>();
	for (const r of filas) {
		const id = String(r.categoria_id ?? 0);
		if (!porCategoria.has(id)) {
			porCategoria.set(id, { id, name: nombres.get(id) ?? `Categoría ${id}`, color: COLORES[Math.abs(Number(r.categoria_id ?? 0)) % COLORES.length], items: [] });
		}
		const numero = Number(r.id);
		if (!Number.isFinite(numero) || numero <= 0) continue;
		const tags: string[] = [];
		if (parseBool(r.es_popular, false)) tags.push("popular");
		if (parseBool(r.es_vegano, false)) tags.push("vegano");
		if (parseBool(r.es_picante, false)) tags.push("picante");
		if (parseBool(r.es_nuevo, false)) tags.push("nuevo");
		if (parseBool(r.es_sin_gluten, false)) tags.push("sin-gluten");
		porCategoria.get(id)!.items.push({
			id: numero,
			name: String(r.nombre ?? ""),
			description: String(r.descripcion_corta ?? r.descripcion ?? ""),
			price: parseNumber(r.precio, 0),
			available: parseBool(r.disponible, true),
			category: id,
			tags,
			prepTime: parseNumber(r.tiempo_preparacion, 10),
			calories: 0,
			imageUrl: typeof r.imagen_url === "string" ? r.imagen_url : undefined,
			imagePublicId: typeof r.imagen_public_id === "string" ? r.imagen_public_id : undefined,
		});
	}
	return [...porCategoria.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const cuerpo = (d: Partial<MenuItem>) => ({
	nombre: d.name,
	descripcion_corta: d.description,
	precio: d.price,
	disponible: d.available,
	tiempo_preparacion: d.prepTime,
	imagen_url: d.imageUrl || null,
	imagen_public_id: d.imagePublicId || null,
	tags: d.tags,
});

function descargar(blob: Blob, nombre: string) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = nombre;
	a.click();
	URL.revokeObjectURL(a.href);
}
const hoy = () => new Date().toISOString().slice(0, 10);

export function useCartaAdmin() {
	const [carga, recargar] = useCarga(async () => {
		const [filas, carta] = await Promise.all([api.get<unknown>("/platillos/export.json"), api.get<unknown>("/menu/categories/with-products").catch(() => [])]);
		const nombres = new Map(normalizarCarta(carta).map((c) => [String(c.id), c.nombre] as const));
		return deFilasBd(filasDe(filas), nombres);
	}, "carta: cargar");
	const categorias = carga.estado === "listo" ? carga.datos : [];

	async function operar(contexto: string, peticion: () => Promise<unknown>): Promise<boolean> {
		try {
			await peticion();
			await recargar({ silenciosa: true });
			return true;
		} catch (e) {
			registrarError(e, contexto);
			return false;
		}
	}

	const buscar = (categoria: string, id: MenuItem["id"]) => categorias.find((c) => c.id === categoria)?.items.find((i) => i.id === id);

	function guardar(categoria: string, datos: Partial<MenuItem>): Promise<boolean> {
		const existente = datos.id === undefined ? undefined : buscar(categoria, datos.id);
		if (existente) return operar("carta: actualizar", () => api.patch(`/platillos/${existente.id}`, cuerpo({ ...existente, ...datos })));
		return operar("carta: crear", () => api.post("/platillos", { categoria_id: Number(categoria), ...cuerpo({ available: true, prepTime: 10, tags: [], ...datos }) }));
	}

	function alternarDisponible(categoria: string, id: MenuItem["id"]): Promise<boolean> {
		const actual = buscar(categoria, id);
		if (!actual) return Promise.resolve(false);
		return operar("carta: disponibilidad", () => api.patch(`/platillos/${actual.id}`, { disponible: !actual.available }));
	}

	function eliminar(categoria: string, id: MenuItem["id"]): Promise<boolean> {
		const actual = buscar(categoria, id);
		if (!actual) return Promise.resolve(false);
		return operar("carta: eliminar", () => api.delete(`/platillos/${actual.id}`));
	}

	async function filasActualesBd(): Promise<Record<string, unknown>[]> {
		try {
			return filasDe(await api.get<unknown>("/platillos/export.json"));
		} catch {
			return [];
		}
	}

	function exportarJson() {
		descargar(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), categories: categorias }, null, 2)], { type: "application/json" }), `menu_${hoy()}.json`);
	}

	function exportarCsv() {
		const lineas = [["category", "name", "description", "price", "available", "tags", "prepTime", "calories"].join(",")];
		for (const c of categorias)
			for (const i of c.items)
				lineas.push([c.name, i.name, i.description, i.price, i.available ? 1 : 0, i.tags?.join("|") ?? "", i.prepTime ?? 0, i.calories ?? 0].map(csvEscape).join(","));
		descargar(new Blob([lineas.join("\n")], { type: "text/csv;charset=utf-8" }), `menu_${hoy()}.csv`);
	}

	/** Descargas del API: `true` si salieron bien. */
	async function descargarDelApi(tipo: "excel" | "plantilla-csv" | "plantilla-xlsx"): Promise<boolean> {
		try {
			if (tipo === "excel") await downloadAsFile(`${API}/platillos/export/dishes/excel`, `platillos_${hoy()}.xlsx`);
			else if (tipo === "plantilla-xlsx") await downloadAsFile(`${API}/platillos/export/dishes/excel`, "template_platillos.xlsx");
			else await downloadAsFile(`${API}/platillos/template.csv`, "template_platillos.csv");
			return true;
		} catch (e) {
			registrarError(e, `carta: descargar ${tipo}`);
			return false;
		}
	}

	return { carga, categorias, recargar, guardar, alternarDisponible, eliminar, filasActualesBd, exportarJson, exportarCsv, descargarDelApi };
}
