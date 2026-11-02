/**
 * Validación de las variables públicas en el build (PLAN 2.16). La llama `next.config.ts` en la
 * fase de build: si algo falla, el build se detiene con la lista de problemas.
 *
 * Los mensajes nombran las variables, **nunca sus valores**.
 *
 * - Exige `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y
 *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
 * - `NEXT_PUBLIC_API_URL` debe ser una URL `https:` en producción. Solo un host local
 *   (`localhost`, `127.0.0.1`, `::1`) puede ir por `http:`: es el build de las pruebas, que sirve
 *   la API simulada en el mismo equipo.
 * - La clave de Stripe debe ser la publicable (`pk_`), nunca la secreta.
 * - Ninguna `NEXT_PUBLIC_*` puede llamarse como un secreto: todas acaban en el navegador.
 */
export const VARIABLES_PUBLICAS_OBLIGATORIAS = [
	"NEXT_PUBLIC_API_URL",
	"NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
	"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;

const PALABRAS_DE_SECRETO = ["SECRET", "PRIVATE", "SERVICE_ROLE", "PASSWORD"];
const HOSTS_LOCALES = new Set(["localhost", "127.0.0.1", "[::1]"]);

type Entorno = Record<string, string | undefined>;

/** Lista de problemas (vacía si todo está bien). */
export function problemasEntornoPublico(entorno: Entorno, produccion: boolean): string[] {
	const problemas: string[] = [];

	for (const nombre of VARIABLES_PUBLICAS_OBLIGATORIAS) {
		if (!entorno[nombre]?.trim()) problemas.push(`${nombre} no está definida.`);
	}

	const api = entorno.NEXT_PUBLIC_API_URL?.trim();
	if (api) {
		let url: URL | null = null;
		try {
			url = new URL(api);
		} catch {
			problemas.push("NEXT_PUBLIC_API_URL no es una URL válida.");
		}
		if (url) {
			const local = HOSTS_LOCALES.has(url.hostname);
			if (url.protocol !== "https:" && url.protocol !== "http:") {
				problemas.push("NEXT_PUBLIC_API_URL debe usar https:.");
			} else if (produccion && url.protocol === "http:" && !local) {
				problemas.push("NEXT_PUBLIC_API_URL debe usar https: en producción (solo un host local puede ir por http:).");
			}
			if (url.username || url.password) problemas.push("NEXT_PUBLIC_API_URL no puede llevar usuario ni contraseña.");
		}
	}

	const stripe = entorno.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
	if (stripe && !stripe.startsWith("pk_")) {
		problemas.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY debe ser la clave publicable (empieza por pk_), nunca la secreta.");
	}

	for (const nombre of Object.keys(entorno).sort()) {
		if (!nombre.startsWith("NEXT_PUBLIC_")) continue;
		const palabra = PALABRAS_DE_SECRETO.find((p) => nombre.toUpperCase().includes(p));
		if (palabra) problemas.push(`${nombre}: el nombre sugiere un secreto (${palabra}) y las NEXT_PUBLIC_* llegan al navegador.`);
	}

	return problemas;
}

/** Lanza un error con todos los problemas; no imprime ningún valor. */
export function validarEntornoPublico(entorno: Entorno = process.env, produccion = process.env.NODE_ENV === "production"): void {
	const problemas = problemasEntornoPublico(entorno, produccion);
	if (problemas.length === 0) return;
	throw new Error(
		["Variables públicas no válidas (PLAN 2.16). Revisa el entorno del build:", ...problemas.map((p) => `  - ${p}`)].join("\n"),
	);
}
