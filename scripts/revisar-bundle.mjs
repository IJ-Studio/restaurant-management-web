// Revisión del build de producción (después de pnpm build). Uso: node scripts/revisar-bundle.mjs
//
// 1. El catálogo de desarrollo (PLAN 3.0) y las páginas de prueba de los límites de error (2.17) no
//    entran al build: ni sus rutas ni sus textos aparecen en .next/server/app ni en .next/static.
// 2. El bundle del navegador (.next/static) no contiene patrones de secretos ni mapas de código
//    (PLAN 2.18). Solo se informa del archivo y del número de coincidencias, nunca del valor.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const SERVIDOR = join(RAIZ, ".next/server/app");
const ESTATICOS = join(RAIZ, ".next/static");
const TEXTO = /\.(js|mjs|cjs|html|rsc|json|txt|map|css|body|meta)$/;

/** Contenido solo de desarrollo. */
const PROHIBIDOS_DEV = ["catalogo", "data-catalogo-dev", "Catálogo de componentes", "Pulsaciones atendidas", "Enviar con fallo", "detalle-interno"];
/** Patrones de secretos en el bundle del navegador (PLAN 2.18). */
const SECRETOS = [
	["clave secreta de Stripe (live)", /sk_live_/g],
	["clave secreta de Stripe (test)", /sk_test_/g],
	["clave privada o certificado (PEM)", /-----BEGIN/g],
	["clave service_role", /service_role/g],
	["cadena de conexión de PostgreSQL", /postgres(?:ql)?:\/\//g],
	["JWT (cabecera eyJhbGci)", /eyJhbGci/g],
];

for (const carpeta of [SERVIDOR, ESTATICOS]) {
	if (!existsSync(carpeta)) {
		console.error(`Falta ${relative(RAIZ, carpeta)}: ejecuta antes pnpm build.`);
		process.exit(2);
	}
}

function* archivos(carpeta) {
	for (const nombre of readdirSync(carpeta)) {
		const ruta = join(carpeta, nombre);
		if (statSync(ruta).isDirectory()) yield* archivos(ruta);
		else yield ruta;
	}
}

const hallazgos = [];
let revisados = 0;

// 1. Contenido de desarrollo, en servidor y navegador.
for (const carpeta of [SERVIDOR, ESTATICOS]) {
	for (const ruta of archivos(carpeta)) {
		revisados++;
		const nombre = relative(RAIZ, ruta);
		const minusculas = nombre.toLowerCase();
		if (minusculas.includes("catalogo") || minusculas.includes("prueba-limites")) hallazgos.push(`${nombre}: nombre de archivo de desarrollo`);
		if (!TEXTO.test(minusculas)) continue;
		const contenido = readFileSync(ruta, "utf8");
		for (const texto of PROHIBIDOS_DEV) if (contenido.includes(texto)) hallazgos.push(`${nombre}: texto de desarrollo «${texto}»`);
	}
}

// 2. Secretos y mapas de código en el navegador.
let mapas = 0;
let coincidencias = 0;
for (const ruta of archivos(ESTATICOS)) {
	const nombre = relative(RAIZ, ruta);
	if (nombre.toLowerCase().endsWith(".map")) {
		mapas++;
		hallazgos.push(`${nombre}: mapa de código`);
		continue;
	}
	if (!TEXTO.test(nombre.toLowerCase())) continue;
	const contenido = readFileSync(ruta, "utf8");
	for (const [descripcion, patron] of SECRETOS) {
		const n = contenido.match(patron)?.length ?? 0;
		if (n) {
			coincidencias += n;
			// Nunca se imprime el valor: solo el archivo, el tipo y cuántas veces aparece.
			hallazgos.push(`${nombre}: ${descripcion} × ${n}`);
		}
	}
}

if (hallazgos.length) {
	console.error(`Hallazgos en el build (${hallazgos.length}; secretos: ${coincidencias}; mapas: ${mapas}):`);
	for (const h of hallazgos) console.error(`  ${h}`);
	process.exit(1);
}
console.log(`Build limpio: ${revisados} archivos revisados; sin contenido de desarrollo, 0 coincidencias de secretos y 0 mapas de código.`);
