import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { simularApi } from "./utilidades/api-simulada";

// Páginas informativas que se conservan (PLAN 4.21, D-08): /about y /promociones, con migas.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
async function abrir(page: Page, ruta: string, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await simularApi(page);
}

test("/about: migas, textos sin opiniones inventadas, datos de la configuración y mapa enlazado", async ({ page }) => {
	await abrir(page, "/about");
	await page.goto("/about", { waitUntil: "load" });
	await expect(page.getByRole("navigation", { name: "Migas de pan" }).locator('[aria-current="page"]')).toHaveText("Nosotros");
	await expect(page.locator("main")).not.toContainText(/Familia Martínez|Google|Facebook ★|Misión|Visión|líder/);
	await expect(page.locator("main dl")).toContainText("Pzla. Hidalgo 5-1");
	await expect(page.getByRole("link", { name: /Cómo llegar/ })).toHaveAttribute("target", "_blank");
});

test("/promociones: las vigentes del API con su tarjeta; si falla, «Reintentar»", async ({ page }) => {
	await abrir(page, "/promociones");
	let intentos = 0;
	await page.route("**/promociones", async (r) => {
		if (r.request().resourceType() !== "fetch") return r.fallback();
		intentos++;
		if (intentos === 1) return r.fulfill({ status: 500, body: "" });
		await r.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify([
				{ id: 1, titulo: "Menú de mediodía", descripcion: "Entrante, principal y postre.", badge: "De la casa", activa: true, orden: 1, precio_original: 480, precio_descuento: 390 },
				{ id: 2, titulo: "Caducada", activa: true, orden: 2, fecha_fin: "2020-01-01" },
				{ id: 3, titulo: "Inactiva", activa: false, orden: 3 },
			]),
		});
	});
	await page.goto("/promociones", { waitUntil: "load" });
	await expect(page.locator("main").getByRole("alert")).toContainText("No pudimos traer las promociones");
	await page.getByRole("button", { name: "Reintentar" }).click();
	const lista = page.getByRole("list", { name: "Promociones vigentes" });
	await expect(lista.getByRole("heading", { level: 2 })).toHaveText(["Menú de mediodía"]);
	await expect(page.getByRole("navigation", { name: "Migas de pan" }).locator('[aria-current="page"]')).toHaveText("Promociones");
});

for (const ruta of ["/about", "/promociones"]) {
	for (const tema of ["oscuro", "claro"] as const) {
		test(`${ruta}: axe y sin desbordar a 360 px (texto al 125 %), tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 360, height: 900 });
			await abrir(page, ruta, { tema, tamanoTexto: "muy-grande" });
			await page.goto(ruta, { waitUntil: "load" });
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/informativas/${info.project.name}${ruta.replace("/", "-")}-${tema}.png`, fullPage: true, animations: "disabled" });
		});
	}
}
