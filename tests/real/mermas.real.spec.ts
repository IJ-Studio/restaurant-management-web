import { test, expect } from "@playwright/test";
import { entrar, tokenDe } from "./sesion";

// Mermas (Prioridad 1.2) contra el API real y la copia local de la BD: solo el personal operativo
// las registra; el admin solo consulta el registro, y el API se lo impide también (403).
const API = process.env.E2E_API_REAL ?? "http://127.0.0.1:4100";

test("cocina registra una merma y el admin la ve en el registro con quién la reportó", async ({ browser }) => {
	const marca = `Prueba merma ${Date.now()}`;
	const cocina = await browser.newPage();
	await entrar(cocina, "cocina");
	await cocina.goto("/dashboard/cocina", { waitUntil: "networkidle" });
	await cocina.locator("main").getByRole("button", { name: "Registrar merma" }).click();
	const dialogo = cocina.getByRole("dialog", { name: "Registrar una merma" });
	await dialogo.getByLabel("Cantidad").fill("0.1");
	await dialogo.getByLabel("Qué pasó").fill(marca);
	await dialogo.getByRole("button", { name: "Registrar merma" }).click();
	await expect(dialogo).toBeHidden({ timeout: 20_000 });
	await cocina.close();

	const admin = await browser.newPage();
	await entrar(admin, "admin");
	await admin.goto("/dashboard/admin/inventory?vista=mermas", { waitUntil: "networkidle" });
	await expect(admin.getByRole("button", { name: "Registrar merma" })).toHaveCount(0);
	const fila = admin.locator("main").locator("tr, li").filter({ hasText: marca }).filter({ visible: true }).first();
	await expect(fila).toBeVisible({ timeout: 20_000 });
	await expect(fila).toContainText(/cocina/i);
	await admin.close();
});

test("el API rechaza que el admin registre una merma (403) y la acepta del personal operativo", async ({ request }) => {
	test.setTimeout(300_000);
	const cuerpo = { productName: "Prueba de permisos", quantity: 1, unit: "pza", reason: "otro", justification: "Prueba de permisos por rol" };
	for (const [rol, esperado] of [["admin", 403], ["cajero", 201], ["mesero", 201], ["cocina", 201]] as const) {
		const r = await request.post(`${API}/inventario/mermas`, { data: cuerpo, headers: { Authorization: `Bearer ${await tokenDe(request, API, rol)}` } });
		expect(r.status(), rol).toBe(esperado);
	}
});
