import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Panel de caja (PLAN 5.17; PLAN-AMPLIACION D-24). Contra el build de producción, con sesión de
// cajero y el API simulado: `/caja/actual`, `/pedidos/admin/recent`, `/pedidos/metodos-pago` y el cobro.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const CUENTAS = [
	{ id: "a1b2c3d4-0000-4000-8000-000000000001", customer: "Ana Ruiz", table: "Mesa 4", time: "20:15", status: "entregada", total: 48.5, items: [{ nombre: "Enchiladas", cantidad: 1 }] },
	{ id: "a1b2c3d4-0000-4000-8000-000000000002", customer: "Luis Gil", table: "Mesa 7", time: "20:30", status: "entregada", total: 320, items: [{ nombre: "Molcajete", cantidad: 1 }] },
	{ id: "a1b2c3d4-0000-4000-8000-000000000003", customer: "Sin cliente", table: "Mesa 2", time: "20:40", status: "en_preparacion", total: 150, items: [] },
];
const METODOS = [
	{ id: 1, nombre: "Efectivo", tipo: "efectivo", aplicaPropina: true, esEfectivo: true },
	{ id: 2, nombre: "Tarjeta", tipo: "terminal", aplicaPropina: true, esEfectivo: false },
];
const CAJA = { abierta: true, fechaApertura: "2026-11-03T14:00:00.000Z", fondoInicial: 500, totalVentas: 1200, propinas: 90, numPagos: 6, efectivoEsperado: 1350 };

async function abrir(browser: Browser, ancho = 1024, preferencias: Record<string, string> = {}, caja: unknown = CAJA) {
	const contexto = await browser.newContext({ storageState: archivoSesion("cajero"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const cobros: { ruta: string; cuerpo: unknown }[] = [];
	let cuentas = [...CUENTAS];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const camino = new URL(p.url()).pathname;
			const json = (cuerpo: unknown) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
			if (camino.endsWith("/caja/actual")) return json(caja);
			if (camino.endsWith("/pedidos/admin/recent")) return json(cuentas);
			if (camino.endsWith("/pedidos/metodos-pago")) return json(METODOS);
			const cobro = camino.match(/\/pedidos\/([^/]+)\/cobrar$/);
			if (cobro && p.method() === "POST") {
				cobros.push({ ruta: camino, cuerpo: p.postDataJSON() });
				cuentas = cuentas.filter((c) => c.id !== cobro[1]);
				return json({ success: true, cambio: "1.50" });
			}
			await json([]);
		},
	);
	await page.goto("/dashboard/cajero", { waitUntil: "load" });
	return { contexto, page, cobros };
}

test("cobrar en efectivo: método del API, cambio en vivo, faltante avisado y el mismo POST de la móvil", async ({ browser }) => {
	const { contexto, page, cobros } = await abrir(browser);
	const main = page.locator("main");
	const porCobrar = main.getByRole("list", { name: "Cuentas por cobrar" }).getByRole("listitem");
	await expect(porCobrar).toHaveCount(2);
	await expect(main.getByText("Datos de ejemplo")).toHaveCount(0);
	// D-37: sin la ruta del QR en `config/app-operaciones.ts`, el bloque no aparece.
	await expect(main.locator('[data-prueba="qr-app-operaciones"]')).toHaveCount(0);
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
	expect(cobros).toEqual([{ ruta: "/pedidos/a1b2c3d4-0000-4000-8000-000000000001/cobrar", cuerpo: { metodoPagoId: 1, montoRecibido: 50 } }]);
	await expect(porCobrar).toHaveCount(1);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Mesa 4 cobrada");
	await contexto.close();
});

test("con tarjeta no pide lo recibido y envía la propina; la búsqueda filtra", async ({ browser }) => {
	const { contexto, page, cobros } = await abrir(browser);
	const main = page.locator("main");
	// Primero la lista del API: escribir antes de que hidrate el panel se pierde en WebKit.
	await expect(main.getByRole("list", { name: "Cuentas por cobrar" }).getByRole("listitem")).toHaveCount(2);
	await main.getByRole("searchbox", { name: "Buscar por cuenta, mesa o cliente" }).fill("luis");
	await expect(main.getByRole("list", { name: "Cuentas por cobrar" }).getByRole("listitem")).toHaveCount(1);
	await main.getByRole("button", { name: /^Cobrar .* de Mesa 7$/ }).click();
	const dialogo = page.getByRole("dialog", { name: "Cobrar Mesa 7" });
	await dialogo.getByText("Tarjeta").click();
	await expect(dialogo.getByLabel("Recibido")).toHaveCount(0);
	await dialogo.getByLabel("Propina").fill("30");
	await dialogo.getByRole("button", { name: /^Cobrar/ }).click();
	await expect(dialogo).toBeHidden();
	expect(cobros[0].cuerpo).toEqual({ metodoPagoId: 2, propina: 30 });
	await contexto.close();
});

test("con la caja cerrada lo avisa y ofrece abrirla", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, 1024, {}, { abierta: false });
	const main = page.locator("main");
	await expect(main.getByText("Tu caja está cerrada.")).toBeVisible();
	await expect(main.getByRole("button", { name: "Abrir caja" })).toBeVisible();
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
			await expect(page.locator("main").getByRole("list", { name: "Cuentas por cobrar" })).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/caja/${info.project.name}/caja-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
