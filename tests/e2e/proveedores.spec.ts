import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Proveedores (PLAN 5.8). Contra el build de producción, con sesión de admin y `/api/inventory/*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const PRODUCTOS = [
	{ id: 1, name: "Jitomate", sku: "J1", category: "vegetales", unit: "kg", stock: 30, minStock: 10, maxStock: 50, costPerUnit: 20, supplier: "Huerta Norte", lastUpdated: "2026-11-01", active: true },
	{ id: 2, name: "Cebolla", sku: "C1", category: "vegetales", unit: "kg", stock: 12, minStock: 5, maxStock: 40, costPerUnit: 15, supplier: "Huerta Norte", lastUpdated: "2026-11-01", active: true },
];
const PROVEEDORES = [
	{ id: 1, name: "Huerta Norte", contact: "Rosa Díaz", email: "ventas@huertanorte.mx", phone: "771 123 4567", category: "Verduras", products: ["Jitomate", "Cebolla"], paymentTerms: "Crédito 15 días", deliveryDays: 2, active: true },
	{ id: 2, name: "Bodegas del Sur", contact: "", email: "", phone: "", category: "Vinos", products: [], paymentTerms: "Contado", deliveryDays: 5, active: false },
];
const ORDENES = [
	{ id: 7, folio: "OC-2026-101", supplierId: 1, supplierName: "Huerta Norte", items: [{ productName: "Jitomate", quantity: 10, unit: "kg", unitCost: 20 }], total: 200, status: "en_camino", createdAt: "2026-11-01" },
];

async function abrir(browser: Browser, opciones: { ancho?: number; ruta?: string; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route("**/api/inventory/**", async (r) => {
		const p = r.request();
		const url = new URL(p.url());
		if (p.method() !== "GET") pedidos.push({ metodo: p.method(), ruta: url.pathname + url.search, cuerpo: p.postData() ? JSON.parse(p.postData()!) : null });
		const datos = url.pathname.endsWith("/products") ? PRODUCTOS : url.pathname.endsWith("/suppliers") ? PROVEEDORES : url.pathname.endsWith("/orders") ? ORDENES : [];
		await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(p.method() === "GET" ? datos : { ok: true }) });
	});
	await page.goto(opciones.ruta ?? "/dashboard/admin/inventory/suppliers", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("tarjetas con contacto enlazado, migas e indicadores", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByRole("navigation", { name: "Migas de pan" }).getByRole("link", { name: "Productos y existencias" })).toHaveAttribute("href", "/dashboard/admin/inventory");
	await expect(main).toContainText("$ 200.00");
	const tarjeta = main.getByRole("listitem").filter({ hasText: "Huerta Norte" });
	await expect(tarjeta.getByRole("link", { name: "771 123 4567" })).toHaveAttribute("href", "tel:7711234567");
	await expect(tarjeta).toContainText("2 días");
	// Al inactivo no se le puede pedir.
	await expect(main.getByRole("listitem").filter({ hasText: "Bodegas del Sur" }).getByRole("button", { name: "Hacer pedido" })).toHaveCount(0);
	await contexto.close();
});

test("orden de compra desde la tarjeta: solo productos del proveedor, total y el POST de siempre", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("listitem").filter({ hasText: "Huerta Norte" }).getByRole("button", { name: "Hacer pedido" }).click();
	const dialogo = page.getByRole("dialog", { name: "Orden de compra nueva" });
	await dialogo.getByRole("button", { name: "Crear orden" }).click();
	await expect(dialogo.getByText("Elige el producto.")).toBeVisible();
	const articulo = dialogo.getByLabel("Artículo 1");
	await expect(articulo.locator("option")).toHaveText(["Elige un producto", "Jitomate", "Cebolla"]);
	await articulo.selectOption("Cebolla");
	await dialogo.getByLabel("Cantidad").fill("4");
	await expect(dialogo).toContainText("$ 60.00");
	await dialogo.getByRole("button", { name: "Crear orden" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos[0]).toMatchObject({
		metodo: "POST",
		ruta: "/api/inventory/orders",
		cuerpo: { id: 0, supplierId: 1, supplierName: "Huerta Norte", status: "borrador", total: 60, items: [{ productName: "Cebolla", quantity: 4, unit: "kg", unitCost: 15 }] },
	});
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Orden creada");
	await contexto.close();
});

test("proveedor nuevo valida el correo; eliminar una orden pide confirmación", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser, { ruta: "/dashboard/admin/inventory/suppliers?vista=ordenes" });
	const main = page.locator("main");
	await main.getByRole("button", { name: "Proveedor nuevo" }).click();
	const dialogo = page.getByRole("dialog", { name: "Proveedor nuevo" });
	await dialogo.getByLabel("Nombre").fill("Quesos Real del Monte");
	await dialogo.getByLabel("Correo").fill("ventas@");
	await dialogo.getByRole("button", { name: "Añadir proveedor" }).click();
	await expect(dialogo.getByLabel("Correo")).toHaveAttribute("aria-invalid", "true");
	await dialogo.getByLabel("Correo").fill("ventas@quesos.mx");
	await dialogo.getByLabel("Producto", { exact: true }).fill("Queso manchego");
	await dialogo.getByLabel("Producto", { exact: true }).press("Enter");
	await expect(dialogo.getByRole("list", { name: "Productos añadidos" })).toContainText("Queso manchego");
	await dialogo.getByRole("button", { name: "Añadir proveedor" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos[0]).toMatchObject({ metodo: "POST", ruta: "/api/inventory/suppliers", cuerpo: { id: 0, name: "Quesos Real del Monte", email: "ventas@quesos.mx", products: ["Queso manchego"] } });

	await main.getByRole("button", { name: "Eliminar la orden OC-2026-101" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Eliminar la orden OC-2026-101?" }).getByRole("button", { name: "Eliminar orden" }).click();
	await expect.poll(() => pedidos.at(-1)).toEqual({ metodo: "DELETE", ruta: "/api/inventory/orders?id=7", cuerpo: null });
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [vista, ancho, tamanoTexto] of [
		["proveedores", 360, "muy-grande"],
		["proveedores", 768, "normal"],
		["proveedores", 1440, "normal"],
		["ordenes", 360, "muy-grande"],
		["ordenes", 1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${vista}, ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, { ancho, ruta: `/dashboard/admin/inventory/suppliers?vista=${vista}`, preferencias: { tema, tamanoTexto } });
			await expect(page.locator("main").getByText("Huerta Norte").filter({ visible: true }).first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/proveedores/${info.project.name}/proveedores-${vista}-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
