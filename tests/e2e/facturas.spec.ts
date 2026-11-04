import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Facturas (PLAN 5.5; PLAN-AMPLIACION D-24). Sin datos de ejemplo: estado vacío honesto hasta que
// el API ofrezca el listado. Contra el build de producción, con sesión de admin.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

test("sin facturas inventadas: estado vacío, sin tabla y sin violaciones de axe", async ({ browser }) => {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: 390, height: 900 } });
	const page = await contexto.newPage();
	await page.goto("/dashboard/admin/finance/invoices", { waitUntil: "load" });
	const main = page.locator("main");
	await expect(main.getByRole("heading", { level: 1 })).toHaveText("Facturas");
	await expect(main.getByText("Las facturas aún no llegan a este panel")).toBeVisible();
	await expect(main.getByRole("table")).toHaveCount(0);
	await expect(main.getByText("Datos de ejemplo")).toHaveCount(0);
	const r = await new AxeBuilder({ page }).include("main").analyze();
	expect(r.violations).toEqual([]);
	await contexto.close();
});
