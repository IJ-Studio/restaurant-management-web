import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Estados vacío, de carga y de error del catálogo (PLAN 3.7). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#estados", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);
const animacion = (page: Page, selector: string) =>
	page.locator(selector).first().evaluate((e) => getComputedStyle(e).animationName);

test.describe("estados vacío, de carga y de error del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("el error se anuncia sin leer el botón; reintentar carga, vuelve a fallar y después muestra el dato", async ({ page }) => {
		await abrir(page);
		const estado = prueba(page, "estado-error");
		const alerta = estado.getByRole("alert");
		await expect(alerta).toContainText("No se pudieron cargar las reservas");
		await expect(alerta.getByRole("button")).toHaveCount(0);
		const reintentar = estado.locator("button");
		await reintentar.click();
		await expect(reintentar).toHaveAttribute("aria-busy", "true");
		await expect(alerta).toContainText("Sigue sin llegar", { timeout: 5_000 });
		await estado.getByRole("button", { name: /Reintentar/ }).click();
		await expect(prueba(page, "estado-cargado")).toContainText("148", { timeout: 5_000 });
	});

	test("ZonaCargando: aria-busy y «Cargando…» para lectores; el esqueleto va oculto", async ({ page }) => {
		await abrir(page);
		const zona = prueba(page, "zona-cargando");
		await expect(zona).toHaveAttribute("aria-busy", "true");
		await expect(zona.getByRole("status")).toHaveText("Cargando el menú…");
		await expect(zona.locator(".esqueleto").first()).toHaveAttribute("aria-hidden", "true");
		await prueba(page, "alternar-carga").click();
		await expect(zona).not.toHaveAttribute("aria-busy", "true");
		await expect(zona).toContainText("Cabrito al horno");
	});

	test("el esqueleto pulsa", async ({ page }) => {
		await abrir(page);
		expect(await animacion(page, '[data-prueba="esqueleto-fondo"] .esqueleto')).toBe("esqueleto-pulso");
	});

	test("sin pulso con movimiento reducido en el panel", async ({ page }) => {
		await abrir(page, { movimiento: "reducido" });
		expect(await animacion(page, '[data-prueba="esqueleto-fondo"] .esqueleto')).toBe("none");
	});

	test("sobre una superficie, el esqueleto es café y se distingue en los dos temas", async ({ page }) => {
		for (const tema of ["oscuro", "claro"] as const) {
			await abrir(page, { tema });
			const [fondo, superficie] = await page.evaluate(() => {
				const color = (s: string) => getComputedStyle(document.querySelector(s)!).backgroundColor;
				return [color('[data-prueba="esqueleto-fondo"] .esqueleto'), color('[data-prueba="zona-cargando"] .esqueleto')];
			});
			expect(fondo, tema).not.toBe(superficie);
		}
	});

	test("CargadorMarca: role=status con el texto solo para lectores, dibujo oculto y aspas que giran", async ({ page }) => {
		await abrir(page);
		const cargadores = prueba(page, "cargadores").locator("[data-cargador-marca]");
		await expect(cargadores).toHaveCount(3);
		for (const [i, texto] of ["Buscando platillos…", "Preparando la carta…", "Preparando tu reserva…"].entries()) {
			const c = cargadores.nth(i);
			await expect(c).toHaveAttribute("role", "status");
			await expect(c).toHaveText(texto);
			await expect(c.locator("svg")).toHaveAttribute("aria-hidden", "true");
			// El texto no se ve: solo lo oye el lector.
			expect(await c.locator(".sr-only").evaluate((e) => e.getBoundingClientRect().width <= 1)).toBe(true);
		}
		expect(await animacion(page, '[data-prueba="cargadores"] .cargador-marca__aspas')).toBe("cargador-aspas");
	});

	test("CargadorMarca: quieto con movimiento reducido en el panel y en el sistema", async ({ page, browser }) => {
		await abrir(page, { movimiento: "reducido" });
		expect(await animacion(page, '[data-prueba="cargadores"] .cargador-marca__aspas')).toBe("none");
		const contexto = await browser.newContext({ reducedMotion: "reduce" });
		const otra = await contexto.newPage();
		await abrir(otra);
		expect(await animacion(otra, '[data-prueba="cargadores"] .cargador-marca__aspas')).toBe("none");
		await contexto.close();
	});

	test("CargadorMarca: plato y molino con 3:1 o más sobre el fondo y la banda café, en los dos temas", async ({ page }) => {
		for (const tema of ["oscuro", "claro"] as const) {
			await abrir(page, { tema });
			const ratios = await page.evaluate(() => {
				const canal = (v: number) => {
					const s = v / 255;
					return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
				};
				const lum = (c: string) => {
					const [r, g, b] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map(canal);
					return 0.2126 * r + 0.7152 * g + 0.0722 * b;
				};
				const ratio = (a: string, b: string) => {
					const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
					return (x + 0.05) / (y + 0.05);
				};
				const fondoDe = (e: Element) => {
					for (let n: Element | null = e; n; n = n.parentElement) {
						const c = getComputedStyle(n).backgroundColor;
						if (c && c !== "transparent" && !/,\s*0\)$/.test(c)) return c;
					}
					return getComputedStyle(document.body).backgroundColor;
				};
				return ['[data-prueba="cargadores"]', '[data-prueba="cargador-cafe"]'].flatMap((sel) => {
					const svg = document.querySelector(`${sel} svg`)!;
					const fondo = fondoDe(svg);
					return [ratio(getComputedStyle(svg.querySelector("circle")!).stroke, fondo), ratio(getComputedStyle(svg).color, fondo)];
				});
			});
			for (const r of ratios) expect(r, tema).toBeGreaterThanOrEqual(3);
		}
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`axe sin violaciones a 360 px con texto al 125 %, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: 360, height: 800 });
			await abrir(page, { tema, tamanoTexto: "muy-grande" });
			const r = await new AxeBuilder({ page })
				.include("section#estados")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
			expect(desborda).toBe(false);
			await page
				.locator("section#estados")
				.screenshot({ path: `test-results/catalogo/${info.project.name}/estados-${tema}-360-muy-grande.png`, animations: "disabled" });
		});
	}
});
