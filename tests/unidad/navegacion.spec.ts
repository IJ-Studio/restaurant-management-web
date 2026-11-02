import { test, expect } from "@playwright/test";
import { RUTAS_PUBLICAS, SECCIONES_LANDING, rutaPublica } from "../../config/navegacion-publica";

// Mapa de rutas públicas → sección de origen (PLAN 3.10). Sin navegador.
test.describe("navegación pública", () => {
	test("reconoce rutas fijas y con parámetros, con barra final, consulta o ancla", () => {
		expect(rutaPublica("/menu")?.origen).toEqual(SECCIONES_LANDING.carta);
		expect(rutaPublica("/menu/")?.titulo).toBe("La carta");
		expect(rutaPublica("/menu/categoria/entradas")?.origen.href).toBe("/menu");
		expect(rutaPublica("/menu/producto/42?variante=2")?.padres.map((m) => m.nombre)).toEqual(["La carta"]);
		expect(rutaPublica("/reservations#mapa")?.origen.href).toBe("/#reservar");
		expect(rutaPublica("/menu/pedido/checkout")?.padres.map((m) => m.href)).toEqual(["/#pedir", "/menu/pedido"]);
	});

	test("no confunde rutas parecidas ni inventa las que no están", () => {
		expect(rutaPublica("/")).toBeNull();
		expect(rutaPublica("/menu/categoria")).toBeNull();
		expect(rutaPublica("/menu/categoria/entradas/extra")).toBeNull();
		expect(rutaPublica("/dashboard/admin")).toBeNull();
		expect(rutaPublica("/menus")).toBeNull();
	});

	test("cada ruta tiene título, un origen interno y texto de Volver", () => {
		for (const r of RUTAS_PUBLICAS) {
			expect(r.titulo, r.patron).not.toBe("");
			expect(r.origen.href.startsWith("/"), r.patron).toBe(true);
			expect(r.origen.volver ?? "", r.patron).toMatch(/^Volver /);
			for (const m of r.padres) expect(m.href.startsWith("/"), `${r.patron} → ${m.href}`).toBe(true);
		}
		// Sin patrones repetidos.
		expect(new Set(RUTAS_PUBLICAS.map((r) => r.patron)).size).toBe(RUTAS_PUBLICAS.length);
	});
});
