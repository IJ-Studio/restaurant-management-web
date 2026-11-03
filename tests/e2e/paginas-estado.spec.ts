import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Páginas de estado e ilustraciones de marca en el catálogo (PLAN 4.0.2, D-21). Solo en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";
const ILUSTRACIONES = ["plato-cloche", "llave-bodega", "puerta-candado", "olla-humeante", "copa-volcada", "mesa-reloj", "molino-quieto"];

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#paginas-estado", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const seccion = (page: Page) => page.locator("section#paginas-estado");

test.describe("páginas de estado del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("cada ilustración existe, va oculta a los lectores y pesa menos de 4 KB", async ({ page }) => {
		await abrir(page);
		for (const nombre of ILUSTRACIONES) {
			const svg = seccion(page).locator(`svg[data-ilustracion="${nombre}"]`).first();
			await expect(svg, nombre).toHaveAttribute("aria-hidden", "true");
			const bytes = await svg.evaluate((e) => new TextEncoder().encode(e.outerHTML).length);
			expect(bytes, nombre).toBeLessThan(4096);
			// Sin colores literales: solo currentColor y clases de tokens.
			const html = await svg.evaluate((e) => e.outerHTML);
			expect(html, nombre).not.toMatch(/#[0-9a-f]{3,6}\b|rgb\(/i);
		}
	});

	test("estructura: código con su nombre para lectores, título, texto y salida", async ({ page }) => {
		await abrir(page);
		const p404 = page.locator('[data-prueba="pagina-noEncontrado"] [data-pagina-estado]');
		await expect(p404.getByText("404")).toBeVisible();
		await expect(p404.locator("p").first()).toHaveText("Código 404");
		await expect(p404.getByRole("heading", { level: 2 })).toHaveText("Aquí no hay nada servido");
		await expect(p404.getByRole("link", { name: "Volver al inicio" })).toBeVisible();
		// Mantenimiento y sin conexión no llevan número.
		await expect(page.locator('[data-prueba="pagina-mantenimiento"] [data-pagina-estado]').getByText("Código")).toHaveCount(0);
		// Nada técnico en ninguna.
		await expect(seccion(page).locator("[data-pagina-estado]").filter({ hasText: /Error al|stack|undefined|fetch|Network|Redirigiendo|Cargando/ })).toHaveCount(0);
	});

	test("las ilustraciones hacen su gesto", async ({ page }) => {
		await abrir(page);
		const nombre = (sel: string) => seccion(page).locator(sel).first().evaluate((e) => getComputedStyle(e).animationName);
		expect(await nombre(".ilus-flota")).toBe("ilus-flota");
		expect(await nombre(".ilus-mece")).toBe("ilus-mece");
	});

	test("con movimiento reducido en el panel, ninguna ilustración se mueve", async ({ page }) => {
		await abrir(page, { movimiento: "reducido" });
		const nombre = (sel: string) => seccion(page).locator(sel).first().evaluate((e) => getComputedStyle(e).animationName);
		for (const sel of [".ilus-flota", ".ilus-mece", ".ilus-respira", ".ilus-arena", ".ilus-viento", ".ilus-cae"]) expect(await nombre(sel), sel).toBe("none");
	});

	for (const tema of ["oscuro", "claro"] as const) {
		for (const ancho of [360, 1440]) {
			test(`axe sin violaciones y sin desbordar a ${ancho} px, tema ${tema}`, async ({ page }, info) => {
				await page.setViewportSize({ width: ancho, height: 900 });
				await abrir(page, { tema, ...(ancho === 360 ? { tamanoTexto: "muy-grande" } : {}) });
				const r = await new AxeBuilder({ page })
					.include("section#paginas-estado")
					.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
					.analyze();
				expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
				expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
				// Las cifras de contraste de cada muestra: ninguna por debajo del mínimo.
				await expect(seccion(page).locator("[data-lectura-contraste] .text-error")).toHaveCount(0);
				await seccion(page).screenshot({ path: `test-results/catalogo/${info.project.name}/paginas-estado-${tema}-${ancho}.png`, animations: "disabled" });
			});
		}
	}
});
