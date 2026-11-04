import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Tu pedido (/menu/pedido, PLAN 4.13). Contra el build de producción, con el API simulado desde
// el navegador. La lógica (endpoints, mesa en la URL, ventana de cancelación) no cambia.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const ahora = () => new Date().toISOString();
const MESA = () => [
	{
		id: "carrito-1",
		estatus: "pendiente",
		ordenItems: [
			{ id: 501, cantidad: 2, precioUnitario: "120.00", platillo: { nombre: "Croquetas de jamón", imagenUrl: "image_l57jar" } },
			{ id: 502, cantidad: 1, precioUnitario: "380.00", platillo: { nombre: "Paella de mariscos", imagenUrl: null } },
		],
	},
	{ id: "abcd1234-comanda", estatus: "abierta", tiempoApertura: ahora(), total: "260.00", ordenItems: [{ id: 601, cantidad: 1, precioUnitario: "260.00", platillo: { nombre: "Gambas al ajillo" } }] },
];
const DOMICILIO = [{ id: "dom12345", estatus: "pendiente", creadoEn: "2026-11-03T18:00:00Z", items: [{ id: 701, nombre: "Tortilla de patatas", cantidad: 1, precio: "110.00" }] }];

async function abrir(page: Page, ruta: string, preferencias: Record<string, string> = {}) {
	const llamadas: string[] = [];
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			if (p.method() !== "GET") {
				llamadas.push(`${p.method()} ${url.pathname}`);
				return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
			}
			let cuerpo: unknown = [];
			if (url.pathname.endsWith("/auth/me")) cuerpo = { user: { id: "41", name: "Prueba", roleId: 5 } };
			else if (url.pathname === "/pedidos/usuario" && url.searchParams.get("tipo") === "domicilio") cuerpo = DOMICILIO;
			else if (url.pathname === "/pedidos/usuario" && url.searchParams.get("mesaId")) cuerpo = MESA();
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto(ruta, { waitUntil: "load" });
	return llamadas;
}

async function conSesion(browser: import("@playwright/test").Browser) {
	const contexto = await browser.newContext({ storageState: archivoSesion("cliente") });
	const page = await contexto.newPage();
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	return { contexto, page };
}

test("mesa: carrito por confirmar, comanda en cocina, precios y estados con palabras", async ({ browser }) => {
	const { contexto, page } = await conSesion(browser);
	await abrir(page, "/menu/pedido?mesaQuery=5&tab=mesa");
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tu pedido");
	await expect(page.getByRole("tab", { name: "En mesa" })).toHaveAttribute("aria-selected", "true");
	const carrito = page.getByRole("article", { name: "Lo que llevas" });
	await expect(carrito).toContainText("Croquetas de jamón");
	await expect(carrito).toContainText("2 × $ 120");
	await expect(carrito).toContainText("$ 240");
	const comanda = page.getByRole("article", { name: "Pedido ABCD1234" });
	await expect(comanda).toContainText("En cocina");
	await expect(comanda).toContainText("$ 260");
	await expect(page.getByText("Mesa 5")).toBeVisible();
	await contexto.close();
});

test("quitar, enviar a cocina y cancelar piden confirmación en un diálogo, nunca confirm()", async ({ browser }) => {
	const { contexto, page } = await conSesion(browser);
	const llamadas = await abrir(page, "/menu/pedido?mesaQuery=5&tab=mesa");

	await page.getByRole("button", { name: "Quitar Croquetas de jamón" }).click();
	const quitar = page.getByRole("alertdialog", { name: "¿Quitar Croquetas de jamón de tu pedido?" });
	await quitar.getByRole("button", { name: "Dejarlo" }).click();
	expect(llamadas).toEqual([]);
	await page.getByRole("button", { name: "Quitar Croquetas de jamón" }).click();
	await quitar.getByRole("button", { name: "Quitar", exact: true }).click();
	await expect.poll(() => llamadas).toContain("DELETE /pedidos/item/501");

	await page.getByRole("button", { name: "Enviar a cocina" }).click();
	await page.getByRole("alertdialog", { name: "¿Enviar tu pedido a cocina?" }).getByRole("button", { name: "Enviar a cocina" }).click();
	await expect.poll(() => llamadas).toContain("POST /pedidos/confirmar/carrito-1");
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Tu pedido va a cocina");

	await page.getByRole("button", { name: "Cancelar pedido" }).click();
	await page.getByRole("alertdialog", { name: "¿Cancelar este pedido?" }).getByRole("button", { name: "Cancelar pedido" }).click();
	await expect.poll(() => llamadas).toContain("PATCH /pedidos/cancelar/abcd1234-comanda");
	await contexto.close();
});

test("domicilio: la pestaña de la URL, quitar y continuar al pago con el mismo enlace", async ({ browser }) => {
	const { contexto, page } = await conSesion(browser);
	await abrir(page, "/menu/pedido?tab=domicilio");
	await expect(page.getByRole("tab", { name: "A domicilio" })).toHaveAttribute("aria-selected", "true");
	const pedido = page.getByRole("article", { name: "Pedido DOM12345" });
	await expect(pedido).toContainText("Por confirmar");
	await expect(pedido).toContainText("Tortilla de patatas");
	await page.getByRole("button", { name: "Continuar al pago" }).click();
	await expect(page).toHaveURL(/\/menu\/pedido\/checkout\?orderId=dom12345$/);
	await contexto.close();
});

test("sin sesión: el proxy lleva a iniciar sesión (PLAN 2.10), como antes", async ({ page }) => {
	await page.goto("/menu/pedido", { waitUntil: "load" });
	await expect(page).toHaveURL(/\/login/);
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await conSesion(browser);
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, "/menu/pedido?mesaQuery=5&tab=mesa", { tema, tamanoTexto });
			await expect(page.getByRole("article", { name: "Lo que llevas" })).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/pedido/${info.project.name}/pedido-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
