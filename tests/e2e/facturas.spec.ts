import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Facturas (PLAN 5.5). Contra el build de producción, con sesión de admin. Datos de ejemplo en memoria.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(browser: Browser, ancho = 1440, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	await page.goto("/dashboard/admin/finance/invoices", { waitUntil: "load" });
	return { contexto, page };
}

test("migas, búsqueda y filtro por estado", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByRole("navigation", { name: "Migas de pan" }).getByRole("link", { name: "Caja y propinas" })).toHaveAttribute("href", "/dashboard/admin/finance");
	const filas = main.getByRole("table", { name: "Facturas" }).locator("tbody tr");
	const total = await filas.count();
	expect(total).toBeGreaterThan(1);
	await main.getByRole("searchbox", { name: "Buscar por folio, cliente o RFC" }).fill("CHI910312AB3");
	await expect(filas).toHaveCount(1);
	await main.getByRole("searchbox", { name: "Buscar por folio, cliente o RFC" }).fill("");
	await main.getByLabel("Estado").selectOption("cancelada");
	await expect(filas.first()).toContainText("Cancelada");
	await main.getByRole("searchbox", { name: "Buscar por folio, cliente o RFC" }).fill("no existe");
	await expect(main.getByText("No hay facturas con esos datos")).toBeVisible();
	await contexto.close();
});

test("factura nueva: valida RFC y conceptos, calcula el IVA y la añade", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Factura nueva" }).click();
	const dialogo = page.getByRole("dialog", { name: "Factura nueva" });
	await dialogo.getByLabel("Nombre o razón social").fill("Bodega del Sur S.A.");
	await dialogo.getByLabel("RFC").fill("NOVALE");
	await dialogo.getByRole("button", { name: "Emitir factura" }).click();
	await expect(dialogo.getByLabel("RFC")).toHaveAttribute("aria-invalid", "true");
	await expect(dialogo.getByLabel("Concepto 1")).toHaveAttribute("aria-invalid", "true");
	await dialogo.getByLabel("RFC").fill("BSU910312AB3");
	await dialogo.getByLabel("Concepto 1").fill("Cena de empresa");
	await dialogo.getByLabel("Precio").fill("1000");
	await expect(dialogo).toContainText("$ 1,160.00");
	await dialogo.getByRole("button", { name: "Emitir factura" }).click();
	await expect(dialogo).toBeHidden();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("emitida");
	await expect(main.getByRole("table", { name: "Facturas" }).locator("tbody tr").first()).toContainText("Bodega del Sur S.A.");
	await contexto.close();
});

test("detalle en panel lateral; cancelar pide confirmación del sistema", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await main.getByLabel("Estado").selectOption("emitida");
	const nombre = (await main.getByRole("table", { name: "Facturas" }).locator("tbody tr").first().locator("th").innerText()).replace("Ver la factura", "").trim();
	await main.getByRole("button", { name: `Ver la factura ${nombre}` }).filter({ visible: true }).click();
	const panel = page.getByRole("dialog", { name: `Factura ${nombre}` });
	await expect(panel.getByRole("table", { name: "Conceptos" })).toBeVisible();
	await panel.getByRole("button", { name: "Cancelar factura" }).click();
	const confirmacion = page.getByRole("alertdialog", { name: `¿Cancelar la factura ${nombre}?` });
	await confirmacion.getByRole("button", { name: "Cancelar factura" }).click();
	await expect(confirmacion).toBeHidden();
	await expect(panel.getByText("Cancelada")).toBeVisible();
	await expect(panel.getByRole("button", { name: "Cancelar factura" })).toHaveCount(0);
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, ancho, { tema, tamanoTexto });
			await expect(page.locator("main").getByRole("heading", { level: 1 })).toHaveText("Facturas");
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/facturas/${info.project.name}/facturas-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			// El detalle y el formulario también pasan axe.
			await page.locator("main").getByRole("button", { name: /^Ver la factura A-/ }).filter({ visible: true }).first().click();
			await expect(page.getByRole("dialog")).toBeVisible();
			const rDetalle = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
			expect(rDetalle.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			await page.screenshot({ path: `test-results/facturas/${info.project.name}/facturas-detalle-${tema}-${ancho}.png`, animations: "disabled" });
			await contexto.close();
		});
	}
}
