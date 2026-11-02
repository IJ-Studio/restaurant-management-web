import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Tabla responsiva, paginación y pestañas del catálogo (PLAN 3.6). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, ruta = "/catalogo#tabla", preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto(ruta, { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const seccion = (page: Page) => page.locator("section#tabla");
const reservas = (page: Page) => seccion(page).getByRole("table", { name: "Reservas de hoy" });

test.describe("tabla, paginación y pestañas del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("desde 768 px es una tabla semántica; por debajo, tarjetas con contraetiqueta", async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 900 });
		await abrir(page);
		const tabla = reservas(page);
		await expect(tabla).toBeVisible();
		await expect(tabla.locator("caption")).toHaveText("Reservas de hoy");
		await expect(tabla.locator("thead th[scope=col]")).toHaveCount(8);
		await expect(tabla.locator("tbody th[scope=row]").first()).toHaveText("Ana López Hernández");
		// Cifras al final y tabulares.
		const personas = tabla.locator("tbody tr").first().locator("td").nth(1);
		expect(await personas.evaluate((e) => [getComputedStyle(e).textAlign, getComputedStyle(e).fontVariantNumeric])).toEqual([
			"end",
			"tabular-nums",
		]);
		// La fila seleccionada se anuncia y cambia el relleno.
		await expect(tabla.locator("tbody tr[data-seleccionada]")).toContainText("(seleccionada)");
		await expect(seccion(page).getByRole("list", { name: "Reservas de hoy" })).toBeHidden();

		await page.setViewportSize({ width: 390, height: 900 });
		await expect(tabla).toBeHidden();
		const tarjetas = seccion(page).getByRole("list", { name: "Reservas de hoy" });
		await expect(tarjetas).toBeVisible();
		await expect(tarjetas.getByRole("listitem")).toHaveCount(5);
		const primera = tarjetas.getByRole("listitem").first();
		await expect(primera.locator("dt").first()).toHaveText("Hora");
		await expect(primera.locator("dd").first()).toHaveText("13:30 h");
		await expect(primera.getByRole("button", { name: "Ver la reserva de Ana López Hernández" })).toBeVisible();
		const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
		expect(desborda).toBe(false);
	});

	test("si la tabla no cabe, su región se desplaza y se enfoca; si cabe, no entra en el tabulador", async ({ page }) => {
		await page.setViewportSize({ width: 800, height: 900 });
		await abrir(page);
		const region = seccion(page).getByRole("region", { name: "Reservas de hoy" });
		await expect(region).toHaveAttribute("tabindex", "0");
		await region.focus();
		await page.keyboard.press("ArrowRight");
		await expect.poll(() => region.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);

		await page.setViewportSize({ width: 1600, height: 900 });
		await expect(region).not.toHaveAttribute("tabindex", "0");
	});

	test("cargando: aria-busy y esqueleto oculto a lectores", async ({ page }) => {
		await abrir(page);
		const cargando = seccion(page).locator('[aria-busy="true"]').filter({ hasText: "Reservas de mañana" });
		await expect(cargando).toHaveCount(1);
		await expect(cargando.locator("tbody tr").first()).toHaveAttribute("aria-hidden", "true");
		await expect(seccion(page).getByText("No hay reservas canceladas hoy.")).toBeVisible();
	});

	test("la paginación lleva la página a la URL y marca la actual", async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 900 });
		await abrir(page);
		const nav = page.locator('[data-prueba="paginacion-url"]').getByRole("navigation", { name: "Paginación", exact: true });
		await expect(nav.locator('[aria-current="page"]')).toHaveText("1");
		await nav.getByRole("link", { name: "Página siguiente, 2" }).click();
		await expect(page).toHaveURL(/[?&]pagina=2/);
		await expect(nav.locator('[aria-current="page"]')).toHaveText("2");
		await nav.getByRole("link", { name: "Página 12" }).click();
		await expect(page).toHaveURL(/[?&]pagina=12/);
		// En la última no hay «Siguiente» para los lectores, pero conserva su hueco.
		await expect(nav.getByRole("link", { name: /Página siguiente/ })).toHaveCount(0);
		await expect(page.locator('[data-prueba="pagina-actual"]')).toHaveText("Mostrando la página 12");
		// Volver a la 1 limpia el parámetro.
		await nav.getByRole("link", { name: "Página 1", exact: true }).click();
		await expect(page).not.toHaveURL(/pagina=/);

		await page.setViewportSize({ width: 390, height: 900 });
		await expect(nav.getByText("Página 1 de 12")).toBeVisible();
		await expect(nav.locator("ol")).toBeHidden();
	});

	test("pestañas: flechas, Inicio y Fin; un solo tabulador; la URL guarda la pestaña", async ({ page }) => {
		await abrir(page);
		const lista = page.getByRole("tablist", { name: "Pedidos por estado" });
		const pestanas = lista.getByRole("tab");
		await expect(pestanas).toHaveCount(4);
		await expect(lista.locator('[tabindex="0"]')).toHaveCount(1);
		await pestanas.first().focus();
		await page.keyboard.press("ArrowRight");
		await expect(pestanas.nth(1)).toBeFocused();
		await expect(pestanas.nth(1)).toHaveAttribute("aria-selected", "true");
		await expect(page.getByRole("tabpanel", { name: "En cocina" })).toHaveText("Dos pedidos en preparación.");
		await expect(page).toHaveURL(/[?&]pestana=cocina/);
		await page.keyboard.press("End");
		await expect(pestanas.nth(3)).toBeFocused();
		await page.keyboard.press("ArrowRight");
		await expect(pestanas.first()).toBeFocused();
		await expect(page).not.toHaveURL(/pestana=/);
		await page.keyboard.press("ArrowLeft");
		await expect(pestanas.nth(3)).toHaveAttribute("aria-selected", "true");
		// El contador se lee entero.
		await expect(pestanas.first()).toHaveAccessibleName("Pendientes 3 pedidos");

		// Al recargar, la URL manda.
		await page.reload({ waitUntil: "load" });
		await expect(page.getByRole("tablist", { name: "Pedidos por estado" }).getByRole("tab", { name: "Entregados" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones a 390 px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 390, height: 900 });
			await abrir(page, "/catalogo#tabla", { tema, tamanoTexto: "muy-grande" });
			const r = await new AxeBuilder({ page })
				.include("section#tabla")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
			expect(desborda).toBe(false);
			await seccion(page).screenshot({ path: `test-results/catalogo/${info.project.name}/tabla-${tema}-390-muy-grande.png`, animations: "disabled" });
		});
	}
});
