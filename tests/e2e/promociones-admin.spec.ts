import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Promociones en administración (PLAN 5.10). Contra el build de producción, con sesión de admin y `/promociones*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const fila = (id: number, titulo: string, extra: Record<string, unknown> = {}) => ({
	id,
	titulo,
	descripcion: "Para compartir.",
	badge: null,
	emoji: null,
	color: "from-orange-600 to-red-600",
	precio_original: 900,
	precio_descuento: 720,
	imagen_url: null,
	imagen_public_id: null,
	activa: true,
	orden: id,
	fecha_inicio: null,
	fecha_fin: null,
	...extra,
});
const FILAS = [fila(1, "Menú de cata"), fila(2, "Vermut de los domingos", { activa: false }), fila(3, "Navidad", { fecha_inicio: "2099-12-01", fecha_fin: "2099-12-31" })];

async function abrir(browser: Browser, opciones: { ancho?: number; falla?: "cargar" | "eliminar"; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/promociones"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const ruta = new URL(p.url()).pathname;
			const metodo = p.method();
			const cuerpo = p.postData() ? JSON.parse(p.postData()!) : null;
			if (metodo !== "GET") pedidos.push({ metodo, ruta, cuerpo });
			if ((opciones.falla === "cargar" && metodo === "GET") || (opciones.falla === "eliminar" && metodo === "DELETE")) return r.fulfill({ status: 500, body: "{}" });
			if (metodo === "GET") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FILAS) });
			if (metodo === "POST") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...fila(9, cuerpo.titulo), ...cuerpo, id: 9 }) });
			if (metodo === "PATCH") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...FILAS.find((f) => `/promociones/${f.id}` === ruta), ...cuerpo }) });
			return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
		},
	);
	await page.goto("/dashboard/admin/promociones", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("estado en la web, fuera de fechas e inactiva; filtro «En la web»", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	const filas = main.getByRole("table", { name: "Promociones" }).locator("tbody tr");
	await expect(filas.filter({ hasText: "Menú de cata" })).toContainText("En la web");
	await expect(filas.filter({ hasText: "Navidad" })).toContainText("Fuera de fechas");
	await expect(filas.filter({ hasText: "Vermut" })).toContainText("Inactiva");
	await main.getByLabel("Mostrar").selectOption("web");
	await expect(filas).toHaveCount(1);
	await contexto.close();
});

test("nueva promoción: valida las fechas y envía el cuerpo de siempre", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Promoción nueva" }).click();
	const dialogo = page.getByRole("dialog", { name: "Promoción nueva" });
	await dialogo.getByRole("button", { name: "Crear promoción" }).click();
	await expect(dialogo.getByLabel("Título")).toHaveAttribute("aria-invalid", "true");
	await dialogo.getByLabel("Título").fill("Cena de San Valentín");
	await dialogo.getByLabel("Desde").fill("2027-02-15");
	await dialogo.getByLabel("Hasta").fill("2027-02-10");
	await dialogo.getByRole("button", { name: "Crear promoción" }).click();
	await expect(dialogo.getByText("La fecha de fin no puede ser anterior a la de inicio.")).toBeVisible();
	await dialogo.getByLabel("Hasta").fill("2027-02-16");
	await dialogo.getByLabel("Precio de la promoción").fill("1200");
	await dialogo.getByRole("button", { name: "Crear promoción" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos[0]).toMatchObject({
		metodo: "POST",
		ruta: "/promociones",
		cuerpo: { titulo: "Cena de San Valentín", precio_descuento: 1200, precio_original: null, fecha_inicio: "2027-02-15", fecha_fin: "2027-02-16", activa: true, orden: 0, color: "from-orange-600 to-red-600" },
	});
	await contexto.close();
});

test("activar con el PATCH de siempre; eliminar con confirmación y error avisado", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser, { falla: "eliminar" });
	const main = page.locator("main");
	await main.getByRole("button", { name: "Activar Vermut de los domingos" }).filter({ visible: true }).click();
	await expect.poll(() => pedidos[0]).toEqual({ metodo: "PATCH", ruta: "/promociones/2", cuerpo: { activa: true } });
	await main.getByRole("button", { name: "Eliminar Menú de cata" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Eliminar «Menú de cata»?" }).getByRole("button", { name: "Eliminar promoción" }).click();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("No se pudo eliminar la promoción");
	await expect(main.getByRole("table", { name: "Promociones" })).toContainText("Menú de cata");
	await contexto.close();
});

test("si no cargan, lo dice con «Reintentar»", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { falla: "cargar" });
	await expect(page.locator("main").getByText("No pudimos traer las promociones").filter({ visible: true })).toBeVisible();
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
			await expect(page.locator("main").getByText("Menú de cata").filter({ visible: true }).first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/promociones-admin/${info.project.name}/promociones-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await page.locator("main").getByRole("button", { name: "Editar Menú de cata" }).filter({ visible: true }).click();
			await expect(page.getByRole("dialog")).toBeVisible();
			const rDialogo = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
			expect(rDialogo.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			await contexto.close();
		});
	}
}

test("«Ver cálculo»: cada cifra de las tarjetas se rehace desde su desglose (P1.4)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await expect(page.locator("main").getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
	expect(await comprobarCalculos(page)).toHaveLength(3);
	await contexto.close();
});
