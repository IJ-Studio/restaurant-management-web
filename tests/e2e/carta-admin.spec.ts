import { test, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Carta en administración (PLAN 5.9). Contra el build de producción, con sesión de admin y `/platillos*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const FILAS_BD = [
	{ id: 11, categoria_id: 1, nombre: "Croquetas de jamón", descripcion_corta: "Seis piezas", precio: 120, disponible: true, es_popular: true, tiempo_preparacion: 12 },
	{ id: 12, categoria_id: 1, nombre: "Gazpacho", descripcion_corta: "Andaluz, frío", precio: 95, disponible: false, tiempo_preparacion: 5 },
	{ id: 21, categoria_id: 2, nombre: "Paella valenciana", descripcion_corta: "Para dos", precio: 640, disponible: true, tiempo_preparacion: 35 },
];

async function abrir(browser: Browser, opciones: { ancho?: number; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && /^\/(platillos|import)/.test(url.pathname),
		async (r) => {
			const p = r.request();
			const url = new URL(p.url());
			const metodo = p.method();
			const tipo = p.headers()["content-type"] ?? "";
			if (metodo !== "GET") pedidos.push({ metodo, ruta: url.pathname + url.search, cuerpo: tipo.includes("json") ? JSON.parse(p.postData() ?? "null") : "form-data" });
			if (metodo === "GET") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FILAS_BD) });
			if (url.pathname.includes("import")) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ inserted: 1, updated: 1 }) });
			if (metodo === "POST") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: 99 }) });
			return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
		},
	);
	await page.goto("/dashboard/admin/menu", { waitUntil: "load" });
	await expect(page.locator("main").getByText("Croquetas de jamón").filter({ visible: true }).first()).toBeVisible();
	return { contexto, page, pedidos };
}

async function subir(page: Page, boton: string, archivo: { name: string; mimeType: string; buffer: Buffer }) {
	await page.locator("main").getByRole("button", { name: "Importar" }).click();
	const selector = page.waitForEvent("filechooser");
	await page.getByRole("dialog", { name: "Importar platillos" }).getByRole("button", { name: boton }).click();
	await (await selector).setFiles(archivo);
}

test("la carta de la BD, por categorías, con filtro y disponibilidad", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main).toContainText("Disponibles: 1 de 2");
	const tabla = main.getByRole("table", { name: "Platillos de Categoría 1" });
	await expect(tabla.locator("tbody tr").filter({ hasText: "Gazpacho" })).toContainText("Agotado");
	await main.getByRole("button", { name: "Agotar Croquetas de jamón" }).filter({ visible: true }).click();
	await expect(tabla.locator("tbody tr").filter({ hasText: "Croquetas" })).toContainText("Agotado");
	await main.getByLabel("Mostrar").selectOption("disponibles");
	await expect(tabla.locator("tbody tr")).toHaveCount(0);
	await contexto.close();
});

test("editar y añadir platillo: PATCH y POST con el contrato de siempre", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Editar Paella valenciana" }).filter({ visible: true }).click();
	const editar = page.getByRole("dialog", { name: "Editar Paella valenciana" });
	await editar.getByLabel("Precio").fill("680");
	await editar.getByRole("button", { name: "Guardar cambios" }).click();
	await expect(editar).toBeHidden();
	await expect.poll(() => pedidos.find((p) => p.metodo === "PATCH")).toMatchObject({ ruta: "/platillos/21", cuerpo: { nombre: "Paella valenciana", precio: 680, disponible: true } });

	await main.getByRole("button", { name: "Añadir a Categoría 2" }).click();
	const nuevo = page.getByRole("dialog", { name: "Platillo nuevo" });
	await nuevo.getByRole("button", { name: "Añadir platillo" }).click();
	await expect(nuevo.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
	await nuevo.getByLabel("Nombre").fill("Fideuá");
	await nuevo.getByLabel("Precio").fill("590");
	await nuevo.getByLabel("Popular").check();
	await nuevo.getByRole("button", { name: "Añadir platillo" }).click();
	await expect.poll(() => pedidos.find((p) => p.metodo === "POST")).toMatchObject({ ruta: "/platillos", cuerpo: { categoria_id: 2, nombre: "Fideuá", precio: 590, tags: ["popular"] } });
	await contexto.close();
});

test("importar: un .xlsx que no es Excel se rechaza antes de leerlo; un CSV válido se revisa y se sube", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await subir(page, "Subir Excel", { name: "carta.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from("nombre,precio\nNo es Excel,1") });
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Elige una hoja de cálculo de Excel (.xlsx).");
	await expect(page.getByRole("dialog", { name: "Revisar la importación" })).toHaveCount(0);

	const csv = "nombre,precio,categoria_id\nGazpacho,99,1\nTortilla de patatas,140,1\nCroquetas de jamón,120,1\n";
	await subir(page, "Subir CSV", { name: "carta.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
	const revision = page.getByRole("dialog", { name: "Revisar la importación" });
	await expect(revision).toContainText("1 platillo nuevo");
	await expect(revision.getByRole("checkbox", { name: "Croquetas de jamón" })).not.toBeChecked();
	await expect(revision.getByRole("checkbox", { name: "Gazpacho" })).toBeChecked();
	await expect(revision).toContainText("$ 95.00");
	await revision.getByRole("button", { name: "Importar 2 platillos" }).click();
	await expect(revision).toBeHidden();
	expect(pedidos.filter((p) => p.ruta.includes("import"))).toEqual([{ metodo: "POST", ruta: "/platillos/import.csv?mode=upsert", cuerpo: "form-data" }]);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Importación completa");
	await contexto.close();
});

test("eliminar pide confirmación del sistema", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Eliminar Gazpacho" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Eliminar Gazpacho de la carta?" }).getByRole("button", { name: "Eliminar platillo" }).click();
	await expect(main.getByRole("table", { name: "Platillos de Categoría 1" })).not.toContainText("Gazpacho");
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, { ancho, preferencias: { tema, tamanoTexto } });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/carta-admin/${info.project.name}/carta-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await page.locator("main").getByRole("button", { name: "Editar Croquetas de jamón" }).filter({ visible: true }).click();
			await expect(page.getByRole("dialog")).toBeVisible();
			const rDialogo = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
			expect(rDialogo.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			await contexto.close();
		});
	}
}
