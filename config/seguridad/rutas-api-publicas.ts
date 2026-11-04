/**
 * Rutas de `/api` que no exigen token (PLAN 2.10, D-15). Todo lo demás de `/api/*` responde 401
 * sin un token válido. La lista es explícita y cada entrada lleva su motivo; se verificó con el
 * inventario del 2026-10-31 (qué rutas llama el front).
 *
 * `/api/public/combos`, `/api/public/cupones` y `/api/mesas` no se llaman desde el front: exigen token.
 */
export interface RutaApiPublica {
	ruta: string;
	metodos: readonly string[];
	motivo: string;
}

export const RUTAS_API_PUBLICAS: readonly RutaApiPublica[] = [
	{ ruta: "/api/auth/login", metodos: ["POST"], motivo: "Iniciar sesión (aún no hay token)" },
	{ ruta: "/api/auth/register", metodos: ["POST"], motivo: "Registro de clientes" },
	{ ruta: "/api/auth/logout", metodos: ["POST"], motivo: "Cerrar sesión debe funcionar aunque el token haya caducado" },
	{ ruta: "/api/auth/me", metodos: ["GET"], motivo: "La parte pública pregunta si hay sesión; ya responde 401 sin token" },
	{
		ruta: "/api/cron/backups",
		metodos: ["GET"],
		motivo: "Excepción temporal: el cron de Vercel no envía token de usuario; pendiente de endurecer en el API (NP-10)",
	},
];

/** Ruta exacta y método incluido en la lista: el resto de métodos de una ruta pública exige token. */
export function esApiPublica(ruta: string, metodo: string): boolean {
	const limpia = ruta.replace(/\/+$/, "");
	// HEAD y OPTIONS siguen al GET de la misma ruta (cabeceras y comprobaciones previas del navegador).
	const equivalente = metodo === "HEAD" || metodo === "OPTIONS" ? "GET" : metodo;
	return RUTAS_API_PUBLICAS.some((r) => r.ruta === limpia && r.metodos.includes(equivalente));
}

/** `/api/admin/**` y `/api/backups/**` exigen además el rol de administrador (403 si no). */
export function esApiSoloAdmin(ruta: string): boolean {
	return ruta.startsWith("/api/admin/") || ruta === "/api/backups" || ruta.startsWith("/api/backups/");
}
