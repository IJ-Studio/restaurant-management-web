import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// Diálogos del catálogo (PLAN 3.5). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";
const SALIDA = join("test-results", "catalogo", "dialogos");

async function abrirCatalogo(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#dialogo", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);

/** El foco está dentro del elemento. */
const focoDentro = (l: Locator) => l.evaluate((e) => e.contains(document.activeElement));

/** Contraste de todo el texto visible y de los iconos de un diálogo abierto (implementación propia). */
async function contrasteDe(caja: Locator) {
	return caja.evaluate((raiz) => {
		const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true })!;
		const rgba = (c: string) => {
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = c;
			ctx.fillRect(0, 0, 1, 1);
			const d = ctx.getImageData(0, 0, 1, 1).data;
			return [d[0], d[1], d[2], d[3] / 255];
		};
		const sobre = (a: number[], b: number[]) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
		const fondo = (e: Element | null) => {
			const capas: number[][] = [];
			for (; e; e = e.parentElement) {
				const c = rgba(getComputedStyle(e).backgroundColor);
				if (c[3] > 0) capas.push(c);
				if (c[3] === 1) break;
			}
			return capas.reduceRight((abajo, arriba) => sobre(arriba, abajo), [255, 255, 255, 1]);
		};
		const lum = (c: number[]) =>
			c
				.slice(0, 3)
				.map((v) => v / 255)
				.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
				.reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
		const rel = (fg: number[], bg: number[]) => {
			const [a, b] = [lum(sobre(fg, bg)), lum(bg)].sort((x, y) => y - x);
			return (a + 0.05) / (b + 0.05);
		};
		const visible = (e: Element) => {
			const s = getComputedStyle(e);
			const r = e.getBoundingClientRect();
			return s.visibility !== "hidden" && s.display !== "none" && r.width > 1 && r.height > 1;
		};
		const exento = (e: Element) => e.closest("[aria-disabled='true']") !== null;
		const textos = [raiz, ...raiz.querySelectorAll("*")].filter(
			(e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && visible(e) && !exento(e),
		);
		const iconos = [...raiz.querySelectorAll("svg")].filter((e) => visible(e) && !exento(e));
		return {
			texto: Math.min(...textos.map((e) => rel(rgba(getComputedStyle(e).color), fondo(e)))),
			icono: iconos.length ? Math.min(...iconos.map((e) => rel(rgba(getComputedStyle(e).color), fondo(e)))) : null,
			muestras: textos.length,
		};
	});
}

test.describe("diálogos del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("Dialogo: atrapa el foco, Esc lo cierra, el foco vuelve y la página queda inerte", async ({ page }) => {
		await abrirCatalogo(page);
		const disparador = prueba(page, "abrir-dialogo");
		await disparador.click();
		const dialogo = page.getByRole("dialog", { name: "Modificar la reserva" });
		await expect(dialogo).toBeVisible();
		await expect(dialogo).toHaveAccessibleDescription(/Revisa los datos antes de guardar/);
		await expect(disparador).toHaveAttribute("aria-expanded", "true");

		// El foco empieza en el contenido (aquí, la primera acción) y no en «Cerrar», y no sale.
		const boton = (nombre: string) => dialogo.getByRole("button", { name: nombre, exact: true });
		await expect(boton("Descartar")).toBeFocused();
		for (const nombre of ["Guardar cambios", "Cerrar", "Descartar", "Guardar cambios"]) {
			await page.keyboard.press("Tab");
			await expect(boton(nombre)).toBeFocused();
		}
		await page.keyboard.press("Shift+Tab");
		await expect(boton("Descartar")).toBeFocused();
		await page.keyboard.press("Shift+Tab");
		await expect(boton("Cerrar")).toBeFocused();
		expect(await focoDentro(dialogo)).toBe(true);

		// Lo de detrás no se lee ni se desplaza.
		await expect(page.getByRole("heading", { name: "Catálogo de componentes" })).toHaveCount(0);
		expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

		await page.keyboard.press("Escape");
		await expect(dialogo).toBeHidden();
		await expect(disparador).toBeFocused();
		await expect(page.getByRole("heading", { name: "Catálogo de componentes" })).toHaveCount(1);
	});

	test("Dialogo: mientras guarda no se cierra; al terminar se cierra solo", async ({ page }) => {
		await abrirCatalogo(page);
		await prueba(page, "abrir-dialogo").click();
		const dialogo = page.getByRole("dialog", { name: "Modificar la reserva" });
		const guardar = prueba(page, "guardar-dialogo");
		await guardar.click();
		await expect(guardar).toHaveAttribute("aria-busy", "true");
		await expect(dialogo.getByRole("button", { name: "Cerrar" })).toHaveAttribute("aria-disabled", "true");
		await expect(dialogo.getByRole("button", { name: "Descartar" })).toHaveAttribute("aria-disabled", "true");
		await page.keyboard.press("Escape");
		await page.mouse.click(4, 4);
		// Clic forzado: Playwright no pulsa por sí mismo un control con aria-disabled.
		await dialogo.getByRole("button", { name: "Cerrar" }).click({ force: true });
		await expect(dialogo).toBeVisible();
		await expect(dialogo).toBeHidden({ timeout: 5_000 });
		await expect(prueba(page, "resultado-dialogo")).toHaveText("Cambios guardados.");
	});

	test("Dialogo amplio: un clic en el velo lo cierra y solo se desplaza el cuerpo", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 640 });
		await abrirCatalogo(page);
		await prueba(page, "abrir-politica").click();
		const dialogo = page.getByRole("dialog", { name: "Política de cancelación" });
		await expect(dialogo).toBeVisible();
		await page.waitForTimeout(300);
		const caja = (await dialogo.boundingBox())!;
		expect(caja.y).toBeGreaterThanOrEqual(0);
		expect(caja.y + caja.height).toBeLessThanOrEqual(640);
		const cuerpo = dialogo.locator(".cuerpo-dialogo");
		const medidas = await cuerpo.evaluate((e) => ({
			desplaza: e.scrollHeight > e.clientHeight,
			overscroll: getComputedStyle(e).overscrollBehaviorY,
		}));
		expect(medidas).toEqual({ desplaza: true, overscroll: "contain" });
		// El pie («Entendido») sigue a la vista sin desplazar.
		await expect(dialogo.getByRole("button", { name: "Entendido" })).toBeInViewport();

		await page.mouse.click(2, 2);
		await expect(dialogo).toBeHidden();
	});

	test("PanelLateral: a toda la altura en su lado; un enlace del menú lo cierra", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 800 });
		await abrirCatalogo(page);
		await prueba(page, "abrir-panel").click();
		const pedido = page.getByRole("dialog", { name: "Tu pedido" });
		await expect(pedido).toBeVisible();
		await page.waitForTimeout(300);
		const caja = (await pedido.boundingBox())!;
		expect(Math.round(caja.x + caja.width)).toBe(390);
		expect(caja.y).toBe(0);
		expect(Math.round(caja.height)).toBe(800);
		expect(caja.width).toBeLessThanOrEqual(390 - 48);
		// Acciones apiladas a todo el ancho, la principal arriba.
		const enviar = (await pedido.getByRole("button", { name: "Enviar a cocina" }).boundingBox())!;
		const seguir = (await pedido.getByRole("button", { name: "Seguir pidiendo" }).boundingBox())!;
		expect(enviar.y).toBeLessThan(seguir.y);
		expect(Math.abs(enviar.width - seguir.width)).toBeLessThan(1);
		await page.keyboard.press("Escape");
		await expect(pedido).toBeHidden();
		await expect(prueba(page, "abrir-panel")).toBeFocused();

		await prueba(page, "abrir-menu").click();
		const menu = page.getByRole("dialog", { name: "El Quijote" });
		await expect(menu).toBeVisible();
		await page.waitForTimeout(300);
		expect((await menu.boundingBox())!.x).toBe(0);
		await menu.getByRole("link", { name: "Tarjeta" }).click();
		await expect(menu).toBeHidden();
	});

	test("DialogoConfirmacion: foco en «Cancelar», el velo no la cierra y confirma con carga", async ({ page }) => {
		await abrirCatalogo(page);
		const disparador = prueba(page, "abrir-confirmacion");
		await disparador.click();
		const confirmacion = page.getByRole("alertdialog", { name: "¿Cancelar la reserva del sábado?" });
		await expect(confirmacion).toBeVisible();
		await expect(confirmacion).toHaveAccessibleDescription(/No se puede deshacer/);
		await expect(confirmacion.getByRole("button", { name: "Conservar reserva" })).toBeFocused();

		await page.mouse.click(4, 4);
		await expect(confirmacion).toBeVisible();

		// Localizador estable: al cargar, su nombre accesible pasa a «Cancelando…».
		const confirmar = confirmacion.locator("footer button").last();
		await expect(confirmar).toHaveAccessibleName("Cancelar reserva");
		await confirmar.click();
		await expect(confirmar).toHaveAccessibleName("Cancelando…");
		await expect(confirmar).toHaveAttribute("aria-busy", "true");
		await expect(confirmacion.getByRole("button", { name: "Conservar reserva" })).toHaveAttribute("aria-disabled", "true");
		await page.keyboard.press("Escape");
		await expect(confirmacion).toBeVisible();
		await expect(confirmacion).toBeHidden({ timeout: 5_000 });
		await expect(prueba(page, "resultado-confirmacion")).toHaveText("Reserva cancelada.");
		await expect(disparador).toBeFocused();
	});

	test("DialogoConfirmacion: si la acción falla, se queda abierta con el error", async ({ page }) => {
		await abrirCatalogo(page);
		await prueba(page, "abrir-fallo").click();
		const confirmacion = page.getByRole("alertdialog", { name: "¿Eliminar «Mole de olla» de la carta?" });
		const eliminar = confirmacion.getByRole("button", { name: "Eliminar platillo" });
		await eliminar.click();
		await expect(confirmacion.getByRole("alert")).toHaveText(/No se pudo eliminar el platillo/, { timeout: 3_000 });
		await expect(confirmacion).toBeVisible();
		await expect(eliminar).not.toHaveAttribute("aria-busy", "true");
		// Se puede reintentar o salir.
		await confirmacion.getByRole("button", { name: "Conservar" }).click();
		await expect(confirmacion).toBeHidden();
	});

	test("useConfirmacion devuelve la respuesta como una promesa", async ({ page }) => {
		await abrirCatalogo(page);
		const disparador = prueba(page, "abrir-hook");
		const resultado = prueba(page, "resultado-hook");
		await disparador.click();
		const confirmacion = page.getByRole("alertdialog", { name: /Lácteos de la Huasteca/ });
		await confirmacion.getByRole("button", { name: "Conservar" }).click();
		await expect(resultado).toHaveText("Respuesta: conservar.");
		await expect(confirmacion).toBeHidden();
		await expect(disparador).toBeFocused();

		await disparador.click();
		await confirmacion.getByRole("button", { name: "Eliminar proveedor" }).click();
		await expect(resultado).toHaveText("Respuesta: eliminar.");
		await page.keyboard.press("Escape");
		await disparador.click();
		await page.keyboard.press("Escape");
		await expect(resultado).toHaveText("Respuesta: conservar.");
	});

	test("con movimiento reducido no hay animación de entrada", async ({ page }) => {
		await abrirCatalogo(page, { movimiento: "reducido" });
		await prueba(page, "abrir-dialogo").click();
		const duracion = await page
			.getByRole("dialog", { name: "Modificar la reserva" })
			.evaluate((e) => parseFloat(getComputedStyle(e).animationDuration));
		expect(duracion).toBeLessThan(0.001);
	});

	test("a 360 px con texto al 125 %: cabe y el pie se apila con la acción principal arriba", async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 740 });
		await abrirCatalogo(page, { tamanoTexto: "muy-grande" });
		await prueba(page, "abrir-confirmacion").click();
		const confirmacion = page.getByRole("alertdialog");
		await expect(confirmacion).toBeVisible();
		await page.waitForTimeout(300);
		const caja = (await confirmacion.boundingBox())!;
		expect(caja.x).toBeGreaterThan(0);
		expect(caja.x + caja.width).toBeLessThan(360);
		const principal = (await confirmacion.getByRole("button", { name: "Cancelar reserva" }).boundingBox())!;
		const secundaria = (await confirmacion.getByRole("button", { name: "Conservar reserva" }).boundingBox())!;
		expect(principal.y).toBeLessThan(secundaria.y);
		expect(Math.abs(principal.width - secundaria.width)).toBeLessThan(1);
		expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		for (const tamanoTexto of ["normal", "muy-grande"] as const) {
			test(`axe y contraste AA con cada diálogo abierto, tema ${tema}, texto ${tamanoTexto}`, async ({ page }, info) => {
				await abrirCatalogo(page, { tema, tamanoTexto });
				const casos: { abrir: string; rol: "dialog" | "alertdialog"; antes?: (c: Locator) => Promise<void> }[] = [
					{ abrir: "abrir-dialogo", rol: "dialog" },
					{ abrir: "abrir-politica", rol: "dialog" },
					{ abrir: "abrir-panel", rol: "dialog" },
					{ abrir: "abrir-menu", rol: "dialog" },
					{ abrir: "abrir-confirmacion", rol: "alertdialog" },
					{
						abrir: "abrir-fallo",
						rol: "alertdialog",
						// Con el error a la vista.
						antes: async (c) => {
							await c.getByRole("button", { name: "Eliminar platillo" }).click();
							await expect(c.getByRole("alert")).toBeVisible({ timeout: 3_000 });
						},
					},
				];
				mkdirSync(join(SALIDA, info.project.name), { recursive: true });
				for (const caso of casos) {
					await prueba(page, caso.abrir).click();
					const caja = page.getByRole(caso.rol);
					await expect(caja).toBeVisible();
					await caso.antes?.(caja);
					await page.waitForTimeout(350);

					const r = await new AxeBuilder({ page })
						.include(caso.rol === "dialog" ? "[role='dialog']" : "[role='alertdialog']")
						.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
						.analyze();
					expect(r.violations.map((v) => `${caso.abrir} ${v.id}: ${v.nodes.length}`)).toEqual([]);

					const c = await contrasteDe(caja);
					expect(c.muestras, caso.abrir).toBeGreaterThan(0);
					expect(c.texto, `${caso.abrir} texto`).toBeGreaterThanOrEqual(4.5);
					if (c.icono !== null) expect(c.icono, `${caso.abrir} icono`).toBeGreaterThanOrEqual(3);

					await page.screenshot({
						path: join(SALIDA, info.project.name, `${caso.abrir}-${tema}-${tamanoTexto}.png`),
						animations: "disabled",
					});
					await page.keyboard.press("Escape");
					await expect(caja).toBeHidden();
				}
			});
		}
	}
});
