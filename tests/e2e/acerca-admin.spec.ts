import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Acerca del restaurante en el panel (PLAN 5.15). Contra el build de producción, con sesión de admin.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(browser: Browser, ancho = 1440, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	const externas: string[] = [];
	page.on("request", (r) => {
		if (/unsplash|pixabay|pravatar/.test(r.url())) externas.push(r.url());
	});
	await page.goto("/dashboard/admin/about", { waitUntil: "load" });
	return { contexto, page, externas };
}

test("datos de ejemplo avisados, sin «Guardar» falso ni vista previa, y sin imágenes de terceros", async ({ browser }) => {
	const { contexto, page, externas } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByText("Pantalla con datos de ejemplo.")).toBeVisible();
	await expect(main.getByRole("button", { name: /Guardar|Vista previa/ })).toHaveCount(0);
	await expect(main.getByText("Sin fotos todavía")).toBeVisible();
	expect(externas).toEqual([]);
	await contexto.close();
});

test("la galería solo admite fotos propias; horario y características se editan", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await main.getByLabel("Dirección de la foto").fill("https://images.unsplash.com/photo-1.jpg");
	await main.getByRole("button", { name: "Añadir foto" }).click();
	await expect(main.getByLabel("Dirección de la foto")).toHaveAttribute("aria-invalid", "true");
	await main.getByLabel("Dirección de la foto").fill("https://res.cloudinary.com/dcb1tspbj/image/upload/v1/sala.jpg");
	await main.getByLabel("Pie de foto").fill("La sala");
	await main.getByRole("button", { name: "Añadir foto" }).click();
	await expect(main.getByRole("list", { name: "Fotos de la galería" }).getByRole("listitem")).toHaveCount(1);

	const lunes = main.getByRole("listitem").filter({ hasText: "Lunes" });
	await lunes.getByLabel("Cerrado").check();
	await expect(main.getByLabel("Abre el lunes")).toBeDisabled();

	await main.getByLabel("Nueva característica").fill("Terraza");
	await main.getByLabel("Nueva característica").press("Enter");
	await expect(main.getByRole("list", { name: "Lo que ofrece la casa" })).toContainText("Terraza");
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, ancho, { tema, tamanoTexto });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/acerca-admin/${info.project.name}/acerca-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
