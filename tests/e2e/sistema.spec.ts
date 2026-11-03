import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Páginas de sistema (PLAN 4.23, D-21): un solo diseño de página de estado con su ilustración,
// dentro del marco público, sin restos del diseño anterior. Contra el build de producción.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const PAGINAS = [
	{ ruta: "/no-existe-esta-pagina", tipo: "no-encontrado", ilustracion: "plato-cloche", codigo: "404", salida: "/" },
	{ ruta: "/unauthorized", tipo: "sin-sesion", ilustracion: "llave-bodega", codigo: "401", salida: "/login" },
	{ ruta: "/forbidden", tipo: "prohibido", ilustracion: "puerta-candado", codigo: "403", salida: "/dashboard" },
	{ ruta: "/maintenance", tipo: "mantenimiento", ilustracion: "mesa-reloj", codigo: null, salida: "tel:+527717028172" },
	{ ruta: "/offline", tipo: "sin-conexion", ilustracion: "molino-quieto", codigo: null, salida: null },
] as const;

async function abrir(page: Page, ruta: string, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto(ruta, { waitUntil: "load" });
}

for (const p of PAGINAS) {
	test(`${p.ruta}: página de estado con su ilustración, su código y el marco público`, async ({ page }) => {
		await abrir(page, p.ruta);
		const estado = page.locator(`[data-pagina-estado="${p.tipo}"]`);
		await expect(estado.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(estado.locator(`svg[data-ilustracion="${p.ilustracion}"]`)).toHaveAttribute("aria-hidden", "true");
		if (p.codigo) await expect(estado.locator("p").first()).toHaveText(`Código ${p.codigo}`);
		if (p.salida) await expect(estado.locator(`a[href="${p.salida}"]`).first()).toBeVisible();
		await expect(page.locator("header.cabecera-sitio")).toBeVisible();
		await expect(page.locator("main")).toHaveCount(1);
		// Nada del diseño anterior ni texto técnico.
		await expect(page.locator("main")).not.toContainText(/Plato no encontrado|Password|Service Worker|Error 40|stack/i);
		const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
		expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
	});
}

test("el 404 responde con estado 404", async ({ request }) => {
	expect((await request.get("/no-existe-esta-pagina")).status()).toBe(404);
});

test("/offline: «Reintentar» funciona sin JavaScript (formulario nativo)", async ({ browser }) => {
	const contexto = await browser.newContext({ javaScriptEnabled: false });
	const page = await contexto.newPage();
	await page.goto("/offline", { waitUntil: "load" });
	await expect(page.locator("form button[type=submit]")).toHaveText(/Reintentar/);
	await contexto.close();
});

// Revisión de las ilustraciones a 360 y 1440 px en los dos temas (D-21).
for (const tema of ["oscuro", "claro"] as const) {
	for (const ancho of [360, 1440]) {
		test(`capturas de las páginas de estado: ${ancho} px, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			for (const p of PAGINAS) {
				await abrir(page, p.ruta, { tema });
				await expect(page.locator(`[data-pagina-estado="${p.tipo}"]`)).toBeVisible();
				expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), p.ruta).toBe(false);
				await page
					.locator(`[data-pagina-estado="${p.tipo}"]`)
					.screenshot({ path: `test-results/sistema/${info.project.name}/${p.tipo}-${tema}-${ancho}.png`, animations: "disabled" });
			}
		});
	}
}
