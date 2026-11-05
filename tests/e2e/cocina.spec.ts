import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Panel de cocina (PLAN 5.19; PLAN-AMPLIACION D-24). Contra el build de producción, con sesión de
// cocina y el API simulado: `/pedidos/admin/recent`, `PATCH /pedidos/:id/estatus` e `/inventario/productos`.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const ID = "c0c1a000-0000-4000-8000-000000000001";
const COMANDAS = [
	{ id: ID, customer: "Ana", table: "Mesa 3", time: "20:10", status: "abierta", total: 300, items: [{ nombre: "Enchiladas suizas", cantidad: 2 }] },
	{ id: "c0c1a000-0000-4000-8000-000000000002", customer: "Luis", table: "Mesa 5", time: "20:05", status: "lista", total: 120, items: [{ nombre: "Sopa de tortilla", cantidad: 1 }] },
];
const INVENTARIO = [
	{ id: 1, name: "Tortillas", unit: "kg", stock: "2", minStock: "5" },
	{ id: 2, name: "Queso", unit: "kg", stock: "9", minStock: "3", costPerUnit: "90.00" },
];

async function abrir(browser: Browser, ancho = 1280, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("cocina"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	const cambios: unknown[] = [];
	let comandas = COMANDAS.map((c) => ({ ...c }));
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const camino = new URL(p.url()).pathname;
			const json = (cuerpo: unknown) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
			if (camino.endsWith("/pedidos/admin/recent")) return json(comandas);
			if (camino.endsWith("/inventario/productos")) return json(INVENTARIO);
			const estatus = camino.match(/\/pedidos\/([^/]+)\/estatus$/);
			if (estatus && p.method() === "PATCH") {
				const cuerpo = p.postDataJSON() as { estatus: string };
				cambios.push({ id: estatus[1], ...cuerpo });
				comandas = comandas.map((c) => (c.id === estatus[1] ? { ...c, status: cuerpo.estatus } : c));
				return json({ success: true });
			}
			if (camino.endsWith("/inventario/mermas") && p.method() === "POST") {
				cambios.push({ merma: p.postDataJSON() });
				return json({ success: true, message: "Merma registrada." });
			}
			await json([]);
		},
	);
	await page.goto("/dashboard/cocina", { waitUntil: "load" });
	await expect(page.locator("main").getByRole("heading", { level: 2, name: /Nuevas/ })).toBeVisible();
	return { contexto, page, cambios };
}

test("avanzar una comanda de nueva a en preparación y a lista con el mismo PATCH de la móvil", async ({ browser }) => {
	const { contexto, page, cambios } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByText("Datos de ejemplo")).toHaveCount(0);
	const nuevas = main.getByRole("list", { name: "Comandas: nuevas" });
	await expect(nuevas).toContainText("Enchiladas suizas");
	const boton = nuevas.getByRole("button", { name: /^Empezar la comanda/ });
	expect((await boton.boundingBox())!.height).toBeGreaterThanOrEqual(56);
	await boton.click();
	const enFuego = main.getByRole("list", { name: "Comandas: en preparación" });
	await expect(enFuego).toContainText("Enchiladas suizas");
	await enFuego.getByRole("button", { name: /^Marcar lista la comanda/ }).click();
	await expect(main.getByRole("list", { name: "Comandas: listas para la mesa" })).toContainText("Enchiladas suizas");
	expect(cambios).toEqual([
		{ id: ID, estatus: "en_preparacion" },
		{ id: ID, estatus: "lista" },
	]);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("lista");
	await contexto.close();
});

test("folios y cantidades con cifras de consola: monoespaciadas y tabulares (P5.2)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const cifra = page.locator("main .cifras-consola").first();
	await expect(cifra).toBeVisible();
	const estilo = await cifra.evaluate((e) => {
		const c = getComputedStyle(e);
		return { familia: c.fontFamily, numeros: c.fontVariantNumeric };
	});
	expect(estilo.familia).toMatch(/monospace/);
	expect(estilo.numeros).toContain("tabular-nums");
	await contexto.close();
});

test("existencias en un panel lateral: primero las bajas, con su nivel en texto", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await expect(page.locator("main").getByText("1 producto en el mínimo o por debajo.")).toBeVisible();
	await page.locator("main").getByRole("button", { name: "Existencias", exact: true }).click();
	const panel = page.getByRole("dialog", { name: "Existencias" });
	await expect(panel.getByRole("listitem").first()).toContainText("Tortillas");
	await expect(panel.getByRole("listitem").first()).toContainText("Bajo");
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1280, "normal"],
		[1920, "normal"],
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

test("cocina registra una merma con el mismo POST de la móvil; el costo y el autor los pone el API (P1.2)", async ({ browser }) => {
	const { contexto, page, cambios } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Registrar merma" }).click();
	const merma = page.getByRole("dialog", { name: "Registrar una merma" });
	await merma.getByLabel("Producto").selectOption({ label: "Queso" });
	await merma.getByLabel("Cantidad").fill("0.5");
	await expect(merma).toContainText("$ 45.00");
	await merma.getByLabel("Qué pasó").fill("Se echó a perder.");
	await merma.getByRole("button", { name: "Registrar merma" }).click();
	await expect(merma).toBeHidden();
	expect(cambios).toEqual([{ merma: { productId: 2, quantity: 0.5, unit: "kg", reason: "caducado", justification: "Se echó a perder." } }]);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Merma registrada");
	await contexto.close();
});
