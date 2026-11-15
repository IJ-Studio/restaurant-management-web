import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Inicio de administración (PLAN 5.2). Contra el build de producción, con sesión de admin y el API simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const ESTADISTICAS = {
	totalVentas: 18420.5,
	pedidosPendientes: 3,
	pedidosEnPreparacion: 2,
	mesasOcupadas: 7,
	mesasLibres: 5,
	totalMesas: 12,
	// Desglose del API (P1.4), coherente con las cifras de arriba.
	calculos: {
		totalVentas: { formula: "suma por hora", operacion: "suma", datos: [{ clave: "13:00 a 13:59", valor: 10000 }, { clave: "14:00 a 14:59", valor: 8420.5 }] },
		pedidosPendientes: { formula: "órdenes pendientes", operacion: "suma", datos: [{ clave: "pendiente", valor: 3 }] },
		mesasOcupadas: { formula: "mesas ocupadas", operacion: "conteo", datos: Array.from({ length: 7 }, (_, i) => ({ clave: `Mesa ${i + 1}`, valor: "ocupada" })) },
	},
};
const INVENTARIO = [
	{ stock: 1, minStock: 10 },
	{ stock: 8, minStock: 10 },
	{ stock: 40, minStock: 10 },
];
const RESERVAS = [{ estatus: "confirmada" }, { estatus: "pendiente" }, { estatus: "cancelada" }];
const PEDIDOS = Array.from({ length: 13 }, (_, i) => ({
	id: String(i + 1),
	customer: `Cliente ${i + 1}`,
	time: "21:10",
	item: "Paella valenciana",
	table: `Mesa ${i + 1}`,
	status: i < 4 ? "pendiente" : "entregada",
	total: 640,
}));
const VENTAS = { ventas: Array.from({ length: 24 }, (_, h) => (h >= 13 && h <= 22 ? 1000 + h * 10 : 0)), totalDia: 18420.5 };

type Respuestas = Partial<Record<"stats" | "inventario" | "reservas" | "pedidos" | "ventas", { status: number; cuerpo: unknown }>>;

async function abrir(browser: Browser, ancho = 1440, respuestas: Respuestas = {}, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const base = {
		stats: { status: 200, cuerpo: ESTADISTICAS },
		inventario: { status: 200, cuerpo: INVENTARIO },
		reservas: { status: 200, cuerpo: RESERVAS },
		pedidos: { status: 200, cuerpo: PEDIDOS },
		ventas: { status: 200, cuerpo: VENTAS },
		...respuestas,
	};
	const peticiones: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const ruta = new URL(p.url()).pathname;
			if (p.method() !== "GET") peticiones.push({ metodo: p.method(), ruta, cuerpo: p.postDataJSON() });
			const clave = ruta.endsWith("/dashboard/admin/stats")
				? "stats"
				: ruta.endsWith("/inventario/productos")
					? "inventario"
					: ruta.endsWith("/reservations")
						? "reservas"
						: ruta.endsWith("/pedidos/admin/recent")
							? "pedidos"
							: ruta.endsWith("/ventas-por-hora")
								? "ventas"
								: null;
			const respuesta = clave ? base[clave] : { status: 200, cuerpo: [] };
			await r.fulfill({ status: respuesta.status, contentType: "application/json", body: JSON.stringify(respuesta.cuerpo) });
		},
	);
	await page.goto("/dashboard/admin", { waitUntil: "load" });
	return { contexto, page, peticiones };
}

test("indicadores, alerta accionable, pedidos con filtro y ventas por hora", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByRole("heading", { level: 1 })).toHaveText("Inicio");
	await expect(page.locator('[data-prueba="indicador-ventas"]')).toContainText(/\$\s18,420\.50/);
	await expect(main).toContainText("7 de 12");
	await expect(main).toContainText("2 en preparación");
	// Reservas de hoy: sin las canceladas.
	await expect(main.getByText("Reservas de hoy").locator("xpath=ancestor::*[contains(@class,'rounded-tarjeta')][1]")).toContainText("2");
	// Inventario: 1 crítico y 2 bajo el mínimo, con enlace.
	await expect(main).toContainText("1 producto está en nivel crítico.");
	await expect(main.getByRole("link", { name: "Ver inventario" })).toHaveAttribute("href", "/dashboard/admin/inventory");

	const tabla = main.getByRole("table", { name: "Pedidos recientes" });
	await expect(tabla.locator("tbody tr")).toHaveCount(10);
	await main.getByRole("button", { name: "Mostrar 3 más" }).click();
	await expect(tabla.locator("tbody tr")).toHaveCount(13);
	await main.getByLabel("Mostrar").selectOption("pendiente");
	await expect(tabla.locator("tbody tr")).toHaveCount(4);
	await expect(main).not.toContainText(/SSE|tiempo real/);

	await expect(main.getByText("Ventas de hoy por hora")).toBeVisible();
	// La gráfica empieza en «cargando» y mide su zona cuando llegan los datos: tiene que dibujar barras.
	await expect(main.locator("svg.font-texto path").first()).toBeVisible();
	expect(await main.locator("svg.font-texto path").count()).toBeGreaterThanOrEqual(6);
	await contexto.close();
});

test("el admin atiende pedidos desde el Inicio con los pasos de la móvil", async ({ browser }) => {
	const pedido = (id: string, status: string) => ({ id, customer: `Cliente ${id}`, time: "21:10", item: "Paella", table: `Mesa ${id}`, status, total: 100 });
	const { contexto, page, peticiones } = await abrir(browser, 1440, {
		pedidos: { status: 200, cuerpo: [pedido("1", "lista"), pedido("2", "pendiente"), pedido("3", "entregada")] },
	});
	const tabla = page.locator("main").getByRole("table", { name: "Pedidos recientes" });
	await expect(tabla.getByRole("button")).toHaveCount(2);
	await tabla.getByRole("button", { name: "Entregar en la mesa: Mesa 1" }).click();
	await tabla.getByRole("button", { name: "Confirmar y enviar a cocina: Mesa 2" }).click();
	await expect.poll(() => peticiones.length).toBe(2);
	expect(peticiones).toEqual([
		{ metodo: "PATCH", ruta: "/pedidos/1/estatus", cuerpo: { estatus: "entregada" } },
		{ metodo: "POST", ruta: "/pedidos/confirmar/2", cuerpo: {} },
	]);
	await contexto.close();
});

test("si el API falla, cada bloque lo dice con «Reintentar» y nunca muestra un cero", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, 1440, {
		stats: { status: 500, cuerpo: {} },
		inventario: { status: 404, cuerpo: {} },
		pedidos: { status: 500, cuerpo: {} },
	});
	const main = page.locator("main");
	await expect(main.getByText("No se pudo cargar").first()).toBeVisible();
	await expect(main.getByText("No pudimos comprobar el inventario.")).toBeVisible();
	await expect(main.getByText("No pudimos traer los pedidos")).toBeVisible();
	await expect(page.locator('[data-prueba="indicador-ventas"]')).not.toContainText("$");
	expect(await main.getByRole("button", { name: "Reintentar" }).count()).toBeGreaterThanOrEqual(3);
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, ancho, {}, { tema, tamanoTexto });
			await expect(page.locator('[data-prueba="indicador-ventas"]')).toContainText("$");
			await expect(page.locator("main").getByText("Cliente 1", { exact: true }).filter({ visible: true }).first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/inicio-admin/${info.project.name}/inicio-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
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
