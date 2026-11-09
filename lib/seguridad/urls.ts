import { HOSTS_ENLACE } from "@/config/seguridad/hosts-permitidos";

/**
 * URLs seguras (PLAN 2.13): redirecciones internas, enlaces externos y parámetros.
 */

const BASE_INTERNA = "http://interno.invalid";

/** Hay algún carácter de control (U+0000 a U+001F o U+007F): no se acepta en una ruta. */
const tieneControl = (texto: string) => [...texto].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127);

/**
 * Ruta interna segura: empieza por `/`, no por `//` ni por `/\` (que el navegador trata como
 * otro origen), sin esquema ni caracteres de control, y al resolverla se queda en el mismo origen.
 */
export function esRutaInternaSegura(ruta: string | null | undefined): ruta is string {
	if (!ruta || !ruta.startsWith("/") || ruta.startsWith("//") || ruta.startsWith("/\\") || tieneControl(ruta)) return false;
	try {
		return new URL(ruta, BASE_INTERNA).origin === BASE_INTERNA;
	} catch {
		return false;
	}
}

/**
 * Enlace externo permitido: solo `https:` y un host de `HOSTS_ENLACE`, sin usuario ni contraseña.
 * Devuelve la URL normalizada, o `null` si no se debe pintar como enlace (p. ej., `javascript:`).
 */
export function urlExternaPermitida(url: string | null | undefined, hosts: readonly string[] = HOSTS_ENLACE): string | null {
	if (!url || tieneControl(url)) return null;
	try {
		const u = new URL(url);
		if (u.protocol !== "https:" || u.username || u.password || !hosts.includes(u.hostname)) return null;
		return u.href;
	} catch {
		return null;
	}
}

/**
 * Ruta interna con parámetros codificados con `URLSearchParams`; se suman a los que ya tuviera y
 * los vacíos no se escriben.
 */
export function rutaConParametros(ruta: string, parametros: Record<string, string | number | null | undefined>): string {
	const u = new URL(ruta, BASE_INTERNA);
	for (const [clave, valor] of Object.entries(parametros)) if (valor !== null && valor !== undefined && valor !== "") u.searchParams.set(clave, String(valor));
	return u.pathname + u.search + u.hash;
}

/** Cantidad de un pedido desde la URL: entero entre 1 y 20 (1 si no es válida). */
export function cantidadSegura(valor: string | null | undefined): number {
	const n = Math.trunc(Number(valor));
	return Number.isFinite(n) && n >= 1 ? Math.min(n, 20) : 1;
}

/** Acciones que el login puede reanudar en la página de origen. */
const ACCIONES_PERMITIDAS = ["pedir_mesa"] as const;

/**
 * Destino tras iniciar sesión (login): el personal va a su panel; el comensal vuelve a la ruta de
 * origen si es interna y segura, con la acción pendiente y la cantidad validadas. Si traía un
 * `callbackUrl` que no es seguro (otro origen, `//`, esquema), va al inicio.
 */
export function destinoTrasLogin({
	rol,
	callbackUrl,
	accion,
	cantidad,
}: {
	rol: string;
	callbackUrl: string | null;
	accion: string | null;
	cantidad: string | null;
}): string {
	if (rol !== "cliente") return `/dashboard/${rol}`;
	if (!callbackUrl) return "/menu";
	if (!esRutaInternaSegura(callbackUrl)) return "/";
	const accionValida = ACCIONES_PERMITIDAS.find((a) => a === accion);
	return rutaConParametros(callbackUrl, { autoExecute: accionValida, qty: accionValida ? cantidadSegura(cantidad) : undefined });
}
