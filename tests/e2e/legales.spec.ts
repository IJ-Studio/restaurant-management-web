import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Páginas legales y de ayuda (PLAN 4.22): de servidor, mismas URL, migas y la redacción de siempre.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const PAGINAS = [
	["/ayuda", "Ayuda"],
	["/condiciones", "Términos y condiciones"],
	["/corporativo", "Información corporativa"],
	["/devoluciones", "Cancelaciones y reembolsos"],
	["/privacidad", "Aviso de privacidad"],
	["/eliminar-cuenta", "Eliminar cuenta"],
	["/seguridad", "Alertas de seguridad"],
] as const;

for (const [ruta, titulo] of PAGINAS) {
	test(`${ruta}: en el HTML del servidor, con migas, título y secciones; axe sin violaciones`, async ({ page, request }) => {
		const html = await (await request.get(ruta)).text();
		expect(html).toContain(`<h1`);
		expect(html).toContain(titulo);
		await page.goto(ruta, { waitUntil: "load" });
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(titulo);
		await expect(page.getByRole("navigation", { name: "Migas de pan" }).locator('[aria-current="page"]')).toHaveText(titulo);
		expect(await page.getByRole("heading", { level: 2 }).count()).toBeGreaterThan(1);
		const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
		expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
	});
}

// D-36: el aviso sigue el texto del documento legal público (finalidades primarias y secundarias,
// derechos ARCO en 20 días hábiles) y no inventa los datos del responsable.
test("el aviso de privacidad sigue el texto legal público y marca los datos por confirmar", async ({ page }) => {
	await page.goto("/privacidad", { waitUntil: "load" });
	const main = page.locator("main");
	await expect(main.getByRole("heading", { name: "Finalidades primarias" })).toBeVisible();
	await expect(main.getByRole("heading", { name: "Finalidades secundarias" })).toBeVisible();
	await expect(main).toContainText("20 días hábiles");
	await expect(main.locator("[data-dato-pendiente]").first()).toHaveText("Dato por confirmar");
});
