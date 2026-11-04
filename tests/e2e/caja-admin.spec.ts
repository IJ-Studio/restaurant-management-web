import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Caja y propinas, panel del Inicio (PLAN-AMPLIACION D-24 y D-27). Solo datos del API simulado:
// `/reportes/hoy` y `/caja/cortes`. Contra el build de producción, con sesión de admin.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const HOY = {
	ventas: { cobrado: 12450.5, propinas: 1320, pagos: 31, ordenesPagadas: 28, ticketPromedio: 444.66, comensales: 74 },
	porMetodo: [
		{ metodo: "Efectivo", total: 7200, pagos: 18 },
		{ metodo: "Tarjeta", total: 5250.5, pagos: 13 },
	],
	porCajero: [{ nombre: "Ana López", total: 12450.5, pagos: 31 }],
};
const CORTES = [
	{ id: 7, cajero: "Ana López", fechaApertura: "2026-11-02T14:00:00.000Z", fechaCierre: "2026-11-03T05:00:00.000Z", totalVentas: "15890.00", propinas: "1500.00", diferencia: "-20.00", estatus: "cerrado" },
];

async function abrir(browser: Browser, ruta: string, ancho = 1440, hoy: { status: number; cuerpo: unknown } = { status: 200, cuerpo: HOY }, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const camino = new URL(p.url()).pathname;
			if (camino.endsWith("/reportes/hoy")) return r.fulfill({ status: hoy.status, contentType: "application/json", body: JSON.stringify(hoy.cuerpo) });
			if (camino.endsWith("/caja/cortes")) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(CORTES) });
			await r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
		},
	);
	await page.goto(ruta, { waitUntil: "load" });
	return { contexto, page };
}

test("la ruta antigua lleva al panel; cifras y tablas salen del API, sin datos de ejemplo", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, "/dashboard/admin/finance");
	await expect(page).toHaveURL(/\/dashboard\/admin\?panel=caja$/);
	const main = page.locator("main");
	await expect(main.getByRole("tab", { name: "Caja y propinas" })).toHaveAttribute("aria-selected", "true");
	await expect(main).toContainText("$ 12,450.50");
	await expect(main).toContainText("$ 1,320.00");
	await expect(main.getByRole("table", { name: "Cobros de hoy por método de pago" }).locator("tbody tr")).toHaveCount(2);
	await expect(main.getByText("Ana López").first()).toBeVisible();
	await expect(main.getByText("Datos de ejemplo")).toHaveCount(0);
	await contexto.close();
});

test("si el API falla, lo dice con «Reintentar» y sin ceros", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, "/dashboard/admin?panel=caja", 1440, { status: 500, cuerpo: {} });
	const main = page.locator("main");
	await expect(main.getByText("No pudimos traer la caja de hoy").first()).toBeVisible();
	await expect(main).not.toContainText("$ 0.00");
	await contexto.close();
});

for (const [ruta, panel] of [
	["/dashboard/admin/reports", "reportes"],
	["/dashboard/admin/payroll", "nomina"],
] as const) {
	test(`${ruta} redirige al panel «${panel}» del Inicio`, async ({ browser }) => {
		const { contexto, page } = await abrir(browser, ruta);
		await expect(page).toHaveURL(new RegExp(`/dashboard/admin\\?panel=${panel}$`));
		await contexto.close();
	});
}

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe y sin desbordar: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, "/dashboard/admin?panel=caja", ancho, undefined, { tema, tamanoTexto });
			await expect(page.locator("main")).toContainText("$ 12,450.50");
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/caja-admin/${info.project.name}/caja-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
