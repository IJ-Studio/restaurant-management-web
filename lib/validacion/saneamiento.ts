/**
 * Saneamiento de texto antes de validar o enviar al API.
 *
 * Es una defensa del front, no una frontera de seguridad: el servidor debe validar y sanear
 * otra vez (NP-06). Aquí solo se quita lo que nunca es legítimo en un formulario:
 *
 * - caracteres de control (categoría Cc), salvo el salto de línea en los textos de varias líneas;
 * - controles de dirección bidireccional (U+202A–U+202E y U+2066–U+2069), que permiten
 *   disfrazar el orden visible del texto;
 * - espacios sobrantes al principio y al final.
 *
 * Además, el texto se normaliza a NFC: «é» escrita como «e» + acento combinado pasa a ser un
 * solo carácter, igual que la que llega desde un teclado normal. Así las reglas de letras y los
 * límites de longitud cuentan lo mismo que ve la persona.
 *
 * No se quitan los unificadores de ancho cero (U+200D), porque forman los emoji compuestos.
 */

/** Tope de seguridad para cualquier entrada de texto: nada legítimo de un formulario lo supera. */
export const LONGITUD_MAXIMA_ENTRADA = 5_000;

const CONTROLES_LINEA = /[\u0000-\u001F\u007F-\u009F]/g;
// Igual que el anterior, pero conserva el salto de línea (U+000A).
const CONTROLES_MULTILINEA = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g;
const CONTROLES_BIDI = /[\u202A-\u202E\u2066-\u2069]/g;
const ESPACIOS_SEGUIDOS = /\s+/g;

/** Texto de una sola línea: NFC, sin controles (los saltos y tabuladores pasan a espacio) y recortado. */
export function sanearLinea(valor: string): string {
	return valor
		.slice(0, LONGITUD_MAXIMA_ENTRADA)
		.normalize("NFC")
		.replace(/[\t\r\n]/g, " ")
		.replace(CONTROLES_LINEA, "")
		.replace(CONTROLES_BIDI, "")
		.trim();
}

/** Texto de varias líneas (notas, peticiones): conserva los saltos, unifica `\r\n` y recorta. */
export function sanearMultilinea(valor: string): string {
	return valor
		.slice(0, LONGITUD_MAXIMA_ENTRADA)
		.normalize("NFC")
		.replace(/\r\n?/g, "\n")
		.replace(/\t/g, " ")
		.replace(CONTROLES_MULTILINEA, "")
		.replace(CONTROLES_BIDI, "")
		.trim();
}

/** Línea saneada y con los espacios interiores repetidos reducidos a uno (nombres y apellidos). */
export function sanearNombre(valor: string): string {
	return sanearLinea(valor).replace(ESPACIOS_SEGUIDOS, " ");
}

/** Solo los dígitos (teléfonos y códigos postales escritos con espacios o guiones). */
export function soloDigitos(valor: string): string {
	return valor.slice(0, LONGITUD_MAXIMA_ENTRADA).replace(/\D/g, "");
}

/** Quita tildes y pasa a minúsculas; sirve para comparar textos, no para enviarlos. */
export function normalizarParaComparar(valor: string): string {
	return valor
		.normalize("NFD")
		.replace(/[\u0300-\u036F]/g, "")
		.toLowerCase()
		.trim();
}
