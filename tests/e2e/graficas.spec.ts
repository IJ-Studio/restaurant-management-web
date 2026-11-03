import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Indicadores y gráficas del catálogo (PLAN 3.8). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#graficas", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);
const zona = (page: Page, id: string) => prueba(page, id).getByRole("group");

test.describe("indicadores y gráficas del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("indicador: la comparación dice si es buena o mala con texto, no solo con color", async ({ page }) => {
		await abrir(page);
		const ventas = page.getByRole("article", { name: "Ventas de hoy" });
		await expect(ventas).toContainText("+8 %");
		await expect(ventas.locator(".solo-lectores")).toHaveText(", mejora");
		const cancelaciones = page.getByRole("article", { name: "Cancelaciones" });
		await expect(cancelaciones.locator(".solo-lectores")).toHaveText(", empeora");
		expect(await cancelaciones.locator("p.text-error").count()).toBe(1);
		const sinComparacion = page.getByRole("article", { name: "Reservas del mes" });
		await expect(sinComparacion.locator("svg")).toHaveCount(0);
		await expect(page.getByRole("article", { name: "Propinas" })).toContainText("Datos de ejemplo");
		await expect(page.getByRole("article", { name: "Pedidos en línea" })).toHaveAttribute("aria-busy", "true");
	});

	test("indicador en error: nunca un cero, y reintentar trae el dato", async ({ page }) => {
		await abrir(page);
		const indicador = prueba(page, "indicador-reintento");
		await expect(indicador).toContainText("No se pudo cargar");
		await expect(indicador).not.toContainText("$ 0");
		await indicador.getByRole("button", { name: "Reintentar" }).click();
		await expect(indicador).toContainText("$ 412", { timeout: 5_000 });
	});

	test("barras: el tooltip sale con el puntero y con las flechas, y el lector oye cada valor", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		const z = zona(page, "grafica-barras");
		await expect(z.locator("svg path")).toHaveCount(7);
		// Columnas de 24 px como mucho.
		const anchos = await z.locator("svg path").evaluateAll((p) => p.map((e) => (e as SVGPathElement).getBBox().width));
		expect(Math.max(...anchos)).toBeLessThanOrEqual(24.01);
		// Sin leyenda con una sola serie.
		await expect(prueba(page, "grafica-barras").getByRole("list", { name: "Leyenda" })).toHaveCount(0);

		await z.scrollIntoViewIfNeeded();
		const caja = (await z.boundingBox())!;
		await page.mouse.move(caja.x + caja.width * 0.75, caja.y + caja.height / 2);
		await expect(z.locator("div.pointer-events-none")).toBeVisible();
		await page.mouse.move(0, 0);
		await expect(z.locator("div.pointer-events-none")).toHaveCount(0);

		await z.focus();
		await page.keyboard.press("Home");
		await expect(z.locator("[aria-live]")).toHaveText("Lun: Ventas $ 12,400");
		await page.keyboard.press("End");
		await expect(z.locator("[aria-live]")).toHaveText("Dom: Ventas $ 19,400");
		await expect(z.locator("div.pointer-events-none")).toContainText("$ 19,400");
	});

	test("varias series: leyenda en orden y colores fijos de la paleta", async ({ page }) => {
		await abrir(page);
		const leyenda = prueba(page, "grafica-barras-series").getByRole("list", { name: "Leyenda" });
		await expect(leyenda.getByRole("listitem")).toHaveText(["En mesa", "A domicilio", "Para llevar", "Eventos"]);
		// La muestra es un SVG con `fill` (PLAN 5.20: sin estilos en línea).
		const colores = await leyenda.locator("li > svg rect").evaluateAll((s) => s.map((e) => e.getAttribute("fill")));
		expect(colores).toEqual([1, 2, 3, 4].map((n) => `var(--color-grafica-${n})`));
		await expect(prueba(page, "grafica-linea-series").getByRole("list", { name: "Leyenda" }).getByRole("listitem")).toHaveCount(3);
	});

	test("vista de tabla con los mismos datos", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		const grafica = prueba(page, "grafica-linea");
		await grafica.getByRole("button", { name: "Ver tabla" }).click();
		const tabla = grafica.getByRole("table", { name: "Ticket medio por semana" });
		await expect(tabla.locator("tbody tr")).toHaveCount(12);
		await expect(tabla.locator("tbody tr").last()).toContainText("17 nov");
		await expect(tabla.locator("tbody tr").last()).toContainText("$ 409");
		await grafica.getByRole("button", { name: "Ver gráfica" }).click();
		await expect(grafica.getByRole("group")).toBeVisible();
	});

	test("donut: de la 5.ª parte en adelante, «Otros»; porcentajes en la leyenda", async ({ page }) => {
		await abrir(page);
		const donut = prueba(page, "grafica-donut");
		const leyenda = donut.getByRole("list", { name: "Leyenda" }).getByRole("listitem");
		await expect(leyenda).toHaveCount(5);
		await expect(leyenda.last()).toContainText("Otros");
		await expect(leyenda.last()).toContainText("$ 13,500");
		await expect(leyenda.first()).toContainText("50 %");
		await zona(page, "grafica-donut").focus();
		await page.keyboard.press("ArrowRight");
		await expect(zona(page, "grafica-donut").locator("[aria-live]")).toHaveText("Platos fuertes: $ 184,200, 50 %");
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones y sin desborde a 360 px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 360, height: 800 });
			await abrir(page, { tema, tamanoTexto: "muy-grande" });
			const r = await new AxeBuilder({ page })
				.include("section#graficas")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
			expect(desborda).toBe(false);
			await page
				.locator("section#graficas")
				.screenshot({ path: `test-results/catalogo/${info.project.name}/graficas-${tema}-360-muy-grande.png`, animations: "disabled" });
		});
	}
});
