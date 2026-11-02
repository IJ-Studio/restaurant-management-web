/**
 * Registro de errores del cliente sin datos sensibles (PLAN 2.8).
 *
 * - Solo se registra el mensaje y el `digest` (el identificador que Next asocia al error del
 *   servidor). Nunca el objeto completo, la pila, cuerpos de respuesta, tokens ni datos personales.
 * - `notFound()` y `redirect()` de Next lanzan errores de control que no son fallos: se ignoran.
 * - Es el único punto donde el cliente escribe errores. En producción `next.config.ts` quita los
 *   demás `console.*` salvo `console.error`.
 */

/** Indica si el error es el que lanza `notFound()`, `redirect()` u otro control de flujo de Next. */
export function esControlDeNext(error: unknown): boolean {
	const digest = typeof error === "object" && error !== null && "digest" in error ? String((error as { digest: unknown }).digest) : "";
	return digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK") || digest === "NEXT_NOT_FOUND";
}

export function registrarError(error: unknown, contexto = "error"): void {
	if (esControlDeNext(error)) return;
	const mensaje = error instanceof Error ? error.message : "Error desconocido";
	const digest = typeof error === "object" && error !== null && "digest" in error ? String((error as { digest: unknown }).digest) : undefined;
	console.error(`[${contexto}]`, mensaje.slice(0, 200), ...(digest ? [`digest=${digest}`] : []));
}
