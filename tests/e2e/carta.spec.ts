import { test, expect, type Page, type Route } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { simularApi } from "./utilidades/api-simulada";

// La carta (/menu, PLAN 4.10, D-20). Contra el build de producción; la página pide los datos
// desde el navegador al API (/menu/categories/with-products), así que aquí se simulan con datos, error y espera.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const foto = (id: string) => `https://res.cloudinary.com/dcb1tspbj/image/upload/v1/${id}.jpg`;
const CARTA = [
	{
		id: 1,
		nombre: "Entrantes",
		platillos: [
			{ id: 11, nombre: "Croquetas de jamón", descripcion: "Bechamel cremosa y jamón curado.", precio: "120.00", imagenUrl: "image_l57jar" },
			{ id: 12, nombre: "Pan con tomate", precio: 60 },
			{ id: 13, nombre: "Pimientos de padrón", precio: 90 },
			{ id: 14, nombre: "Tortilla de patatas", precio: 110 },
			{ id: 15, nombre: "Gambas al ajillo", precio: 180 },
		],
	},
	{ id: 2, nombre: "Arroces", imagenUrl: foto("no-existe"), platillos: [{ id: 21, nombre: "Paella de mariscos", precio: 380 }] },
];

async function abrir(page: Page, responder: (ruta: Route) => Promise<void>, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await simularApi(page);
	await page.route("**/menu/categories/with-products", responder);
	await page.goto("/menu", { waitUntil: "load" });
}
const conDatos = (ruta: Route) => ruta.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(CARTA) });

test("secciones con sus platos, precios, enlaces de siempre y migas", async ({ page }) => {
	await abrir(page, conDatos);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("La carta");
	await expect(page.getByRole("navigation", { name: "Migas de pan" })).toContainText("Inicio");
	await expect(page.getByRole("link", { name: "Volver a «Menú»" })).toHaveAttribute("href", "/#menu");
	const entrantes = page.locator("section#seccion-1");
	await expect(entrantes.getByRole("heading", { level: 2 })).toHaveText("Entrantes");
	// Cuatro platos por sección y el enlace a la categoría con su formato de siempre.
	await expect(entrantes.getByRole("link", { name: /Croquetas de jamón/ })).toHaveAttribute("href", "/menu/producto/11");
	await expect(entrantes.locator('a[href^="/menu/producto/"]')).toHaveCount(4);
	await expect(entrantes.getByText("$ 120")).toBeVisible();
	await expect(entrantes.getByRole("link", { name: /Ver toda la sección \(5\)/ })).toHaveAttribute("href", "/menu/categoria/1?bg=");
	// Sección sin foto válida: el respaldo de Imagen, nunca una caja rota.
	await expect(page.locator("section#seccion-2 [data-respaldo-imagen], section#seccion-2 img")).toHaveCount(1);
	await expect(page.getByRole("navigation", { name: "Secciones de la carta" }).getByRole("link")).toHaveText(["Entrantes", "Arroces"]);
});

test("buscar sin tildes ni mayúsculas, anunciar el resultado y volver a la carta", async ({ page }) => {
	await abrir(page, conDatos);
	const campo = page.getByRole("searchbox", { name: "Buscar en la carta" });
	// Con la carta pintada, React ya controla el campo (en WebKit, escribir antes se perdía).
	await expect(page.locator("section#seccion-1")).toBeVisible();
	await campo.fill("JAMON");
	await expect(page.getByRole("list", { name: "Resultados para «JAMON»" }).getByRole("link")).toHaveText(["Croquetas de jamón"]);
	await expect(page.getByText("1 plato", { exact: true })).toBeAttached();
	await campo.fill("cocido");
	await expect(page.getByRole("heading", { name: "Ningún plato coincide con «cocido»" })).toBeVisible();
	await page.getByRole("button", { name: "Ver toda la carta" }).click();
	await expect(campo).toHaveValue("");
	await expect(page.locator("section#seccion-1")).toBeVisible();
});

test("mientras carga, esqueletos y ningún texto de proceso visible", async ({ page }) => {
	let soltar: () => void = () => {};
	const espera = new Promise<void>((r) => (soltar = r));
	await abrir(page, async (ruta) => {
		await espera;
		await conDatos(ruta);
	});
	await expect(page.locator("[aria-busy=true] .esqueleto").first()).toBeVisible();
	await expect(page.locator("main")).not.toContainText(/Cargando/);
	soltar();
	await expect(page.locator("section#seccion-1")).toBeVisible();
});

test("si falla: error cálido sin texto técnico, y «Reintentar» vuelve a pedirla", async ({ page }) => {
	let intentos = 0;
	await abrir(page, async (ruta) => {
		intentos++;
		if (intentos === 1) await ruta.fulfill({ status: 500, contentType: "application/json", body: '{"error":"Error interno en el servidor proxy de rutas"}' });
		else await conDatos(ruta);
	});
	const alerta = page.locator("main").getByRole("alert");
	await expect(alerta).toContainText("No pudimos traer la carta");
	await expect(page.locator("main")).not.toContainText(/Error|servidor|proxy|Intenta más tarde|500/);
	await expect(page.getByRole("link", { name: "Llamar al restaurante" })).toHaveAttribute("href", "tel:+527717028172");
	await page.getByRole("button", { name: "Reintentar" }).click();
	await expect(page.locator("section#seccion-1")).toBeVisible();
	expect(intentos).toBe(2);
});

test("carta vacía: un estado honesto, sin cero ni hueco", async ({ page }) => {
	await abrir(page, (ruta) => ruta.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
	await expect(page.getByRole("heading", { name: "Todavía no hay platos publicados" })).toBeVisible();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[390, "normal"],
		[768, "normal"],
		[1024, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}, texto ${tamanoTexto}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, conDatos, { tema, tamanoTexto });
			await expect(page.locator("section#seccion-1")).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/carta/${info.project.name}/carta-${tema}-${ancho}-${tamanoTexto}.png`, fullPage: true, animations: "disabled" });
		});
	}
}

// Prioridad 4.2: al bajar por la carta, las migas y «Volver» siguen arriba, a la vista.
test("las migas y «Volver» quedan fijas arriba al bajar por la carta", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 700 });
	await abrir(page, conDatos);
	await expect(page.locator("section#seccion-1")).toBeVisible();
	// Hasta la última sección de la carta (más abajo empieza el pie y el encabezado deja de acompañar).
	await page.locator("main section[id^=\"seccion-\"]").last().scrollIntoViewIfNeeded();
	const migas = page.getByRole("navigation", { name: "Migas de pan" });
	await expect(migas).toBeInViewport();
	// Justo bajo la cabecera fija, no tapadas por ella.
	const caja = await migas.boundingBox();
	const cabecera = await page.locator("header").first().boundingBox();
	expect(caja!.y).toBeGreaterThanOrEqual(Math.floor(cabecera!.y + cabecera!.height) - 1);
	expect(caja!.y).toBeLessThan(200);
	await expect(page.getByRole("link", { name: /Volver/ }).or(page.getByRole("button", { name: /Volver/ })).first()).toBeInViewport();
});
