import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Nómina (PLAN 5.6). Contra el build de producción, con sesión de admin y `/payroll` simulado en memoria.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const INICIALES = [
	{ id: "1", role: "Chef 1", name: "Marta Ruiz", weeklyPay: 4200, active: true },
	{ id: "2", role: "Mesero 1", name: "Pablo Gil", weeklyPay: 2100, active: true },
	{ id: "3", role: "Gerente", name: "Laura Méndez", weeklyPay: 5600, active: false },
];

async function abrir(browser: Browser, opciones: { ancho?: number; falla?: "get" | "delete"; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const lista = INICIALES.map((e) => ({ ...e }));
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	// Sumas y restas (Prioridad 3.1): API simulada aparte, para no mezclar sus llamadas con las de /payroll.
	const movimientos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	const historial: Record<string, unknown>[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const ruta = new URL(p.url()).pathname;
			if (!ruta.startsWith("/payroll")) return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
			if (ruta.startsWith("/payroll/movimientos")) {
				if (opciones.falla === "get" && p.method() === "GET") return r.fulfill({ status: 500, contentType: "application/json", body: "{}" });
				const cuerpo = p.postData() ? JSON.parse(p.postData()!) : null;
				const json = (b: unknown) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(b) });
				if (p.method() === "POST") {
					movimientos.push({ metodo: "POST", ruta, cuerpo });
					historial.unshift({ id: historial.length + 1, empleado: "MARTA RUIZ", fecha: "2026-11-05", autor: "LAURA MÉNDEZ", corrigeId: null, corregidoPor: null, ...cuerpo });
					return json({ id: historial.length });
				}
				if (ruta.endsWith("/resumen")) {
					const restas = historial.filter((m) => m.tipo === "resta").reduce((a, m) => a + Number(m.monto), 0);
					return json([{ empleadoId: "1", nombre: "MARTA RUIZ", puesto: "CHEF", base: 4200, sumas: 0, restas, neto: 4200 - restas, calculo: { formula: "neto = base + sumas − restas", periodo: { inicio: "2026-11-02", fin: "2026-11-08" }, datos: [{ clave: "base", valor: 4200 }, ...historial.map((m) => ({ clave: `resta#${m.id}`, valor: -Number(m.monto) }))] } }]);
				}
				return json({ movimientos: historial, pagina: 1, haySiguiente: false });
			}
			const metodo = p.method();
			const cuerpo = p.postData() ? JSON.parse(p.postData()!) : null;
			pedidos.push({ metodo, ruta, cuerpo });
			if ((opciones.falla === "get" && metodo === "GET") || (opciones.falla === "delete" && metodo === "DELETE"))
				return r.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ message: "Internal server error", statusCode: 500 }) });
			const json = (b: unknown) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(b) });
			if (metodo === "GET") return json(lista);
			if (metodo === "POST") return json({ id: "9", ...cuerpo });
			const id = ruta.split("/").pop();
			const actual = lista.find((e) => e.id === id)!;
			if (metodo === "PATCH") return json({ ...actual, ...cuerpo });
			return json({});
		},
	);
	await page.goto("/dashboard/admin?panel=nomina", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("totales del personal activo, alta con el mismo POST y búsqueda", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await expect(main).toContainText("$ 6,300.00");
	await expect(main).toContainText("De 3 en la nómina");
	await main.getByRole("button", { name: "Añadir a la nómina" }).click();
	const dialogo = page.getByRole("dialog", { name: "Añadir a la nómina" });
	await dialogo.getByRole("button", { name: "Añadir" }).click();
	await expect(dialogo.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
	await dialogo.getByLabel("Nombre").fill("Iván Soto");
	await dialogo.getByLabel("Puesto").fill("Mesero 2");
	await dialogo.getByLabel("Pago semanal").fill("2300");
	await dialogo.getByRole("button", { name: "Añadir" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos.filter((p) => p.metodo === "POST")).toEqual([{ metodo: "POST", ruta: "/payroll", cuerpo: { role: "Mesero 2", name: "Iván Soto", weeklyPay: 2300, active: true } }]);
	await expect(main).toContainText("$ 8,600.00");
	await main.getByRole("searchbox", { name: "Buscar por nombre o puesto" }).fill("gerente");
	await expect(main.getByRole("table", { name: "Personal en la nómina" }).locator("tbody tr")).toHaveCount(1);
	await contexto.close();
});

test("activar y quitar: el mismo PATCH, confirmación del sistema y error sin texto del API", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser, { falla: "delete" });
	const main = page.locator("main");
	await main.getByRole("button", { name: "Activar a Laura Méndez" }).filter({ visible: true }).click();
	await expect.poll(() => pedidos.filter((p) => p.metodo === "PATCH")).toEqual([{ metodo: "PATCH", ruta: "/payroll/3", cuerpo: { active: true } }]);
	await expect(main).toContainText("$ 11,900.00");
	await main.getByRole("button", { name: "Quitar a Pablo Gil" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Quitar a Pablo Gil de la nómina?" }).getByRole("button", { name: "Quitar de la nómina" }).click();
	const avisos = page.locator('section[aria-label="Notificaciones"]');
	await expect(avisos).toContainText("No se pudo quitar");
	await expect(avisos).not.toContainText(/Internal|statusCode/);
	// Se deshace el borrado optimista.
	await expect(main.getByRole("table", { name: "Personal en la nómina" })).toContainText("Pablo Gil");
	await contexto.close();
});

test("si la nómina no carga, lo dice con «Reintentar» y sin ceros", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { falla: "get" });
	const main = page.locator("main");
	await expect(main.getByText("No pudimos traer la nómina")).toBeVisible();
	await expect(main).not.toContainText("$ 0.00");
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
			await expect(page.locator("main").getByText("Marta Ruiz").filter({ visible: true }).first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/nomina/${info.project.name}/nomina-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}

test("sumar o restar exige justificación, queda en el historial y el neto se recalcula desde «Ver cálculo» (P3.1)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Sumar o restar a Marta Ruiz" }).filter({ visible: true }).click();
	const dialogo = page.getByRole("dialog", { name: "Sumar o restar a Marta Ruiz" });
	await dialogo.getByLabel("Monto").fill("150.5");
	await dialogo.getByRole("button", { name: "Registrar" }).click();
	await expect(dialogo.getByText("Explica el motivo (al menos 5 letras).")).toBeVisible();
	await dialogo.getByLabel("Justificación").fill("Rompió una copa de cristal");
	await dialogo.getByRole("button", { name: "Registrar" }).click();
	await expect(dialogo).toBeHidden();
	await expect(main.getByRole("table", { name: "Historial de sumas y restas" })).toContainText("Rompió una copa de cristal");
	// «Ver cálculo»: la suma de los datos del desglose da exactamente el neto mostrado.
	await main.getByRole("button", { name: "Ver cálculo de neto de Marta Ruiz" }).filter({ visible: true }).first().click();
	const calculo = page.getByRole("dialog", { name: "Cálculo: neto de Marta Ruiz" });
	const valores = await calculo.locator("[data-valor]").evaluateAll((filas) => filas.map((f) => Number(f.getAttribute("data-valor"))));
	const resultado = Number(await calculo.locator("[data-resultado]").textContent());
	expect(Math.round(valores.reduce((a, b) => a + b, 0) * 100) / 100).toBe(resultado);
	expect(resultado).toBe(4049.5);
	await contexto.close();
});

test("«Ver cálculo»: cada cifra de las tarjetas se rehace desde su desglose (P1.4)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await expect(page.locator("main").getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
	// Cuatro tarjetas y el neto de la persona del resumen.
	expect(await comprobarCalculos(page)).toHaveLength(5);
	await contexto.close();
});
