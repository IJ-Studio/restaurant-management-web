import { test, expect, type Page } from "@playwright/test";
import { comprobarCalculos } from "../e2e/calculos";
import { entrar } from "./sesion";

// «Ver cálculo» (Prioridad 1.4) contra el API real y la copia local: en cada pantalla con tarjetas,
// cada resultado se rehace desde su desglose.
async function revisar(page: Page, ruta: string) {
	await page.goto(ruta, { waitUntil: "networkidle" });
	const boton = page.locator("main").getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true }).first();
	await expect(boton, ruta).toBeVisible({ timeout: 30_000 });
	return comprobarCalculos(page);
}

test("admin: inicio, caja, nómina, carta, inventario, proveedores, mesas, reservas, promociones y personal", async ({ page }) => {
	test.setTimeout(600_000);
	await entrar(page, "admin");
	const rutas = [
		"/dashboard/admin",
		"/dashboard/admin?panel=caja",
		"/dashboard/admin?panel=nomina",
		"/dashboard/admin/menu",
		"/dashboard/admin/inventory",
		"/dashboard/admin/inventory/suppliers",
		"/dashboard/admin/mesas",
		"/dashboard/admin/reservations",
		"/dashboard/admin/promociones",
		"/dashboard/admin/users",
	];
	const total: Record<string, number> = {};
	for (const ruta of rutas) total[ruta] = (await revisar(page, ruta)).length;
	console.log("Ver cálculo comprobados:", JSON.stringify(total));
	expect(Object.values(total).every((n) => n >= 3)).toBe(true);
});

for (const [rol, ruta, minimo] of [
	["cajero", "/dashboard/cajero", 1],
	["cocina", "/dashboard/cocina", 3],
	["mesero", "/dashboard/mesero", 3],
] as const) {
	test(`${rol}: tarjetas de su panel`, async ({ page }) => {
		test.setTimeout(300_000);
		await entrar(page, rol);
		expect((await revisar(page, ruta)).length).toBeGreaterThanOrEqual(minimo);
	});
}
