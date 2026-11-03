import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

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
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const ruta = new URL(p.url()).pathname;
			if (!ruta.startsWith("/payroll")) return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
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
	await page.goto("/dashboard/admin/payroll", { waitUntil: "load" });
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
