// Validación del origen de una imagen antes de pintarla (PLAN 1.9). Sin dependencias de
// React para poder probarla sola.
import type { ImageLoader } from "next/image";
import { esImagenPermitida } from "@/config/seguridad/hosts-permitidos";
import { cargadorCloudinary, idCloudinary } from "./cargador-cloudinary";

export interface OrigenImagen {
	src: string;
	/** Solo en Cloudinary; el resto pasa por el optimizador de Next. */
	loader?: ImageLoader;
}

const CON_ESQUEMA = /^[a-z][a-z\d+.-]*:/i;

/**
 * Decide de dónde sale una imagen: ruta local de `public/`, public ID o URL de la nube
 * de la casa, o URL https de un host permitido. Cualquier otra cosa (http, data:,
 * javascript:, hosts no listados, rutas con «..») devuelve null y se pinta el respaldo.
 */
export function resolverOrigen(src: string | null | undefined): OrigenImagen | null {
	const valor = src?.trim();
	if (!valor) return null;

	if (valor.startsWith("/")) {
		// «//host/…» es una URL sin esquema, no una ruta local.
		if (valor.startsWith("//") || valor.includes("..") || valor.includes("\\")) return null;
		return { src: valor };
	}

	if (!CON_ESQUEMA.test(valor)) {
		const id = idCloudinary(valor);
		return id ? { src: id, loader: cargadorCloudinary } : null;
	}

	let url: URL;
	try {
		url = new URL(valor);
	} catch {
		return null;
	}
	if (!esImagenPermitida(url)) return null;
	if (url.hostname === "res.cloudinary.com") {
		const id = idCloudinary(url);
		return id ? { src: id, loader: cargadorCloudinary } : null;
	}
	return { src: url.href };
}
