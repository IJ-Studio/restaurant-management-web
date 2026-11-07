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
