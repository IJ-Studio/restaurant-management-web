import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Predicción de demanda (PLAN 5.12). Contra el build de producción, con sesión de admin y `/inventory/predictive*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const platillo = (id: number, nombre: string, variacionPct: number, clasificacion: string) => ({
	platilloId: id,
	nombre,
	categoria: "Principales",
	unidadesUltimos7: 40,
	unidadesPredichas7: 40 * (1 + variacionPct / 100),
	variacionPct,
	clasificacion,
});
const RANKING = {
	disponible: true,
	horizonteDias: 7,
	wapeModelo: 0.183,
	wapeBaseline: 0.264,
	mejoraPct: 30.7,
	platilloMayorCrecimiento: platillo(1, "Paella valenciana", 25, "Alta demanda"),
	platilloMayorDecrecimiento: platillo(2, "Gazpacho", -18, "Baja demanda"),
	platillos: [platillo(1, "Paella valenciana", 25, "Alta demanda"), platillo(2, "Gazpacho", -18, "Baja demanda"), platillo(3, "Croquetas", 2, "Demanda media")],
};
const DETALLE = {
	disponible: true,
	platillo: { id: 1, nombre: "Paella valenciana", categoria: "Principales", precio: 640 },
	wapeModelo: 0.15,
	wapeBaseline: 0.22,
	serieHistorica: [
		{ fecha: "2026-11-01", unidades: 5 },
		{ fecha: "2026-11-02", unidades: 7 },
	],
	pronostico: [
		{ fecha: "2026-11-03", unidadesPredichas: 8 },
		{ fecha: "2026-11-04", unidadesPredichas: 9 },
	],
};

async function abrir(browser: Browser, opciones: { ancho?: number; ranking?: unknown; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	const pedidos: string[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/inventory/predictive"),
		async (r) => {
			const url = new URL(r.request().url());
			pedidos.push(url.pathname + url.search);
			const cuerpo = url.pathname.endsWith("/ranking") ? (opciones.ranking ?? RANKING) : DETALLE;
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto("/dashboard/admin/predictive", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("indicadores en palabras de la casa y curva al elegir un platillo", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await expect(main).toContainText("18.3 %");
	await expect(main).toContainText("La estimación simple falla un 26.4 %");
	await expect(main).not.toContainText(/WAPE|baseline/i);
	expect(pedidos).toEqual(["/inventory/predictive/ranking?dias=7"]);
	const boton = main.getByRole("button", { name: "Ver la curva de Paella valenciana" }).filter({ visible: true });
	await boton.click();
	await expect(boton).toHaveAttribute("aria-pressed", "true");
	await expect(main.getByRole("table", { name: "Vendido y previsto de Paella valenciana" })).toBeVisible();
	await expect(main.locator(".recharts-line-curve").first()).toBeVisible();
	expect(pedidos).toContain("/inventory/predictive/1?dias=7");
	await contexto.close();
});

test("sin datos, muestra el motivo del API", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { ranking: { disponible: false, motivo: "Hacen falta al menos 30 días de ventas." } });
	await expect(page.locator("main")).toContainText("Hacen falta al menos 30 días de ventas.");
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
			await page.locator("main").getByRole("button", { name: "Ver la curva de Paella valenciana" }).filter({ visible: true }).click();
			await expect(page.locator(".recharts-line-curve").first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/prediccion/${info.project.name}/prediccion-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
