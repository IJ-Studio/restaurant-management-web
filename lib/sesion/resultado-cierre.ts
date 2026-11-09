/**
 * Qué responde `POST /api/auth/logout` según lo que contestó `POST /auth/sign-out` del API.
 * 401/403 significan que el token ya caducó o se revocó: la sesión ya estaba cerrada y cerrar una
 * sesión caducada no es un error (antes el navegador mostraba «POST /api/auth/logout 401»).
 * Las cookies se caducan siempre, pase lo que pase (NP-41).
 */
export function resultadoCierre(estadoApi: number | null): { status: number; cuerpo: Record<string, unknown> } {
	if (estadoApi === null || (estadoApi >= 200 && estadoApi < 300) || estadoApi === 401 || estadoApi === 403)
		return { status: 200, cuerpo: { success: true } };
	return { status: 502, cuerpo: { error: "No pudimos cerrar la sesión en el servidor; en este equipo ya está cerrada." } };
}
