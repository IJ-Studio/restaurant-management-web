import { test, expect } from "@playwright/test";
import { ANCHOS, RUTAS_PUBLICAS } from "./rutas";
import { inspeccionarDom, sinExcepciones, vigilar, vigilarCsp } from "./utilidades/vigilantes";

// Las rutas de panel se recorren con sesión simulada en el paso 0.7.
for (const ruta of RUTAS_PUBLICAS) {
	for (const ancho of ANCHOS) {
		test(`${ruta} @${ancho}`, async ({ page }, info) => {
			test.setTimeout(120_000); // la primera visita en next dev compila la ruta
			await page.setViewportSize({ width: ancho, height: 900 });
			const hallazgos = vigilar(page);
			await vigilarCsp(page);
			await page.goto(ruta, { waitUntil: "load" });
			await page.waitForTimeout(1500); // deja que carguen imágenes y peticiones diferidas
			hallazgos.push(...(await inspeccionarDom(page)));
			const nombre = `${ruta.replace(/\W+/g, "_") || "inicio"}-${ancho}`;
			await page.screenshot({
				path: `test-results/recorrido/${info.project.name}/${nombre}.png`,
				fullPage: true,
			});
			expect(sinExcepciones(hallazgos), JSON.stringify(hallazgos, null, 1)).toEqual([]);
		});
	}
}
