/**
 * Importación de la carta desde Excel o CSV (Fase 4.2) con `POST /platillos/importar` del API, que
 * es quien valida y compara con la carta:
 * - `confirmar=false` devuelve la vista previa sin guardar nada;
 * - `modo=reemplazar` deshabilita (nunca borra) los platillos que no vengan en el archivo;
 * - `forzar=true` es «Importar de todas formas»: guarda las filas válidas y omite las que tienen error.
 * La plantilla es `GET /platillos/plantilla.csv` (Excel la abre tal cual).
 */
import { TAMANO_MAXIMO, verificarArchivo } from "@/lib/validacion/archivos";

export type ModoImportacion = "agregar" | "reemplazar";

export interface FilaPlan {
	fila: number;
	nombre: string;
	categoria: string;
	precio: number;
	existenteId: number | null;
}

export interface Problema {
	fila: number | null;
	mensaje: string;
}

export interface PlanImportacion {
	nuevos: FilaPlan[];
	actualizados: FilaPlan[];
	deshabilitar: { id: number; nombre: string }[];
	categoriasNuevas: string[];
	avisos: Problema[];
	errores: Problema[];
	aplicado: boolean;
}

const MB = 1024 * 1024;
export const ACEPTA_CARTA = ".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Revisa el archivo antes de subirlo; devuelve el error para mostrar o `null`. */
export async function validarArchivo(archivo: File): Promise<string | null> {
	const nombre = archivo.name.toLowerCase();
	if (nombre.endsWith(".xlsx")) {
		const verificado = await verificarArchivo(archivo, "hoja");
		return verificado.valido ? null : verificado.error;
	}
	if (!nombre.endsWith(".csv")) return "Elige una hoja de cálculo de Excel (.xlsx) o un archivo CSV (.csv).";
	if (archivo.size === 0) return "El archivo está vacío.";
	if (archivo.size > TAMANO_MAXIMO.hoja) return `El archivo supera el tamaño máximo de ${TAMANO_MAXIMO.hoja / MB} MB.`;
	return null;
}

/** Envía el archivo al API: vista previa (`confirmar: false`) o importación. */
export async function enviarImportacion(
	api: string,
	archivo: File,
	modo: ModoImportacion,
	{ confirmar, forzar = false }: { confirmar: boolean; forzar?: boolean },
): Promise<{ plan: PlanImportacion } | { error: string }> {
	const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
	const datos = new FormData();
	datos.append("file", archivo);
	const consulta = new URLSearchParams({ modo, confirmar: String(confirmar), forzar: String(forzar) });
	try {
		// Sin `Content-Type`: el navegador pone el `multipart/form-data` con su separador.
		const res = await fetch(`${api}/platillos/importar?${consulta}`, {
			cache: "no-store",
			method: "POST",
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: datos,
		});
		const cuerpo: unknown = await res.json().catch(() => null);
		if (!res.ok) {
			const mensaje = (cuerpo as { message?: unknown } | null)?.message;
			return { error: typeof mensaje === "string" ? mensaje : "No se pudo importar la carta. Vuelve a intentarlo en un momento." };
		}
		return { plan: cuerpo as PlanImportacion };
	} catch {
		return { error: "No hay conexión con el servidor. Vuelve a intentarlo en un momento." };
	}
}
