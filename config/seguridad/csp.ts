import { HOSTS_CONEXION, HOSTS_IMAGEN, HOSTS_MARCO, origenApi } from "./hosts-permitidos";

/**
 * Content-Security-Policy con nonce por petición (PLAN 2.3, D-02). La construye `proxy.ts` a
 * partir de las listas de `hosts-permitidos.ts`, que es la única fuente de orígenes.
 *
 * - `script-src` con nonce y `'strict-dynamic'`: los scripts de Next llevan el nonce y lo que
 *   ellos carguen hereda la confianza. Stripe.js se carga desde su origen.
 * - Sin `'unsafe-eval'` en producción; en desarrollo se añade solo porque Next lo exige.
 * - `style-src-attr 'unsafe-inline'`: React escribe atributos `style` (posiciones de Radix,
 *   tamaños calculados); no son ejecutables.
 * - `upgrade-insecure-requests` solo cuando se aplica (2.5): en modo informe el navegador lo
 *   ignora y avisa en la consola.
 */

const STRIPE_JS = "https://js.stripe.com";
const STRIPE_API = "https://api.stripe.com";
const STRIPE_HOOKS = "https://hooks.stripe.com";

export const CABECERA_CSP_INFORME = "Content-Security-Policy-Report-Only";
export const CABECERA_CSP = "Content-Security-Policy";

/** Nonce aleatorio de 128 bits en base64 (Web Crypto: sirve en el runtime del proxy). */
export function crearNonce(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	let binario = "";
	for (const b of bytes) binario += String.fromCharCode(b);
	return btoa(binario);
}

export interface OpcionesCsp {
	nonce: string;
	desarrollo: boolean;
	/** `true` cuando la cabecera se aplica (2.5); `false` en modo informe. */
	aplicada: boolean;
}

export function construirCsp({ nonce, desarrollo, aplicada }: OpcionesCsp): string {
	const api = origenApi();
	const directivas: [string, ...string[]][] = [
		["default-src", "'self'"],
		["script-src", "'self'", `'nonce-${nonce}'`, "'strict-dynamic'", STRIPE_JS, ...(desarrollo ? ["'unsafe-eval'"] : [])],
		["style-src", "'self'", `'nonce-${nonce}'`],
		["style-src-attr", "'unsafe-inline'"],
		["img-src", "'self'", "data:", "blob:", ...new Set(HOSTS_IMAGEN.map((h) => `https://${h.host}`))],
		["font-src", "'self'"],
		["connect-src", "'self'", ...(api ? [api] : []), STRIPE_API, ...HOSTS_CONEXION],
		["frame-src", STRIPE_JS, STRIPE_HOOKS, ...HOSTS_MARCO],
		["worker-src", "'none'"],
		["manifest-src", "'self'"],
		["object-src", "'none'"],
		["base-uri", "'self'"],
		["form-action", "'self'"],
		["frame-ancestors", "'none'"],
	];
	if (aplicada) directivas.push(["upgrade-insecure-requests"]);
	return directivas.map((d) => d.join(" ")).join("; ");
}
