/**
 * Errores conocidos que el recorrido tolera de forma temporal.
 * Cada entrada DEBE llevar el paso del PLAN o la NP que la resuelve.
 * La lista solo puede decrecer.
 */
type TipoExcepcion = "consola" | "pagina" | "red" | "http" | "imagen" | "csp";

export interface Excepcion {
	/** Fragmento del mensaje o de la URL. */
	contiene: string;
	/** Tipo o tipos de hallazgo a los que aplica (un mismo fallo llega distinto según el motor). */
	tipo: TipoExcepcion | TipoExcepcion[];
	/** Motores en los que aparece cada tipo, si no son todos. */
	motores?: string;
	/** Paso del PLAN o NP que lo resuelve. */
	resuelve: string;
}

/** Indica si la excepción cubre un hallazgo de ese tipo con ese detalle. */
export function cubre(e: Excepcion, tipo: string, detalle: string): boolean {
	const tipos: string[] = Array.isArray(e.tipo) ? e.tipo : [e.tipo];
	return tipos.includes(tipo) && detalle.includes(e.contiene);
}

export const EXCEPCIONES: Excepcion[] = [
	// Fotos de muestra (aboutMock.ts) del editor de «Acerca de»: origen fuera de la CSP.
	{ tipo: "csp", contiene: "img-src https://images.unsplash.com/", resuelve: "NP-36: decisión del usuario antes del 2.5" },
	// WebKit avisa en consola de que una CSP solo de informe sin report-to no tiene efecto: es el modo
	// que pidió el usuario hasta aprobar el 2.5, que la aplica.
	{ tipo: "consola", contiene: "was delivered in report-only mode, but does not specify a 'report-to'", resuelve: "2.5 (aplicar la CSP, pendiente de la aprobación del usuario)" },
	// Sin backend en pruebas: las llamadas a la API caen en el propio servidor de Next.
	{ tipo: "http", contiene: "/api/auth/me", resuelve: "0.7 (API simulada); el 401 sin sesión es el comportamiento esperado" },
	{ tipo: "http", contiene: "localhost:3100/footer", resuelve: "0.7 (API simulada)" },
	{ tipo: "http", contiene: "localhost:3100/promotions", resuelve: "0.7 (API simulada)" },
	{ tipo: "http", contiene: "localhost:3100/categories", resuelve: "0.7 (API simulada)" },
	{ tipo: "http", contiene: "localhost:3100/settings", resuelve: "0.7 (API simulada)" },
	{ tipo: "http", contiene: "/reservations/availability", resuelve: "0.7 (API simulada)" },
	{ tipo: "http", contiene: "/api/menu/categories", resuelve: "0.7 (API simulada)" },
	{ tipo: "consola", contiene: "No se pudieron cargar las promociones", resuelve: "0.7 (API simulada)" },
	{ tipo: "consola", contiene: "Error en Fetch Menu", resuelve: "0.7 (API simulada)" },
	{ tipo: "consola", contiene: "status of 401", resuelve: "0.7 (API simulada); /api/auth/me sin sesión" },
	{ tipo: "consola", contiene: "status of 404", resuelve: "0.7 (API simulada)" },
	// Next precarga en todas las rutas el CSS de los módulos de app/error.tsx y app/not-found.tsx
	// (comprobado en producción al cerrar la fase 1; en dev, además, el CSS de desarrollo).
	{ tipo: "consola", contiene: "was preloaded using link preload", resuelve: "2.17 y 4.23 (límites de error y páginas de sistema sin módulo CSS)" },
];
