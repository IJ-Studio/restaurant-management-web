import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Secciones de la landing con datos de ejemplo en el catálogo (PLAN 4.4 en adelante). Solo en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#landing", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}
const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);

test.describe("secciones de la landing en el catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("Nosotros: galería con el nombre de cada plato, fotos de la casa y respaldo sin foto", async ({ page }) => {
		await abrir(page);
		const galeria = prueba(page, "galeria-nosotros");
		await expect(galeria.getByRole("listitem")).toHaveCount(3);
		await expect(galeria.locator("figcaption")).toHaveText(["Parrillada de la casa", "Empanadas al horno", "Plato sin foto"]);
		const fotos = galeria.locator("img");
		await expect(fotos).toHaveCount(2);
		for (const src of await fotos.evaluateAll((e) => e.map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src)))
			expect(src).toMatch(/^https:\/\/res\.cloudinary\.com\/dcb1tspbj\//);
		await expect(galeria.locator("[data-respaldo-imagen]")).toHaveCount(1);
		await expect(prueba(page, "demo-nosotros").getByRole("link", { name: "Conoce la casa" })).toHaveAttribute("href", "/about");
	});

	test("el molino de Nosotros gira dos veces y se queda quieto con movimiento reducido", async ({ page }) => {
		await abrir(page);
		const nombre = () => prueba(page, "demo-nosotros").locator(".molino-animado__aspas").evaluate((e) => getComputedStyle(e).animationName);
		expect(await nombre()).toBe("molino-aspas");
		expect(await prueba(page, "demo-nosotros").locator(".molino-animado__aspas").evaluate((e) => getComputedStyle(e).animationIterationCount)).toBe("2");
		await page.emulateMedia({ reducedMotion: "reduce" });
		expect(await nombre()).toBe("none");
	});

	test("Menú: platos con foto o respaldo y contraetiqueta, sin enlaces en las tarjetas y un solo botón", async ({ page }) => {
		await abrir(page);
		const demo = prueba(page, "demo-menu");
		const platos = demo.locator('[data-prueba="platos-menu"] > li');
		await expect(platos).toHaveCount(3);
		await expect(platos.first().getByRole("heading", { level: 3 })).toHaveText("Parrillada de la casa");
		await expect(platos.first().locator("dd").last()).toHaveText("$ 420");
		await expect(platos.nth(2).locator("[data-respaldo-imagen]")).toHaveCount(1);
		await expect(platos.locator("a")).toHaveCount(0);
		await expect(demo.getByRole("link")).toHaveCount(1);
		await expect(demo.getByRole("link", { name: "Ver la carta completa" })).toHaveAttribute("href", "/menu");
		await expect(prueba(page, "demo-menu-vacio")).toContainText("Todavía no hay platos publicados en la carta.");
	});

	for (const tema of ["oscuro", "claro"] as const) {
		for (const ancho of [360, 1440]) {
			test(`axe y sin desbordar a ${ancho} px, tema ${tema}`, async ({ page }, info) => {
				await page.setViewportSize({ width: ancho, height: 900 });
				await abrir(page, { tema, ...(ancho === 360 ? { tamanoTexto: "muy-grande" } : {}) });
				const r = await new AxeBuilder({ page }).include("section#landing").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
				expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
				expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
				await page.locator("section#landing").screenshot({ path: `test-results/catalogo/${info.project.name}/landing-${tema}-${ancho}.png`, animations: "disabled" });
			});
		}
	}
});
