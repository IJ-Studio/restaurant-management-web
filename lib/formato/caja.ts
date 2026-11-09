/**
 * Presentación de los textos que el API guarda en MAYÚSCULAS (normalización del API):
 * «Primera mayúscula, demás minúsculas». Se conservan tal cual los correos, las URL, las siglas
 * fiscales y técnicas (RFC, IVA, CFDI…) y las claves con dígitos (folios, códigos, CP).
 */
const SIGLAS = new Set([
	"RFC", "IVA", "CFDI", "CURP", "NSS", "SAT", "ISR", "IEPS", "CP", "QR", "CLABE", "MXN", "IMSS", "PDF", "XML", "SA", "CV", "RL",
]);

function conservar(palabra: string): boolean {
	const limpia = palabra.replace(/[.,;:()¡!¿?"«»]/g, "").toUpperCase();
	return palabra.includes("@") || /^https?:\/\//i.test(palabra) || /\d/.test(palabra) || SIGLAS.has(limpia);
}

/** Hay minúsculas fuera de correos, URL y claves: el texto no viene del API normalizado. */
const yaMixto = (texto: string) =>
	texto.split(/\s+/).some((p) => !conservar(p) && p !== p.toLocaleUpperCase("es-MX"));

/** «ENCHILADAS SUIZAS CON IVA» → «Enchiladas suizas con IVA». Un texto ya mixto no se toca. */
export function primeraMayuscula(texto: string | null | undefined): string {
	if (!texto) return "";
	if (yaMixto(texto)) return texto;
	const minus = texto
		.split(/(\s+)/)
		.map((p) => (conservar(p) ? p : p.toLocaleLowerCase("es-MX")))
		.join("");
	return minus.replace(/^(\P{L}*)(\p{L})/u, (_, previo: string, letra: string) => previo + letra.toLocaleUpperCase("es-MX"));
}

/** Nombres de persona: «MARÍA DE LA PEÑA» → «María de la Peña». */
export function nombrePropio(texto: string | null | undefined): string {
	if (!texto) return "";
	if (yaMixto(texto)) return texto;
	const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y"]);
	return texto
		.toLocaleLowerCase("es-MX")
		.split(/(\s+|-)/)
		.map((p, i) => (i > 0 && PARTICULAS.has(p) ? p : p.replace(/^\p{L}/u, (l) => l.toLocaleUpperCase("es-MX"))))
		.join("");
}

const CLAVES_FRASE = new Set(["nombre", "descripcion", "descripcionCorta", "descripcion_corta", "categoria", "subcategoria"]);

/**
 * Recorre una respuesta del API y presenta con `primeraMayuscula` los textos de carta (nombre,
 * descripción, categoría). Devuelve una copia; lo demás (ids, precios, URL) queda igual.
 */
export function presentarCarta<T>(datos: T): T {
	if (Array.isArray(datos)) return datos.map((d) => presentarCarta(d)) as T;
	if (!datos || typeof datos !== "object") return datos;
	return Object.fromEntries(
		Object.entries(datos as Record<string, unknown>).map(([k, v]) => [k, CLAVES_FRASE.has(k) && typeof v === "string" ? primeraMayuscula(v) : presentarCarta(v)]),
	) as T;
}
