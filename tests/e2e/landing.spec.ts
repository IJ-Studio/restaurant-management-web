import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { simularApi } from "./utilidades/api-simulada";

// Landing de una sola página (PLAN 4.2 a 4.9, D-19 y D-20). Contra el build de producción: los
// datos se piden en el servidor y en las pruebas no hay backend, así que la carta y las
// promociones muestran su error cálido. Su versión con datos la cubren las pruebas unitarias.
test.skip(process.env.E2E_MODO === "dev", "la landing se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const SECCIONES = ["inicio", "nosotros", "menu", "promociones", "reservas", "pedir", "visitanos"];

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await simularApi(page);
	await page.goto("/", { waitUntil: "load" });
}

test("las siete secciones llegan en el HTML del servidor, en orden y con un solo h1", async ({ request }) => {
	const html = await (await request.get("/")).text();
	const posiciones = SECCIONES.map((id) => html.indexOf(`id="${id}"`));
	expect(posiciones.every((p) => p > 0)).toBe(true);
	expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
	expect(html.match(/<h1\b/g)?.length).toBe(1);
});

test("la navegación es de anclas y marca la sección visible", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await abrir(page);
	const nav = page.locator("header.cabecera-sitio").getByRole("navigation", { name: "Principal" });
	const hrefs = await nav.getByRole("link").evaluateAll((e) => e.map((a) => a.getAttribute("href")));
	expect(hrefs).toEqual(SECCIONES.map((id) => `/#${id}`));
	await nav.getByRole("link", { name: "Promociones" }).click();
	await expect(page).toHaveURL(/#promociones$/);
	await expect(nav.getByRole("link", { name: "Promociones" })).toHaveAttribute("aria-current", "true");
	// La cabecera fija no tapa el título de la sección.
	const [arriba, cabecera] = await page.evaluate(() => [
		document.getElementById("promociones-titulo")!.getBoundingClientRect().top,
		document.querySelector("header.cabecera-sitio")!.getBoundingClientRect().bottom,
	]);
	expect(arriba).toBeGreaterThanOrEqual(cabecera);
});

test("sin datos del API: errores cálidos con «Reintentar» y ningún texto técnico", async ({ page }) => {
	await abrir(page);
	for (const id of ["menu", "promociones"]) {
		const seccion = page.locator(`section#${id}`);
		await expect(seccion.getByRole("alert")).toBeVisible();
		await expect(seccion.getByRole("button", { name: "Reintentar" })).toBeVisible();
	}
	await expect(page.locator("main")).not.toContainText(/Error al|Intenta más tarde|Cargando|Redirigiendo|undefined|NaN|fetch|Network/);
	await expect(page.locator("section#menu").getByRole("link", { name: "Ver la carta completa" })).toHaveAttribute("href", "/menu");
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[390, "normal"],
		[768, "normal"],
		[1024, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}, texto ${tamanoTexto}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, { tema, tamanoTexto });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/landing/${info.project.name}/landing-${tema}-${ancho}-${tamanoTexto}.png`, fullPage: true, animations: "disabled" });
		});
	}
}
