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
			// Se evalúa antes de la captura: en WebKit, Playwright inyecta un estilo para hacerla y la CSP
			// solo de informe lo anota en consola. Es de la herramienta, no de la página (cierre de la fase 2).
			const deLaPagina = [...hallazgos];
			const nombre = `${ruta.replace(/\W+/g, "_") || "inicio"}-${ancho}`;
			await page.screenshot({
				path: `test-results/recorrido/${info.project.name}/${nombre}.png`,
				fullPage: true,
			});
			expect(sinExcepciones(deLaPagina), JSON.stringify(deLaPagina, null, 1)).toEqual([]);
		});
	}
}
