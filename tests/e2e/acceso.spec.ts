import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Iniciar sesión (/login, PLAN 4.17). Contra el build de producción, con /api/auth/login simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, respuesta: { status: number; body: unknown }, preferencias: Record<string, string> = {}) {
	const envios: unknown[] = [];
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.route("**/api/auth/login", async (r) => {
		envios.push(JSON.parse(r.request().postData() ?? "{}"));
		await r.fulfill({ status: respuesta.status, contentType: "application/json", body: JSON.stringify(respuesta.body) });
	});
	await page.goto("/login", { waitUntil: "load" });
	return envios;
}
const rellenar = async (page: Page, correo = "ana@correo.mx", clave = "una-clave-larga") => {
	await page.getByLabel("Correo").fill(correo);
	await page.getByLabel("Contraseña", { exact: true }).fill(clave);
};
const entrar = (page: Page) => page.getByRole("button", { name: "Iniciar sesión" }).click();

test("etiquetas, autocomplete y migas", async ({ page }) => {
	await abrir(page, { status: 401, body: {} });
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Iniciar sesión");
	await expect(page.getByLabel("Correo")).toHaveAttribute("autocomplete", "email");
	await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("autocomplete", "current-password");
	await expect(page.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toHaveAttribute("href", "/frm_reset");
	await expect(page.getByRole("link", { name: "Crear una cuenta" })).toHaveAttribute("href", "/register");
});

test("error genérico: no dice si la cuenta existe ni repite el texto del servidor", async ({ page }) => {
	const envios = await abrir(page, { status: 401, body: { message: "El usuario ana@correo.mx no existe", statusCode: 401 } });
	await rellenar(page);
	await entrar(page);
	const aviso = page.locator("form").getByRole("alert");
	await expect(aviso).toContainText("El correo o la contraseña no coinciden");
	await expect(page.locator("main")).not.toContainText(/no existe|statusCode|Unauthorized/);
	expect(envios).toEqual([{ email: "ana@correo.mx", password: "una-clave-larga" }]);
});

test("bloqueo temporal: el aviso con los segundos y el botón inactivo", async ({ page }) => {
	await abrir(page, { status: 403, body: { message: "Demasiados intentos. Debes esperar 30 segundos." } });
	await rellenar(page);
	await entrar(page);
	await expect(page.getByText(/Podrás intentarlo de nuevo en \d+ segundos/)).toBeVisible();
	await expect(page.getByRole("button", { name: "Iniciar sesión" })).toHaveAttribute("aria-disabled", "true");
});

test("correo con formato inválido: error en el campo, sin llamar al API", async ({ page }) => {
	const envios = await abrir(page, { status: 200, body: {} });
	await rellenar(page, "ana-sin-arroba");
	await entrar(page);
	await expect(page.getByLabel("Correo")).toHaveAttribute("aria-invalid", "true");
	expect(envios).toEqual([]);
});

test("al entrar, el cargador de marca y ningún «Redirigiendo»", async ({ page }) => {
	await abrir(page, { status: 200, body: { accessToken: "e2e.token", user: { id: 9, name: "Ana", email: "ana@correo.mx", roleId: 5 } } });
	await rellenar(page);
	await entrar(page);
	await expect(page).toHaveURL(/\/menu(\?|$)/);
	await expect(page.locator("main")).not.toContainText(/Redirigiendo|Login exitoso/);
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, { status: 401, body: {} }, { tema, tamanoTexto });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/acceso/${info.project.name}/login-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
		});
	}
}
