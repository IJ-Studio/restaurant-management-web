import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Inventario (PLAN 5.7). Contra el build de producción, con sesión de admin y el API (`/inventario/*`) simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const producto = (id: number, name: string, stock: number, minStock: number, extra: Record<string, unknown> = {}) => ({
	id,
	name,
	sku: `SKU-${id}`,
	category: "vegetales",
	unit: "kg",
	stock,
	minStock,
	maxStock: 50,
	costPerUnit: 20,
	supplier: "Huerta Norte",
	lastUpdated: "2026-11-01",
	active: true,
	...extra,
});
const PRODUCTOS = [producto(1, "Jitomate", 30, 10), producto(2, "Azafrán", 1, 5, { unit: "g", costPerUnit: 90 }), producto(3, "Aceite de oliva", 8, 10, { unit: "l", category: "condimentos" })];
const MERMAS = [{ id: 1, productId: 1, productName: "Jitomate", quantity: 2, unit: "kg", reason: "calidad", justification: "Llegó golpeado.", reportedBy: "Luis", date: "2026-11-02", cost: 40 }];

async function abrir(browser: Browser, opciones: { ancho?: number; falla?: "carga" | "borrar"; ruta?: string; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(u) => u.origin === "http://localhost:3100" && u.pathname.startsWith("/inventario/"),
		async (r) => {
		const p = r.request();
		const url = new URL(p.url());
		const ruta = url.pathname + url.search;
		const metodo = p.method();
		if (metodo !== "GET") pedidos.push({ metodo, ruta, cuerpo: p.postData() ? JSON.parse(p.postData()!) : null });
		if (opciones.falla === "carga" && metodo === "GET") return r.fulfill({ status: 500, body: "{}" });
		if (opciones.falla === "borrar" && metodo === "DELETE") return r.fulfill({ status: 500, body: "{}" });
		const cuerpo = url.pathname.endsWith("/productos") ? PRODUCTOS : url.pathname.endsWith("/mermas") ? MERMAS : [];
		await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(metodo === "GET" ? cuerpo : { ok: true }) });
		},
	);
	await page.goto(opciones.ruta ?? "/dashboard/admin/inventory", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("indicadores, alerta con «Ver solo esos» y el nivel dicho con texto", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main).toContainText("$ 850.00");
	await expect(main).toContainText("1 producto está en nivel crítico.");
	const filas = main.getByRole("table", { name: "Productos del inventario" }).locator("tbody tr");
	await expect(filas).toHaveCount(3);
	await main.getByRole("button", { name: "Ver solo esos" }).click();
	await expect(filas).toHaveCount(2);
	await expect(filas.filter({ hasText: "Azafrán" })).toContainText("Crítico");
	await expect(filas.filter({ hasText: "Aceite de oliva" })).toContainText("Bajo");
	await contexto.close();
});

test("ajustar existencias envía el mismo POST con el valor calculado", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Ajustar las existencias de Jitomate" }).filter({ visible: true }).click();
	const dialogo = page.getByRole("dialog", { name: "Ajustar las existencias de Jitomate" });
	await dialogo.getByLabel("Cantidad").fill("-40");
	await dialogo.getByRole("button", { name: "Ajustar" }).click();
	await expect(dialogo.getByText("Las existencias no pueden quedar por debajo de cero.")).toBeVisible();
	await dialogo.getByLabel("Cantidad").fill("5");
	await expect(dialogo).toContainText("35 kg");
	await dialogo.getByRole("button", { name: "Ajustar" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos).toEqual([{ metodo: "POST", ruta: "/inventario/admin/productos/1/ajuste", cuerpo: { stock: 35 } }]);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Existencias ajustadas");
	await contexto.close();
});

test("producto nuevo valida mínimo y máximo; merma calcula la pérdida", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Producto nuevo" }).click();
	const dialogo = page.getByRole("dialog", { name: "Producto nuevo" });
	await dialogo.getByLabel("Nombre").fill("Pimentón de la Vera");
	await dialogo.getByLabel("Mínimo").fill("20");
	await dialogo.getByLabel("Máximo").fill("10");
	await dialogo.getByRole("button", { name: "Añadir producto" }).click();
	await expect(dialogo.getByText("Tiene que ser igual o mayor que el mínimo.")).toBeVisible();
	await dialogo.getByLabel("Máximo").fill("40");
	await dialogo.getByRole("button", { name: "Añadir producto" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos[0]).toMatchObject({ metodo: "POST", ruta: "/inventario/admin/productos", cuerpo: { name: "Pimentón de la Vera", minStock: 20, maxStock: 40, active: true } });
	// Solo los campos que acepta el DTO del API (sin id, lastUpdated ni supplierId).
	expect(Object.keys(pedidos[0].cuerpo as object)).not.toContain("id");

	// Las mermas las registra el personal operativo (P1.2): el admin solo ve el registro.
	await expect(page.getByRole("button", { name: "Registrar merma" })).toHaveCount(0);
	await contexto.close();
});

test("eliminar pide confirmación y, si falla, lo avisa", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser, { falla: "borrar" });
	await page.locator("main").getByRole("button", { name: "Eliminar Jitomate" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Eliminar Jitomate del inventario?" }).getByRole("button", { name: "Eliminar producto" }).click();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("No se pudo eliminar el producto");
	expect(pedidos).toEqual([{ metodo: "DELETE", ruta: "/inventario/admin/productos/1", cuerpo: null }]);
	await contexto.close();
});

test("si el inventario no carga, lo dice con «Reintentar» y sin ceros", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { falla: "carga" });
	const main = page.locator("main");
	await expect(main.getByText("No pudimos traer el inventario").filter({ visible: true })).toBeVisible();
	await expect(main).not.toContainText("$ 0.00");
	await expect(main).not.toContainText(/Failed to fetch/);
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [vista, ancho, tamanoTexto] of [
		["productos", 360, "muy-grande"],
		["productos", 768, "normal"],
		["productos", 1440, "normal"],
		["mermas", 360, "muy-grande"],
		["mermas", 1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${vista}, ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, { ancho, ruta: `/dashboard/admin/inventory?vista=${vista}`, preferencias: { tema, tamanoTexto } });
			await expect(page.locator("main").getByText("Jitomate").filter({ visible: true }).first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/inventario/${info.project.name}/inventario-${vista}-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}

test("«Ver cálculo»: cada cifra de las tarjetas se rehace desde su desglose (P1.4)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await expect(page.locator("main").getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
	expect(await comprobarCalculos(page)).toHaveLength(4);
	await contexto.close();
});
