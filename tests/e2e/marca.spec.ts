import { test, expect } from "@playwright/test";
import { simularApi } from "./utilidades/api-simulada";

const CLAVE = "elquijote:preferencias";

test.describe("logo y sello locales (D-07)", () => {
	test.describe.configure({ timeout: 90_000 });

	test("el logo es un SVG local que toma el color del texto en cada tema", async ({ page }) => {
		const remotas: string[] = [];
		page.on("request", (r) => {
			if (/logo|\.ico\b|\/Ico\//i.test(r.url()) && !r.url().startsWith("http://localhost:3100")) remotas.push(r.url());
		});
		await simularApi(page);
		await page.goto("/menu", { waitUntil: "load" });

		// En /menu la cabecera va sobre la foto: su logo es blanco en los dos temas, como el
		// resto de esa barra. El del pie sigue al tema.
		const cabecera = page.getByRole("img", { name: "El Quijote, restaurante" }).first();
		const pie = page.locator("footer").getByRole("img", { name: "El Quijote, restaurante" });
		const color = (l: typeof pie) => l.evaluate((e) => getComputedStyle(e).color);
		await expect(pie).toBeVisible();
		expect(await pie.evaluate((e) => e.tagName.toLowerCase())).toBe("svg");
		expect(await color(pie)).toBe("rgb(239, 231, 218)"); // --color-texto-principal, oscuro
		expect(await color(cabecera)).toBe("rgb(255, 255, 255)");

		await page.evaluate((c) => localStorage.setItem(c, JSON.stringify({ v: 1, tema: "claro" })), CLAVE);
		await page.reload({ waitUntil: "load" });
		await expect(pie).toBeVisible();
		expect(await color(pie)).toBe("rgb(30, 24, 19)"); // --color-texto-principal, claro
		expect(await color(cabecera)).toBe("rgb(255, 255, 255)");
		expect(remotas).toEqual([]);
	});

	test("iconos locales enlazados y sin el icono remoto", async ({ page, request }) => {
		await simularApi(page);
		await page.goto("/", { waitUntil: "load" });
		const iconos = await page.locator('head link[rel~="icon"], head link[rel="apple-touch-icon"]').evaluateAll((ls) =>
			ls.map((l) => (l as HTMLLinkElement).getAttribute("href") ?? ""),
		);
		expect(iconos.some((h) => h.startsWith("/icon.svg"))).toBe(true);
		expect(iconos.some((h) => h.startsWith("/apple-icon.png"))).toBe(true);
		expect(iconos.filter((h) => !h.startsWith("/"))).toEqual([]);
		for (const ruta of ["/icon.svg", "/apple-icon.png", "/icons/icon-192.png", "/icons/icon-512.png"]) {
			expect((await request.get(ruta)).status(), ruta).toBe(200);
		}
	});
});
