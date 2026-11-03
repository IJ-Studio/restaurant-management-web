/**
 * Importación de la carta (PLAN 5.9). La lógica de `handleImportFile` (página) y de
 * `ImportPreviewModal` sin cambios de contrato:
 * - lee CSV, JSON o XLSX y obtiene filas;
 * - compara por nombre con las filas de la BD (`GET /platillos/export.json`);
 * - sube solo las elegidas a los mismos endpoints (`/platillos/import.json`, `/platillos/import.csv`,
 *   `/import/platillos/excel`, con `mode=upsert`) y el mismo token.
 *
 * Lo nuevo es la validación **antes** de leer: el XLSX pasa por `verificarArchivo` (≤ 2 MB,
 * extensión, MIME y firma `PK 03 04`, paso 3.1) antes de llegar a la librería `xlsx` (NP-31); el
 * CSV y el JSON, por el mismo tope de tamaño. Los errores devuelven un texto para la persona, sin
 * detalles técnicos.
 */
import { TAMANO_MAXIMO, verificarArchivo } from "@/lib/validacion/archivos";
import { parseCsv } from "@/features/dashboard/admin/utils/menuUtils";

export type Fila = Record<string, unknown>;
export type TipoDiferencia = "nuevo" | "modificado" | "igual";

export interface CampoDiferencia {
	campo: string;
	rotulo: string;
	antes: string;
	despues: string;
	cambia: boolean;
}
export interface Diferencia {
	indice: number;
	tipo: TipoDiferencia;
	nombre: string;
	categoria: string;
	fila: Fila;
	campos: CampoDiferencia[];
}

export const CAMPOS_VISIBLES: Record<string, string> = {
	nombre: "Nombre",
	descripcion_corta: "Descripción corta",
	descripcion: "Descripción",
	precio: "Precio",
	precio_costo: "Costo",
	disponible: "Disponible",
	es_popular: "Popular",
	es_vegano: "Vegano",
	es_picante: "Picante",
	es_sin_gluten: "Sin gluten",
	tiempo_preparacion: "Preparación (min)",
	categoria_id: "Categoría",
};

const MB = 1024 * 1024;
type Formato = "csv" | "json" | "xlsx";
export const formatoDe = (nombre: string): Formato | null => {
	const n = nombre.toLowerCase();
	return n.endsWith(".xlsx") ? "xlsx" : n.endsWith(".json") ? "json" : n.endsWith(".csv") ? "csv" : null;
};

/** Lee el archivo pedido y devuelve sus filas, o un error para mostrar. */
export async function leerArchivo(archivo: File, pedido: Formato): Promise<{ filas: Fila[] } | { error: string }> {
	const formato = formatoDe(archivo.name);
	if (formato !== pedido) {
		return { error: pedido === "xlsx" ? "Elige una hoja de cálculo de Excel (.xlsx)." : pedido === "csv" ? "Elige un archivo CSV (.csv)." : "Elige un archivo JSON (.json)." };
	}
	if (formato === "xlsx") {
		const verificado = await verificarArchivo(archivo, "hoja");
		if (!verificado.valido) return { error: verificado.error };
	} else {
		if (archivo.size === 0) return { error: "El archivo está vacío." };
		if (archivo.size > TAMANO_MAXIMO.hoja) return { error: `El archivo supera el tamaño máximo de ${TAMANO_MAXIMO.hoja / MB} MB.` };
	}

	try {
		let filas: Fila[] = [];
		if (formato === "json") {
			const datos = JSON.parse(await archivo.text());
			if (Array.isArray(datos)) filas = datos;
			else if (Array.isArray(datos?.rows)) filas = datos.rows;
			else if (Array.isArray(datos?.categories)) {
				for (const cat of datos.categories) for (const item of cat.items ?? []) filas.push({ ...item, category: cat.name });
			}
		} else if (formato === "xlsx") {
			const XLSX = await import("xlsx");
			const libro = XLSX.read(await archivo.arrayBuffer(), { type: "array" });
			filas = XLSX.utils.sheet_to_json(libro.Sheets[libro.SheetNames[0]], { defval: "" }) as Fila[];
		} else {
			const rejilla = parseCsv(await archivo.text());
			if (rejilla.length >= 2) {
				const [cabecera, ...datos] = rejilla;
				filas = datos.map((cols) => Object.fromEntries(cabecera.map((h, i) => [h.trim(), cols[i]?.trim() ?? ""])));
			}
		}
		if (!filas.length) return { error: "El archivo no tiene platillos." };
		return { filas };
	} catch {
		return { error: "No pudimos leer el archivo. Revisa que tenga el formato de la plantilla." };
	}
}

function formatear(campo: string, valor: unknown): string {
	if (valor === null || valor === undefined || valor === "") return "—";
	if (typeof valor === "boolean") return valor ? "Sí" : "No";
	if (campo.startsWith("es_") || campo === "disponible") {
		const s = String(valor).toLowerCase().trim();
		if (["1", "true", "si", "sí", "yes", "t"].includes(s)) return "Sí";
		if (["0", "false", "no", "n", "f"].includes(s)) return "No";
	}
	if (campo === "precio" || campo === "precio_costo") {
		const n = parseFloat(String(valor));
		return Number.isNaN(n) ? String(valor) : `$ ${n.toFixed(2)}`;
	}
	return String(valor);
}

/** Compara por nombre (sin mayúsculas) con la BD; solo las columnas que trae el archivo. */
export function calcularDiferencias(entrantes: Fila[], enBd: Fila[]): Diferencia[] {
	const porNombre = new Map<string, Fila>();
	for (const f of enBd) {
		const clave = String(f.nombre ?? "").trim().toLowerCase();
		if (clave) porNombre.set(clave, f);
	}
	return entrantes.map((fila, indice) => {
		const nombre = String(fila.nombre ?? fila.name ?? "").trim();
		const actual = porNombre.get(nombre.toLowerCase()) ?? null;
		const campos = Object.keys(fila)
			.filter((k) => CAMPOS_VISIBLES[k])
			.map((k) => {
				const antes = formatear(k, actual?.[k] ?? null);
				const despues = formatear(k, fila[k]);
				return { campo: k, rotulo: CAMPOS_VISIBLES[k], antes, despues, cambia: antes !== despues };
			});
		const tipo: TipoDiferencia = !actual ? "nuevo" : campos.some((c) => c.cambia) ? "modificado" : "igual";
		return { indice, tipo, nombre: nombre || `Fila ${indice + 1}`, categoria: String(fila.categoria_id ?? fila.category ?? "").trim(), fila, campos };
	});
}

/** Sube las filas elegidas con el mismo formato que el archivo original. Lanza si el API responde con error. */
export async function subirImportacion(archivo: File, filas: Fila[], api: string): Promise<{ inserted: number; updated: number }> {
	const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
	const autorizacion: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
	const formato = formatoDe(archivo.name);
	let res: Response;
	if (formato === "json") {
		res = await fetch(`${api}/platillos/import.json?mode=upsert`, {
			cache: "no-store",
			method: "POST",
			headers: { "Content-Type": "application/json", ...autorizacion },
			body: JSON.stringify(filas),
		});
	} else if (formato === "xlsx") {
		const XLSX = await import("xlsx");
		const libro = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas), "Platillos");
		const datos = new FormData();
		datos.append("file", new Blob([XLSX.write(libro, { type: "array", bookType: "xlsx" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), archivo.name);
		res = await fetch(`${api}/import/platillos/excel?mode=upsert`, { cache: "no-store", method: "POST", headers: autorizacion, body: datos });
	} else {
		const cabecera = Object.keys(filas[0]);
		const escapar = (v: unknown) => {
			const s = String(v ?? "");
			return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
		};
		const csv = [cabecera.join(","), ...filas.map((f) => cabecera.map((h) => escapar(f[h])).join(","))].join("\n");
		const datos = new FormData();
		datos.append("file", new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), archivo.name);
		res = await fetch(`${api}/platillos/import.csv?mode=upsert`, { cache: "no-store", method: "POST", headers: autorizacion, body: datos });
	}
	if (!res.ok) throw new Error(`importación respondió ${res.status}`);
	const r = await res.json().catch(() => ({}));
	return { inserted: Number(r.inserted ?? 0), updated: Number(r.updated ?? 0) };
}
