import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Navegación por rol, barra superior y encabezado de página de los paneles (PLAN 3.13).
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#paneles", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);

test.describe("navegación de los paneles", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("desde 1024 px: barra lateral con grupos, la activa marcada y su grupo abierto", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		const nav = page.getByRole("navigation", { name: "Navegación del panel de administración" });
		await expect(nav).toBeVisible();
		const activa = nav.locator('[aria-current="page"]');
		await expect(activa).toHaveCount(1);
		await expect(activa).toHaveText("Proveedores");
		await expect(activa).toHaveAttribute("href", "/dashboard/admin/inventory/suppliers");
		// Relleno café y filete de acento: cambia el relleno, no solo el tinte.
		const estilo = await activa.evaluate((e) => {
			const s = getComputedStyle(e);
			const muestra = document.createElement("span");
			muestra.style.color = "var(--color-acento)";
			muestra.style.backgroundColor = "var(--color-superficie-cafe)";
			document.body.append(muestra);
			const r = [s.backgroundColor === getComputedStyle(muestra).backgroundColor, s.borderInlineStartColor === getComputedStyle(muestra).color];
			muestra.remove();
			return r;
		});
		expect(estilo).toEqual([true, true]);
		// El grupo que contiene la activa empieza abierto; los demás, cerrados.
		await expect(nav.getByRole("button", { name: "Inventario" })).toHaveAttribute("aria-expanded", "true");
		const finanzas = nav.getByRole("button", { name: "Finanzas & Caja" });
		await expect(finanzas).toHaveAttribute("aria-expanded", "false");
		await finanzas.click();
		await expect(finanzas).toHaveAttribute("aria-expanded", "true");
		await expect(nav.getByRole("link", { name: "Facturas" })).toBeVisible();
		// Grupos con rótulo: cada lista tiene nombre.
		await expect(nav.getByRole("list", { name: "Menú Principal" })).toBeVisible();
		// Sin drawer a este ancho.
		await expect(prueba(page, "abrir-navegacion-panel")).toBeHidden();
	});

	test("la consulta decide la entrada activa (caja con ?filter=pending)", async ({ page }) => {
		await abrir(page);
		const nav = page.getByRole("navigation", { name: "Navegación del panel de caja" });
		await expect(nav.locator('[aria-current="page"]')).toHaveText("Tickets Pendientes");
		await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
	});

	test("por debajo de 1024 px: la navegación va en un panel lateral que se cierra al elegir", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await abrir(page);
		await expect(page.getByRole("navigation", { name: "Navegación del panel de administración" })).toBeHidden();
		const abrirNav = prueba(page, "abrir-navegacion-panel");
		await abrirNav.click();
		const drawer = page.getByRole("dialog", { name: "Administración" });
		await expect(drawer.locator('[aria-current="page"]')).toHaveText("Proveedores");
		await page.keyboard.press("Escape");
		await expect(drawer).toBeHidden();
		await expect(abrirNav).toBeFocused();
		// Al elegir un enlace, el panel se cierra (el destino no existe en el catálogo: se intercepta).
		await page.route("**/dashboard/admin/reports**", (r) => r.abort());
		await abrirNav.click();
		await drawer.getByRole("link", { name: "Reportes" }).click();
		await expect(drawer).toBeHidden();
	});

	test("cuenta y encabezado de página: menú con nombre y rol; h1 y acciones con la primaria al final", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		await prueba(page, "abrir-cuenta-panel").click();
		const menu = page.getByRole("dialog", { name: "Tu cuenta" });
		await expect(menu).toContainText("Laura Méndez");
		await expect(menu).toContainText("Administradora");
		await expect(menu.getByRole("button", { name: "Cerrar sesión" })).toHaveCount(0);
		await page.keyboard.press("Escape");
		const encabezado = prueba(page, "panel-admin").getByRole("heading", { level: 1 });
		await expect(encabezado).toHaveText("Proveedores");
		const botones = prueba(page, "panel-admin").locator("header").last().getByRole("button");
		await expect(botones.last()).toHaveText(/Añadir proveedor/i);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		for (const ancho of [360, 1280]) {
			test(`axe sin violaciones y sin desborde a ${ancho} px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
				await page.setViewportSize({ width: ancho, height: 900 });
				await abrir(page, { tema, tamanoTexto: "muy-grande" });
				const r = await new AxeBuilder({ page })
					.include("section#paneles")
					.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
					.analyze();
				expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
				const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
				expect(desborda).toBe(false);
				// El marco recorta: la barra superior misma debe caber.
				const barra = prueba(page, "barra-superior-panel");
				expect(await barra.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
				await page
					.locator("section#paneles")
					.screenshot({ path: `test-results/catalogo/${info.project.name}/paneles-${tema}-${ancho}-muy-grande.png`, animations: "disabled" });
			});
		}
	}
});
