import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Migas de pan y «Volver» del catálogo (PLAN 3.10). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function preparar(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
}

async function abrir(page: Page, opciones: { referer?: string } = {}) {
	await page.goto("/catalogo#navegacion", { waitUntil: "load", ...opciones });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const seccion = (page: Page) => page.locator("section#navegacion");

test.describe("migas de pan y Volver del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("migas: nav con nombre, lista ordenada y la actual sin enlace con aria-current", async ({ page }) => {
		await preparar(page);
		await abrir(page);
		const migas = seccion(page).getByRole("navigation", { name: "Migas de pan" });
		await expect(migas).toHaveCount(4);
		const pago = migas.nth(2);
		await expect(pago.getByRole("link")).toHaveText(["Inicio", "Pedir", "Tu pedido"]);
		await expect(pago.getByRole("link").nth(1)).toHaveAttribute("href", "/#pedir");
		const actual = pago.locator('[aria-current="page"]');
		await expect(actual).toHaveText("Pago");
		expect(await actual.evaluate((e) => e.tagName)).toBe("SPAN");
		await expect(migas.nth(1).locator('[aria-current="page"]')).toHaveText("Entradas");
		// Separadores ocultos a lectores y enlaces con 44 px de alto.
		await expect(pago.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
		expect((await pago.getByRole("link").first().boundingBox())!.height).toBeGreaterThanOrEqual(44);
	});

	test("Volver sin historial del sitio: es un enlace al origen y lleva a él", async ({ page }) => {
		await preparar(page);
		await abrir(page);
		const volver = page.locator('[data-prueba="boton-volver"]');
		await expect(volver).toHaveText("Volver al principio del catálogo");
		await expect(volver).toHaveAttribute("href", "/catalogo#boton");
		await volver.click();
		await expect(page).toHaveURL(/\/catalogo#boton$/);
	});

	test("Volver llegando desde el sitio: usa el historial", async ({ page }) => {
		await preparar(page);
		await page.goto("/offline", { waitUntil: "load" });
		const anterior = page.url();
		await abrir(page, { referer: anterior });
		expect(await page.evaluate(() => document.referrer)).toBe(anterior);
		await page.locator('[data-prueba="boton-volver"]').click();
		await expect(page).toHaveURL(anterior);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones y sin desborde a 360 px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 360, height: 800 });
			await preparar(page, { tema, tamanoTexto: "muy-grande" });
			await abrir(page);
			const r = await new AxeBuilder({ page })
				.include("section#navegacion")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
			expect(desborda).toBe(false);
			await seccion(page).screenshot({ path: `test-results/catalogo/${info.project.name}/navegacion-${tema}-360-muy-grande.png`, animations: "disabled" });
		});
	}
});
