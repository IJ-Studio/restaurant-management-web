import { test, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Pago del pedido (/menu/pedido/checkout, PLAN 4.14). Contra el build de producción, con el API
// simulado. Se recorren los cinco pasos y se paga con una tarjeta guardada que el backend da por
// cobrada (status "succeeded"), así que no hace falta confirmar con Stripe: la tarjeta nueva y
// 3-D Secure quedan como no verificados (sin claves de prueba, ver el 2.5).
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const PEDIDO = { id: "dom12345", estatus: "pendiente", total: "290.00", items: [{ id: 1, nombre: "Tortilla de patatas", cantidad: 2, precio: "110.00" }, { id: 2, nombre: "Pan con tomate", cantidad: 1, precio: "70.00" }] };
const DIRECCIONES = [{ id: 3, alias: "Casa", linea1: "Pzla. Hidalgo 5", colonia: "Centro", ciudad: "Huejutla", estado: "Hidalgo", codigoPostal: "43000", esPrincipal: true }];
const METODOS = [{ id: "pm_1", marca: "visa", ultimos4: "4242", mesExpiracion: 12, anioExpiracion: 2030, esPrincipal: true }];

async function abrir(browser: Browser, ruta: string, { direcciones = DIRECCIONES, preferencias = {} as Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("cliente") });
	const page = await contexto.newPage();
	const envios: { ruta: string; cuerpo: unknown }[] = [];
	// El API toma al cliente del token: toda llamada al API debe llevar la sesión.
	const sinToken: string[] = [];
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			if (!url.pathname.startsWith("/api/") && !p.headers()["authorization"]?.startsWith("Bearer ")) sinToken.push(`${p.method()} ${url.pathname}`);
			if (p.method() === "POST") {
				envios.push({ ruta: url.pathname, cuerpo: JSON.parse(p.postData() ?? "{}") });
				const cuerpo = url.pathname === "/pagos/crear-intento" ? { clientSecret: "pi_e2e_secret", status: "succeeded" } : url.pathname === "/direcciones" ? { id: 9, alias: "Casa" } : {};
				return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
			}
			let cuerpo: unknown = [];
			if (url.pathname.endsWith("/auth/me")) cuerpo = { user: { id: "41", name: "Prueba", roleId: 5 } };
			else if (url.pathname === "/pedidos/usuario") cuerpo = [PEDIDO];
			else if (url.pathname === "/direcciones") cuerpo = direcciones;
			else if (url.pathname === "/metodos-pago") cuerpo = METODOS;
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto(ruta, { waitUntil: "load" });
	return { contexto, page, envios, sinToken };
}
const continuar = (page: Page) => page.getByRole("button", { name: "Continuar" }).click();

test("los cinco pasos con la dirección y la tarjeta guardadas, el mismo payload de pago y la redirección", async ({ browser }) => {
	const { contexto, page, envios, sinToken } = await abrir(browser, "/menu/pedido/checkout?orderId=dom12345");
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pago");
	await expect(page.getByRole("list", { name: "Pasos del pago" }).locator('[aria-current="step"]')).toContainText("Resumen");
	await expect(page.locator("#paso-titulo")).toHaveText("Resumen de tu pedido");
	await expect(page.locator("section")).toContainText("$ 290");
	await continuar(page);
	await expect(page.getByRole("radio", { name: /Casa/ })).toBeChecked();
	await continuar(page);
	await expect(page.locator("#paso-titulo")).toHaveText("Factura");
	await continuar(page);
	await expect(page.getByRole("radio", { name: /4242/ })).toBeChecked();
	await continuar(page);
	await expect(page.locator("#paso-titulo")).toHaveText("Confirma tu pedido");
	// D-36: sin aceptar los términos no se paga; la casilla empieza desmarcada.
	await page.getByRole("button", { name: "Pagar $ 290" }).click();
	await expect(page.getByText("Para pagar, acepta los términos y condiciones.")).toBeVisible();
	expect(envios).toEqual([]);
	await page.getByRole("checkbox", { name: /acepto los términos y condiciones/i }).check();
	await page.getByRole("button", { name: "Pagar $ 290" }).click();
	await expect(page).toHaveURL(/\/menu\/pedido\/checkout\/exito\?ordenId=dom12345$/);
	expect(envios).toEqual([{ ruta: "/pagos/crear-intento", cuerpo: { ordenId: "dom12345", direccionId: 3, metodoPagoGuardadoId: "pm_1" } }]);
	expect(sinToken).toEqual([]);
	await contexto.close();
});

test("dirección nueva: etiquetas, autocomplete, errores por campo y se guarda con el mismo payload", async ({ browser }) => {
	const { contexto, page, envios } = await abrir(browser, "/menu/pedido/checkout?orderId=dom12345", { direcciones: [] });
	await continuar(page);
	await expect(page.getByLabel("Calle y número")).toHaveAttribute("autocomplete", "address-line1");
	await expect(page.getByLabel("Código postal")).toHaveAttribute("autocomplete", "postal-code");
	await expect(page.getByLabel("Código postal")).toHaveAttribute("inputmode", "numeric");
	await continuar(page);
	await expect(page.locator("section").getByRole("alert").first()).toBeVisible();
	await expect(page.getByLabel("Calle y número")).toHaveAttribute("aria-invalid", "true");
	await expect(page.getByText("La calle y número son requeridos.")).toBeVisible();
	await page.getByLabel("Calle y número").fill("Juárez 12");
	await page.getByLabel("Colonia").fill("Centro");
	await page.getByLabel("Ciudad").fill("Huejutla");
	await page.getByLabel("Estado").fill("Hidalgo");
	await page.getByLabel("Código postal").fill("43000");
	await continuar(page);
	await expect(page.locator("#paso-titulo")).toHaveText("Factura");
	expect(envios[0]).toEqual({
		ruta: "/direcciones",
		cuerpo: { alias: "Casa", linea1: "Juárez 12", linea2: "", colonia: "Centro", ciudad: "Huejutla", estado: "Hidalgo", codigoPostal: "43000", referencias: "" },
	});
	await contexto.close();
});

test("factura: RFC y correo fiscal se comprueban; el correo vacío vale", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, "/menu/pedido/checkout?orderId=dom12345");
	await continuar(page);
	await continuar(page);
	await page.getByLabel("Necesito factura de esta compra").check();
	await page.getByLabel("RFC").fill("abc");
	await page.getByLabel("Correo para enviarte la factura (opcional)").fill("no-es-correo");
	await continuar(page);
	await expect(page.getByLabel("RFC")).toHaveAttribute("aria-invalid", "true");
	await expect(page.getByLabel("Correo para enviarte la factura (opcional)")).toHaveAttribute("aria-invalid", "true");
	await page.getByLabel("RFC").fill("XAXX010101000");
	await page.getByLabel("Razón social").fill("Público en general");
	await page.getByLabel("Régimen fiscal").selectOption("616");
	await page.getByLabel("Código postal fiscal").fill("43000");
	await page.getByLabel("Correo para enviarte la factura (opcional)").fill("");
	await continuar(page);
	await expect(page.locator("#paso-titulo")).toHaveText("¿Cómo quieres pagar?");
	await contexto.close();
});

test("sin el pedido: un estado cálido con salida a tu pedido", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, "/menu/pedido/checkout?orderId=no-existe");
	await expect(page.locator("main").getByRole("alert")).toContainText("No encontramos este pedido");
	await expect(page.getByRole("link", { name: "Volver a tu pedido" }).last()).toHaveAttribute("href", "/menu/pedido?tab=domicilio");
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe en el paso de la dirección nueva, sin desbordar: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, "/menu/pedido/checkout?orderId=dom12345", { direcciones: [], preferencias: { tema, tamanoTexto } });
			await page.setViewportSize({ width: ancho, height: 900 });
			await continuar(page);
			await expect(page.getByLabel("Calle y número")).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const fuera = await page.evaluate(() =>
				document.documentElement.scrollWidth <= document.documentElement.clientWidth
					? []
					: [...document.querySelectorAll("main *")]
					.filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
					.slice(0, 5)
					.map((e) => `${e.tagName}.${String(e.getAttribute("class")).slice(0, 60)} «${(e.textContent ?? "").trim().slice(0, 30)}»`),
			);
			expect(fuera).toEqual([]);
			await page.screenshot({ path: `test-results/checkout/${info.project.name}/checkout-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}

// PLAN 4.15: confirmación del pago, con la factura en PDF y XML si existe.
test("confirmación: sello, mensaje sin promesas y descarga de la factura con la sesión", async ({ browser }) => {
	const contexto = await browser.newContext({ storageState: archivoSesion("cliente") });
	const page = await contexto.newPage();
	const sinToken: string[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/facturas/"),
		(r) => {
			const p = r.request();
			if (!p.headers()["authorization"]?.startsWith("Bearer ")) sinToken.push(new URL(p.url()).pathname);
			if (p.url().includes("/descargar")) return r.fulfill({ status: 200, contentType: "application/pdf", body: "%PDF-1.4 e2e" });
			return r.fulfill({ status: 200, contentType: "application/json", body: '{"id":1}' });
		},
	);
	await page.goto("/menu/pedido/checkout/exito?ordenId=dom12345", { waitUntil: "load" });
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gracias, tu pedido está pagado");
	await expect(page.locator("main")).not.toContainText(/Cargando|Te avisaremos/);
	const descarga = page.waitForEvent("download");
	await page.getByRole("button", { name: "Factura en PDF" }).click();
	expect((await descarga).suggestedFilename()).toBe("factura-dom12345.pdf");
	expect(sinToken).toEqual([]);
	await expect(page.getByRole("link", { name: "Ver tu pedido" })).toHaveAttribute("href", "/menu/pedido?tab=domicilio");
	const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
	expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
	await contexto.close();
});
