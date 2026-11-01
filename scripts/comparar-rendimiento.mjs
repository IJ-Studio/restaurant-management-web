// Compara el rendimiento móvil de `/` entre commits (PLAN, cierre de la fase 1).
// Cada commit se mide en su propio worktree, fuera del repo: instala, compila, sirve con
// `next start` en el puerto 3100 y pasa Lighthouse móvil 3 veces; se queda la mediana.
// Mide lo que está en el commit, no la copia de trabajo.
//
// Uso, desde una terminal y con el editor y los navegadores cerrados:
//   node scripts/comparar-rendimiento.mjs                 766855a (cierre de la fase 0) frente a HEAD
//   node scripts/comparar-rendimiento.mjs <a> <b> [...]   commits concretos, el primero es la referencia
//   node scripts/comparar-rendimiento.mjs --biseccion     si la bajada persiste, busca el primer commit que la causa
// Opciones: --umbral=5 (puntos que cuentan como bajada), --conservar (no borra los worktrees),
//           --forzar (mide aunque haya otros procesos abiertos; el resultado deja de valer).
// Resultados: RENDIMIENTO_DIR o D:\dev-cache\rendimiento\<fecha>\ (resumen.md, resumen.json,
// los JSON de Lighthouse y el registro de cada build). Nunca en test-results/.
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, closeSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const REFERENCIA = "766855a";
const VERSION_LIGHTHOUSE = "12.8.2";
const EJECUCIONES = 3;
const PUERTO = 3100;
const BASE = `http://localhost:${PUERTO}`;
const WINDOWS = process.platform === "win32";

const opciones = process.argv.slice(2).filter((a) => a.startsWith("--"));
const commitsPedidos = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const opcion = (nombre) => opciones.some((o) => o === `--${nombre}` || o.startsWith(`--${nombre}=`));
const UMBRAL = Number(opciones.find((o) => o.startsWith("--umbral="))?.split("=")[1] ?? 5);

const repo = resolve(import.meta.dirname, "..");
const fecha = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const raizSalida = process.env.RENDIMIENTO_DIR ?? (WINDOWS ? "D:\\dev-cache\\rendimiento" : join(repo, "..", "rendimiento"));
const SALIDA = join(raizSalida, fecha);
const ARBOLES = join(raizSalida, "arboles");

// Mismos valores ficticios que playwright.config.ts: el build importa lib/db.ts.
const ENTORNO = {
	...process.env,
	NODE_OPTIONS: "--max-old-space-size=3072",
	NEXT_TELEMETRY_DISABLED: "1",
	DATABASE_URL: "postgres://prueba:prueba@127.0.0.1:5432/prueba",
	JWT_SECRET: "secreto-ficticio-solo-para-pruebas-e2e",
	NEXT_PUBLIC_API_URL: BASE,
	NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "dcb1tspbj",
};

const git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
const mediana = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function buscarChrome() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	const raiz = process.env.PLAYWRIGHT_BROWSERS_PATH ?? (WINDOWS ? "D:\\playwright-browsers" : "");
	if (raiz && existsSync(raiz)) {
		const carpeta = readdirSync(raiz).find((d) => /^chromium-\d+$/.test(d));
		const exe = carpeta && join(raiz, carpeta, "chrome-win64", "chrome.exe");
		if (exe && existsSync(exe)) return exe;
	}
	throw new Error("Define CHROME_PATH o PLAYWRIGHT_BROWSERS_PATH con Chromium instalado.");
}

async function puertoLibre() {
	try {
		await fetch(BASE, { signal: AbortSignal.timeout(2_000) });
		return false;
	} catch {
		return true;
	}
}

/** Editor, navegadores y servidores de Next o Lighthouse abiertos: alteran la medición. */
function procesosQueEstorban() {
	if (!WINDOWS) return [];
	const lista = execFileSync("tasklist", ["/FO", "CSV", "/NH"], { encoding: "latin1" })
		.split(/\r?\n/)
		.map((l) => l.split('","')[0].replace(/^"/, "").toLowerCase());
	const prohibidos = ["code.exe", "code - insiders.exe", "chrome.exe", "msedge.exe", "firefox.exe", "brave.exe", "opera.exe"];
	const abiertos = [...new Set(lista.filter((n) => prohibidos.includes(n)))];
	const nodos = execFileSync(
		"powershell",
		["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { $_.CommandLine }"],
		{ encoding: "utf8" },
	)
		.split(/\r?\n/)
		.filter((c) => /next|lighthouse|playwright/i.test(c));
	return [...abiertos, ...nodos.map((c) => `node: ${c.slice(0, 120)}`)];
}

function memoriaLibreMB() {
	if (!WINDOWS) return null;
	const salida = execFileSync(
		"powershell",
		["-NoProfile", "-Command", "(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory"],
		{ encoding: "utf8" },
	);
	return Math.round(Number(salida.trim()) / 1024);
}

/** Ejecuta un comando dejando su salida en un archivo de registro. */
function ejecutar(comando, args, cwd, registro) {
	const fd = openSync(registro, "a");
	const r = spawnSync(comando, args, { cwd, env: ENTORNO, shell: true, stdio: ["ignore", fd, fd] });
	closeSync(fd);
	if (r.status !== 0) throw new Error(`${comando} ${args.join(" ")} falló (salida ${r.status}); ver ${registro}`);
}

/** Worktrees creados por esta ejecución: se borran al terminar, también si algo falla. */
const arboles = new Set();

function prepararArbol(sha) {
	const dir = join(ARBOLES, sha.slice(0, 12));
	if (!existsSync(dir)) git("worktree", "add", "--detach", dir, sha);
	arboles.add(dir);
	const registro = join(SALIDA, `build-${sha.slice(0, 12)}.log`);
	console.log(`  instalando dependencias (${dir})…`);
	ejecutar("corepack", ["pnpm", "install", "--frozen-lockfile"], dir, registro);
	console.log("  compilando…");
	const inicio = Date.now();
	ejecutar("corepack", ["pnpm", "build"], dir, registro);
	return { dir, segundosBuild: Math.round((Date.now() - inicio) / 1000) };
}

async function servir(dir) {
	const next = join(dir, "node_modules", "next", "dist", "bin", "next");
	const hijo = spawn(process.execPath, [next, "start", "-p", String(PUERTO)], { cwd: dir, env: ENTORNO, stdio: "ignore" });
	for (let i = 0; i < 120; i++) {
		await esperar(1_000);
		try {
			const r = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(10_000) });
			if (r.ok) return hijo;
		} catch {
			// Aún arrancando.
		}
	}
	await parar(hijo);
	throw new Error("next start no respondió en 2 minutos");
}

/** Para el servidor y sus hijos por PID y comprueba que el puerto queda libre. */
async function parar(hijo) {
	if (WINDOWS) spawnSync("taskkill", ["/PID", String(hijo.pid), "/T", "/F"], { stdio: "ignore" });
	else hijo.kill("SIGTERM");
	for (let i = 0; i < 30 && !(await puertoLibre()); i++) await esperar(1_000);
	if (!(await puertoLibre())) throw new Error(`el puerto ${PUERTO} sigue ocupado tras parar el servidor`);
}

const METRICAS = {
	fcp: "first-contentful-paint",
	lcp: "largest-contentful-paint",
	tbt: "total-blocking-time",
	cls: "cumulative-layout-shift",
	si: "speed-index",
};

function lighthouse(sha, i, chrome) {
	const archivo = join(SALIDA, `inicio-movil-${sha.slice(0, 12)}-${i}.json`);
	const args = [
		"-y",
		`lighthouse@${VERSION_LIGHTHOUSE}`,
		`${BASE}/`,
		"--output=json",
		`--output-path="${archivo}"`,
		"--quiet",
		'--chrome-flags="--headless=new --no-sandbox"',
	];
	const r = spawnSync("npx", args, { env: { ...process.env, CHROME_PATH: chrome }, shell: true, stdio: "ignore" });
	if (r.status !== 0 || !existsSync(archivo)) throw new Error(`Lighthouse falló en ${sha.slice(0, 12)}, ejecución ${i}`);
	const informe = JSON.parse(readFileSync(archivo, "utf8"));
	const fila = { rendimiento: Math.round(informe.categories.performance.score * 100) };
	for (const [corto, id] of Object.entries(METRICAS)) fila[corto] = informe.audits[id].numericValue;
	fila.benchmarkIndex = informe.environment?.benchmarkIndex ?? null;
	return fila;
}

const medidos = new Map();

async function medir(sha, chrome) {
	if (medidos.has(sha)) return medidos.get(sha);
	const asunto = git("log", "-1", "--format=%s", sha);
	console.log(`\n${sha.slice(0, 12)} · ${asunto}`);
	const { dir, segundosBuild } = prepararArbol(sha);
	const servidor = await servir(dir);
	const ejecuciones = [];
	try {
		// Una visita previa para que la primera ejecución no pague el arranque en frío.
		await fetch(`${BASE}/`).then((r) => r.arrayBuffer());
		for (let i = 1; i <= EJECUCIONES; i++) {
			ejecuciones.push(lighthouse(sha, i, chrome));
			console.log(`  ejecución ${i}: ${ejecuciones.at(-1).rendimiento}`);
		}
	} finally {
		await parar(servidor);
	}
	const med = Object.fromEntries(
		Object.keys(ejecuciones[0]).map((k) => [k, mediana(ejecuciones.map((e) => e[k] ?? 0))]),
	);
	const resultado = { sha, asunto, segundosBuild, mediana: med, ejecuciones, memoriaLibreMB: memoriaLibreMB() };
	medidos.set(sha, resultado);
	console.log(`  mediana: ${med.rendimiento} (LCP ${Math.round(med.lcp)} ms, TBT ${Math.round(med.tbt)} ms)`);
	return resultado;
}

function escribirResumen(resultados, biseccion) {
	const ms = (v) => `${Math.round(v)} ms`;
	const filas = resultados.map(
		(r) =>
			`| \`${r.sha.slice(0, 12)}\` | ${r.asunto.replace(/\|/g, "\\|")} | **${r.mediana.rendimiento}** | ${r.ejecuciones
				.map((e) => e.rendimiento)
				.join(" / ")} | ${ms(r.mediana.fcp)} | ${ms(r.mediana.lcp)} | ${ms(r.mediana.tbt)} | ${r.mediana.cls.toFixed(3)} | ${ms(r.mediana.si)} | ${Math.round(r.mediana.benchmarkIndex ?? 0)} | ${r.memoriaLibreMB ?? "—"} |`,
	);
	const md = [
		`# Rendimiento móvil de \`/\` · ${fecha}`,
		"",
		`Lighthouse ${VERSION_LIGHTHOUSE}, móvil (limitación simulada), ${EJECUCIONES} ejecuciones por commit y la mediana. Umbral de bajada: ${UMBRAL} puntos.`,
		"",
		"| Commit | Asunto | Mediana | Ejecuciones | FCP | LCP | TBT | CLS | SI | benchmarkIndex | RAM libre (MB) |",
		"|---|---|---|---|---|---|---|---|---|---|---|",
		...filas,
		"",
		biseccion ?? "",
	].join("\n");
	writeFileSync(join(SALIDA, "resumen.md"), md);
	writeFileSync(join(SALIDA, "resumen.json"), JSON.stringify({ fecha, umbral: UMBRAL, resultados, biseccion }, null, 1));
	console.log(`\n${md}\nResultados en ${SALIDA}`);
}

async function principal() {
	const estorban = procesosQueEstorban();
	if (estorban.length && !opcion("forzar")) {
		console.error("Cierra antes de medir (o usa --forzar, y el resultado no vale como comparación):");
		for (const p of estorban) console.error(`  - ${p}`);
		process.exit(1);
	}
	if (!(await puertoLibre())) {
		console.error(`El puerto ${PUERTO} está ocupado: para ese servidor antes de medir.`);
		process.exit(1);
	}
	mkdirSync(SALIDA, { recursive: true });
	mkdirSync(ARBOLES, { recursive: true });
	const chrome = buscarChrome();

	const shas = (commitsPedidos.length ? commitsPedidos : [REFERENCIA, "HEAD"]).map((c) => git("rev-parse", c));
	const resultados = [];
	let biseccion = null;
	try {
		for (const sha of shas) resultados.push(await medir(sha, chrome));

		const [referencia] = resultados;
		const actual = resultados.at(-1);
		const baja = referencia.mediana.rendimiento - actual.mediana.rendimiento;
		if (opcion("biseccion") && baja >= UMBRAL) {
			// Primer commit cuya mediana queda a UMBRAL o más puntos por debajo de la referencia.
			const lista = git("rev-list", "--first-parent", "--reverse", `${referencia.sha}..${actual.sha}`).split(/\s+/);
			let bueno = -1;
			let malo = lista.length - 1;
			while (malo - bueno > 1) {
				const medio = Math.floor((bueno + malo) / 2);
				const r = await medir(lista[medio], chrome);
				resultados.push(r);
				if (referencia.mediana.rendimiento - r.mediana.rendimiento >= UMBRAL) malo = medio;
				else bueno = medio;
			}
			const culpable = medidos.get(lista[malo]) ?? (await medir(lista[malo], chrome));
			biseccion =
				`**Bisección:** el primer commit con la bajada es \`${culpable.sha.slice(0, 12)}\` · ${culpable.asunto} ` +
				`(mediana ${culpable.mediana.rendimiento} frente a ${referencia.mediana.rendimiento}). ` +
				"Con 3 ejecuciones hay ruido: si dos commits seguidos quedan cerca del umbral, repetirlos.";
		} else if (opcion("biseccion")) {
			biseccion = `**Bisección no necesaria:** la diferencia (${baja} puntos) no llega al umbral de ${UMBRAL}.`;
		}
	} finally {
		if (resultados.length) escribirResumen(resultados, biseccion);
		if (!opcion("conservar")) {
			for (const dir of arboles) if (existsSync(dir)) git("worktree", "remove", "--force", dir);
		}
	}
}

await principal();
