import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Tu cuenta (/profile, PLAN 4.20). Contra el build de producción, con sesión de cliente y el API simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const USUARIO = { id: "41", name: "Ana", lastname: "López", email: "ana@correo.mx", phone: "7711234567", direccion: { calle: "Juárez", numero: "12", colonia: "Centro", ciudad: "Huejutla", codigoPostal: "43000", indicaciones: "" } };

async function abrir(browser: Browser, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("cliente") });
	const page = await contexto.newPage();
	const envios: { url: string; cuerpo: unknown }[] = [];
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			if (p.method() === "PUT") {
				envios.push({ url: url.pathname, cuerpo: JSON.parse(p.postData() ?? "{}") });
				return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
			}
			const cuerpo = url.pathname.endsWith("/auth/me") ? { user: USUARIO } : [];
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto("/profile", { waitUntil: "load" });
	return { contexto, page, envios };
}

test("editar y guardar: confirmación del sistema, el mismo PUT con todo el formulario y notificación", async ({ browser }) => {
	const { contexto, page, envios } = await abrir(browser);
	const guardar = page.getByRole("button", { name: "Guardar cambios" });
	await expect(guardar).toHaveAttribute("aria-disabled", "true");
	await expect(page.getByLabel("Teléfono")).toHaveAttribute("readonly", "");
	await page.getByRole("button", { name: "Editar datos personales" }).click();
	await page.getByLabel("Teléfono").fill("7719998877");
	await guardar.click();
	await page.getByRole("alertdialog", { name: "¿Guardar los cambios de tu cuenta?" }).getByRole("button", { name: "Guardar cambios" }).click();
	await expect.poll(() => envios.length).toBe(1);
	expect(envios[0]).toEqual({
		url: "/usuarios/perfil/actualizar/41",
		cuerpo: { name: "Ana", lastname: "López", email: "ana@correo.mx", phone: "7719998877", calle: "Juárez", numero: "12", colonia: "Centro", ciudad: "Huejutla", codigoPostal: "43000", indicaciones: "" },
	});
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Tu cuenta está al día");
	await contexto.close();
});

test("cancelar restaura los valores y un nombre vacío se marca sin enviar", async ({ browser }) => {
	const { contexto, page, envios } = await abrir(browser);
	await page.getByRole("button", { name: "Editar datos personales" }).click();
	await page.getByLabel("Nombre").fill("");
	await page.getByRole("button", { name: "Guardar cambios" }).click();
	await expect(page.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
	await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
	await page.getByRole("button", { name: "Cancelar" }).click();
	await expect(page.getByLabel("Nombre")).toHaveValue("Ana");
	expect(envios).toEqual([]);
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, { tema, tamanoTexto });
			await page.setViewportSize({ width: ancho, height: 900 });
			await expect(page.getByLabel("Nombre")).toHaveValue("Ana");
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/cuenta/${info.project.name}/cuenta-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await contexto.close();
		});
	}
}
