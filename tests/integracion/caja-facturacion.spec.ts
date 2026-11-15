import { test, expect, type Page } from "@playwright/test";

// Caja y facturación de punta a punta contra el API local real (ver playwright.integracion.config.ts):
// una cuenta de $100.01 dividida entre 3 con efectivo y tarjeta, la factura pedida desde caja,
// emitida y cancelada por el administrador en el sandbox de Facturapi, y el corte con su diferencia.
const API = process.env.API_URL ?? "http://localhost:10000";
const CLAVE = process.env.CLAVE_PRUEBAS ?? "Prueba#2026";
const PLATILLO = Number(process.env.PLATILLO_CENTAVOS);
const CAPTURAS = process.env.CAPTURAS ?? "test-results/integracion/capturas";
const MESA = process.env.MESA ?? "P32";

test.skip(!/^http:\/\/(localhost|127\.0\.0\.1)/.test(API) || !(PLATILLO > 0), "solo contra el API local con datos de prueba");

// Un inicio de sesión por rol: el API admite 5 por minuto.
const tokens = new Map<string, Promise<string>>();
function token(rol: string) {
	if (!tokens.has(rol))
		tokens.set(
			rol,
			fetch(`${API}/auth/sign-in`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: `${rol}@prueba.local`, password: CLAVE }) })
				.then((r) => r.json() as Promise<{ accessToken: string }>)
				.then((d) => d.accessToken),
		);
	return tokens.get(rol)!;
}
async function api(rol: string, metodo: string, ruta: string, cuerpo?: unknown) {
	const r = await fetch(`${API}${ruta}`, {
		method: metodo,
		headers: { "content-type": "application/json", authorization: `Bearer ${await token(rol)}` },
		body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
	});
	return (await r.json()) as Record<string, unknown>;
}

/** Mesa levantada por el mesero, preparada por cocina y entregada: queda «por cobrar». */
async function cuentaEntregada() {
	const creada = await api("mesero", "POST", "/pedidos/mesa", { mesa: MESA, numComensales: 3, items: [{ platilloId: PLATILLO, cantidad: 1 }] });
	const id = String(creada.ordenId);
	await api("mesero", "POST", `/pedidos/confirmar/${id}`, {});
	await api("cocina", "PATCH", `/pedidos/${id}/estatus`, { estatus: "lista" });
	await api("mesero", "PATCH", `/pedidos/${id}/estatus`, { estatus: "entregada" });
	return id;
}

async function entrar(page: Page, rol: string) {
	await page.context().clearCookies();
	await page.goto("/login");
	await page.getByLabel("Correo").fill(`${rol}@prueba.local`);
	await page.getByLabel("Contraseña").fill(CLAVE);
	await page.getByRole("button", { name: "Iniciar sesión" }).click();
	await page.waitForURL(/\/dashboard/);
}

const captura = (page: Page, nombre: string) => page.screenshot({ path: `${CAPTURAS}/${nombre}.png`, fullPage: false });

test("cuenta de $100.01 entre 3 con efectivo y tarjeta, factura desde caja, emisión, cancelación y corte", async ({ page }) => {
	const cuenta = await cuentaEntregada();

	await entrar(page, "cajero");
	await page.goto("/dashboard/cajero");
	const main = page.locator("main");
	// Caja abierta con fondo de $500 para que el corte cuente estos cobros.
	await expect(main.getByRole("button", { name: /^(Abrir|Cerrar) caja$/ })).toBeVisible();
	if (await main.getByRole("button", { name: "Abrir caja" }).isVisible()) {
		await main.getByRole("button", { name: "Abrir caja" }).click();
		const abrir = page.getByRole("dialog", { name: "Abrir caja" });
		await abrir.getByLabel("Fondo inicial").fill("500");
		await abrir.getByRole("button", { name: "Abrir caja" }).click();
		await expect(abrir).toBeHidden();
	}

	const cobrar = () => main.getByRole("button", { name: new RegExp(`^Cobrar .* de Mesa ${MESA}$`) });
	const pagos: [string, string, string][] = [
		["3", "EFECTIVO", "33.34"],
		["2", "TARJETA", "33.34"],
		["1", "EFECTIVO", "33.33"],
	];
	for (const [i, [personas, metodo, parte]] of pagos.entries()) {
		await cobrar().click();
		const dialogo = page.getByRole("dialog", { name: `Cobrar Mesa ${MESA}` });
		await expect(dialogo).toContainText(i === 0 ? /Consumo\s*\$\s100\.01/ : /Falta por cobrar/);
		await dialogo.getByLabel("Dividir la cuenta").selectOption(personas);
		await dialogo.getByText(metodo, { exact: true }).click();
		if (metodo === "EFECTIVO") await dialogo.getByLabel("Recibido").fill(parte);
		else await dialogo.getByLabel(/^Referencia o folio/).fill("AUT-100");
		await expect(dialogo.getByRole("button", { name: new RegExp(`^Cobrar \\$\\s${parte.replace(".", "\\.")}$`) })).toBeVisible();
		await captura(page, `web-division-${i + 1}-persona-${i + 1}`);
		await dialogo.getByRole("button", { name: /^Cobrar \$/ }).click();
		await expect(dialogo).toBeHidden();
	}

	// La última parte cierra la cuenta: caja ofrece la factura.
	const factura = page.getByRole("dialog", { name: "¿El cliente quiere factura?" });
	await expect(factura).toBeVisible();
	await factura.getByLabel("RFC").fill("EKU9003173C9");
	await factura.getByLabel("Razón social").fill("ESCUELA KEMPER URGATE");
	await factura.getByLabel("Régimen fiscal").selectOption("601");
	await factura.getByLabel("Código postal fiscal").fill("42501");
	await captura(page, "web-factura-1-desde-caja");
	await factura.getByRole("button", { name: "Pedir factura" }).click();
	await expect(factura).toBeHidden();

	const detalle = await api("cajero", "GET", `/pedidos/${cuenta}`);
	expect([detalle.estatus, detalle.pagado, detalle.restante]).toEqual(["pagada", "100.01", "0.00"]);

	// Corte: la diferencia se ve en vivo antes de cerrar.
	await main.getByRole("button", { name: "Cerrar caja" }).click();
	const corte = page.getByRole("dialog", { name: "Cerrar caja" });
	await corte.getByLabel("Efectivo contado").fill("560");
	await expect(corte.getByRole("status")).toBeVisible();
	await captura(page, "web-corte-diferencia-en-vivo");
	await corte.getByRole("button", { name: "Volver" }).or(corte.getByRole("button", { name: "Cancelar" })).first().click();

	// Administración emite la factura en el sandbox y después la cancela.
	await entrar(page, "admin");
	await page.goto("/dashboard/admin/finance/invoices");
	// La cola va de la más antigua a la más reciente: la nuestra es la última que se puede emitir.
	await main.getByRole("button", { name: /^Emitir la factura de /, disabled: false }).last().click();
	await expect(page.getByText(/Factura .* emitida/).first()).toBeVisible({ timeout: 30_000 });
	await captura(page, "web-factura-2-emitida");
	await main.getByRole("searchbox", { name: /Buscar por RFC/ }).fill("EKU9003173C9");
	const cancelar = main.getByRole("button", { name: /^Cancelar la factura / }).first();
	await cancelar.click();
	const dialogo = page.getByRole("dialog", { name: /^Cancelar la factura / });
	await dialogo.getByLabel("Motivo").selectOption("02");
	await captura(page, "web-factura-3-cancelar");
	await dialogo.getByRole("button", { name: "Cancelar factura" }).click();
	await expect(page.getByText(/Factura .* cancelada/).first()).toBeVisible({ timeout: 30_000 });
	await captura(page, "web-factura-4-cancelada");
});
