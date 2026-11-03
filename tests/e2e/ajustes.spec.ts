import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Ajustes (PLAN 5.14, D-12). Contra el build de producción, con sesión de admin y `/backups` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const RESPALDOS = [{ id: 4, name: "respaldo-2026-11-02.sql.gz", sizeBytes: 43_200_000, type: "auto", status: "ok", createdAt: "2026-11-02 23:00" }];

async function abrir(browser: Browser, opciones: { ancho?: number; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: string[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/backups"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			if (p.method() !== "GET") pedidos.push(`${p.method()} ${url.pathname}`);
			const cuerpo = p.method() === "POST" ? { id: 5, name: "respaldo-manual.sql.gz", sizeBytes: 1000, type: "manual", status: "ok", createdAt: "2026-11-03 10:00" } : p.method() === "GET" ? RESPALDOS : {};
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto("/dashboard/admin/settings", { waitUntil: "load" });
	await expect(page.locator("main").getByText("respaldo-2026-11-02.sql.gz").filter({ visible: true }).first()).toBeVisible();
	return { contexto, page, pedidos };
}

test("sin Apariencia ni claves de pasarela (D-12)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByText(/Apariencia|Tipografía|Color principal/)).toHaveCount(0);
	await main.getByRole("button", { name: "Ajustes de Stripe" }).click();
	const dialogo = page.getByRole("dialog", { name: "Ajustes de Stripe" });
	await expect(dialogo.getByLabel("Entorno")).toBeVisible();
	await expect(dialogo.getByLabel(/API Key|Secret|Clave/i)).toHaveCount(0);
	await expect(dialogo.locator('input[type="password"]')).toHaveCount(0);
	await contexto.close();
});

test("la imagen de inicio de sesión solo admite fotos propias y los ajustes se guardan", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	const campo = main.getByLabel("Imagen del inicio de sesión");
	// El valor por defecto (un identificador de la nube de la casa) se puede guardar tal cual.
	await main.getByRole("button", { name: "Guardar ajustes" }).click();
	await expect(campo).not.toHaveAttribute("aria-invalid", "true");
	await campo.fill("https://images.unsplash.com/photo-1.jpg");
	await main.getByRole("button", { name: "Guardar ajustes" }).click();
	await expect(campo).toHaveAttribute("aria-invalid", "true");
	await campo.fill("https://res.cloudinary.com/dcb1tspbj/image/upload/v1/sala.jpg");
	await main.getByLabel("Nombre del restaurante").fill("El Quijote · Huejutla");
	await main.getByRole("button", { name: "Guardar ajustes" }).click();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Ajustes guardados");
	const guardado = await page.evaluate(() => Object.entries(localStorage).find(([, v]) => v.includes("El Quijote · Huejutla"))?.[1] ?? "");
	expect(guardado).toContain("res.cloudinary.com/dcb1tspbj");
	await contexto.close();
});

test("respaldos: crear y eliminar con confirmación, con las llamadas de siempre", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Crear respaldo ahora" }).click();
	await expect(main.getByText("respaldo-manual.sql.gz").filter({ visible: true }).first()).toBeVisible();
	await main.getByRole("button", { name: "Eliminar respaldo-2026-11-02.sql.gz" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog").getByRole("button", { name: "Eliminar respaldo" }).click();
	await expect.poll(() => pedidos).toEqual(["POST /backups", "DELETE /backups/4"]);
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
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/ajustes/${info.project.name}/ajustes-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
