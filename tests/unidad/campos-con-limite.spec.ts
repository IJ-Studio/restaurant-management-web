import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Guarda automática (DV-15, docs/validaciones-publicas.md del API): todo campo de texto de la web
// (`Campo`, `AreaTexto`, `input`, `textarea`) declara `maxLength`. Un formulario nuevo sin límite
// hace fallar esta prueba. Los tipos que no son texto (fecha, número, casilla…) no lo necesitan.
const SIN_TEXTO = /\btype=\{?["'](date|time|number|checkbox|radio|file|hidden|color|range|datetime-local|month|week|submit|button)["']/;
const CARPETAS = ["app", "components", "features"];

function archivos(dir: string): string[] {
	return readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		// `(dev)`: demos del catálogo de componentes, no son formularios del sitio.
		if (statSync(p).isDirectory()) return /node_modules|\.next|\(dev\)/.test(p) ? [] : archivos(p);
		return p.endsWith(".tsx") ? [p] : [];
	});
}

/** Atributos de cada etiqueta, contando llaves para no cortar en el `>` de una función flecha. */
function etiquetas(fuente: string) {
	const out: { etiqueta: string; atributos: string; linea: number }[] = [];
	for (const m of fuente.matchAll(/<(Campo|AreaTexto|input|textarea)\b/g)) {
		let i = m.index + m[0].length;
		for (let prof = 0; i < fuente.length; i++) {
			const c = fuente[i];
			if (c === "{") prof++;
			else if (c === "}") prof--;
			else if (c === ">" && prof === 0) break;
		}
		out.push({ etiqueta: m[1], atributos: fuente.slice(m.index + m[0].length, i), linea: fuente.slice(0, m.index).split("\n").length });
	}
	return out;
}

test("todo campo de texto de la web tiene maxLength", () => {
	const sinLimite = CARPETAS.flatMap(archivos).flatMap((f) =>
		etiquetas(readFileSync(f, "utf8"))
			.filter((e) => !SIN_TEXTO.test(e.atributos) && !/\bmaxLength\b/.test(e.atributos))
			.map((e) => `${f}:${e.linea} <${e.etiqueta}>`),
	);
	expect(sinLimite).toEqual([]);
});
