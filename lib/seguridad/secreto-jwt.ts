/**
 * Clave para verificar los JWT de sesión (PLAN 2.9): sin valores de respaldo. Si falta
 * `JWT_SECRET`, devuelve `null` y quien la usa trata la petición como no autenticada («fallar
 * cerrado»). El error de configuración se registra una sola vez y nunca incluye el valor.
 * La rotación del secreto es NP-02.
 */
let avisado = false;

export function claveJwt(): Uint8Array | null {
	const secreto = process.env.JWT_SECRET;
	if (!secreto) {
		if (!avisado) {
			avisado = true;
			console.error("[configuración] Falta JWT_SECRET: las rutas protegidas se tratan como no autenticadas.");
		}
		return null;
	}
	return new TextEncoder().encode(secreto);
}
