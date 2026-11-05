import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion, type Rol } from "./roles";

// Layout de los paneles (PLAN 5.1). Contra el build de producción, con sesión simulada.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";

async function abrir(browser: Browser, rol: Rol, ruta: string, ancho: number, preferencias: Record<string, string> = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion(rol), viewport: { width: ancho, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto(ruta, { waitUntil: "load" });
	return { contexto, page };
}

const NAV_ADMIN = "Navegación del panel de administración";

test("admin en 1440 px: barra lateral con la entrada activa, un solo main y el salto al contenido", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, "admin", "/dashboard/admin/inventory/suppliers", 1440);
	const lateral = page.locator('[data-prueba="barra-lateral-panel"]');
	await expect(lateral).toBeVisible();
	const nav = page.getByRole("navigation", { name: NAV_ADMIN });
	await expect(nav.getByRole("link", { name: "Proveedores" })).toHaveAttribute("aria-current", "page");
	await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
	// D-27/D-30: nueve entradas con Mesas (P1.3), todas a la vista (D-29: nada plegado ni oculto).
	await expect(nav.getByRole("link")).toHaveCount(9);
	await expect(nav.getByRole("button")).toHaveCount(0);
	for (const nombre of ["Inicio", "Reservas", "Mesas", "Carta", "Promociones", "Existencias", "Proveedores", "Personal", "Facturas"])
		await expect(nav.getByRole("link", { name: nombre, exact: true })).toBeVisible();
	await expect(page.locator("main")).toHaveCount(1);
	await expect(page.getByRole("button", { name: "Abrir la navegación" })).toHaveCount(0);
	// La barra lateral no tapa el contenido: empieza donde acaba ella.
	const [l, m] = await Promise.all([lateral.boundingBox(), page.locator("main").boundingBox()]);
	expect(Math.round(m!.x)).toBeGreaterThanOrEqual(Math.round(l!.x + l!.width));

	await page.locator(".saltar-contenido").focus();
	await page.keyboard.press("Enter");
	await expect(page.locator("main")).toBeFocused();
	await contexto.close();
});

test("admin en 360 px: el contenido ocupa todo el ancho y la navegación entera está a la vista", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, "admin", "/dashboard/admin", 360);
	await expect(page.locator('[data-prueba="barra-lateral-panel"]')).toBeHidden();
	const main = await page.locator("main").boundingBox();
	expect(Math.round(main!.x)).toBe(0);
	expect(Math.round(main!.width)).toBe(360);

	// Sin cajón ni botón de menú (D-29): las nueve entradas se ven sin abrir nada, y sin desbordar.
	await expect(page.getByRole("button", { name: "Abrir la navegación" })).toHaveCount(0);
	const nav = page.getByRole("navigation", { name: NAV_ADMIN });
	await expect(nav.getByRole("link")).toHaveCount(9);
	for (const enlace of await nav.getByRole("link").all()) await expect(enlace).toBeInViewport();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
	await expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
	await nav.getByRole("link", { name: "Reservas" }).click();
	await expect(page).toHaveURL(/\/dashboard\/admin\/reservations$/);
	await expect(page.getByRole("navigation", { name: NAV_ADMIN }).getByRole("link", { name: "Reservas" })).toHaveAttribute("aria-current", "page");
	await contexto.close();
});

for (const rol of ["mesero", "cajero", "cocina"] as const) {
	test(`${rol}: no ve ninguna entrada de administración y cierra sesión desde la cuenta`, async ({ browser }) => {
		const { contexto, page } = await abrir(browser, rol, `/dashboard/${rol}`, 360);
		await expect(page.getByRole("navigation", { name: NAV_ADMIN })).toHaveCount(0);
		await expect(page.locator('a[href^="/dashboard/admin"]')).toHaveCount(0);
		await expect(page.getByRole("button", { name: "Abrir la navegación" })).toHaveCount(0);
		await expect(page.locator("main")).toHaveCount(1);
		await page.locator('[data-prueba="abrir-cuenta-panel"]').click();
		await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
		await contexto.close();
	});
}

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`marco del panel con axe y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, "admin", "/dashboard/admin", ancho, { tema, tamanoTexto });
			// El contenido de cada pantalla se rehace en 5.2–5.19: aquí solo se mide el marco.
			const r = await new AxeBuilder({ page })
				.include('[data-prueba="barra-superior-panel"]')
				.include(ancho >= 1024 ? '[data-prueba="barra-lateral-panel"]' : "a.saltar-contenido")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const barra = await page.locator('[data-prueba="barra-superior-panel"]').boundingBox();
			expect(Math.round(barra!.x + barra!.width)).toBeLessThanOrEqual(ancho);
			await page.screenshot({ path: `test-results/layout-paneles/${info.project.name}/panel-${tema}-${ancho}.png`, animations: "disabled" });
			await contexto.close();
		});
	}
}
