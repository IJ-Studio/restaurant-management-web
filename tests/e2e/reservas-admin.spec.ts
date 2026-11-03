import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Reservas en administración (PLAN 5.11). Contra el build de producción, con sesión de admin y `/reservations*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const reserva = (id: string, nombre: string, estatus: string, extra: Record<string, unknown> = {}) => ({
	id,
	clienteNombre: nombre,
	clienteEmail: `${id}@correo.mx`,
	clienteTelefono: "771 000 0000",
	fechaHora: "2026-11-14T21:00:00",
	numComensales: 4,
	mesaNumero: 7,
	canal: "web",
	ocasion: "Aniversario",
	peticionesEspeciales: "Mesa junto a la ventana",
	depositoPagado: 200,
	estatus,
	...extra,
});
const RESERVAS = [reserva("a1", "Ana López", "confirmada"), reserva("b2", "Luis Pérez", "pendiente", { numComensales: 2, mesaNumero: null }), reserva("c3", "Eva Ruiz", "cancelada")];

async function abrir(browser: Browser, opciones: { ancho?: number; falla?: boolean; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(
		([clave, valor]) => {
			localStorage.setItem(clave, valor);
			// La pantalla comprueba en el cliente que haya un token legible, como antes.
			localStorage.setItem("authToken", "token-de-prueba");
		},
		[CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })],
	);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/reservations"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			pedidos.push({ metodo: p.method(), ruta: url.pathname + url.search, cuerpo: p.postData() ? JSON.parse(p.postData()!) : null });
			if (url.pathname.endsWith("/no-show-risk")) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ probabilidad: 0.72, clasificacion: "Alto" }) });
			if (opciones.falla && p.method() === "GET") return r.fulfill({ status: 500, body: "{}" });
			if (p.method() === "GET") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(RESERVAS) });
			return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
		},
	);
	await page.goto("/dashboard/admin/reservations", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("indicadores, riesgo solo para las confirmadas y filtros que llegan al API", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	const filas = main.getByRole("table", { name: "Reservas" }).locator("tbody tr");
	await expect(filas).toHaveCount(3);
	await expect(main).toContainText("Sin canceladas ni ausencias");
	await expect(filas.filter({ hasText: "Ana López" })).toContainText("Alto · 72 %");
	await expect(filas.filter({ hasText: "Luis Pérez" })).toContainText("2 · sin mesa");
	expect(pedidos.filter((p) => p.ruta.endsWith("/no-show-risk"))).toEqual([{ metodo: "GET", ruta: "/reservations/a1/no-show-risk", cuerpo: null }]);
	await main.getByLabel("Estado", { exact: true }).selectOption("pendiente");
	await expect.poll(() => pedidos.at(-1)?.ruta).toBe("/reservations?estatus=pendiente");
	await contexto.close();
});

test("cambiar el estado en un diálogo envía el mismo PATCH", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Cambiar estado de Luis Pérez" }).filter({ visible: true }).click();
	const dialogo = page.getByRole("dialog", { name: "Estado de Luis Pérez" });
	await dialogo.getByLabel("Estado").selectOption("confirmada");
	await dialogo.getByRole("button", { name: "Guardar estado" }).click();
	await expect(dialogo).toBeHidden();
	const cambio = pedidos.find((p) => p.metodo !== "GET");
	expect(cambio).toMatchObject({ ruta: "/reservations/b2", cuerpo: { estatus: "confirmada" } });
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Estado guardado");
	await contexto.close();
});

test("si no cargan, lo dice con «Reintentar»", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { falla: true });
	await expect(page.locator("main").getByText("No pudimos traer las reservas").filter({ visible: true })).toBeVisible();
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
			await expect(page.locator("main").getByText("Alto · 72 %").filter({ visible: true }).first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/reservas-admin/${info.project.name}/reservas-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
