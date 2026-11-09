import { test, expect, type Page } from "@playwright/test";
import { simularApi } from "./utilidades/api-simulada";
import { EXCEPCIONES, cubre } from "./excepciones";

const CLAVE = "elquijote:preferencias";

/**
 * Registra los atributos de <html> en el instante en que aparece <body>, antes de
 * que se pinte contenido. Si coinciden con lo guardado, no hay parpadeo.
 */
async function capturarAtributosIniciales(page: Page, guardado: Record<string, string> | null, antiguo?: string) {
	await page.addInitScript(
		([clave, valor, tema]) => {
			if (!sessionStorage.getItem("__sembrado")) {
				sessionStorage.setItem("__sembrado", "1");
				localStorage.clear();
				if (valor) localStorage.setItem(clave as string, valor as string);
				if (tema) localStorage.setItem("theme", tema as string);
			}
			const w = window as unknown as { __inicio?: Record<string, string | undefined> };
			const obs = new MutationObserver(() => {
				if (document.body && !w.__inicio) {
					const d = document.documentElement.dataset;
					w.__inicio = { tema: d.tema, tamano: d.tamanoTexto, movimiento: d.movimiento };
					obs.disconnect();
				}
			});
			obs.observe(document, { childList: true, subtree: true });
		},
		[CLAVE, guardado ? JSON.stringify({ v: 1, ...guardado }) : null, antiguo ?? null] as const,
	);
}

test.describe("preferencias de accesibilidad", () => {
	test.describe.configure({ timeout: 90_000 });

	test("tema claro, texto muy grande y movimiento reducido se aplican antes de pintar", async ({ page }) => {
		await simularApi(page);
		await capturarAtributosIniciales(page, { tema: "claro", tamanoTexto: "muy-grande", movimiento: "reducido" });
		await page.goto("/", { waitUntil: "load" });
		const inicio = await page.evaluate(() => (window as unknown as { __inicio: unknown }).__inicio);
		expect(inicio).toEqual({ tema: "claro", tamano: "muy-grande", movimiento: "reducido" });
		const fondo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(fondo).toBe("rgb(244, 238, 227)"); // --color-fondo del tema claro
		const raiz = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
		expect(raiz).toBe("20px"); // 125 %
	});

	test("sin preferencias: oscuro por defecto y nada guardado salvo la clave propia", async ({ page }) => {
		await simularApi(page);
		await capturarAtributosIniciales(page, null);
		await page.goto("/", { waitUntil: "load" });
		const inicio = await page.evaluate(() => (window as unknown as { __inicio: unknown }).__inicio);
		expect(inicio).toEqual({ tema: "oscuro", tamano: undefined, movimiento: undefined });
		await page.waitForTimeout(500);
		const claves = await page.evaluate(() => Object.keys(localStorage).filter((k) => !["authToken", "user", "num_mesa"].includes(k)));
		expect(claves.filter((k) => k !== CLAVE)).toEqual([]);
	});

	test("migra la clave antigua 'theme' una vez y la borra", async ({ page }) => {
		await simularApi(page);
		await capturarAtributosIniciales(page, null, "light");
		await page.goto("/", { waitUntil: "load" });
		const inicio = await page.evaluate(() => (window as unknown as { __inicio: { tema: string } }).__inicio);
		expect(inicio.tema).toBe("claro");
		await page.waitForTimeout(500);
		const estado = await page.evaluate((c) => ({ nueva: localStorage.getItem(c), vieja: localStorage.getItem("theme") }), CLAVE);
		expect(estado.vieja).toBeNull();
		expect(JSON.parse(estado.nueva ?? "{}")).toMatchObject({ v: 1, tema: "claro" });
	});

	test("la barra del navegador toma el fondo del tema antes de hidratar y sin errores", async ({ page }) => {
		const errores: string[] = [];
		// Las peticiones fallidas las vigila recorrido.spec.ts; aquí, solo errores de script.
		// WebKit rechaza registrar /sw.js en http://localhost: lo resuelve 2.7 (sin service worker).
		const conocido = (t: string) =>
			t.startsWith("Failed to load resource") ||
			t.startsWith("Error al registrar el service worker") ||
			EXCEPCIONES.some((e) => cubre(e, "consola", t));
		page.on("console", (m) => m.type() === "error" && !conocido(m.text()) && errores.push(m.text()));
		page.on("pageerror", (e) => errores.push(e.message));
		await simularApi(page);
		await page.addInitScript(() => {
			const w = window as unknown as { __barra?: string | null };
			document.addEventListener("DOMContentLoaded", () => {
				w.__barra = document.querySelector('meta[name="theme-color"]')?.getAttribute("content");
			});
		});
		// El navegador usa la primera etiqueta theme-color; tras hidratar, todas coinciden.
		const barra = async () => ({
			antes: await page.evaluate(() => (window as unknown as { __barra: string }).__barra),
			despues: await page.locator('meta[name="theme-color"]').evaluateAll((m) => [...new Set(m.map((e) => e.getAttribute("content")))]),
		});

		await page.goto("/", { waitUntil: "load" });
		await page.waitForTimeout(500);
		expect(await barra()).toEqual({ antes: "#14100C", despues: ["#14100C"] });
		expect(await page.locator('meta[name="theme-color"]').count()).toBe(1);

		await page.evaluate((c) => localStorage.setItem(c, JSON.stringify({ v: 1, tema: "claro" })), CLAVE);
		await page.reload({ waitUntil: "load" });
		await page.waitForTimeout(500);
		expect(await barra()).toEqual({ antes: "#F4EEE3", despues: ["#F4EEE3"] });

		await page.getByRole("button", { name: "Opciones de accesibilidad" }).first().click();
		await page.getByRole("radio", { name: "Oscuro" }).check();
		expect((await barra()).despues).toEqual(["#14100C"]);
		expect(await page.locator('meta[name="viewport"]').getAttribute("content")).toBe(
			"width=device-width, initial-scale=1, viewport-fit=cover",
		);
		expect(errores).toEqual([]);
	});

	test("el panel cambia el tema y lo recuerda al recargar", async ({ page }) => {
		await simularApi(page);
		await capturarAtributosIniciales(page, null);
		await page.goto("/", { waitUntil: "load" });
		await page.getByRole("button", { name: "Opciones de accesibilidad" }).first().click();
		await page.getByRole("radio", { name: "Claro" }).check();
		await expect(page.locator("html")).toHaveAttribute("data-tema", "claro");
		await page.reload({ waitUntil: "load" });
		const inicio = await page.evaluate(() => (window as unknown as { __inicio: { tema: string } }).__inicio);
		expect(inicio.tema).toBe("claro");
	});
});
