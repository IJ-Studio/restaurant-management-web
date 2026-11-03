import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Crear cuenta (/register, PLAN 4.18). Contra el build de producción, con el API simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, status = 201, preferencias: Record<string, string> = {}) {
	const envios: unknown[] = [];
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.route("**/api/auth/register", async (r) => {
		envios.push(JSON.parse(r.request().postData() ?? "{}"));
		await r.fulfill({ status, contentType: "application/json", body: JSON.stringify(status < 300 ? { ok: true } : { message: ["email must be an email"], statusCode: 400 }) });
	});
	await page.goto("/register", { waitUntil: "load" });
	return envios;
}
async function rellenar(page: Page) {
	await page.getByLabel("Nombre").fill("  Ana  ");
	await page.getByLabel("Apellido").fill("López");
	await page.getByLabel("Correo").fill("ana@correo.mx");
	await page.getByLabel("Teléfono").fill("7711234567");
	await page.getByLabel("Contraseña", { exact: true }).fill("Bodega#Tinta9");
	await page.getByLabel(/Acepto las/).check();
}
const crear = (page: Page) => page.getByRole("button", { name: "Crear cuenta" }).click();

test("crear la cuenta envía el contrato exacto de siempre y avisa sin «Redirigiendo»", async ({ page }) => {
	const envios = await abrir(page);
	await expect(page.getByLabel("Nombre")).toHaveAttribute("autocomplete", "given-name");
	await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("autocomplete", "new-password");
	await rellenar(page);
	await page.waitForTimeout(1_100); // envío protegido: tiempo mínimo de 1 s
	await crear(page);
	await expect(page.getByText("Tu cuenta está creada")).toBeVisible();
	expect(envios).toEqual([{ name: "Ana", lastname: "López", email: "ana@correo.mx", phone: "+527711234567", password: "Bodega#Tinta9", passwordConfirm: "Bodega#Tinta9" }]);
	await expect(page.locator("main")).not.toContainText(/Redirigiendo/);
	await expect(page).toHaveURL(/\/login$/, { timeout: 6_000 });
});

test("requisitos de la contraseña con su estado en texto", async ({ page }) => {
	await abrir(page);
	const requisitos = page.getByRole("list", { name: "Requisitos de la contraseña" });
	await expect(requisitos.getByRole("listitem")).toHaveCount(5);
	await page.getByLabel("Contraseña", { exact: true }).fill("abc");
	await expect(requisitos.getByRole("listitem").filter({ hasText: "Una letra minúscula" })).toContainText("(cumplido)");
	await expect(requisitos.getByRole("listitem").filter({ hasText: "Un número" })).toContainText("(pendiente)");
	await expect(page.getByText("La contraseña contiene secuencias predecibles.")).toBeVisible();
});

test("enviar vacío marca cada campo y no llama al API", async ({ page }) => {
	const envios = await abrir(page);
	await page.waitForTimeout(1_100);
	await crear(page);
	for (const etiqueta of ["Nombre", "Apellido", "Correo", "Teléfono"]) await expect(page.getByLabel(etiqueta)).toHaveAttribute("aria-invalid", "true");
	await expect(page.getByText("Debes aceptar los términos y condiciones.")).toBeVisible();
	expect(envios).toEqual([]);
});

test("el campo trampa y un error de validación del API no muestran nada técnico", async ({ page }) => {
	const envios = await abrir(page, 400);
	await rellenar(page);
	await page.waitForTimeout(1_100);
	await crear(page);
	await expect(page.locator("form").getByRole("alert").first()).toContainText("Revisa los datos del formulario");
	await expect(page.locator("main")).not.toContainText(/must be|statusCode/);
	expect(envios).toHaveLength(1);
	await page.locator('input[name="sitio_web"]').evaluate((e: HTMLInputElement) => (e.value = "spam"));
	await crear(page);
	expect(envios).toHaveLength(1);
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, 201, { tema, tamanoTexto });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/registro/${info.project.name}/registro-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
		});
	}
}
