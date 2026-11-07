import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Usuarios (PLAN 5.13). Contra el build de producción, con sesión de admin y `/users` simulado.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const USUARIOS = [
	{ id: 1, name: "Laura", lastname: "Méndez", email: "laura@elquijote.mx", phone: "7711112222", roleId: 1, isActive: true },
	{ id: 2, name: "Pablo", lastname: "Gil", email: "pablo@elquijote.mx", phone: "7713334444", roleId: 3, isActive: true },
	{ id: 3, name: "Ana", lastname: "López", email: "ana@correo.mx", phone: "", roleId: 5, isActive: false },
];

async function abrir(browser: Browser, opciones: { ancho?: number; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname.startsWith("/users"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const ruta = new URL(p.url()).pathname;
			if (p.method() !== "GET") pedidos.push({ metodo: p.method(), ruta, cuerpo: JSON.parse(p.postData() ?? "null") });
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(p.method() === "GET" ? USUARIOS : { ok: true }) });
		},
	);
	await page.goto("/dashboard/admin/users", { waitUntil: "load" });
	await expect(page.locator("main").getByText("Laura Méndez").filter({ visible: true }).first()).toBeVisible();
	return { contexto, page, pedidos };
}

test("crear valida con el esquema y envía el teléfono con lada", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Usuario nuevo" }).click();
	const dialogo = page.getByRole("dialog", { name: "Usuario nuevo" });
	await dialogo.getByLabel("Correo").fill("no-es-correo");
	await dialogo.getByLabel("Contraseña").fill("corta");
	await dialogo.getByRole("button", { name: "Crear usuario" }).click();
	await expect(dialogo.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
	await expect(dialogo.getByLabel("Correo")).toHaveAttribute("aria-invalid", "true");
	await expect(dialogo.getByText("Mínimo 8 caracteres.").first()).toBeVisible();
	// El rol de administrador no se puede crear desde aquí.
	await expect(dialogo.getByLabel("Rol").locator("option", { hasText: "Administrador" })).toHaveCount(0);
	await dialogo.getByLabel("Nombre").fill("Iván");
	await dialogo.getByLabel("Apellidos").fill("Soto");
	await dialogo.getByLabel("Correo").fill("ivan@elquijote.mx");
	await dialogo.getByLabel("Teléfono").fill("7715556666");
	await dialogo.getByLabel("Rol").selectOption({ label: "Mesero" });
	await dialogo.getByLabel("Contraseña").fill("Bodega#Tinta9");
	await dialogo.getByRole("button", { name: "Crear usuario" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos).toEqual([{ metodo: "POST", ruta: "/users", cuerpo: { name: "Iván", lastname: "Soto", email: "ivan@elquijote.mx", phone: "+527715556666", password: "Bodega#Tinta9", roleId: 3 } }]);
	await contexto.close();
});

test("editar manda el perfil y el rol a sus rutas; activar y desactivar usan las rutas del API", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Editar a Pablo Gil" }).filter({ visible: true }).click();
	const dialogo = page.getByRole("dialog", { name: "Editar a Pablo Gil" });
	// El correo no se edita aquí y no hay campo de contraseña (el API los descartaba en silencio).
	await expect(dialogo.getByLabel("Correo")).toHaveAttribute("readonly", "");
	await expect(dialogo.getByLabel(/Contraseña/)).toHaveCount(0);
	await dialogo.getByLabel("Teléfono").fill("771 999 8888");
	await dialogo.getByLabel("Rol").selectOption({ label: "Cocina" });
	await dialogo.getByRole("button", { name: "Guardar cambios" }).click();
	await expect(dialogo).toBeHidden();
	expect(pedidos.slice(0, 2)).toEqual([
		{ metodo: "PATCH", ruta: "/users/2", cuerpo: { name: "Pablo", lastname: "Gil", phone: "+527719998888" } },
		{ metodo: "PATCH", ruta: "/users/2/role", cuerpo: { roleId: 4 } },
	]);

	await main.getByRole("button", { name: "Desactivar a Pablo Gil" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Desactivar a Pablo Gil?" }).getByRole("button", { name: "Desactivar" }).click();
	await expect.poll(() => pedidos[2]).toEqual({ metodo: "DELETE", ruta: "/users/2", cuerpo: null });
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Usuario desactivado");

	await main.getByRole("button", { name: "Activar a Ana López" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Activar a Ana López?" }).getByRole("button", { name: "Activar" }).click();
	await expect.poll(() => pedidos[3]).toEqual({ metodo: "PATCH", ruta: "/users/3/reactivar", cuerpo: null });
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
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/usuarios/${info.project.name}/usuarios-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
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
