import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Panel de cocina (PLAN 5.19). Contra el build de producción, con sesión de cocina. Servicios locales de ejemplo.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(browser: Browser, ancho = 1280, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("cocina"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/dashboard/cocina", { waitUntil: "load" });
	await expect(page.locator("main").getByRole("heading", { level: 2, name: /Nuevas/ })).toBeVisible();
	return { contexto, page };
}

test("avanzar una comanda de nueva a en preparación y a lista; sin «Entregado» ni promedio inventado", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main).not.toContainText(/Avg|Entregado/);
	const nuevas = main.getByRole("list", { name: "Comandas: nuevas" });
	const comanda = nuevas.getByRole("listitem").filter({ has: page.getByRole("button", { name: /^Empezar/ }) }).first();
	const boton = comanda.getByRole("button", { name: /^Empezar la comanda / });
	const nombre = (await boton.getAttribute("aria-label"))!.replace("Empezar la comanda ", "");
	expect((await boton.boundingBox())!.height).toBeGreaterThanOrEqual(56);
	await boton.click();
	const enPreparacion = main.getByRole("list", { name: "Comandas: en preparación" });
	await enPreparacion.getByRole("button", { name: `Marcar lista la comanda ${nombre}` }).click();
	await expect(main.getByRole("list", { name: "Comandas: listas para la mesa" })).toContainText(nombre);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText(`Comanda ${nombre} lista`);
	await contexto.close();
});

test("existencias en un panel lateral, con su nivel en texto", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Existencias", exact: true }).click();
	const panel = page.getByRole("dialog", { name: "Existencias" });
	await expect(panel.getByText(/^(Bajo|Bien)$/).first()).toBeVisible();
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1024, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, ancho, { tema, tamanoTexto });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/cocina/${info.project.name}/cocina-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
