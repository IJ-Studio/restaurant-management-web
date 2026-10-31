/**
 * Errores conocidos que el recorrido tolera de forma temporal.
 * Cada entrada DEBE llevar el paso del PLAN o la NP que la resuelve.
 * La lista solo puede decrecer.
 */
export interface Excepcion {
	/** Fragmento del mensaje o de la URL. */
	contiene: string;
	/** Tipo de hallazgo al que aplica. */
	tipo: "consola" | "pagina" | "red" | "http" | "imagen";
	/** Paso del PLAN o NP que lo resuelve. */
	resuelve: string;
}

export const EXCEPCIONES: Excepcion[] = [
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
	{ tipo: "consola", contiene: "status of 404", resuelve: "0.7 (API simulada) y 1.8 (logo)" },
	// Defectos diagnosticados en ESTADO.md.
	{ tipo: "http", contiene: "/logo.svg", resuelve: "1.8 (logo local)" },
	{ tipo: "red", contiene: "/logo.svg", resuelve: "1.8 (logo local)" },
	{ tipo: "http", contiene: "food-3955317_1", resuelve: "ESTADO §8.1 / NP-33 (fondo de login sin el sufijo _zstvf7)" },
	{ tipo: "consola", contiene: "Image with src", resuelve: "ESTADO §8.1 / NP-33 (fondo de login)" },
	{ tipo: "red", contiene: "lh3.googleusercontent.com", resuelve: "Fase 4 (imagen externa en /about, pasa a Cloudinary/local)" },
	{ tipo: "imagen", contiene: "lh3.googleusercontent.com", resuelve: "Fase 4 (imagen externa en /about, pasa a Cloudinary/local)" },
	// Solo ocurre con next dev (precarga de CSS de desarrollo).
	{ tipo: "consola", contiene: "was preloaded using link preload", resuelve: "solo next dev; se vigila en el build de producción al cerrar la fase" },
];
