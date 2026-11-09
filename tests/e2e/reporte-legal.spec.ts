import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// D-34 (reportar un problema) y D-36 (legal para México). Contra el build de producción.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

async function simularReportes(page: Page, status: number) {
	const enviados: unknown[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			if (new URL(p.url()).pathname.endsWith("/reportes-problemas")) {
				enviados.push(p.postDataJSON());
				return r.fulfill({ status, contentType: "application/json", body: status < 300 ? '{"success":true}' : "{}" });
			}
			await r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
		},
	);
	return enviados;
}

test("reportar un problema desde el pie: valida, envía tipo, descripción y ruta, y confirma solo con éxito del API", async ({ page }) => {
	const enviados = await simularReportes(page, 201);
	await page.goto("/privacidad", { waitUntil: "load" });
	await page.locator("footer").getByRole("button", { name: "Reportar un problema" }).click();
	const panel = page.getByRole("dialog", { name: "Reportar un problema" });
	await expect(panel).toContainText("/privacidad");
	await page.waitForTimeout(1100); // tiempo mínimo de rellenado del formulario
	await panel.getByRole("button", { name: "Enviar el reporte" }).click();
	await expect(panel.getByText("Elige qué tipo de problema es.")).toBeVisible();
	await panel.getByLabel("¿Qué pasó?").selectOption("no-funciona");
	await panel.getByLabel("Descripción").fill("El enlace del pie no abre.");
	await panel.getByRole("button", { name: "Enviar el reporte" }).click();
	await expect(panel.getByText("Gracias, ya nos llegó tu reporte.")).toBeVisible();
	expect(enviados).toEqual([{ tipo: "no-funciona", descripcion: "El enlace del pie no abre.", ruta: "/privacidad" }]);
});

test("si el API del reporte falla, lo dice con calidez, conserva el texto y nunca finge éxito", async ({ page }) => {
	await simularReportes(page, 404);
	await page.goto("/cookies", { waitUntil: "load" });
	await page.locator("footer").getByRole("button", { name: "Reportar un problema" }).click();
	const panel = page.getByRole("dialog", { name: "Reportar un problema" });
	await page.waitForTimeout(1100);
	await panel.getByLabel("¿Qué pasó?").selectOption("otro");
	await panel.getByLabel("Descripción").fill("Una prueba de texto largo.");
	await panel.getByRole("button", { name: "Enviar el reporte" }).click();
	// El mensaje también se anuncia en una región solo para lectores; aquí se mira la alerta visible.
	await expect(panel.getByRole("alert").getByText(/No pudimos enviar tu reporte/)).toBeVisible();
	await expect(panel.getByText("Gracias, ya nos llegó tu reporte.")).toHaveCount(0);
	await expect(panel.getByLabel("Descripción")).toHaveValue("Una prueba de texto largo.");
});

test("el reporte también está en la barra de los paneles, con el aviso del personal en la cuenta", async ({ browser }) => {
	const contexto = await browser.newContext({ storageState: archivoSesion("cocina"), viewport: { width: 390, height: 900 } });
	const page = await contexto.newPage();
	await simularReportes(page, 201);
	await page.goto("/dashboard/cocina", { waitUntil: "load" });
	await expect(page.locator('[data-prueba="barra-superior-panel"]').getByRole("button", { name: "Reportar un problema" })).toBeVisible();
	await page.locator('[data-prueba="abrir-cuenta-panel"]').click();
	await expect(page.getByRole("link", { name: "Aviso de privacidad del personal" })).toHaveAttribute("href", "/privacidad/personal");
	await contexto.close();
});

test("pie: nombre, teléfono, correo y enlaces legales; los datos del proveedor quedan en /corporativo", async ({ page }) => {
	await page.goto("/", { waitUntil: "load" });
	const pie = page.locator("footer");
	await expect(pie.locator('[data-prueba="datos-proveedor"]')).toHaveCount(0);
	await expect(pie).toContainText("+52 771 702 8172");
	await expect(pie.locator('[data-prueba="correo-contacto"]')).toBeVisible();
	for (const [nombre, href] of [
		["Términos y condiciones", "/condiciones"],
		["Aviso de privacidad", "/privacidad"],
		["Cookies", "/cookies"],
		["Eliminar cuenta", "/eliminar-cuenta"],
		["Cancelaciones y reembolsos", "/devoluciones"],
	])
		await expect(pie.getByRole("link", { name: nombre, exact: true })).toHaveAttribute("href", href);
	await page.goto("/corporativo", { waitUntil: "load" });
	await expect(page.locator("main")).toContainText("Razón social");
});

test("Google Play: /privacidad describe la app y enlaza a /eliminar-cuenta, que funciona sin sesión", async ({ page }) => {
	await page.goto("/privacidad", { waitUntil: "load" });
	await expect(page.locator("#app-movil")).toContainText("Restaurante El Quijote");
	await expect(page.locator("#eliminacion").getByRole("link", { name: "Eliminar cuenta" })).toHaveAttribute("href", "/eliminar-cuenta");
	await page.goto("/eliminar-cuenta", { waitUntil: "load" });
	await expect(page.getByRole("heading", { level: 1, name: "Eliminar cuenta" })).toBeVisible();
	await expect(page.locator("main")).toContainText("Restaurante El Quijote");
	await expect(page.locator("main")).toContainText("Qué se conserva");
});

test("registro y reserva: consentimientos con las casillas desmarcadas y enlace al aviso", async ({ page }) => {
	await page.goto("/register", { waitUntil: "load" });
	const terminos = page.getByRole("checkbox", { name: /Acepto los términos y condiciones/ });
	const promociones = page.getByRole("checkbox", { name: /Quiero recibir promociones/ });
	await expect(terminos).not.toBeChecked();
	await expect(promociones).not.toBeChecked();
	await expect(page.locator("main").getByRole("link", { name: "aviso de privacidad" })).toHaveAttribute("href", "/privacidad");
});

for (const ruta of ["/privacidad", "/privacidad/personal", "/eliminar-cuenta", "/condiciones", "/devoluciones", "/cookies", "/corporativo"]) {
	test(`${ruta}: texto legal sin violaciones de axe ni desbordes a 360 px`, async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 800 });
		await page.goto(ruta, { waitUntil: "load" });
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
		expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
		expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
	});
}
