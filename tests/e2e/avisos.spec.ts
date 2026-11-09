import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Avisos y notificaciones del catálogo (PLAN 3.4). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#avisos", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);
const pila = (page: Page) => page.getByRole("region", { name: "Notificaciones", exact: true });
const visibles = (page: Page) => page.locator('[data-prueba="notificacion"]:not([data-saliendo])');

test.describe("avisos y notificaciones del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("el aviso lleva su rol por gravedad y se puede descartar", async ({ page }) => {
		await abrir(page);
		const aviso = prueba(page, "aviso-descartable");
		await expect(aviso).toHaveAttribute("role", "status");
		await expect(aviso.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
		await aviso.getByRole("button", { name: "Descartar aviso" }).click();
		await expect(aviso).toHaveCount(0);
		await prueba(page, "restaurar-aviso").click();
		await expect(prueba(page, "aviso-descartable")).toBeVisible();
	});

	test("la notificación se anuncia, se va sola a los 6 s y se detiene con el puntero encima", async ({ page }) => {
		await abrir(page);
		// Sin notificaciones no hay región vacía.
		await expect(pila(page)).toHaveCount(0);
		await prueba(page, "notificar-exito").click();
		await expect(visibles(page)).toHaveCount(1);
		await expect(prueba(page, "anuncio-notificacion")).toHaveText("Reserva guardada. Sábado 14, 21:00 h, mesa para 4.");
		await expect(prueba(page, "anuncio-notificacion")).toHaveAttribute("aria-live", "polite");
		// El anuncio va aparte: la notificación visible no es una región viva.
		await expect(pila(page).locator("[aria-live]")).toHaveCount(0);

		// Con el puntero encima no se va.
		await visibles(page).first().hover();
		await page.waitForTimeout(7_000);
		await expect(visibles(page)).toHaveCount(1);
		// Al salir, sigue la cuenta y desaparece.
		await page.mouse.move(0, 0);
		await expect(prueba(page, "notificacion")).toHaveCount(0, { timeout: 8_000 });
		await expect(pila(page)).toHaveCount(0);
	});

	test("los errores y las que llevan acción se quedan; la acción se atiende y cierra", async ({ page }) => {
		await abrir(page);
		await prueba(page, "notificar-error").click();
		await prueba(page, "notificar-accion").click();
		await page.mouse.move(0, 0);
		await page.waitForTimeout(7_000);
		await expect(visibles(page)).toHaveCount(2);

		const conAccion = visibles(page).filter({ hasText: "Platillo archivado" });
		await conAccion.getByRole("button", { name: "Deshacer" }).click();
		await expect(prueba(page, "deshechos")).toHaveText("Acciones deshechas: 1");
		await expect(prueba(page, "notificacion").filter({ hasText: "Platillo archivado" })).toHaveCount(0);

		const error = visibles(page).filter({ hasText: "No se pudo enviar el pedido" });
		await error.getByRole("button", { name: "Cerrar notificación" }).click();
		await expect(prueba(page, "notificacion")).toHaveCount(0);
	});

	test("como mucho tres a la vez: sale la más antigua", async ({ page }) => {
		await abrir(page);
		await prueba(page, "notificar-varias").click();
		await expect(visibles(page)).toHaveCount(3);
		await expect(visibles(page).first()).toContainText("Pedido 2 recibido");
		await expect(prueba(page, "notificacion").filter({ hasText: "Pedido 1 recibido" })).toHaveCount(0);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones con notificaciones abiertas, tema ${tema}, y sin desborde a 360 px`, async ({ page }) => {
			await page.setViewportSize({ width: 360, height: 800 });
			await abrir(page, { tema, tamanoTexto: "muy-grande" });
			await prueba(page, "notificar-error").click();
			await prueba(page, "notificar-accion").click();
			await expect(visibles(page)).toHaveCount(2);
			const r = await new AxeBuilder({ page })
				.include("section#avisos")
				.include(".pila-notificaciones")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			// La pila respeta los márgenes de la página y no se sale por los lados.
			const caja = (await pila(page).boundingBox())!;
			expect(caja.x).toBeGreaterThanOrEqual(0);
			expect(caja.x + caja.width).toBeLessThanOrEqual(360);
			const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
			expect(desborda).toBe(false);
			await page.screenshot({ path: `test-results/catalogo/notificaciones-${tema}-360.png`, animations: "disabled" });
		});
	}
});
