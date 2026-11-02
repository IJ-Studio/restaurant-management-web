import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Cabecera y pie del sitio en el catálogo (PLAN 3.11). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#sitio", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);

test.describe("cabecera y pie del sitio en el catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("desde 1024 px: logo al inicio, secciones, accesibilidad, cuenta y «Reservar»", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		const cabecera = prueba(page, "cabecera");
		await expect(cabecera.getByRole("link", { name: "El Quijote, restaurante" })).toHaveAttribute("href", "/");
		const secciones = cabecera.getByRole("navigation", { name: "Principal" });
		await expect(secciones.getByRole("link")).toHaveText(["La casa", "La carta", "Promociones", "Pedir", "Visítanos"]);
		await expect(secciones.getByRole("link", { name: "La carta" })).toHaveAttribute("href", "/#carta");
		await expect(cabecera.getByRole("button", { name: "Opciones de accesibilidad" })).toBeVisible();
		await expect(cabecera.getByRole("link", { name: "Reservar" })).toHaveAttribute("href", "/reservations");
		await expect(prueba(page, "abrir-menu-movil")).toBeHidden();
		// Sin SVG a mano: todos los iconos son de Lucide (el logo es la pieza de marca).
		const aMano = await cabecera.locator("svg:not(.lucide)").evaluateAll((s) => s.filter((e) => !e.closest('a[href="/"]')).length);
		expect(aMano).toBe(0);
		// Todo lo interactivo mide al menos 44 px de alto.
		const bajos = await cabecera.locator("a, button").evaluateAll((e) => e.filter((x) => x.getBoundingClientRect().height < 44 && x.getBoundingClientRect().height > 0).length);
		expect(bajos).toBe(0);
	});

	test("cuenta: con sesión, un menú con nombre, correo y «Tu cuenta»; sin sesión, «Iniciar sesión»", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await abrir(page);
		await prueba(page, "abrir-cuenta").click();
		const menu = page.getByRole("dialog", { name: "Tu cuenta" });
		await expect(menu).toContainText("Ana López");
		await expect(menu).toContainText("ana.lopez@correo.mx");
		await expect(menu.getByRole("link", { name: "Tu cuenta" })).toHaveAttribute("href", "/profile");
		// El cierre de sesión único (2.14) llega a la cabecera.
		await expect(menu.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(menu).toBeHidden();
		await expect(prueba(page, "abrir-cuenta")).toBeFocused();
		await expect(prueba(page, "cuenta-sin-sesion").getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
	});

	test("por debajo de 1024 px: menú en panel lateral con trampa de foco y cierre con Esc; «Reservar» sigue visible", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await abrir(page);
		const cabecera = prueba(page, "cabecera");
		await expect(cabecera.getByRole("navigation", { name: "Principal" })).toBeHidden();
		await expect(cabecera.getByRole("link", { name: "Reservar" })).toBeVisible();
		const abrirMenu = prueba(page, "abrir-menu-movil");
		await abrirMenu.click();
		const panel = page.getByRole("dialog", { name: "Menú" });
		await expect(panel.getByRole("navigation", { name: "Principal" }).getByRole("link")).toHaveCount(5);
		await expect(panel.getByRole("link", { name: "Tu cuenta" })).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(panel).toBeHidden();
		await expect(abrirMenu).toBeFocused();
		const cabe = await cabecera.evaluate((e) => e.scrollWidth <= e.clientWidth);
		expect(cabe).toBe(true);
	});

	test("pie: contacto, redes con nombre, legales y el acceso del personal discreto en la última fila", async ({ page }) => {
		await abrir(page);
		// Dentro de <main> (aquí, en el catálogo) un <footer> no es el punto de referencia «contentinfo»; en la página, sí.
		const pie = prueba(page, "pie").locator("footer");
		await expect(pie).toContainText("Pzla. Hidalgo 5-1");
		await expect(pie.getByRole("link", { name: "+52 771 702 8172" })).toHaveAttribute("href", "tel:+527717028172");
		const redes = pie.getByRole("list", { name: "Redes sociales" }).getByRole("link");
		await expect(redes).toHaveCount(2);
		await expect(redes.first()).toHaveAccessibleName(/Facebook de El Quijote/);
		await expect(redes.first()).toHaveAttribute("rel", "noopener noreferrer");
		const personal = prueba(page, "acceso-personal");
		await expect(personal).toHaveText("Acceso del personal");
		// En el color tenue y el tamaño pequeño (DESIGN.md § Navegación pública).
		const [color, tenue, tamano] = await personal.evaluate((e) => {
			const muestra = document.createElement("span");
			muestra.style.color = "var(--color-texto-tenue)";
			document.body.append(muestra);
			const resultado = [getComputedStyle(e).color, getComputedStyle(muestra).color, getComputedStyle(e).fontSize];
			muestra.remove();
			return resultado;
		});
		expect(color).toBe(tenue);
		expect(tamano).toBe("14px");
		// Es lo último del pie.
		const ultimo = await pie.evaluate((e) => [...e.querySelectorAll("a")].at(-1)?.textContent);
		expect(ultimo).toBe("Acceso del personal");
	});

	for (const tema of ["oscuro", "claro"] as const) {
		for (const ancho of [360, 1280]) {
			test(`axe sin violaciones y sin desborde a ${ancho} px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
				await page.setViewportSize({ width: ancho, height: 900 });
				await abrir(page, { tema, tamanoTexto: "muy-grande" });
				const r = await new AxeBuilder({ page })
					.include("section#sitio")
					.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
					.analyze();
				expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
				const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
				expect(desborda).toBe(false);
				// El marco del catálogo recorta: se comprueba que la cabecera misma cabe y que el menú se ve.
				const cabecera = prueba(page, "cabecera").locator("header");
				expect(await cabecera.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
				if (ancho < 1024) {
					// Visible entero: IntersectionObserver tiene en cuenta el recorte del marco.
					await prueba(page, "abrir-menu-movil").scrollIntoViewIfNeeded();
					await expect(prueba(page, "abrir-menu-movil")).toBeInViewport({ ratio: 1 });
				}
				await page
					.locator("section#sitio")
					.screenshot({ path: `test-results/catalogo/${info.project.name}/sitio-${tema}-${ancho}-muy-grande.png`, animations: "disabled" });
			});
		}
	}
});
