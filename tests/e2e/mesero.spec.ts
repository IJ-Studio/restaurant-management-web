import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Panel del mesero (PLAN 5.18). Contra el build de producción, con sesión de mesero. Servicios locales de ejemplo.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(browser: Browser, ancho = 390, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("mesero"), viewport: { width: ancho, height: 844 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	await page.goto("/dashboard/mesero", { waitUntil: "load" });
	await expect(page.locator("main").getByRole("list", { name: "Mesas" })).toBeVisible();
	return { contexto, page };
}

test("tomar pedido en una mesa libre: platos, descuento a la vista y la mesa pasa a ocupada", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	const libre = main.getByRole("list", { name: "Mesas" }).getByRole("listitem").filter({ hasText: "Libre" }).first();
	const nombre = (await libre.getByRole("heading").innerText()).trim();
	const tomar = libre.getByRole("button", { name: `Tomar pedido de ${nombre}` });
	expect((await tomar.boundingBox())!.height).toBeGreaterThanOrEqual(48);
	await tomar.click();
	const panel = page.getByRole("dialog", { name: `Pedido de ${nombre}` });
	await expect(panel.getByRole("button", { name: /^Añade algún plato/ })).toBeVisible();
	const anadir = panel.getByRole("button", { name: /^Añadir un / }).filter({ visible: true });
	const primero = anadir.first();
	expect((await primero.boundingBox())!.height).toBeGreaterThanOrEqual(48);
	await primero.click();
	await primero.click();
	await expect(panel).toContainText("En el pedido: 2 platos");
	await panel.getByLabel("Descuento").selectOption("porcentaje");
	await panel.getByLabel("Porcentaje").fill("10");
	await expect(panel).toContainText("Total (−$");
	await panel.getByRole("button", { name: /^Enviar a cocina/ }).click();
	await expect(panel).toBeHidden();
	const mesa = main.getByRole("listitem").filter({ has: page.getByRole("heading", { name: nombre, exact: true }) });
	await expect(mesa).toContainText("Ocupada");
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText(`Pedido de ${nombre} enviado a cocina`);

	await mesa.getByRole("button", { name: `Pedir la cuenta de ${nombre}` }).click();
	await expect(mesa).toContainText("Cuenta pedida");
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[390, "normal"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, ancho, { tema, tamanoTexto });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/mesero/${info.project.name}/mesero-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			// El panel del pedido también pasa axe.
			await page.locator("main").getByRole("button", { name: /^(Tomar pedido|Añadir al pedido) de / }).first().click();
			await expect(page.getByRole("dialog")).toBeVisible();
			const rPanel = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
			expect(rPanel.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			await contexto.close();
		});
	}
}
