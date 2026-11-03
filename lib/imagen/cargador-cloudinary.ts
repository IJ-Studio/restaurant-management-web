// Cargador de next/image para Cloudinary (PLAN 1.9): Cloudinary elige formato y calidad
// y recorta al ancho que pide next/image, sin pasar por el optimizador de Next.
import type { ImageLoaderProps } from "next/image";
import { RUTA_CLOUDINARY, esImagenPermitida } from "@/config/seguridad/hosts-permitidos";

const ENTREGA = `https://res.cloudinary.com${RUTA_CLOUDINARY}`;

/** Public ID (con carpeta, versión y extensión opcionales): sin «..», espacios ni caracteres de URL. */
const ID_VALIDO = /^(?!.*\.\.)[\w-][\w.-]*(?:\/[\w-][\w.-]*)*$/;

/** Segmento de transformación ya escrito en la URL (`q_auto`, `c_limit,w_400`…). */
const TRANSFORMACION = /^(?:(?:a|ar|b|bo|c|co|dpr|e|f|fl|g|h|l|o|q|r|t|w|x|y|z)_[^,/]+,?)+$/;

/**
 * Devuelve el public ID de una imagen de la nube de la casa, ya sea un ID suelto
 * o una URL de entrega, quitando las transformaciones que trajera. Null si no es válido.
 */
export function idCloudinary(origen: string | URL): string | null {
	let ruta: string;
	if (origen instanceof URL) {
		if (origen.hostname !== "res.cloudinary.com" || !esImagenPermitida(origen) || origen.search) return null;
		ruta = decodeURIComponent(origen.pathname.slice(RUTA_CLOUDINARY.length));
	} else {
		ruta = origen;
	}
	const segmentos = ruta.split("/");
	while (segmentos.length > 1 && TRANSFORMACION.test(segmentos[0])) segmentos.shift();
	const id = segmentos.join("/");
	return ID_VALIDO.test(id) ? id : null;
}

/** `f_auto,q_auto,c_limit,w_<ancho>`: nunca amplía por encima del original. */
export function cargadorCloudinary({ src, width }: ImageLoaderProps): string {
	return `${ENTREGA}f_auto,q_auto,c_limit,w_${width}/${src}`;
}

/**
 * Cargador con un recorte previo encadenado (`c_crop,w_0.9,h_0.9,g_north_west`), que se aplica
 * en la entrega sin modificar el recurso (PLAN 4.3: la marca de agua de la portada). Solo admite
 * una transformación con la sintaxis de Cloudinary; si no lo es, devuelve el cargador normal.
 */
export function cargadorConRecorte(recorte: string) {
	if (!TRANSFORMACION.test(recorte)) return cargadorCloudinary;
	return ({ src, width }: ImageLoaderProps) => `${ENTREGA}${recorte}/f_auto,q_auto,c_limit,w_${width}/${src}`;
}
