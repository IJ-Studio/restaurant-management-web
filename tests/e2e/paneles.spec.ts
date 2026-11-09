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

	test("desde 1024 px: barra lateral con grupos, la activa marcada y los hijos a la vista", async ({ page }) => {
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
		// D-29: nada se pliega; los hijos de «Inventario» se ven siempre y no hay botones en la navegación.
		await expect(nav.getByRole("button")).toHaveCount(0);
		await expect(nav.getByRole("list", { name: "Inventario" }).getByRole("link")).toHaveCount(2);
		await expect(nav.getByRole("link", { name: "Facturas" })).toBeVisible();
		// Grupos con rótulo: cada lista tiene nombre.
		await expect(nav.getByRole("list", { name: "Servicio" })).toBeVisible();
		await expect(prueba(page, "abrir-navegacion-panel")).toHaveCount(0);
	});

	test("por debajo de 1024 px: la navegación entera a la vista, sin cajón", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await abrir(page);
		const panel = prueba(page, "panel-admin");
		const nav = panel.getByRole("navigation", { name: "Navegación del panel de administración" });
		await expect(nav).toBeVisible();
		await expect(nav.getByRole("link")).toHaveCount(8);
		await expect(nav.locator('[aria-current="page"]')).toHaveText("Inventario: proveedores");
		await expect(prueba(page, "abrir-navegacion-panel")).toHaveCount(0);
	});

	test("cuenta y encabezado de página: menú con nombre y rol; h1 y acciones con la primaria al final", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		await prueba(page, "abrir-cuenta-panel").click();
		const menu = page.getByRole("dialog", { name: "Tu cuenta" });
		await expect(menu).toContainText("Laura Méndez");
		await expect(menu).toContainText("Administradora");
		await expect(menu.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
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
