"use client";

import { useCallback, useEffect, useState } from "react";
import { MenuService } from "@/features/shared/services/dataService";
import type { MenuCategory, MenuItem } from "@/features/shared/data/restaurantData";
import { authHeaders, csvEscape, downloadAsFile, parseBool, parseNumber } from "@/features/dashboard/admin/utils/menuUtils";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Lógica de la carta en administración (PLAN 5.9), sacada de la página sin cambiar su contrato:
 * - el estado vive en `MenuService` (almacenamiento local) y, con API externa, se carga de
 *   `GET /platillos/export.json`;
 * - el alta (`POST /platillos`) es optimista y reconcilia el id real; la edición hace `PATCH
 *   /platillos/:id` solo si el id viene de la BD; activar y eliminar siguen siendo locales, como
 *   antes (NP-46);
 * - exportar a CSV o JSON es local; a Excel y las plantillas, del API.
 *
 * Lo que cambia: sin `alert()` ni `confirm()`. Las operaciones devuelven si salieron bien y la
 * pantalla avisa con notificaciones; la confirmación de eliminar la pide la pantalla.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
export const API = (BASE && BASE.length > 0 ? BASE : "/api").replace(/\/$/, "");
export const API_EXTERNA = API.startsWith("http");

/** Colores de categoría: tokens de las gráficas en lugar de hex. */
const COLORES = ["var(--color-grafica-1)", "var(--color-grafica-2)", "var(--color-grafica-3)", "var(--color-grafica-4)"];

export function filasDe(datos: unknown): Record<string, unknown>[] {
	if (Array.isArray(datos)) return datos;
	const filas = (datos as { rows?: unknown } | null)?.rows;
	return Array.isArray(filas) ? filas : [];
}

function deFilasBd(filas: Record<string, unknown>[]): MenuCategory[] {
	const porCategoria = new Map<string, MenuCategory>();
	filas.forEach((r, i) => {
		const id = String(r.categoria_id ?? 0);
		if (!porCategoria.has(id)) {
			porCategoria.set(id, { id, name: `Categoría ${r.categoria_id ?? 0}`, icon: "", color: COLORES[Math.abs(Number(r.categoria_id ?? 0)) % COLORES.length], items: [] });
		}
		const tags: string[] = [];
		if (parseBool(r.es_popular, false)) tags.push("popular");
		if (parseBool(r.es_vegano, false)) tags.push("vegano");
		if (parseBool(r.es_picante, false)) tags.push("picante");
		if (parseBool(r.es_nuevo, false)) tags.push("nuevo");
		if (parseBool(r.es_sin_gluten, false)) tags.push("sin-gluten");
		porCategoria.get(id)!.items.push({
			id: Number(r.id) || Date.now() + i,
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
	});
	return [...porCategoria.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const cuerpo = (d: Partial<MenuItem>) => ({
	nombre: d.name,
	descripcion_corta: d.description,
	precio: d.price,
	disponible: d.available,
	tiempo_preparacion: d.prepTime,
	imagen_url: d.imageUrl ?? null,
	imagen_public_id: d.imagePublicId ?? null,
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
	const [categorias, setCategorias] = useState<MenuCategory[]>([]);
	const [cargada, setCargada] = useState(false);

	const cargarDeBd = useCallback(async () => {
		try {
			const res = await fetch(`${API}/platillos/export.json`, { cache: "no-store", headers: authHeaders() });
			if (!res.ok) return;
			const filas = filasDe(await res.json().catch(() => null));
			if (filas.length) setCategorias(deFilasBd(filas));
		} catch (e) {
			registrarError(e, "carta: cargar de la BD");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial del almacenamiento local
		setCategorias(MenuService.getMenu());
		setCargada(true);
		if (API_EXTERNA) void cargarDeBd();
	}, [cargarDeBd]);

	useEffect(() => {
		if (categorias.length > 0) MenuService.saveMenu(categorias);
	}, [categorias]);

	function guardar(categoria: string, datos: Partial<MenuItem>) {
		const existente = categorias.find((c) => c.id === categoria)?.items.find((i) => i.id === datos.id);
		if (existente) {
			if (typeof existente.id === "number" && existente.id > 0 && API_EXTERNA) {
				void fetch(`${API}/platillos/${existente.id}`, {
					cache: "no-store",
					method: "PATCH",
					headers: { "Content-Type": "application/json", ...authHeaders() },
					body: JSON.stringify(cuerpo({ ...existente, ...datos })),
				}).catch((e) => registrarError(e, "carta: actualizar"));
			}
			setCategorias((cs) => cs.map((c) => (c.id !== categoria ? c : { ...c, items: c.items.map((i) => (i.id === datos.id ? ({ ...i, ...datos } as MenuItem) : i)) })));
			return;
		}
		const temporal = Date.now();
		const nuevo: MenuItem = {
			id: temporal,
			name: datos.name ?? "",
			description: datos.description ?? "",
			price: datos.price ?? 0,
			available: datos.available ?? true,
			category: categoria,
			tags: datos.tags ?? [],
			prepTime: datos.prepTime ?? 10,
			calories: datos.calories ?? 0,
			imageUrl: datos.imageUrl ?? undefined,
			imagePublicId: datos.imagePublicId ?? undefined,
		};
		setCategorias((cs) => cs.map((c) => (c.id !== categoria ? c : { ...c, items: [...c.items, nuevo] })));
		if (!API_EXTERNA) return;
		void (async () => {
			try {
				const res = await fetch(`${API}/platillos`, {
					cache: "no-store",
					method: "POST",
					headers: { "Content-Type": "application/json", ...authHeaders() },
					body: JSON.stringify({ categoria_id: Number(categoria), ...cuerpo(nuevo) }),
				});
				if (!res.ok) return;
				const real = Number((await res.json().catch(() => null))?.id);
				if (!Number.isFinite(real) || real <= 0) return;
				setCategorias((cs) => cs.map((c) => (c.id !== categoria ? c : { ...c, items: c.items.map((i) => (i.id === temporal ? { ...i, id: real } : i)) })));
			} catch (e) {
				registrarError(e, "carta: crear");
			}
		})();
	}

	function alternarDisponible(categoria: string, id: MenuItem["id"]) {
		setCategorias((cs) => cs.map((c) => (c.id !== categoria ? c : { ...c, items: c.items.map((i) => (i.id !== id ? i : { ...i, available: !i.available })) })));
	}

	/** `false` si el id no es válido (antes, `alert("ID de platillo inválido")`). */
	function eliminar(categoria: string, id: MenuItem["id"]): boolean {
		const numero = Number(id);
		if (!Number.isFinite(numero) || numero <= 0) return false;
		setCategorias((cs) => cs.map((c) => (c.id !== categoria ? c : { ...c, items: c.items.filter((i) => i.id !== id) })));
		return true;
	}

	async function filasActualesBd(): Promise<Record<string, unknown>[]> {
		if (!API_EXTERNA) return [];
		try {
			const res = await fetch(`${API}/platillos/export.json`, { cache: "no-store", headers: authHeaders() });
			return res.ok ? filasDe(await res.json().catch(() => null)) : [];
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
				lineas.push(
					[c.name, i.name, i.description, i.price, i.available ? 1 : 0, i.tags?.join("|") ?? "", i.prepTime ?? 0, i.calories ?? 0].map(csvEscape).join(","),
				);
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

	return { categorias, cargada, guardar, alternarDisponible, eliminar, filasActualesBd, recargarDeBd: cargarDeBd, exportarJson, exportarCsv, descargarDelApi };
}
