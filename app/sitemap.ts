import type { MetadataRoute } from "next";

/**
 * Mapa del sitio público. Incluye las páginas legales que se capturan en Google Play
 * (/privacidad y /eliminar-cuenta). La URL base sale de NEXT_PUBLIC_SITE_URL en Vercel.
 */
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://el-quijote.vercel.app").replace(/\/+$/, "");

const RUTAS = [
	"/",
	"/menu",
	"/promociones",
	"/reservations",
	"/about",
	"/ayuda",
	"/corporativo",
	"/condiciones",
	"/privacidad",
	"/privacidad/personal",
	"/eliminar-cuenta",
	"/cookies",
	"/devoluciones",
	"/seguridad",
];

export default function sitemap(): MetadataRoute.Sitemap {
	return RUTAS.map((ruta) => ({ url: `${BASE}${ruta === "/" ? "" : ruta}` }));
}
