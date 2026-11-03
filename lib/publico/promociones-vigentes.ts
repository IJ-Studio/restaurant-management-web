import type { Promotion } from "@/features/shared/data/promotions";

/** Activas, con título y dentro de sus fechas, en el orden que fija el admin (PLAN 4.2 y 4.6). */
export function promocionesVigentes(promos: Promotion[], ahora = new Date()): Promotion[] {
	const hoy = ahora.getTime();
	const fecha = (s?: string) => (s ? Date.parse(s) : NaN);
	// Una fecha de fin sin hora («2026-11-30») vale todo ese día.
	const fin = (s?: string) => fecha(s) + (s && s.length <= 10 ? 86_400_000 - 1 : 0);
	return promos
		.filter((p) => p.active !== false && p.title)
		.filter((p) => !(fecha(p.startDate) > hoy) && !(fin(p.endDate) < hoy))
		.sort((a, b) => a.order - b.order);
}
