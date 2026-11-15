import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Acabado del panel de opciones de accesibilidad (PLAN 3.12), en la cabecera y el pie del catálogo.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#sitio", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const panel = (page: Page) => page.getByRole("dialog", { name: "Opciones de accesibilidad" });
const disparadorCabecera = (page: Page) => page.locator('[data-prueba="cabecera"] [data-prueba="accesibilidad"]');
const disparadorPie = (page: Page) => page.locator('[data-prueba="pie"] [data-prueba="accesibilidad-con-texto"]');

test.describe("panel de opciones de accesibilidad", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("con el teclado: abre, el foco entra, las flechas aplican la opción, Esc cierra y el foco vuelve", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		const boton = disparadorCabecera(page);
		await boton.focus();
		await page.keyboard.press("Enter");
		await expect(panel(page)).toBeVisible();
		// Aparece como los menús flotantes y por encima de la cabecera fija.
		const estilo = await panel(page).evaluate((e) => [getComputedStyle(e).animationName, getComputedStyle(e).zIndex]);
		expect(estilo).toEqual(["dialogo-entra", "110"]);
		// Claro es el tema por defecto: el foco cae en la opción marcada.
		const claro = panel(page).getByRole("radio", { name: "Claro" });
		await expect(claro).toBeFocused();
		await expect(panel(page).getByRole("group", { name: "Tema" })).toBeVisible();
		// Flecha: pasa a «Oscuro» y se aplica al momento, y se guarda.
		await page.keyboard.press("ArrowUp");
		await expect(panel(page).getByRole("radio", { name: "Oscuro" })).toBeChecked();
		await expect(page.locator("html")).toHaveAttribute("data-tema", "oscuro");
		expect(await page.evaluate((c) => JSON.parse(localStorage.getItem(c) ?? "{}").tema, CLAVE)).toBe("oscuro");
		await page.keyboard.press("Escape");
		await expect(panel(page)).toBeHidden();
		await expect(boton).toBeFocused();
	});

	test("desde el pie: botón con texto visible y el mismo panel", async ({ page }) => {
		await abrir(page);
		const boton = disparadorPie(page);
		await expect(boton).toHaveText("Opciones de accesibilidad");
		await expect(boton).toHaveAccessibleName("Opciones de accesibilidad");
		await boton.click();
		await expect(panel(page)).toBeVisible();
		// Con el teclado: abajo a la izquierda, el indicador de next dev tapa parte del panel al ratón.
		await panel(page).getByRole("radio", { name: "Muy grande" }).focus();
		await page.keyboard.press("Space");
		await expect(page.locator("html")).toHaveAttribute("data-tamano-texto", "muy-grande");
		await panel(page).getByRole("button", { name: "Cerrar opciones de accesibilidad" }).focus();
		await page.keyboard.press("Enter");
		await expect(panel(page)).toBeHidden();
	});

	test("con movimiento reducido, la aparición dura 0,01 ms", async ({ page }) => {
		await abrir(page, { movimiento: "reducido" });
		await disparadorPie(page).click();
		const duracion = await panel(page).evaluate((e) => getComputedStyle(e).animationDuration);
		expect(["1e-05s", "0.00001s"]).toContain(duracion);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones con el panel abierto a 360 px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 360, height: 800 });
			await abrir(page, { tema, tamanoTexto: "muy-grande" });
			await disparadorPie(page).click();
			await expect(panel(page)).toBeVisible();
			await page.waitForTimeout(300);
			const r = await new AxeBuilder({ page })
				.include('[role="dialog"]')
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			// Cabe en la pantalla.
			const caja = (await panel(page).boundingBox())!;
			expect(caja.x).toBeGreaterThanOrEqual(0);
			expect(caja.x + caja.width).toBeLessThanOrEqual(360);
			await page.screenshot({ path: `test-results/catalogo/${info.project.name}/panel-accesibilidad-${tema}-360.png` });
		});
	}
});
