import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Reservas en administración (PLAN 5.11). Contra el build de producción, con sesión de admin y `/reservations*` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const reserva = (id: string, nombre: string, estatus: string, extra: Record<string, unknown> = {}) => ({
	id,
	clienteNombre: nombre,
	clienteEmail: `${id}@correo.mx`,
	clienteTelefono: "771 000 0000",
	fechaHora: "2026-11-14T21:00:00",
	numComensales: 4,
	mesaNumero: 7,
	canal: "web",
	ocasion: "Aniversario",
	peticionesEspeciales: "Mesa junto a la ventana",
	depositoPagado: 200,
	estatus,
	...extra,
});
const RESERVAS = [reserva("a1", "Ana López", "confirmada"), reserva("b2", "Luis Pérez", "pendiente", { numComensales: 2, mesaNumero: null, clienteTelefono: "", clienteEmail: "" }), reserva("c3", "Eva Ruiz", "cancelada", { motivoCancelacion: "NO LLEGÓ EL GRUPO" })];

async function abrir(browser: Browser, opciones: { ancho?: number; falla?: boolean; prediccion?: boolean; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(
		([clave, valor]) => {
			localStorage.setItem(clave, valor);
			// La pantalla comprueba en el cliente que haya un token legible, como antes.
			localStorage.setItem("authToken", "token-de-prueba");
		},
		[CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })],
	);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/reservations"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			pedidos.push({ metodo: p.method(), ruta: url.pathname + url.search, cuerpo: p.postData() ? JSON.parse(p.postData()!) : null });
			if (url.pathname.endsWith("/no-show-model/estado")) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ activa: opciones.prediccion ?? true }) });
			if (url.pathname.endsWith("/no-show-risk")) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ probabilidad: 0.72, clasificacion: "Alto" }) });
			if (opciones.falla && p.method() === "GET") return r.fulfill({ status: 500, body: "{}" });
			if (p.method() === "GET") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(RESERVAS) });
			return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
		},
	);
	await page.goto("/dashboard/admin/reservations", { waitUntil: "load" });
	return { contexto, page, pedidos };
}

test("indicadores, riesgo solo para las confirmadas y filtros que llegan al API", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	const filas = main.getByRole("table", { name: "Reservas" }).locator("tbody tr");
	await expect(filas).toHaveCount(3);
	await expect(main).toContainText("Sin canceladas ni ausencias");
	await expect(filas.filter({ hasText: "Ana López" })).toContainText("Alto · 72 %");
	await expect(filas.filter({ hasText: "Luis Pérez" })).toContainText("2 · sin mesa");
	expect(pedidos.filter((p) => p.ruta.endsWith("/no-show-risk"))).toEqual([{ metodo: "GET", ruta: "/reservations/a1/no-show-risk", cuerpo: null }]);
	await main.getByLabel("Estado", { exact: true }).selectOption("pendiente");
	await expect.poll(() => pedidos.at(-1)?.ruta).toBe("/reservations?estatus=pendiente");
	await contexto.close();
});

test("cambiar el estado en un diálogo envía el mismo PATCH", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Cambiar estado de Luis Pérez" }).filter({ visible: true }).click();
	const dialogo = page.getByRole("dialog", { name: "Estado de Luis Pérez" });
	await dialogo.getByLabel("Estado").selectOption("confirmada");
	await dialogo.getByRole("button", { name: "Guardar estado" }).click();
	await expect(dialogo).toBeHidden();
	const cambio = pedidos.find((p) => p.metodo !== "GET");
	expect(cambio).toMatchObject({ ruta: "/reservations/b2", cuerpo: { estatus: "confirmada" } });
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Estado guardado");
	await contexto.close();
});

test("cancelar exige el motivo, lo envía y se muestra en la tabla (Prioridad 3.3)", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Cambiar estado de Luis Pérez" }).filter({ visible: true }).click();
	const dialogo = page.getByRole("dialog", { name: "Estado de Luis Pérez" });
	await dialogo.getByLabel("Estado").selectOption("cancelada");
	await dialogo.getByRole("button", { name: "Guardar estado" }).click();
	await expect(dialogo.getByText("Escribe el motivo de la cancelación.")).toBeVisible();
	expect(pedidos.filter((p) => p.metodo !== "GET")).toHaveLength(0);
	await dialogo.getByLabel("Motivo de la cancelación").fill("Llamó para cancelar");
	await dialogo.getByRole("button", { name: "Guardar estado" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos.find((p) => p.metodo !== "GET")).toMatchObject({ ruta: "/reservations/b2", cuerpo: { estatus: "cancelada", motivoCancelacion: "Llamó para cancelar" } });
	// El motivo de una reserva ya cancelada se ve en su fila.
	await expect(main.getByText("No llegó el grupo").filter({ visible: true }).first()).toBeVisible();
	await contexto.close();
});

test("con la predicción desactivada en el API no hay columna de riesgo ni peticiones (Prioridad 3.5)", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser, { prediccion: false });
	const main = page.locator("main");
	await expect(main.getByRole("table", { name: "Reservas" }).locator("tbody tr")).toHaveCount(3);
	await expect(main.getByRole("columnheader", { name: "Riesgo de no venir" })).toHaveCount(0);
	expect(pedidos.filter((p) => p.ruta.endsWith("/no-show-risk"))).toEqual([]);
	await contexto.close();
});

test("WhatsApp con la lada de país; sin teléfono, desactivado y con el motivo (Prioridad 3.4)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	const enlace = main.getByRole("link", { name: "Escribir a Ana López por WhatsApp (se abre en otra pestaña)" }).filter({ visible: true }).first();
	await expect(enlace).toHaveAttribute("href", /^https:\/\/wa\.me\/527710000000\?text=Hola%2C%20Ana%20L%C3%B3pez/);
	await expect(enlace).toHaveAttribute("target", "_blank");
	await expect(enlace).toHaveAttribute("rel", "noopener noreferrer");
	await expect(main.getByRole("button", { name: "Sin WhatsApp: no hay un teléfono válido de Luis Pérez" }).filter({ visible: true }).first()).toBeDisabled();
	await contexto.close();
});

test("correo además de WhatsApp: asunto y mensaje listos; sin correo, desactivado (Fase 4.6)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	const enlace = main.getByRole("link", { name: "Escribir a Ana López por correo" }).filter({ visible: true }).first();
	await expect(enlace).toHaveAttribute("href", /^mailto:a1@correo\.mx\?subject=Tu%20reserva%20en%20El%20Quijote%20del%20.+&body=Hola%2C%20Ana%20L%C3%B3pez/);
	await expect(main.getByRole("button", { name: "Sin correo: no hay un correo válido de Luis Pérez" }).filter({ visible: true }).first()).toBeDisabled();
	await contexto.close();
});

test("si no cargan, lo dice con «Reintentar»", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, { falla: true });
	await expect(page.locator("main").getByText("No pudimos traer las reservas").filter({ visible: true })).toBeVisible();
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, { ancho, preferencias: { tema, tamanoTexto } });
			await expect(page.locator("main").getByText("Alto · 72 %").filter({ visible: true }).first()).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/reservas-admin/${info.project.name}/reservas-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}

test("«Ver cálculo»: cada cifra de las tarjetas se rehace desde su desglose (P1.4)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await expect(page.locator("main").getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
	expect(await comprobarCalculos(page)).toHaveLength(4);
	await contexto.close();
});
