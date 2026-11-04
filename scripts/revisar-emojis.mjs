// Falla si algún archivo del código, versionado o nuevo sin ignorar por .gitignore, contiene emojis
// (PLAN-AMPLIACION D-25): pictogramas extendidos (`\p{Extended_Pictographic}`), el selector de
// variación de emoji (U+FE0F), los modificadores de tono de piel y las secuencias unidas con U+200D.
// Quedan fuera los símbolos de texto que no son pictogramas («©», «®», «™» sin U+FE0F se aceptan
// porque Unicode los marca como pictográficos solo por compatibilidad: se listan en PERMITIDOS).
// Solo informa de archivo y línea. Uso: node scripts/revisar-emojis.mjs (o pnpm revisar:emojis).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const CARPETAS = ["app", "components", "lib", "features", "hooks", "config", "tests", "styles", "providers", "store", "types", "utils", "public"];
const BINARIOS = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|pdf|zip|mp4|webm)$/i;
const PERMITIDOS = new Set(["©", "®", "™"]);
const EMOJI = /\p{Extended_Pictographic}|\u{FE0F}|\u{200D}|[\u{1F3FB}-\u{1F3FF}]/gu;

const rutas = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", ...CARPETAS], {
	cwd: RAIZ,
	encoding: "utf8",
})
	.split("\0")
	.filter(Boolean);

const hallazgos = [];
let revisados = 0;
for (const ruta of rutas) {
	if (BINARIOS.test(ruta)) continue;
	let texto;
	try {
		texto = readFileSync(join(RAIZ, ruta), "utf8");
	} catch {
		continue; // Borrado en el árbol de trabajo y aún sin confirmar.
	}
	if (texto.slice(0, 8000).includes("\0")) continue;
	revisados++;
	texto.split("\n").forEach((linea, i) => {
		const encontrados = [...linea.matchAll(EMOJI)].filter((m) => !PERMITIDOS.has(m[0]));
		if (encontrados.length) hallazgos.push(`${ruta}:${i + 1}`);
	});
}

if (hallazgos.length) {
	console.error(`Emojis en ${hallazgos.length} línea(s) (D-25: usar iconos de Lucide o texto):`);
	for (const h of hallazgos) console.error(`  ${h}`);
	process.exit(1);
}
console.log(`Sin emojis: ${revisados} archivos revisados, versionados y nuevos sin ignorar (${CARPETAS.join(", ")}).`);
