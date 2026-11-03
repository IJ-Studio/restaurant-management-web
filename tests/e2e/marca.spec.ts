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

		// Cabecera del sitio (PLAN 4.1), renderizada en el servidor: su logo y el del pie siguen al
		// tema. La variante transparente sobre la portada llega en el 4.3.
		const cabecera = page.locator("header.cabecera-sitio").getByRole("img", { name: "El Quijote, restaurante" });
		const pie = page.locator("footer").getByRole("img", { name: "El Quijote, restaurante" });
		const color = (l: typeof pie) => l.evaluate((e) => getComputedStyle(e).color);
		await expect(pie).toBeVisible();
		await expect(cabecera).toBeVisible();
		expect(await pie.evaluate((e) => e.tagName.toLowerCase())).toBe("svg");
		expect(await color(pie)).toBe("rgb(239, 231, 218)"); // --color-texto-principal, oscuro
		expect(await color(cabecera)).toBe("rgb(239, 231, 218)");

		await page.evaluate((c) => localStorage.setItem(c, JSON.stringify({ v: 1, tema: "claro" })), CLAVE);
		await page.reload({ waitUntil: "load" });
		await expect(pie).toBeVisible();
		await expect(cabecera).toBeVisible();
		expect(await color(pie)).toBe("rgb(30, 24, 19)"); // --color-texto-principal, claro
		expect(await color(cabecera)).toBe("rgb(30, 24, 19)");
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

// PLAN 4.1: la cabecera, el pie y «Saltar al contenido» llegan en el HTML del servidor.
test.describe("marco público renderizado en el servidor (4.1)", () => {
	test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

	for (const ruta of ["/", "/menu", "/about", "/login"]) {
		test(`${ruta}: cabecera, main y pie en el HTML sin JavaScript`, async ({ request }) => {
			const html = await (await request.get(ruta)).text();
			expect(html).toContain('class="cabecera-sitio"');
			expect(html).toContain('href="#contenido"');
			expect(html).toMatch(/<main[^>]*id="contenido"/);
			expect(html).toContain("<footer");
			expect(html.match(/<main\b/g)?.length).toBe(1);
		});
	}

	test("«Saltar al contenido» es lo primero del tabulador y lleva al main", async ({ page }) => {
		await simularApi(page);
		await page.goto("/about", { waitUntil: "load" });
		await page.keyboard.press("Tab");
		const enlace = page.getByRole("link", { name: "Saltar al contenido" });
		await expect(enlace).toBeFocused();
		await expect(enlace).toBeInViewport();
		await page.keyboard.press("Enter");
		await expect(page.locator("main#contenido")).toBeFocused();
	});

	test("los paneles no llevan la cabecera pública", async ({ request }) => {
		const html = await (await request.get("/dashboard", { maxRedirects: 0, failOnStatusCode: false })).text();
		expect(html).not.toContain('class="cabecera-sitio"');
	});
});
