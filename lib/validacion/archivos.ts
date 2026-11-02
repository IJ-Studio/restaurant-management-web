/**
 * Verificación de archivos antes de subirlos o de pasarlos a una librería (PLAN 3.1, 5.9 y 5.10).
 *
 * Se comprueban, en este orden: que no esté vacío, el tamaño, la extensión, el tipo MIME que
 * declara el navegador y la **firma de bytes** del principio del archivo, que es lo único que no
 * depende del nombre. Además, la firma tiene que corresponder a la extensión: un `.exe`
 * renombrado a `.png`, o un PNG renombrado a `.jpg`, se rechazan.
 *
 * Es una defensa del front: el servidor (o Cloudinary, con un preset firmado, NP-08) debe volver
 * a comprobarlo.
 */
import { z } from "zod";

export type FormatoArchivo = "jpeg" | "png" | "webp" | "avif" | "xlsx";
export type ClaseArchivo = "imagen" | "hoja";

const MB = 1024 * 1024;

/** Tamaños máximos por clase de archivo. */
export const TAMANO_MAXIMO: Record<ClaseArchivo, number> = {
	imagen: 5 * MB,
	hoja: 2 * MB,
};

const FORMATOS: Record<ClaseArchivo, FormatoArchivo[]> = {
	imagen: ["jpeg", "png", "webp", "avif"],
	hoja: ["xlsx"],
};

const EXTENSIONES: Record<FormatoArchivo, string[]> = {
	jpeg: ["jpg", "jpeg"],
	png: ["png"],
	webp: ["webp"],
	avif: ["avif"],
	xlsx: ["xlsx"],
};

const MIME: Record<FormatoArchivo, string> = {
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
	avif: "image/avif",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/** Extensiones aceptadas por clase, para el atributo `accept` de los `<input type="file">`. */
export const ACEPTA: Record<ClaseArchivo, string> = {
	imagen: FORMATOS.imagen.flatMap((f) => [MIME[f], ...EXTENSIONES[f].map((e) => `.${e}`)]).join(","),
	hoja: FORMATOS.hoja.flatMap((f) => [MIME[f], ...EXTENSIONES[f].map((e) => `.${e}`)]).join(","),
};

const BYTES_DE_FIRMA = 16;

const ascii = (bytes: Uint8Array, desde: number, hasta: number) =>
	String.fromCharCode(...bytes.subarray(desde, hasta));

/** Reconoce el formato por los primeros bytes; `null` si no es ninguno de los admitidos. */
export function detectarFormato(bytes: Uint8Array): FormatoArchivo | null {
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
	if (
		bytes.length >= 8 &&
		[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)
	) {
		return "png";
	}
	if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "webp";
	// ISO BMFF: tamaño de caja (4 bytes), «ftyp» y la marca principal. «avis» es AVIF animado.
	if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) {
		return "avif";
	}
	// ZIP (local file header). Un XLSX es un ZIP; que dentro haya una hoja lo comprueba la librería.
	if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
		return "xlsx";
	}
	return null;
}

export type ResultadoArchivo =
	| { valido: true; formato: FormatoArchivo }
	| { valido: false; error: string };

function extensionDe(nombre: string): string {
	const punto = nombre.lastIndexOf(".");
	return punto > 0 ? nombre.slice(punto + 1).toLowerCase() : "";
}

/** Mensajes por clase; sin detalles técnicos. */
const MENSAJES = {
	vacio: "El archivo está vacío.",
	grande: (clase: ClaseArchivo) =>
		`El archivo supera el tamaño máximo de ${TAMANO_MAXIMO[clase] / MB} MB.`,
	tipo: (clase: ClaseArchivo) =>
		clase === "imagen"
			? "Elige una imagen JPG, PNG, WebP o AVIF."
			: "Elige una hoja de cálculo de Excel (.xlsx).",
} as const;

/**
 * Comprueba un archivo de la clase indicada. Lee solo los primeros 16 bytes.
 * El archivo es un `File` (con nombre); un `Blob` sin nombre se rechaza, porque sin extensión
 * no se puede contrastar con la firma.
 */
export async function verificarArchivo(archivo: Blob, clase: ClaseArchivo): Promise<ResultadoArchivo> {
	const nombre = archivo instanceof File ? archivo.name : "";
	if (archivo.size === 0) return { valido: false, error: MENSAJES.vacio };
	if (archivo.size > TAMANO_MAXIMO[clase]) return { valido: false, error: MENSAJES.grande(clase) };

	const extension = extensionDe(nombre);
	const porExtension = FORMATOS[clase].find((f) => EXTENSIONES[f].includes(extension));
	if (!porExtension) return { valido: false, error: MENSAJES.tipo(clase) };

	// Algunos navegadores dejan el tipo vacío (p. ej., AVIF o XLSX en sistemas sin asociación);
	// en ese caso decide la firma. Si viene, debe ser el de la extensión.
	if (archivo.type && archivo.type !== MIME[porExtension]) {
		return { valido: false, error: MENSAJES.tipo(clase) };
	}

	const cabecera = new Uint8Array(await archivo.slice(0, BYTES_DE_FIRMA).arrayBuffer());
	const porFirma = detectarFormato(cabecera);
	if (porFirma !== porExtension) return { valido: false, error: MENSAJES.tipo(clase) };

	return { valido: true, formato: porFirma };
}

/**
 * Esquema zod de un archivo de la clase indicada. La firma se lee de forma asíncrona, así que
 * se valida con `parseAsync` o `safeParseAsync`.
 */
export const esquemaArchivo = (clase: ClaseArchivo) =>
	z.instanceof(Blob, { error: MENSAJES.tipo(clase) }).superRefine(async (archivo, ctx) => {
		const resultado = await verificarArchivo(archivo, clase);
		if (!resultado.valido) ctx.addIssue({ code: "custom", message: resultado.error });
	});

export const esquemaImagen = esquemaArchivo("imagen");
export const esquemaHojaCalculo = esquemaArchivo("hoja");
