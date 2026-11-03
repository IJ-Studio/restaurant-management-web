/**
 * Fecha corta para la parte pública: «30 de noviembre». Una fecha sin hora («2026-11-30») se lee
 * como ese día, sin desplazarla por la zona horaria. `null` si no es una fecha válida.
 */
const formato = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", timeZone: "UTC" });

export function formatearDia(valor: string | null | undefined): string | null {
	if (!valor) return null;
	const iso = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T12:00:00Z` : valor;
	const fecha = new Date(iso);
	return Number.isNaN(fecha.getTime()) ? null : formato.format(fecha);
}
