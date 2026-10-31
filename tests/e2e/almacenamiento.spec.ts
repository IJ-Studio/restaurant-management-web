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

// Se resuelve en el paso 2.7 (se retira el service worker) y 2.14 (limpieza de cachés).
test("Cache Storage vacío y sin service worker", async ({ page }) => {
	test.skip(process.env.E2E_MODO === "dev", "el service worker solo se registra en el build de producción");
	test.fail(true, "paso 2.7 / 2.14: aún hay service worker y cachés");
	await recorrer(page);
	const r = await page.evaluate(async () => ({
		caches: await caches.keys(),
		workers: (await navigator.serviceWorker.getRegistrations()).length,
	}));
	expect(r.caches).toEqual([]);
	expect(r.workers).toBe(0);
});
