import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Panel de sala (PLAN 5.18; PLAN-AMPLIACION D-24). Contra el build de producción, con sesión de
// mesero y el API simulado: `/mesas`, la carta, `/pedidos/admin/recent`, el alta con su confirmación
// y «servido».
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const MESAS = [
	{ id: 1, numero: "1", nombre: null, capacidad: 4, activa: true },
	{ id: 2, numero: "2", nombre: null, capacidad: 2, activa: true },
	{ id: 3, numero: "3", nombre: "Terraza", capacidad: 6, activa: false },
];
const CARTA = [
	{ id: 10, nombre: "Platos fuertes", platillos: [{ id: 101, nombre: "Enchiladas suizas", precio: "150.00" }, { id: 102, nombre: "Molcajete", precio: "320.00" }] },
];
const PEDIDO_LISTO = { id: "b0b0b0b0-0000-4000-8000-000000000002", table: "Mesa 2", status: "lista", total: 150 };

async function abrir(browser: Browser, ancho = 390, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("mesero"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	const peticiones: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	let pedidos = [PEDIDO_LISTO];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const camino = new URL(p.url()).pathname;
			const json = (cuerpo: unknown) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
			if (p.method() !== "GET") peticiones.push({ metodo: p.method(), ruta: camino, cuerpo: p.postDataJSON() });
			if (camino.endsWith("/mesas")) return json(MESAS);
			if (camino.endsWith("/menu/categories/with-products")) return json(CARTA);
			if (camino.endsWith("/pedidos/admin/recent")) return json(pedidos);
			if (camino.endsWith("/pedidos/mesa")) return json({ success: true, ordenId: "nuevo-1", total: "300.00" });
			if (camino.includes("/pedidos/confirmar/")) {
				pedidos = [...pedidos, { id: "nuevo-1", table: "Mesa 1", status: "abierta", total: 300 }];
				return json({ success: true, ordenId: "nuevo-1" });
			}
			if (camino.endsWith("/estatus")) {
				pedidos = pedidos.map((x) => (camino.includes(x.id) ? { ...x, status: "entregada" } : x));
				return json({ success: true });
			}
			await json([]);
		},
	);
	await page.goto("/dashboard/mesero", { waitUntil: "load" });
	return { contexto, page, peticiones };
}

test("tomar un pedido: el mismo alta y confirmación de la móvil, y la mesa pasa a ocupada", async ({ browser }) => {
	const { contexto, page, peticiones } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByText("Datos de ejemplo")).toHaveCount(0);
	// La mesa inactiva no aparece.
	await expect(main.getByRole("list", { name: "Mesas" }).getByRole("listitem")).toHaveCount(2);
	await main.getByRole("button", { name: "Tomar pedido de Mesa 1" }).click();
	const panel = page.getByRole("dialog", { name: "Pedido de Mesa 1" });
	await panel.getByRole("button", { name: "Añadir un Enchiladas suizas" }).click();
	await panel.getByRole("button", { name: "Añadir un Enchiladas suizas" }).click();
	await panel.getByLabel("Comensales").fill("3");
	await panel.getByRole("button", { name: /^Enviar a cocina/ }).click();
	await expect(panel).toBeHidden();
	expect(peticiones).toEqual([
		{ metodo: "POST", ruta: "/pedidos/mesa", cuerpo: { mesa: "1", items: [{ platilloId: 101, cantidad: 2 }], numComensales: 3 } },
		{ metodo: "POST", ruta: "/pedidos/confirmar/nuevo-1", cuerpo: {} },
	]);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Pedido de Mesa 1 enviado a cocina");
	await contexto.close();
});

test("un plato listo se marca servido con el PATCH de estatus", async ({ browser }) => {
	const { contexto, page, peticiones } = await abrir(browser);
	const boton = page.locator("main").getByRole("button", { name: "Marcar servido el pedido de Mesa 2" });
	expect((await boton.boundingBox())!.height).toBeGreaterThanOrEqual(48);
	await boton.click();
	await expect(boton).toBeHidden();
	expect(peticiones).toEqual([{ metodo: "PATCH", ruta: `/pedidos/${PEDIDO_LISTO.id}/estatus`, cuerpo: { estatus: "entregada" } }]);
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
			await expect(page.locator("main").getByRole("list", { name: "Mesas" })).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/mesero/${info.project.name}/mesero-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
