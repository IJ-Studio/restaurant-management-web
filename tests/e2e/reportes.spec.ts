import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Reportes (PLAN 5.3; D-24 y D-27): panel del Inicio con la segmentación de clientes y la exportación.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const cliente = (id: string, x: number, y: number) => ({
	id,
	nombre: `Cliente ${id}`,
	email: `cliente${id}@correo.mx`,
	frecuencia: 6,
	ticketPromedio: 410,
	tipoDominante: "Mesa",
	recenciaDias: 3,
	pcaX: x,
	pcaY: y,
});
const SEGMENTOS = {
	disponible: true,
	segmentosDetectados: 2,
	clientesAnalizados: 4,
	indiceSilueta: 0.62,
	segmentos: [
		{ nombre: "Habituales", color: "brand", descripcion: "Vienen cada semana.", tamano: 2, tamanoPct: 50, ticketPromedio: 520, frecuenciaPromedio: 8, tipoDominante: "Mesa", recenciaPromedioDias: 4, clientes: [cliente("1", 1, 2), cliente("2", 1.2, 1.8)] },
		{ nombre: "Ocasionales", color: "secondary", descripcion: "Vienen en fechas especiales.", tamano: 2, tamanoPct: 50, ticketPromedio: 300, frecuenciaPromedio: 2, tipoDominante: "Para llevar", recenciaPromedioDias: 40, clientes: [cliente("3", -1, -2), cliente("4", -1.1, -1.7)] },
	],
};

/** Reportes es un panel del Inicio (D-27); la ruta antigua redirige aquí. */
const R = "/dashboard/admin?panel=reportes";

async function abrir(browser: Browser, ruta: string, ancho = 1440, segmentos: { status: number; cuerpo: unknown } = { status: 200, cuerpo: SEGMENTOS }, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos = { segmentos: 0, exportar: [] as string[] };
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			if (url.pathname.endsWith("/reports/customer-segments")) {
				pedidos.segmentos++;
				return r.fulfill({ status: segmentos.status, contentType: "application/json", body: JSON.stringify(segmentos.cuerpo) });
			}
			if (url.pathname.endsWith("/export")) {
				pedidos.exportar.push(url.search);
				return r.fulfill({ status: 200, contentType: "text/csv", headers: { "Content-Disposition": 'attachment; filename="ventas.csv"' }, body: "plato,unidades\n" });
			}
			await r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
		},
	);
	await page.goto(ruta, { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("exportar: valida las fechas y descarga con la misma petición de siempre", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser, R);
	await page.locator("main").getByRole("button", { name: "Exportar" }).click();
	const dialogo = page.getByRole("dialog", { name: "Exportar un informe" });
	await dialogo.getByLabel("Formato").selectOption("csv");
	await dialogo.getByLabel("Desde").fill("2026-11-10");
	await dialogo.getByLabel("Hasta").fill("2026-11-01");
	await expect(dialogo.getByText("Tiene que ser igual o posterior a «Desde».")).toBeVisible();
	await dialogo.getByLabel("Hasta").fill("2026-11-20");
	const descarga = page.waitForEvent("download");
	await dialogo.getByRole("button", { name: "Descargar" }).click();
	expect((await descarga).suggestedFilename()).toBe("ventas.csv");
	expect(pedidos.exportar).toEqual(["?type=dishes&format=csv&startDate=2026-11-10&endDate=2026-11-20&limit=50"]);
	await expect(dialogo).toBeHidden();
	await contexto.close();
});

test("clientes: segmentos con su lista en un diálogo", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, R);
	const main = page.locator("main");
	await expect(main.getByRole("tab", { name: "Reportes" })).toHaveAttribute("aria-selected", "true");
	await expect(main).toContainText("0.62");
	await main.getByRole("button", { name: "Ver 2 clientes" }).first().click();
	const dialogo = page.getByRole("dialog", { name: "Habituales" });
	await expect(dialogo.getByRole("table", { name: "Clientes del segmento Habituales" }).locator("tbody tr")).toHaveCount(2);
	await contexto.close();
});

test("clientes: error con «Reintentar» y segmentación no disponible con el motivo del API", async ({ browser }) => {
	const fallo = await abrir(browser, R, 1440, { status: 500, cuerpo: {} });
	await expect(fallo.page.locator("main").getByText("No pudimos traer la segmentación")).toBeVisible();
	await expect(fallo.page.locator("main").getByRole("button", { name: "Reintentar" })).toBeVisible();
	await fallo.contexto.close();
	const sinDatos = await abrir(browser, R, 1440, { status: 200, cuerpo: { disponible: false, motivo: "Hacen falta al menos 20 clientes con pedidos." } });
	await expect(sinDatos.page.locator("main")).toContainText("Hacen falta al menos 20 clientes con pedidos.");
	await sinDatos.contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, R, ancho, undefined, { tema, tamanoTexto });
			const main = page.locator("main");
			await expect(main.getByText("Habituales").first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/reportes/${info.project.name}/reportes-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
