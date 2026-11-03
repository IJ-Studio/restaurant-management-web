import { test, expect, type Page, type Route } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { simularApi } from "./utilidades/api-simulada";

// Una sección de la carta (/menu/categoria/[slug], PLAN 4.11, D-20 y D-21). Contra el build de
// producción, con /menu/categories/with-products simulado desde el navegador.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const CARTA = [
	{
		id: 7,
		nombre: "Arroces",
		descripcion: "Arroces secos y melosos, para compartir.",
		platillos: [
			{ id: 71, nombre: "Paella de mariscos", descripcion: "Bomba, sofrito y caldo de pescado.", precio: "380.00", imagenUrl: "food-3955317_1280_zstvf7.jpg" },
			{ id: 72, name: "Arroz negro", price: 340, available: false },
		],
	},
	{ id: 8, name: "Postres", products: [] },
];

async function abrir(page: Page, slug: string, responder: (r: Route) => Promise<void>, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await simularApi(page);
	await page.route("**/menu/categories/with-products", responder);
	await page.goto(`/menu/categoria/${slug}`, { waitUntil: "load" });
}
const conDatos = (r: Route) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(CARTA) });

test("los platos de la sección, con migas, precio, agotado y enlace al detalle", async ({ page }) => {
	await abrir(page, "7", conDatos);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Arroces");
	await expect(page.getByText("Arroces secos y melosos, para compartir.")).toBeVisible();
	const migas = page.getByRole("navigation", { name: "Migas de pan" });
	await expect(migas.getByRole("link")).toHaveText(["Inicio", "La carta"]);
	await expect(migas.locator('[aria-current="page"]')).toHaveText("Arroces");
	const platos = page.getByRole("list", { name: "Platos de Arroces" }).getByRole("listitem");
	await expect(platos).toHaveCount(2);
	await expect(platos.first().getByRole("link", { name: "Paella de mariscos" })).toHaveAttribute("href", "/menu/producto/71");
	await expect(platos.first()).toContainText("$\u00a0380");
	// Los nombres en inglés siguen valiendo; agotado se dice con texto.
	await expect(platos.nth(1).getByRole("link", { name: "Arroz negro" })).toHaveAttribute("href", "/menu/producto/72");
	await expect(platos.nth(1)).toContainText("Agotado");
	await expect(platos.nth(1).locator("[data-respaldo-imagen]")).toHaveCount(1);
	// La tarjeta entera responde: el clic en la foto lleva al detalle.
	const foto = await platos.first().locator("img").boundingBox();
	await page.mouse.click(foto!.x + foto!.width / 2, foto!.y + foto!.height / 2);
	await expect(page).toHaveURL(/\/menu\/producto\/71$/);
});

test("sección vacía: estado honesto y salida a la carta", async ({ page }) => {
	await abrir(page, "8", conDatos);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Postres");
	await expect(page.getByRole("heading", { name: "Esta sección todavía no tiene platos publicados" })).toBeVisible();
});

test("sección que no existe: página de estado con su ilustración y sin texto técnico", async ({ page }) => {
	await abrir(page, "999", conDatos);
	const estado = page.locator('[data-pagina-estado="no-encontrado"]');
	await expect(estado.getByRole("heading", { level: 1 })).toHaveText("Esta sección de la carta no existe");
	await expect(estado.locator('svg[data-ilustracion="plato-cloche"]')).toHaveAttribute("aria-hidden", "true");
	await expect(estado.getByRole("link", { name: "Ver la carta" })).toHaveAttribute("href", "/menu");
});

test("si falla: error cálido, «Reintentar» vuelve a pedirla", async ({ page }) => {
	let intentos = 0;
	await abrir(page, "7", async (r) => {
		intentos++;
		if (intentos === 1) await r.fulfill({ status: 503, body: "Service Unavailable" });
		else await conDatos(r);
	});
	await expect(page.locator("main").getByRole("alert")).toContainText("No pudimos traer esta sección");
	await expect(page.locator("main")).not.toContainText(/Error|Intenta más tarde|503|Unavailable|Cargando/);
	await page.getByRole("button", { name: "Reintentar" }).click();
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Arroces");
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, "7", conDatos, { tema, tamanoTexto });
			await expect(page.getByRole("heading", { level: 1 })).toHaveText("Arroces");
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/categoria/${info.project.name}/categoria-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
		});
	}
}
