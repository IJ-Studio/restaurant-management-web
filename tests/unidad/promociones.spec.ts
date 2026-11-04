import { test, expect } from "@playwright/test";
import { promocionesVigentes } from "../../lib/publico/promociones-vigentes";
import type { Promotion } from "../../features/shared/data/promotions";

// Promociones vigentes de la landing (PLAN 4.2 y 4.6). Sin navegador.
const base: Promotion = { id: 1, title: "Menú de mediodía", description: "", color: "", active: true, order: 0 };
const hoy = new Date("2026-11-03T18:00:00Z");

test("solo las activas, con título y dentro de sus fechas, en su orden", () => {
	const lista: Promotion[] = [
		{ ...base, id: 1, order: 2 },
		{ ...base, id: 2, order: 1, startDate: "2026-11-01", endDate: "2026-11-03" },
		{ ...base, id: 3, active: false },
		{ ...base, id: 4, title: "" },
		{ ...base, id: 5, startDate: "2026-11-10" },
		{ ...base, id: 6, endDate: "2026-11-02" },
	];
	expect(promocionesVigentes(lista, hoy).map((p) => p.id)).toEqual([2, 1]);
});

test.describe("promociones: fila del API", () => {
	test("el título en mayúsculas del API se presenta con primera mayúscula y los importes como número", async () => {
		const { mapPromotionRow } = await import("../../features/shared/data/promotions");
		const p = mapPromotionRow({
			id: 3, titulo: "2X1 EN TACOS", descripcion: null, badge: "NUEVO", emoji: null, color: null,
			precio_original: 120, precio_descuento: "80.00", imagen_url: null, imagen_public_id: null,
			activa: true, orden: 0, fecha_inicio: "2026-11-01", fecha_fin: null,
		});
		expect(p).toMatchObject({ title: "2X1 en tacos", description: "", badge: "Nuevo", originalPrice: 120, discountedPrice: 80 });
	});
});
