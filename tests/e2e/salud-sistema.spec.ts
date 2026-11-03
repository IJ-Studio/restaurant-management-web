import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Salud del sistema (PLAN 5.16, NP-24). Contra el build de producción, con sesión de admin y `/db-metrics/*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const historia = (n: number, f: (i: number) => Record<string, number>) => Array.from({ length: n }, (_, i) => ({ ts: `2026-11-03T1${i}:00:00`, ...f(i) }));
const METRICAS = (cpu: number) => ({
	cpu: { totalPct: cpu, postgresPct: 22, loadAvg1m: 1.4, iowaitPct: 3, userPct: 30, systemPct: 10, idlePct: 60, history: historia(6, (i) => ({ totalPct: 30 + i * 5, postgresPct: 15 + i })) },
	"rw-ratio": { reads: 9000, writes: 1000, readPct: 90, writePct: 10 },
	autovacuum: [{ tableName: "pedidos", lastAutovacuum: null, lastAutoanalyze: null, deadTuples: 120, liveTuples: 5000, deadPct: 2.3, vacuumRunning: false, minutesSinceVacuum: 45 }],
	storage: { totalMB: 2300, tablesMB: 1500, indexesMB: 700, toastMB: 100, growth24hMB: 12, history: historia(6, (i) => ({ totalMB: 2250 + i * 10 })) },
	"hot-tables": [{ tableName: "pedidos", seqScan: 20, idxScan: 900, tupReturned: 5000, tupModified: 300, totalOps: 920, sizeMB: 300 }],
	latency: { SELECT: { avgMs: 4, p95Ms: 18, p99Ms: 40 }, INSERT: { avgMs: 6, p95Ms: 25, p99Ms: 60 }, UPDATE: { avgMs: 7, p95Ms: 30, p99Ms: 70 }, DELETE: { avgMs: 5, p95Ms: 20, p99Ms: 50 }, history: historia(6, () => ({ SELECT: 4, INSERT: 6, UPDATE: 7, DELETE: 5 })) },
	connections: { active: 4, idle: 10, idleInTx: 0, waiting: 0, total: 14, maxConnections: 100, usagePct: 14, history: historia(6, (i) => ({ total: 10 + i, active: 2 + i })) },
	"wait-events": [
		{ category: "IO", pct: 40, count: 120 },
		{ category: "Lock", pct: 5, count: 3 },
	],
});

async function abrir(browser: Browser, opciones: { ancho?: number; cpu?: number; falla?: boolean; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: string[] = [];
	const datos = METRICAS(opciones.cpu ?? 35) as Record<string, unknown>;
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/db-metrics/"),
		async (r) => {
			const nombre = new URL(r.request().url()).pathname.replace("/db-metrics/", "");
			if (r.request().method() === "POST") pedidos.push(nombre);
			if (opciones.falla) return r.fulfill({ status: 500, body: "{}" });
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(datos[nombre] ?? {}) });
		},
	);
	await page.goto("/dashboard/admin/db-performance", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("semáforo en orden, comprobaciones con texto y detalle desplegable", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByRole("heading", { name: "Todo en orden" })).toBeVisible();
	await expect(main.getByRole("table", { name: "Comprobaciones de salud" }).locator("tbody tr")).toHaveCount(6);
	await expect(main.getByText("Uso total")).toBeHidden();
	await main.getByText("Procesador", { exact: true }).filter({ visible: true }).last().click();
	await expect(main.getByText("Uso total")).toBeVisible();
	await contexto.close();
});

test("con el procesador al 90 % el semáforo pide atención", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { cpu: 90 });
	const fila = page.locator("main").getByRole("table", { name: "Comprobaciones de salud" }).locator("tbody tr").filter({ hasText: "Procesador" });
	await expect(fila).toContainText("Necesita atención");
	await expect(page.locator("main").getByRole("heading", { name: "Hay algo que necesita atención" })).toBeVisible();
	await contexto.close();
});

test("limpiar pide confirmación y usa el endpoint de siempre", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Limpiar ahora" }).click();
	await page.getByRole("alertdialog", { name: "¿Limpiar ahora la base de datos?" }).getByRole("button", { name: "Limpiar ahora" }).click();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Limpieza en marcha");
	expect(pedidos).toEqual(["vacuum-manual"]);
	await contexto.close();
});

test("si no responde, lo dice con «Reintentar»", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { falla: true });
	await expect(page.locator("main").getByText("No pudimos leer el estado del sistema")).toBeVisible();
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
			await expect(page.locator("main").getByRole("heading", { name: "Todo en orden" })).toBeVisible();
			// Todos los desplegables abiertos, para medirlos.
			await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => d.setAttribute("open", "")));
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/salud/${info.project.name}/salud-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
