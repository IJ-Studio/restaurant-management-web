// Falla si algún archivo del código, versionado o nuevo sin ignorar por .gitignore, contiene caracteres invisibles peligrosos:
// controles bidireccionales (U+202A a U+202E y U+2066 a U+2069), de ancho cero (U+200B a U+200F)
// U+FEFF fuera del inicio del archivo o caracteres de control C0 y C1 (NP-39). Pueden esconder código
// distinto del que se ve al revisarlo.
// Solo informa de archivo y línea, para no volver a imprimir el carácter.
// Si una cadena necesita uno de estos caracteres, se escribe como escape en el código, nunca literal.
// Uso: node scripts/revisar-caracteres-invisibles.mjs (o pnpm revisar:invisibles). No necesita build.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const CARPETAS = ["app", "components", "lib", "features", "hooks", "config", "tests", "styles"];
const BINARIOS = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|pdf|zip|mp4|webm)$/i;

const BOM = 0xfeff;
function esProhibido(codigo) {
	return (
		// NP-39: controles C0 (salvo tabulador y saltos de línea) y C1, como un retroceso literal.
		(codigo < 0x20 && codigo !== 0x09 && codigo !== 0x0a && codigo !== 0x0d) ||
		(codigo >= 0x7f && codigo <= 0x9f) ||
		(codigo >= 0x202a && codigo <= 0x202e) ||
		(codigo >= 0x2066 && codigo <= 0x2069) ||
		(codigo >= 0x200b && codigo <= 0x200f) ||
		codigo === BOM
	);
}

// Versionados y nuevos aún sin añadir, para detectarlos antes del commit; los ignorados quedan fuera.
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
	let bytes;
	try {
		bytes = readFileSync(join(RAIZ, ruta));
	} catch {
		continue; // Borrado en el árbol de trabajo y aún sin confirmar.
	}
	if (bytes.subarray(0, 8000).includes(0)) continue; // Binario sin extensión conocida.
	revisados++;
	const texto = bytes.toString("utf8");
	let linea = 1;
	let ultimaLineaAnotada = 0;
	for (let i = 0; i < texto.length; i++) {
		const codigo = texto.charCodeAt(i);
		if (codigo === 10) {
			linea++;
			continue;
		}
		if (!esProhibido(codigo) || (codigo === BOM && i === 0)) continue;
		if (linea !== ultimaLineaAnotada) {
			hallazgos.push(`${ruta}:${linea}`);
			ultimaLineaAnotada = linea;
		}
	}
}

if (hallazgos.length) {
	console.error(`Caracteres invisibles prohibidos en ${hallazgos.length} línea(s):`);
	for (const h of hallazgos) console.error(`  ${h}`);
	process.exit(1);
}
console.log(`Sin caracteres invisibles prohibidos: ${revisados} archivos revisados, versionados y nuevos sin ignorar (${CARPETAS.join(", ")}).`);
