// Comprueba que el catálogo de desarrollo (PLAN 3.0) no entra al build de producción:
// ni la ruta ni sus textos de demostración aparecen en .next/server/app ni en .next/static.
// Uso: node scripts/revisar-bundle.mjs (después de pnpm build).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const CARPETAS = [".next/server/app", ".next/static"].map((c) => join(RAIZ, c));
const PROHIBIDOS = ["catalogo", "data-catalogo-dev", "Catálogo de componentes", "Pulsaciones atendidas", "Enviar con fallo"];

for (const carpeta of CARPETAS) {
	if (!existsSync(carpeta)) {
		console.error(`Falta ${carpeta}: ejecuta antes pnpm build.`);
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
for (const carpeta of CARPETAS) {
	for (const ruta of archivos(carpeta)) {
		revisados++;
		const nombre = ruta.toLowerCase();
		if (nombre.includes("catalogo")) hallazgos.push(`${ruta} (nombre de archivo)`);
		if (!/\.(js|mjs|cjs|html|rsc|json|txt|map|css|body|meta)$/.test(nombre)) continue;
		const contenido = readFileSync(ruta, "utf8");
		for (const texto of PROHIBIDOS) if (contenido.includes(texto)) hallazgos.push(`${ruta}: «${texto}»`);
	}
}

if (hallazgos.length) {
	console.error(`El catálogo de desarrollo aparece en el build (${hallazgos.length}):`);
	for (const h of hallazgos) console.error(`  ${h}`);
	process.exit(1);
}
console.log(`Build limpio: ${revisados} archivos revisados sin rastro del catálogo.`);
