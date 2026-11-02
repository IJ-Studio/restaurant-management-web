import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Piezas de marca del catálogo (PLAN 3.9): etiqueta de sección, contraetiqueta, sello y filete doble.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#marca", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const seccion = (page: Page) => page.locator("section#marca");

test.describe("piezas de marca del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("etiqueta de sección: lote oculto a lectores, rótulo, filete doble y título en orden", async ({ page }) => {
		await abrir(page);
		const etiqueta = seccion(page).locator(".etiqueta-seccion").first();
		const hijos = await etiqueta.evaluate((e) =>
			[...e.children].map((h) => `${h.tagName.toLowerCase()}${h.getAttribute("aria-hidden") ? "·oculto" : ""}:${h.className.includes("filete-doble") ? "filete" : (h.textContent ?? "").slice(0, 12)}`),
		);
		expect(hijos).toEqual(["span·oculto:Nº 03", "p:La carta", "span·oculto:filete", "h3:Cocina de la", "p:Recetas de l"]);
		// Lote en Fraunces itálica y en acento; el título, en Fraunces sin mayúsculas.
		const lote = etiqueta.locator("span").first();
		expect(await lote.evaluate((e) => getComputedStyle(e).fontStyle)).toBe("italic");
		const titulo = etiqueta.locator("h3");
		expect(await titulo.evaluate((e) => getComputedStyle(e).textTransform)).toBe("none");
	});

	test("filete doble: dos líneas de 1 px separadas 3 px y 3rem de ancho", async ({ page }) => {
		await abrir(page);
		const medida = await page.locator('[data-prueba="filete-doble"]').evaluate((e) => {
			const s = getComputedStyle(e);
			return { ancho: e.getBoundingClientRect().width, alto: e.getBoundingClientRect().height, arriba: s.borderTopWidth, abajo: s.borderBottomWidth };
		});
		expect(medida).toEqual({ ancho: 48, alto: 5, arriba: "1px", abajo: "1px" });
	});

	test("contraetiqueta: los filetes de rótulo y valor quedan a la misma altura aunque el valor ocupe dos líneas", async ({ page }) => {
		for (const ancho of [390, 1024]) {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page);
			const desalineados = await seccion(page)
				.locator("dl.contraetiqueta")
				.evaluateAll((listas) =>
					listas.flatMap((dl) =>
						[...dl.querySelectorAll(":scope > dt")].flatMap((dt) => {
							const dd = dt.nextElementSibling!;
							const a = dt.getBoundingClientRect();
							const b = dd.getBoundingClientRect();
							return Math.abs(a.bottom - b.bottom) > 0.5 || Math.abs(a.top - b.top) > 0.5 ? [`${dt.textContent}: ${a.bottom} ≠ ${b.bottom}`] : [];
						}),
					),
				);
			expect(desalineados, `a ${ancho} px`).toEqual([]);
		}
	});

	test("contraetiqueta a dos columnas desde 768 px y a una por debajo", async ({ page }) => {
		const columnas = () =>
			seccion(page)
				.locator('dl[data-columnas="2"]')
				.evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length);
		await page.setViewportSize({ width: 1024, height: 900 });
		await abrir(page);
		expect(await columnas()).toBe(4);
		await page.setViewportSize({ width: 390, height: 900 });
		expect(await columnas()).toBe(2);
	});

	test("el sello es decorativo y toma el color del texto", async ({ page }) => {
		await abrir(page, { tema: "claro" });
		const sello = page.locator('[data-prueba="banda-reservar"] svg').first();
		await expect(sello).toHaveAttribute("aria-hidden", "true");
		const [color, texto] = await sello.evaluate((e) => [
			getComputedStyle(e.querySelector("path")!).fill,
			getComputedStyle(document.body).color,
		]);
		expect(color).toBe(texto);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones y sin desborde a 360 px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 360, height: 800 });
			await abrir(page, { tema, tamanoTexto: "muy-grande" });
			const r = await new AxeBuilder({ page })
				.include("section#marca")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
			expect(desborda).toBe(false);
			await seccion(page).screenshot({ path: `test-results/catalogo/${info.project.name}/marca-${tema}-360-muy-grande.png`, animations: "disabled" });
		});
	}
});
