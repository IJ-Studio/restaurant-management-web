import { test, expect } from "@playwright/test";
import { RUTAS_PUBLICAS } from "./rutas";

test.describe.configure({ timeout: 120_000 }); // recorre 19 rutas; la primera visita en next dev compila

/** Claves permitidas en localStorage: preferencias de accesibilidad (DESIGN.md). */
const CLAVES_APROBADAS = ["elquijote:preferencias"];
/** Excepciones conocidas: authToken/user/num_mesa → D-03, NP-04, NP-12. */
const CLAVES_EXCEPCION = ["authToken", "user", "num_mesa"];

async function recorrer(page: import("@playwright/test").Page) {
	for (const ruta of RUTAS_PUBLICAS) {
		await page.goto(ruta, { waitUntil: "load" });
		await page.waitForTimeout(500);
	}
}

test("localStorage solo contiene claves aprobadas o excepciones conocidas", async ({ page }) => {
	await recorrer(page);
	const claves = await page.evaluate(() => Object.keys(localStorage));
	const extra = claves.filter((c) => ![...CLAVES_APROBADAS, ...CLAVES_EXCEPCION].includes(c));
	// Las claves de dataService (NP-12) se retiran en el paso 2.14; hasta entonces se
	// listan aquí con claridad para que el fallo muestre exactamente cuáles son.
	expect(extra, `claves no aprobadas: ${extra.join(", ")}`).toEqual([]);
});

test("sessionStorage está vacío", async ({ page }) => {
	await recorrer(page);
	expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
});

test("IndexedDB está vacío", async ({ page, browserName }) => {
	test.skip(browserName === "firefox", "indexedDB.databases() no existe en Firefox");
	await recorrer(page);
	const bases = await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name));
	expect(bases).toEqual([]);
});

// Paso 2.7: no hay service worker ni cachés de la aplicación.
test("Cache Storage vacío y sin service worker", async ({ page }) => {
	test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");
	const pedidas: string[] = [];
	page.on("request", (r) => {
		if (new URL(r.url()).pathname === "/sw.js") pedidas.push(r.url());
	});
	await recorrer(page);
	const r = await page.evaluate(async () => ({
		caches: await caches.keys(),
		workers: (await navigator.serviceWorker.getRegistrations()).length,
	}));
	expect(r.caches).toEqual([]);
	expect(r.workers).toBe(0);
	// Ninguna página pide ya /sw.js.
	expect(pedidas).toEqual([]);
});

// Paso 2.7: un navegador que tenía el service worker antiguo queda limpio en la siguiente carga.
test("el service worker antiguo y sus cachés se retiran al recargar", async ({ page, context, browserName }) => {
	test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");
	test.skip(browserName !== "chromium", "basta con un motor: la limpieza usa APIs estándar");
	// El /sw.js antiguo ya no existe en el servidor: la prueba lo sirve para poder instalarlo.
	await context.route("**/sw.js", (ruta) =>
		ruta.fulfill({ contentType: "application/javascript", body: "self.addEventListener('fetch', () => {});" }),
	);
	await page.goto("/menu", { waitUntil: "load" });
	const instalado = await page.evaluate(async () => {
		await caches.open("quijote-v1").then((c) => c.put("/antigua", new Response("x")));
		await navigator.serviceWorker.register("/sw.js", { scope: "/" });
		await navigator.serviceWorker.ready;
		return { workers: (await navigator.serviceWorker.getRegistrations()).length, caches: await caches.keys() };
	});
	expect(instalado.workers).toBe(1);
	expect(instalado.caches).toContain("quijote-v1");

	await page.reload({ waitUntil: "load" });
	await expect
		.poll(() =>
			page.evaluate(async () => ({
				workers: (await navigator.serviceWorker.getRegistrations()).length,
				caches: (await caches.keys()).length,
			})),
		)
		.toEqual({ workers: 0, caches: 0 });
});
