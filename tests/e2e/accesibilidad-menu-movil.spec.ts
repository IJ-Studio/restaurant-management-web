import { test, expect } from "@playwright/test";

// Fase 4.9: a 360 px las opciones de accesibilidad viven en el menú lateral; su panel debe quedar
// por encima del menú y del velo, y responder al toque.
test("a 360 px, el panel de accesibilidad abre por encima del menú lateral y se puede usar", async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	await page.goto("/", { waitUntil: "load" });
	await page.locator('[data-prueba="abrir-menu-movil"]').click();
	const menu = page.locator('[role="dialog"]:has([data-prueba="accesibilidad-con-texto"])');
	await menu.locator('[data-prueba="accesibilidad-con-texto"]').click();
	const panel = page.getByRole("dialog", { name: "Opciones de accesibilidad" });
	await expect(panel).toBeVisible();
	const caja = (await panel.boundingBox())!;
	// El punto central es del panel flotante (no del menú de debajo) y recibe toques.
	const dentro = await page.evaluate(
		([x, y]) => !!document.elementFromPoint(x, y)?.closest("[data-radix-popper-content-wrapper]"),
		[caja.x + caja.width / 2, caja.y + caja.height / 2],
	);
	expect(dentro).toBe(true);
	await panel.getByRole("button", { name: "Cerrar opciones de accesibilidad" }).click();
	await expect(panel).toBeHidden();
	// El menú lateral sigue abierto tras cerrar el panel.
	await expect(menu).toBeVisible();
});
