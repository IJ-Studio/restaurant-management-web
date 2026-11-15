import { test, expect, type BrowserContext, type Page } from "@playwright/test";

// Pago a domicilio con Stripe en modo de prueba, de punta a punta: la web en :3000, el API local real y
// Stripe test (tarjetas oficiales de prueba). Sin `stripe listen` el webhook no llega al API local: aquí
// se comprueba lo que ve el cliente; el cambio a «pagada» por webhook lo cubre el API (#164).
const API = process.env.API_URL ?? "http://localhost:10000";
const CLAVE = process.env.CLAVE_PRUEBAS ?? "Prueba#2026";
const CAPTURAS = process.env.CAPTURAS ?? "test-results/integracion/capturas";

test.skip(!/^http:\/\/(localhost|127\.0\.0\.1)/.test(API), "solo contra el API local con Stripe en modo test");
test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

let sesion: Awaited<ReturnType<BrowserContext["storageState"]>>;
let token: string;

test.beforeAll(async ({ browser }) => {
	const page = await browser.newPage();
	await page.goto("/login");
	await page.getByLabel("Correo").fill("cliente@prueba.local");
	await page.getByLabel("Contraseña").fill(CLAVE);
	await page.getByRole("button", { name: "Iniciar sesión" }).click();
	await page.waitForURL((u) => !u.pathname.startsWith("/login"));
	token = (await page.evaluate(() => localStorage.getItem("authToken")))!;
	sesion = await page.context().storageState();
	await page.close();
});

/** Pedido a domicilio pendiente del cliente (el carrito), con un platillo disponible. */
async function pedidoPendiente() {
	const menu = (await (await fetch(`${API}/menu`)).json()) as { id: number; disponible: boolean }[];
	const r = await fetch(`${API}/pedidos/mesa`, {
		method: "POST",
		headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
		body: JSON.stringify({ platilloId: menu.find((p) => p.disponible)!.id, cantidad: 1 }),
	});
	expect(r.status).toBe(201);
	return ((await r.json()) as { ordenId: string }).ordenId;
}

async function hastaPagar(page: Page, ordenId: string, tarjeta: string) {
	await page.goto(`/menu/pedido/checkout?orderId=${ordenId}`);
	const continuar = page.getByRole("button", { name: /^Continuar$/i });
	await expect(page.locator("#paso-titulo")).toHaveText("Resumen de tu pedido", { timeout: 60_000 });
	await continuar.click();
	await expect(page.locator("#paso-titulo")).toHaveText("¿A dónde te lo llevamos?");
	if (await page.getByRole("radio").count()) await page.getByRole("radio").first().check();
	if (await page.getByLabel("Calle y número").count()) {
		await page.getByLabel("Calle y número").fill("Calle Hidalgo 5");
		await page.getByLabel("Colonia").fill("Centro");
		await page.getByLabel("Ciudad").fill("Huejutla");
		await page.getByLabel("Estado").fill("Hidalgo");
		await page.getByLabel("Código postal", { exact: true }).fill("43000");
	}
	await continuar.click();
	await expect(page.locator("#paso-titulo")).toHaveText("Factura");
	await continuar.click();
	await expect(page.locator("#paso-titulo")).toHaveText("¿Cómo quieres pagar?");
	// Tarjeta nueva en el iframe de Stripe Elements (nunca pasa por la web ni por el API).
	const tarjetaNueva = page.getByRole("radio", { name: /nueva/i });
	if (await tarjetaNueva.count()) await tarjetaNueva.check();
	const frame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
	await frame.locator('[name="cardnumber"]').fill(tarjeta);
	await frame.locator('[name="exp-date"]').fill("12 / 34");
	await frame.locator('[name="cvc"]').fill("123");
	if (await frame.locator('[name="postal"]').count()) await frame.locator('[name="postal"]').fill("43000");
	await continuar.click();
	await expect(page.locator("#paso-titulo")).toHaveText("Confirma tu pedido");
	await page.getByRole("checkbox", { name: /acepto los términos/i }).check();
	await page.getByRole("button", { name: /^Pagar/i }).click();
}

test("tarjeta aprobada (4242…): el cliente llega a la página de éxito", async ({ browser }) => {
	const page = await (await browser.newContext({ storageState: sesion })).newPage();
	const ordenId = await pedidoPendiente();
	await hastaPagar(page, ordenId, "4242 4242 4242 4242");
	await page.waitForURL(new RegExp(`/menu/pedido/checkout/exito\\?ordenId=${ordenId}`), { timeout: 60_000 });
	await page.screenshot({ path: `${CAPTURAS}/pago-aprobado.png`, fullPage: true });
});

test("fondos insuficientes (…9995): se queda en el pago con el motivo de Stripe", async ({ browser }) => {
	const page = await (await browser.newContext({ storageState: sesion })).newPage();
	const ordenId = await pedidoPendiente();
	await hastaPagar(page, ordenId, "4000 0000 0000 9995");
	await expect(page.getByText(/fondos|insufficient/i).first()).toBeVisible({ timeout: 60_000 });
	expect(page.url()).not.toContain("/exito");
	await page.screenshot({ path: `${CAPTURAS}/pago-fondos-insuficientes.png`, fullPage: true });
});

test("3D Secure (…3184): el banco pide autenticar y al aprobar se completa el pago", async ({ browser }) => {
	const page = await (await browser.newContext({ storageState: sesion })).newPage();
	const ordenId = await pedidoPendiente();
	await hastaPagar(page, ordenId, "4000 0027 6000 3184");
	// Página de prueba de Stripe en iframes anidados: se busca el botón «Complete» en cualquiera y se
	// pulsa cuando ya está lista (el primer clic puede llegar antes de que cargue).
	const boton = async () => {
		for (const f of page.frames()) {
			const b = f.getByRole("button", { name: "Complete", exact: true });
			if (await b.isVisible().catch(() => false)) return b;
		}
		return null;
	};
	await expect.poll(boton, { timeout: 60_000 }).not.toBeNull();
	await page.screenshot({ path: `${CAPTURAS}/pago-3ds-desafio.png`, fullPage: true });
	for (let intento = 0; intento < 5 && (await boton()); intento++) {
		await page.waitForTimeout(1_500);
		await (await boton())?.click().catch(() => {});
	}
	await page.waitForURL(/\/menu\/pedido\/checkout\/exito/, { timeout: 60_000 });
	await page.screenshot({ path: `${CAPTURAS}/pago-3ds-aprobado.png`, fullPage: true });
});
