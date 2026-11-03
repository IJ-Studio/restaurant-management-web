import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Caja y propinas (PLAN 5.4). Contra el build de producción, con sesión de admin. La pantalla usa
// datos de ejemplo en memoria; no llama al API.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(browser: Browser, ruta = "/dashboard/admin/finance", ancho = 1440, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	await page.goto(ruta, { waitUntil: "load" });
	return { contexto, page };
}

test("datos de ejemplo avisados; registrar un ingreso valida y notifica", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByRole("heading", { level: 1 })).toHaveText("Caja y propinas");
	await expect(main.getByText("Pantalla con datos de ejemplo.")).toBeVisible();
	await expect(main.getByText(/^Resumen del \d+ de \w+$/)).toBeVisible();
	const tabla = main.getByRole("table", { name: "Movimientos de caja chica" });
	const antes = await tabla.locator("tbody tr").count();

	await main.getByRole("button", { name: "Ingreso" }).click();
	const dialogo = page.getByRole("dialog", { name: "Registrar un ingreso" });
	await dialogo.getByRole("button", { name: "Registrar" }).click();
	await expect(dialogo.getByLabel("Concepto")).toHaveAttribute("aria-invalid", "true");
	await expect(dialogo.getByText("Escribe un importe mayor que cero.")).toBeVisible();
	await dialogo.getByLabel("Concepto").fill("Evento de cata");
	await dialogo.getByLabel("Importe").fill("1250.5");
	await dialogo.getByRole("button", { name: "Registrar" }).click();
	await expect(dialogo).toBeHidden();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Ingreso registrado");
	await expect(tabla.locator("tbody tr")).toHaveCount(antes + 1);
	await expect(tabla).toContainText("+$ 1,250.50");
	await contexto.close();
});

test("cerrar la caja muestra la diferencia y la deja cerrada", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Cerrar caja" }).click();
	const dialogo = page.getByRole("dialog", { name: "Cerrar la caja" });
	await dialogo.getByLabel("Efectivo contado").fill("1");
	await expect(dialogo).toContainText(/Faltan \$/);
	await dialogo.getByLabel("Cierre hecho por").fill("Laura");
	await dialogo.getByRole("button", { name: "Cerrar caja" }).click();
	await expect(dialogo).toBeHidden();
	await expect(main.getByRole("button", { name: "Cerrar caja" })).toHaveCount(0);
	await main.getByRole("tab", { name: /Cierres/ }).click();
	await expect(page).toHaveURL(/vista=cierres/);
	await expect(main.getByRole("table", { name: "Cierres de caja" })).not.toContainText("Abierta");
	await contexto.close();
});

test("repartir propinas pide confirmación del sistema", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, "/dashboard/admin/finance?vista=propinas");
	const main = page.locator("main");
	const boton = main.getByRole("button", { name: /^Repartir \$/ }).first();
	await boton.click();
	const confirmacion = page.getByRole("alertdialog");
	await expect(confirmacion).toContainText("¿Marcar como repartidas las propinas de");
	await confirmacion.getByRole("button", { name: "Cancelar" }).click();
	await expect(confirmacion).toBeHidden();
	const repartir = main.getByRole("button", { name: /^Repartir \$/ }).filter({ visible: true });
	const pendientes = await repartir.count();
	expect(pendientes).toBeGreaterThan(0);
	await repartir.first().click();
	await page.getByRole("alertdialog").getByRole("button", { name: "Marcar como repartidas" }).click();
	await expect(page.getByRole("alertdialog")).toBeHidden();
	await expect(repartir).toHaveCount(pendientes - 1);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Propinas repartidas");
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [vista, ancho, tamanoTexto] of [
		["caja", 360, "muy-grande"],
		["caja", 768, "normal"],
		["caja", 1440, "normal"],
		["propinas", 360, "muy-grande"],
		["cierres", 1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${vista}, ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, `/dashboard/admin/finance?vista=${vista}`, ancho, { tema, tamanoTexto });
			await expect(page.locator("main").getByRole("tab", { selected: true })).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			// Ninguna cifra se sale de su indicador ni un valor de su tarjeta (PLAN 5.4).
			const desbordes = await page.evaluate(() =>
				[...document.querySelectorAll<HTMLElement>(".indicador-cifra, .contraetiqueta > dd")]
					.filter((e) => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 1)
					.map((e) => e.textContent),
			);
			expect(desbordes).toEqual([]);
			await page.screenshot({ path: `test-results/finanzas/${info.project.name}/finanzas-${vista}-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
