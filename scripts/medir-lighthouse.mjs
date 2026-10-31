// Mide Lighthouse contra `next start` (puerto 3100): móvil y escritorio, 3 ejecuciones
// por página y la mediana. Guarda los JSON en test-results/lighthouse/ y muestra una tabla.
//
// Uso (con el build de producción ya servido en el puerto 3100):
//   node scripts/medir-lighthouse.mjs [ruta ...]
// Navegador: CHROME_PATH, o el Chromium de Playwright (PLAYWRIGHT_BROWSERS_PATH).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3100";
const VERSION_LIGHTHOUSE = "12.8.2";
const EJECUCIONES = 3;
const RUTAS = process.argv.slice(2).length
	? process.argv.slice(2)
	: ["/", "/login", "/menu", "/promociones", "/reservations"];
const SALIDA = "test-results/lighthouse";

function buscarChrome() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	const raiz = process.env.PLAYWRIGHT_BROWSERS_PATH;
	if (raiz && existsSync(raiz)) {
		const carpeta = readdirSync(raiz).find((d) => /^chromium-\d+$/.test(d));
		const exe = carpeta && join(raiz, carpeta, "chrome-win64", "chrome.exe");
		if (exe && existsSync(exe)) return exe;
	}
	throw new Error("Define CHROME_PATH o PLAYWRIGHT_BROWSERS_PATH con Chromium instalado.");
}

const mediana = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const nombre = (ruta) => (ruta.replace(/\W+/g, "_") || "inicio").replace(/^_/, "") || "inicio";

mkdirSync(SALIDA, { recursive: true });
const env = { ...process.env, CHROME_PATH: buscarChrome() };
const filas = [];

for (const modo of ["movil", "escritorio"]) {
	for (const ruta of RUTAS) {
		const puntos = { performance: [], accessibility: [], "best-practices": [], seo: [] };
		for (let i = 1; i <= EJECUCIONES; i++) {
			const archivo = join(SALIDA, `${nombre(ruta)}-${modo}-${i}.json`);
			const args = [
				"-y",
				`lighthouse@${VERSION_LIGHTHOUSE}`,
				`${BASE}${ruta}`,
				"--output=json",
				`--output-path=${archivo}`,
				"--quiet",
				"--chrome-flags=--headless=new --no-sandbox",
				...(modo === "escritorio" ? ["--preset=desktop"] : []),
			];
			const r = spawnSync("npx", args, { env, shell: true, stdio: "ignore" });
			if (r.status !== 0 || !existsSync(archivo)) {
				console.error(`FALLO ${modo} ${ruta} ejecución ${i}`);
				continue;
			}
			const { categories } = JSON.parse(readFileSync(archivo, "utf8"));
			for (const k of Object.keys(puntos)) puntos[k].push(Math.round(categories[k].score * 100));
		}
		const m = (k) => (puntos[k].length ? mediana(puntos[k]) : "—");
		filas.push({
			modo,
			ruta,
			rendimiento: m("performance"),
			accesibilidad: m("accessibility"),
			"buenas prácticas": m("best-practices"),
			seo: m("seo"),
			ejecuciones: puntos.performance.length,
		});
	}
}

console.table(filas);
