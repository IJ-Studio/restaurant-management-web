import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Detalle de un plato (PLAN 4.12, D-20 y D-21). Contra el build de producción, con el API
// simulado desde el navegador. La lógica (endpoints, payloads, redirecciones) no cambia.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const PLATO = {
	id: 7,
	nombre: "Paella de mariscos",
	precio: "380.00",
	descripcion: "Arroz bomba, sofrito lento y caldo de pescado.",
	descripcionCorta: "Para compartir.",
	alergenos: ["marisco", "pescado"],
	categoria: { nombre: "Arroces" },
	disponible: true,
	esNuevo: true,
	imagenUrl: "image_l57jar",
};
const COMBO = { disponible: true, confianza: 42, precioCombo: 90, sugerido: { id: 9, nombre: "Crema catalana", precio: 110 } };

interface Opciones {
	plato?: number | object;
	pedido?: number;
	preferencias?: Record<string, string>;
}

async function abrir(page: Page, ruta: string, { plato = PLATO, pedido = 200, preferencias = {} }: Opciones = {}) {
	const pedidos: unknown[] = [];
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			// Las peticiones RSC de la navegación de Next no son del API: si se simularan, Next recargaría la página.
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const { pathname } = new URL(p.url());
			if (pathname.endsWith("/pedidos/mesa") && p.method() === "POST") {
				pedidos.push(JSON.parse(p.postData() ?? "{}"));
				const cuerpo = pedido === 200 ? { mesaId: "5" } : { message: "violates foreign key constraint" };
				return r.fulfill({ status: pedido, contentType: "application/json", body: JSON.stringify(cuerpo) });
			}
			if (pathname === "/menu/items/7") {
				if (typeof plato === "number") return r.fulfill({ status: plato, body: "" });
				return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(plato) });
			}
			let cuerpo: unknown = [];
			if (pathname.endsWith("/auth/me")) cuerpo = { user: { id: "41", name: "Prueba", roleId: 5 } };
			else if (pathname.includes("/recommendations/combo/")) cuerpo = COMBO;
			else if (pathname.endsWith("/mesas")) cuerpo = [{ id: 1, numero: "4" }, { id: 2, numero: "5" }];
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto(ruta, { waitUntil: "load" });
	return pedidos;
}

test("ficha del plato: contraetiqueta, insignias, combo y migas", async ({ page }) => {
	await abrir(page, "/menu/producto/7");
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Paella de mariscos");
	await expect(page.getByRole("navigation", { name: "Migas de pan" }).locator('[aria-current="page"]')).toHaveText("Paella de mariscos");
	const dd = page.locator("main dl").first().locator("dd");
	await expect(dd).toHaveText(["Arroces", "$ 380 IVA incluido", "marisco, pescado"]);
	await expect(page.getByText("Nuevo", { exact: true })).toBeVisible();
	await expect(page.getByRole("region", { name: "Arma tu combo" })).toContainText("El 42 % de los pedidos");
	await expect(page.locator("main")).not.toContainText(/Vacío|Sin fotografía|Popular/);
	expect(await page.locator("main").textContent()).not.toMatch(/\p{Extended_Pictographic}/u);
});

test("cantidad entre 1 y 20 con botones accesibles", async ({ page }) => {
	await abrir(page, "/menu/producto/7");
	const quitar = page.getByRole("button", { name: "Quitar uno" });
	await expect(quitar).toHaveAttribute("aria-disabled", "true");
	await page.getByRole("button", { name: "Añadir uno" }).click();
	await expect(page.locator("output")).toHaveText("2");
	await quitar.click();
	await expect(page.locator("output")).toHaveText("1");
});

test("pedir en mesa: diálogo con las mesas, mismo payload, notificación y redirección", async ({ browser }) => {
	const contexto = await browser.newContext({ storageState: archivoSesion("cliente") });
	const page = await contexto.newPage();
	const pedidos = await abrir(page, "/menu/producto/7");
	await page.getByRole("button", { name: "Añadir uno" }).click();
	await page.getByRole("button", { name: "Pedir en mesa" }).click();
	const dialogo = page.getByRole("dialog", { name: "¿En qué mesa estás?" });
	await expect(dialogo).toBeVisible();
	// La opción es la etiqueta entera (el radio va oculto a la vista y sigue en el tabulador).
	await dialogo.locator("label", { hasText: "5" }).click();
	await expect(dialogo.getByRole("radio", { name: /5/ })).toBeChecked();
	await dialogo.getByRole("button", { name: "Confirmar mesa" }).click();
	await expect.poll(() => pedidos.length).toBe(1);
	expect(pedidos[0]).toEqual({ platilloId: 7, cantidad: 2, usuarioId: 41, mesa: "5" });
	await expect(page).toHaveURL(/\/menu\/pedido\?mesaQuery=5&tab=mesa$/);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Añadido a tu pedido");
	await contexto.close();
});

test("si el pedido falla: aviso cálido en la página, sin el mensaje del servidor ni alert()", async ({ browser }) => {
	const contexto = await browser.newContext({ storageState: archivoSesion("cliente") });
	const page = await contexto.newPage();
	let alerta = false;
	page.on("dialog", (d) => {
		alerta = true;
		void d.dismiss();
	});
	await abrir(page, "/menu/producto/7", { pedido: 500 });
	await page.getByRole("button", { name: "Para domicilio" }).click();
	await expect(page.locator("main").getByRole("alert")).toContainText("No pudimos añadirlo a tu pedido");
	await expect(page.locator("main")).not.toContainText(/foreign key|HTTP|500/);
	expect(alerta).toBe(false);
	await contexto.close();
});

test("plato que no existe: página de estado con su ilustración", async ({ page }) => {
	await abrir(page, "/menu/producto/7", { plato: 404 });
	const estado = page.locator('[data-pagina-estado="no-encontrado"]');
	await expect(estado.getByRole("heading", { level: 1 })).toHaveText("Este plato ya no está en la carta");
	await expect(estado.getByRole("link", { name: "Ver la carta" })).toHaveAttribute("href", "/menu");
});

test("si falla la carga: error cálido y «Reintentar»", async ({ page }) => {
	await abrir(page, "/menu/producto/7", { plato: 502 });
	await expect(page.locator("main").getByRole("alert")).toContainText("No pudimos traer este plato");
	await expect(page.locator("main")).not.toContainText(/Error al|Intenta más tarde|502|Cargando/);
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[1024, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, "/menu/producto/7", { preferencias: { tema, tamanoTexto } });
			await expect(page.getByRole("heading", { level: 1 })).toHaveText("Paella de mariscos");
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/producto/${info.project.name}/producto-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
		});
	}
}
