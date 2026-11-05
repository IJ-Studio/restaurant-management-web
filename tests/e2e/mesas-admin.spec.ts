import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Mesas en administración (Prioridad 1.3). Contra el build de producción, con sesión de admin y `/mesas/admin*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const mesa = (id: number, numero: string, extra: Record<string, unknown> = {}) => ({
	id,
	numero,
	nombre: null,
	capacidad: 4,
	forma: "cuadrada",
	areaId: 1,
	areaNombre: "Salón Principal",
	activa: true,
	conHistorial: false,
	reservasActivas: 0,
	...extra,
});
const MESAS = [mesa(1, "S01", { conHistorial: true, reservasActivas: 2 }), mesa(2, "T01", { areaId: 2, areaNombre: "Terraza", capacidad: 6 }), mesa(3, "B01", { activa: false, forma: "barra" })];
const AREAS = [
	{ id: 1, nombre: "Salón Principal", activa: true },
	{ id: 2, nombre: "Terraza", activa: true },
];

async function abrir(browser: Browser, ancho = 1440) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/mesas/admin"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const ruta = new URL(p.url()).pathname;
			const metodo = p.method();
			const json = (cuerpo: unknown, status = 200) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(cuerpo) });
			if (metodo === "GET") return json(ruta.endsWith("/areas") ? AREAS : MESAS);
			const cuerpo = p.postData() ? JSON.parse(p.postData()!) : null;
			pedidos.push({ metodo, ruta, cuerpo });
			if (metodo === "POST" && cuerpo.numero === "S01") return json({ message: "Ya hay una mesa con ese número.", statusCode: 409 }, 409);
			if (metodo === "DELETE") return json({ resultado: "desactivada", reservasActivas: 2, message: "La mesa tiene 2 reservación(es) por venir: se desactivó y se conservan." });
			return json({ id: 9, ...cuerpo });
		},
	);
	await page.goto("/dashboard/admin/mesas", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("lista las mesas con su área, capacidad, reservas por venir y estado", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const filas = page.locator("main").getByRole("table", { name: "Mesas" }).locator("tbody tr");
	await expect(filas).toHaveCount(3);
	await expect(filas.filter({ hasText: "T01" })).toContainText("Terraza");
	await expect(filas.filter({ hasText: "S01" })).toContainText("2");
	await expect(filas.filter({ hasText: "B01" })).toContainText("Inactiva");
	await expect(page.locator("main")).toContainText("Mesas activas");
	await contexto.close();
});

test("mesa nueva: valida, envía el cuerpo del API y muestra el 409 del número repetido", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Mesa nueva" }).click();
	const dialogo = page.getByRole("dialog", { name: "Mesa nueva" });
	await dialogo.getByLabel("Capacidad").fill("0");
	await dialogo.getByRole("button", { name: "Añadir mesa" }).click();
	await expect(dialogo.getByLabel("Número")).toHaveAttribute("aria-invalid", "true");
	await expect(dialogo.getByLabel("Capacidad")).toHaveAttribute("aria-invalid", "true");
	await dialogo.getByLabel("Número").fill("S01");
	await dialogo.getByLabel("Capacidad").fill("2");
	await dialogo.getByRole("button", { name: "Añadir mesa" }).click();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Ya hay una mesa con ese número.");
	await expect(dialogo).toBeVisible();
	await dialogo.getByLabel("Número").fill("T05");
	await dialogo.getByLabel("Área").selectOption({ label: "Terraza" });
	await dialogo.getByLabel("Forma").selectOption({ label: "Redonda" });
	await dialogo.getByRole("button", { name: "Añadir mesa" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos.at(-1)).toEqual({ metodo: "POST", ruta: "/mesas/admin", cuerpo: { numero: "T05", nombre: null, capacidad: 2, forma: "redonda", areaId: 2 } });
	await contexto.close();
});

test("la baja de una mesa con historial avisa que se desactiva y lo confirma el API", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Dar de baja la mesa S01" }).filter({ visible: true }).click();
	const confirmacion = page.getByRole("alertdialog");
	await expect(confirmacion).toContainText("se desactivará y se conserva todo");
	await confirmacion.getByRole("button", { name: "Desactivar mesa" }).click();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("2 reservación(es) por venir");
	expect(pedidos).toEqual([{ metodo: "DELETE", ruta: "/mesas/admin/1", cuerpo: null }]);
	await contexto.close();
});

for (const ancho of [390, 1440]) {
	test(`sin violaciones de accesibilidad a ${ancho} px`, async ({ browser }) => {
		const { contexto, page } = await abrir(browser, ancho);
		await expect(page.locator("main")).toContainText("S01");
		const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
		expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
		await contexto.close();
	});
}

test("«Ver cálculo»: cada cifra de las tarjetas se rehace desde su desglose (P1.4)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await expect(page.locator("main").getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
	expect(await comprobarCalculos(page)).toHaveLength(3);
	await contexto.close();
});
