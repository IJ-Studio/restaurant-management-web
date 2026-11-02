import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// El catálogo solo existe en next dev (PLAN 3.0). En producción debe dar 404.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";
const SALIDA = join("test-results", "catalogo");

test.describe("catálogo en producción", () => {
	test.skip(MODO_DEV, "se comprueba contra next start");
	test("/catalogo no existe en el build", async ({ request }) => {
		expect((await request.get("/catalogo")).status()).toBe(404);
	});
});

interface Medida {
	seccion: string;
	fila: string;
	columna: string;
	texto: number | null;
	borde: number | null;
	exento: boolean;
}

/** Mide todas las muestras con una implementación propia, independiente de la del catálogo. */
async function medir(page: Page): Promise<Medida[]> {
	return page.evaluate(() => {
		const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", {
			willReadFrequently: true,
		})!;
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
		return [...document.querySelectorAll("[data-muestra]")].map((m) => {
			const control = m.firstElementChild!;
			const conTexto = [control, ...control.querySelectorAll("*")].filter(
				(e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) && visible(e),
			);
			const s = getComputedStyle(control);
			const detras = fondo(control.parentElement);
			const bordes: number[] = [];
			if (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) bordes.push(rel(rgba(s.outlineColor), detras));
			if (control.hasAttribute("data-borde-control")) bordes.push(rel(rgba(s.borderTopColor), detras));
			// Iconos: contraste no textual (WCAG 1.4.11), mínimo 3:1.
			const icono = control.querySelector("svg");
			if (icono && visible(icono)) bordes.push(rel(rgba(getComputedStyle(icono).color), fondo(icono)));
			const celda = m.closest("td");
			const tabla = m.closest("table");
			return {
				seccion: m.closest("section")?.id ?? "",
				fila: m.closest("tr")?.querySelector("th code")?.textContent ?? control.textContent?.trim().slice(0, 40) ?? "",
				columna: celda && tabla ? (tabla.querySelectorAll("thead th")[celda.cellIndex]?.textContent ?? "") : "",
				texto: conTexto.length ? Math.min(...conTexto.map((e) => rel(rgba(getComputedStyle(e).color), fondo(e)))) : null,
				borde: bordes.length ? Math.min(...bordes) : null,
				exento: control.getAttribute("aria-disabled") === "true",
			};
		});
	});
}

async function abrir(page: Page, preferencias: Record<string, string>) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	// Las transiciones de color duran 180 ms.
	await page.waitForTimeout(500);
}

test.describe("catálogo de componentes", () => {
	test.skip(!MODO_DEV, "solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	for (const tema of ["oscuro", "claro"] as const) {
		test(`contraste AA de todas las muestras en tema ${tema}`, async ({ page }, info) => {
			await abrir(page, { tema });
			const medidas = await medir(page);
			expect(medidas.length).toBeGreaterThan(50);
			mkdirSync(SALIDA, { recursive: true });
			writeFileSync(join(SALIDA, `contraste-${info.project.name}-${tema}.json`), JSON.stringify(medidas, null, 1));
			const fallos = medidas.filter((m) => !m.exento && ((m.texto !== null && m.texto < 4.5) || (m.borde !== null && m.borde < 3)));
			expect(fallos, JSON.stringify(fallos, null, 1)).toEqual([]);
			// La lectura del propio catálogo no marca ningún fallo.
			await expect(page.locator("[data-lectura-contraste] .text-error")).toHaveCount(0);
		});

		for (const tamanoTexto of ["normal", "muy-grande"] as const) {
			test(`axe sin violaciones, tema ${tema}, texto ${tamanoTexto}`, async ({ page }, info) => {
				await abrir(page, { tema, tamanoTexto });
				const r = await new AxeBuilder({ page })
					.include("[data-catalogo-dev]")
					.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
					.analyze();
				expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
				for (const id of ["boton", "boton-enlace", "insignia", "tarjeta", "avisos", "campos", "dialogo", "tabla", "estados", "graficas", "marca", "navegacion", "sitio", "paneles"]) {
					await page.locator(`section#${id}`).screenshot({
						path: join(SALIDA, info.project.name, `${id}-${tema}-${tamanoTexto}.png`),
						animations: "disabled",
					});
				}
			});
		}
	}

	test("el hover y el foco reales pintan lo mismo que las muestras fijadas", async ({ page }) => {
		await abrir(page, { tema: "oscuro" });
		const fila = page.locator("section#boton tbody tr").first();
		const reposo = fila.locator("td").nth(0).locator("button");
		const fijado = (n: number) => fila.locator("td").nth(n).locator("button");
		const estilo = (l: typeof reposo) =>
			l.evaluate((e) => {
				const s = getComputedStyle(e);
				return { fondo: s.backgroundColor, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset };
			});
		await reposo.hover();
		await page.waitForTimeout(300);
		expect((await estilo(reposo)).fondo).toBe((await estilo(fijado(1))).fondo);

		await page.mouse.move(0, 0);
		await reposo.focus();
		await page.keyboard.press("Shift+Tab");
		await page.keyboard.press("Tab");
		const real = await estilo(reposo);
		const conFoco = await estilo(fijado(2));
		expect(real.outline).toBe(conFoco.outline);
		expect(real.offset).toBe("3px");
	});

	test("deshabilitado y cargando son enfocables, lo anuncian e ignoran los clics", async ({ page }) => {
		await abrir(page, {});
		const fila = page.locator("section#boton tbody tr").first();
		const deshabilitado = fila.locator("td").nth(4).locator("button");
		const cargando = fila.locator("td").nth(5).locator("button");
		await expect(deshabilitado).toHaveAttribute("aria-disabled", "true");
		await expect(cargando).toHaveAttribute("aria-busy", "true");
		await expect(cargando).toHaveAccessibleName(/Enviando…/);
		await deshabilitado.focus();
		await expect(deshabilitado).toBeFocused();
		// El ancho no cambia al pasar a «Enviando…».
		const anchoReposo = (await fila.locator("td").nth(0).locator("button").boundingBox())!.width;
		expect(Math.abs((await cargando.boundingBox())!.width - anchoReposo)).toBeLessThan(1);
	});

	test("el doble clic solo se atiende una vez mientras dura la operación", async ({ page }) => {
		await abrir(page, {});
		const boton = page.locator('[data-prueba="doble-clic"]');
		const atendidas = page.locator('[data-prueba="atendidas"]');
		// Tres clics seguidos en la misma tarea, antes de que React vuelva a pintar.
		await boton.evaluate((b: HTMLButtonElement) => {
			b.click();
			b.click();
			b.click();
		});
		await expect(atendidas).toHaveText("Pulsaciones atendidas: 1");
		await expect(boton).toHaveAttribute("aria-busy", "true");
		await expect(boton).not.toHaveAttribute("aria-busy", "true", { timeout: 5_000 });
		// Y un doble clic real del ratón.
		await boton.dblclick();
		await expect(atendidas).toHaveText("Pulsaciones atendidas: 2");
	});

	test("el fallo vuelve a reposo y el error se anuncia", async ({ page }) => {
		await abrir(page, {});
		const boton = page.locator('[data-prueba="fallo"]');
		await boton.click();
		await expect(page.getByRole("alert").filter({ hasText: "No se pudo enviar" })).toBeVisible({ timeout: 3_000 });
		await expect(boton).not.toHaveAttribute("aria-busy", "true");
	});

	test("la tarjeta en error reintenta, carga y muestra el contenido", async ({ page }) => {
		await abrir(page, {});
		const tarjeta = page.locator('[data-prueba="reintento"]');
		await expect(tarjeta).toContainText("No se pudo cargar");
		await tarjeta.getByRole("button", { name: "Reintentar" }).click();
		await expect(tarjeta).toHaveAttribute("aria-busy", "true");
		await expect(tarjeta).toContainText("$ 18 420", { timeout: 3_000 });
	});

	test("la tarjeta con enlace se recorre con el teclado y el foco la rodea", async ({ page, browserName }) => {
		await abrir(page, {});
		const enlace = page.locator("section#tarjeta .enlace-tarjeta").first();
		await enlace.focus();
		if (browserName === "webkit") {
			// WebKit, como Safari, no lleva el Tab a los enlaces salvo que se active en sus preferencias.
			await page.keyboard.press("Shift");
			await enlace.focus();
		} else {
			await page.keyboard.press("Shift+Tab");
			await page.keyboard.press("Tab");
		}
		await expect(enlace).toBeFocused();
		const tarjeta = enlace.locator("xpath=ancestor::article[1]");
		expect(await tarjeta.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
	});

	test("sin desborde horizontal a 360 px con texto al 125 %", async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 800 });
		await abrir(page, { tamanoTexto: "muy-grande" });
		const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
		expect(desborda).toBe(false);
	});
});
