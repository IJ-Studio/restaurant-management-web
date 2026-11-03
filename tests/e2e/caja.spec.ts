import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Panel de caja (PLAN 5.17). Contra el build de producción, con sesión de cajero. Datos de ejemplo en memoria.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(browser: Browser, ancho = 1024, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("cajero"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	await page.goto("/dashboard/cajero", { waitUntil: "load" });
	return { contexto, page };
}

test("cobrar en efectivo: el cambio en vivo, faltante avisado y el ticket pasa a cobrados", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	const porCobrar = main.getByRole("list", { name: "Tickets por cobrar" }).getByRole("listitem");
	await expect(porCobrar).toHaveCount(3);
	const boton = main.getByRole("button", { name: /^Cobrar \$\s48\.50 de Mesa 4$/ });
	expect((await boton.boundingBox())!.height).toBeGreaterThanOrEqual(48);
	await boton.click();
	const dialogo = page.getByRole("dialog", { name: "Cobrar Mesa 4" });
	await dialogo.getByLabel("Recibido").fill("40");
	await expect(dialogo).toContainText("Faltan");
	await dialogo.getByRole("button", { name: /^Cobrar/ }).click();
	await expect(dialogo.getByText(/Faltan \$\s8\.50\./)).toBeVisible();
	await dialogo.getByLabel("Recibido").fill("50");
	await expect(dialogo).toContainText(/Cambio\s*\$\s1\.50/);
	await dialogo.getByRole("button", { name: /^Cobrar/ }).click();
	await expect(dialogo).toBeHidden();
	await expect(porCobrar).toHaveCount(2);
	await expect(main.getByRole("table", { name: "Cobrados hoy" })).toContainText("Mesa 4");
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Mesa 4 cobrada");
	await contexto.close();
});

test("con tarjeta no pide el importe recibido; la búsqueda filtra", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("searchbox", { name: "Buscar por ticket, mesa o cliente" }).fill("barra");
	await expect(main.getByRole("list", { name: "Tickets por cobrar" }).getByRole("listitem")).toHaveCount(1);
	await main.getByRole("button", { name: /^Cobrar .* de Barra 2$/ }).click();
	const dialogo = page.getByRole("dialog", { name: "Cobrar Barra 2" });
	await dialogo.getByText("Tarjeta").click();
	await expect(dialogo.getByLabel("Recibido")).toHaveCount(0);
	await dialogo.getByRole("button", { name: /^Cobrar/ }).click();
	await expect(dialogo).toBeHidden();
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
			await page.screenshot({ path: `test-results/caja/${info.project.name}/caja-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
