import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Buscador con filtro local diferido y búsqueda remota con espera y cancelación (PLAN 3.14).
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#buscador", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);

test.describe("buscador del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("filtro local: sin tildes, anuncia el resultado, Esc y «Borrar búsqueda» vacían", async ({ page }) => {
		await abrir(page);
		const local = prueba(page, "filtro-local");
		await expect(local.getByRole("search", { name: "Buscar en la carta" })).toBeVisible();
		const campo = local.getByRole("searchbox", { name: "Buscar en la carta" });
		await campo.fill("cafe");
		await expect(prueba(page, "cuenta-local")).toHaveText("10");
		await expect(local.locator('[data-prueba="anuncio-buscador"]')).toHaveText("10 platillos");
		await expect(local.getByRole("listitem").first()).toContainText("Café");
		// Enter no envía ni recarga.
		await campo.press("Enter");
		await expect(campo).toHaveValue("cafe");
		await campo.press("Escape");
		await expect(campo).toHaveValue("");
		await expect(local.locator('[data-prueba="anuncio-buscador"]')).toHaveText("");
		await campo.fill("chiles en nogada");
		await expect(local.locator('[data-prueba="anuncio-buscador"]')).toHaveText("Sin resultados para «chiles en nogada»");
		await expect(local).toContainText("Ningún platillo coincide");
		await local.getByRole("button", { name: "Borrar búsqueda" }).click();
		await expect(campo).toHaveValue("");
		await expect(campo).toBeFocused();
	});

	test("búsqueda remota: espera a dejar de escribir y cancela la petición anterior", async ({ page }) => {
		await abrir(page);
		const remota = prueba(page, "busqueda-remota");
		const campo = remota.getByRole("searchbox", { name: "Buscar cliente" });
		const cuentas = prueba(page, "cuentas-remota");
		// Una letra no busca.
		await campo.pressSequentially("a");
		await page.waitForTimeout(600);
		await expect(cuentas).toHaveText("Peticiones: 0 · canceladas: 0");
		// Escribir seguido (menos de 300 ms entre teclas) lanza una sola petición.
		await campo.pressSequentially("ng", { delay: 60 });
		await expect(remota).toHaveAttribute("data-estado", "lista", { timeout: 5_000 });
		await expect(cuentas).toHaveText("Peticiones: 1 · canceladas: 0");
		await expect(remota.locator('[data-prueba="anuncio-buscador"]')).toHaveText("3 clientes");
		await expect(remota.getByRole("listitem")).toHaveText(["Mariana Cruz del Ángel", "Andrés Ángeles", "Ángel Reyes"]);

		// Una consulta nueva mientras la anterior sigue en curso la cancela.
		await campo.fill("lu");
		await expect(remota).toHaveAttribute("data-estado", "buscando", { timeout: 2_000 });
		await campo.fill("luis");
		await expect(remota).toHaveAttribute("data-estado", "lista", { timeout: 5_000 });
		await expect(cuentas).toHaveText("Peticiones: 3 · canceladas: 1");
		await expect(remota.getByRole("listitem")).toHaveText(["Luis Pérez"]);
	});

	test("búsqueda remota: un fallo se anuncia y se muestra con el estado de error", async ({ page }) => {
		await abrir(page);
		const remota = prueba(page, "busqueda-remota");
		await remota.getByRole("searchbox", { name: "Buscar cliente" }).fill("error");
		await expect(remota).toHaveAttribute("data-estado", "error", { timeout: 5_000 });
		await expect(remota.locator('[data-prueba="anuncio-buscador"]')).toHaveText("No se pudo buscar.");
		await expect(remota.getByRole("alert")).toContainText("No se pudo buscar");
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones y sin desborde a 360 px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 360, height: 800 });
			await abrir(page, { tema, tamanoTexto: "muy-grande" });
			await prueba(page, "filtro-local").getByRole("searchbox").fill("mole");
			await page.waitForTimeout(300);
			const r = await new AxeBuilder({ page })
				.include("section#buscador")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
			expect(desborda).toBe(false);
			await page
				.locator("section#buscador")
				.screenshot({ path: `test-results/catalogo/${info.project.name}/buscador-${tema}-360-muy-grande.png`, animations: "disabled" });
		});
	}
});
