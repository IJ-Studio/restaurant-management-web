import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Facturas (PLAN 5.5; PLAN-AMPLIACION D-24): listado del administrador con `GET /facturas`
// (simulado), paginado en el servidor. Contra el build de producción, con sesión de admin.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const factura = (n: number, extra: Record<string, unknown> = {}) => ({
	id: `f-${n}`,
	ordenId: `o-${n}`,
	serie: "A",
	folio: String(n),
	rfcReceptor: "XAXX010101000",
	razonSocial: "PÚBLICO EN GENERAL",
	total: "116.00",
	estatus: "vigente",
	fechaEmision: "2026-11-04T18:00:00Z",
	...extra,
});

async function abrir(browser: Browser, respuesta: (url: URL) => unknown) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: 1440, height: 900 } });
	const page = await contexto.newPage();
	const consultas: string[] = [];
	await page.route(
		(u) => u.origin === "http://localhost:3100" && u.pathname === "/facturas",
		async (r) => {
			const url = new URL(r.request().url());
			consultas.push(url.search);
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(respuesta(url)) });
		},
	);
	await page.goto("/dashboard/admin/finance/invoices", { waitUntil: "load" });
	return { contexto, page, consultas };
}

test("sin facturas: estado vacío honesto, sin datos inventados y sin violaciones de axe", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, () => ({ facturas: [], pagina: 1, haySiguiente: false }));
	const main = page.locator("main");
	await expect(main.getByRole("heading", { level: 1 })).toHaveText("Facturas");
	await expect(main.getByText("Todavía no hay facturas")).toBeVisible();
	await expect(main.getByText("Datos de ejemplo")).toHaveCount(0);
	const r = await new AxeBuilder({ page }).include("main").analyze();
	expect(r.violations).toEqual([]);
	await contexto.close();
});

test("lista, busca y pagina en el servidor; el texto del API se presenta con primera mayúscula", async ({ browser }) => {
	const { contexto, page, consultas } = await abrir(browser, (url) => {
		const pagina = Number(url.searchParams.get("pagina"));
		if (url.searchParams.get("q")) return { facturas: [factura(9, { estatus: "cancelada" })], pagina: 1, haySiguiente: false };
		return { facturas: [factura(pagina * 10 + 1), factura(pagina * 10 + 2)], pagina, haySiguiente: pagina === 1 };
	});
	const main = page.locator("main");
	await expect(main.getByText("A-11").filter({ visible: true }).first()).toBeVisible();
	await expect(main.getByText("Público en general").filter({ visible: true }).first()).toBeVisible();
	await main.getByRole("button", { name: "Siguiente" }).click();
	await expect(main.getByText("A-21").filter({ visible: true }).first()).toBeVisible();
	await expect(main.getByRole("button", { name: "Siguiente" })).toBeDisabled();
	await main.getByRole("searchbox", { name: /Buscar por RFC/ }).fill("A-9");
	await expect(main.getByText("Cancelada").filter({ visible: true }).first()).toBeVisible();
	expect(consultas[0]).toBe("?pagina=1");
	expect(consultas).toContain("?pagina=2");
	expect(consultas.at(-1)).toBe("?pagina=1&q=A-9");
	await contexto.close();
});

// Fase 4.1: solicitudes de factura en cola (`/solicitudes-factura`, simulado).
const solicitud = (n: number, extra: Record<string, unknown> = {}) => ({
	id: n,
	ordenId: `o-${n}`,
	rfc: "XAXX010101000",
	razonSocial: "PÚBLICO EN GENERAL",
	email: "cliente@correo.mx",
	cliente: "ANA LÓPEZ",
	totalOrden: "215.00",
	estatusOrden: "pagada",
	creadoEn: "2026-11-14T18:00:00Z",
	...extra,
});

async function abrirBandeja(browser: Browser, pendientes: unknown[]) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: 1440, height: 900 } });
	const page = await contexto.newPage();
	const acciones: { ruta: string; cuerpo: unknown }[] = [];
	let lista = pendientes;
	await page.route(
		(u) => u.origin === "http://localhost:3100" && u.pathname === "/facturas",
		(r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ facturas: [], pagina: 1, haySiguiente: false }) }),
	);
	await page.route(
		(u) => u.origin === "http://localhost:3100" && u.pathname.startsWith("/solicitudes-factura"),
		async (r) => {
			const url = new URL(r.request().url());
			if (r.request().method() === "GET") {
				await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(lista) });
				return;
			}
			acciones.push({ ruta: url.pathname, cuerpo: r.request().postDataJSON() });
			lista = [];
			const body = url.pathname.endsWith("/emitir")
				? { facturaId: "f-1", folio: "A-12", correo: { enviado: false, motivo: "El envío por correo está desactivado." } }
				: { id: 1, estatus: "rechazada" };
			await r.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(body) });
		},
	);
	await page.goto("/dashboard/admin/finance/invoices", { waitUntil: "load" });
	return { contexto, page, acciones };
}

test("bandeja: emite una solicitud pagada y avisa que el correo está desactivado", async ({ browser }) => {
	const { contexto, page, acciones } = await abrirBandeja(browser, [solicitud(1), solicitud(2, { estatusOrden: "entregada", cliente: "LUIS PÉREZ" })]);
	const main = page.locator("main");
	await expect(main.getByRole("heading", { name: "Solicitudes pendientes" })).toBeVisible();
	await expect(main.getByRole("button", { name: "Emitir la factura de LUIS PÉREZ" })).toBeDisabled();
	await main.getByRole("button", { name: "Emitir la factura de ANA LÓPEZ" }).click();
	await expect(page.getByText("Factura A-12 emitida")).toBeVisible();
	await expect(page.getByText("El envío por correo está desactivado.")).toBeVisible();
	expect(acciones.map((a) => a.ruta)).toEqual(["/solicitudes-factura/1/emitir"]);
	await expect(main.getByText("Sin solicitudes pendientes")).toBeVisible();
	await contexto.close();
});

test("bandeja: rechazar exige motivo y lo manda al API", async ({ browser }) => {
	const { contexto, page, acciones } = await abrirBandeja(browser, [solicitud(1)]);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Rechazar la factura de ANA LÓPEZ" }).click();
	const dialogo = page.getByRole("dialog");
	await dialogo.getByRole("button", { name: "Rechazar solicitud" }).click();
	await expect(dialogo.getByText("Escribe el motivo del rechazo (al menos 5 caracteres).")).toBeVisible();
	await dialogo.getByLabel("Motivo del rechazo").fill("El RFC no coincide con la razón social");
	await dialogo.getByRole("button", { name: "Rechazar solicitud" }).click();
	await expect(page.getByText("Solicitud rechazada")).toBeVisible();
	expect(acciones).toEqual([{ ruta: "/solicitudes-factura/1/rechazar", cuerpo: { motivo: "El RFC no coincide con la razón social" } }]);
	await contexto.close();
});
