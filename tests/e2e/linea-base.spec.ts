import { test, expect } from "@playwright/test";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { ANCHOS, RUTAS_PANEL, RUTAS_PUBLICAS } from "./rutas";
import { archivoSesion, rolParaRuta } from "./roles";
import { simularApi } from "./utilidades/api-simulada";

test.describe.configure({ timeout: 60_000 }); // la primera visita en next dev compila la ruta

// LINEA_BASE_DIR permite guardar fuera de test-results/, que Playwright vacía en cada ejecución.
const SALIDA = process.env.LINEA_BASE_DIR ?? "test-results/linea-base";
const TABLA = `${SALIDA}/rutas.txt`;

test.beforeAll(() => {
	mkdirSync(SALIDA, { recursive: true });
	if (test.info().project.name === "chromium") writeFileSync(TABLA, "ruta\trol\truta final\n");
});

function grupo(titulo: string, rutas: readonly string[], conSesion: boolean) {
	test.describe(titulo, () => {
		for (const ruta of rutas) {
			test(`${ruta}`, async ({ browser }, info) => {
				const rol = conSesion ? rolParaRuta(ruta) : "anónimo";
				const contexto = await browser.newContext(conSesion ? { storageState: archivoSesion(rolParaRuta(ruta)) } : {});
				const page = await contexto.newPage();
				await simularApi(page);
				const nombre = ruta.replace(/\W+/g, "_") || "inicio";
				let finalUrl = "";
				for (const ancho of ANCHOS) {
					await page.setViewportSize({ width: ancho, height: 900 });
					await page.goto(ruta, { waitUntil: "load" });
					await page.waitForTimeout(1000);
					await page.evaluate(() => document.fonts.ready);
					finalUrl = new URL(page.url()).pathname;
					await page.screenshot({ path: `${SALIDA}/${info.project.name}/${nombre}-${ancho}.png`, fullPage: true, animations: "disabled", caret: "hide" });
				}
				appendFileSync(TABLA, `${ruta}\t${rol}\t${finalUrl}\n`);
				await contexto.close();
				expect(finalUrl).not.toBe("");
			});
		}
	});
}

grupo("rutas públicas", RUTAS_PUBLICAS, false);
grupo("rutas de panel con sesión simulada", RUTAS_PANEL, true);
