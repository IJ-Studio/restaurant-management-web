// Fuente única de los orígenes externos del front (PLAN 1.9). La leen next.config.ts
// (images.remotePatterns), el componente Imagen y, en la fase 2, la CSP de proxy.ts.
// Añadir un host aquí lo permite en todos esos sitios a la vez: hacerlo solo con un
// uso real comprobado y anotar el motivo.

/** Nube de Cloudinary de la casa. No es secreto: va en cada URL de imagen. */
export const NUBE_CLOUDINARY = "dcb1tspbj";

/** Ruta de entrega de imágenes de esa nube; todo lo demás de res.cloudinary.com queda fuera. */
export const RUTA_CLOUDINARY = `/${NUBE_CLOUDINARY}/image/upload/`;

export interface HostImagen {
	host: string;
	/** Prefijo de ruta permitido, con barra final. */
	ruta: string;
	motivo: string;
}

/** Orígenes de imagen: solo https, sin puerto ni credenciales, y bajo su ruta. */
export const HOSTS_IMAGEN: readonly HostImagen[] = [
	{ host: "res.cloudinary.com", ruta: RUTA_CLOUDINARY, motivo: "Fotos de la casa y de la carta (ESTADO §8.1)" },
	{
		host: "mdygrtdebtmuhmirnbxz.supabase.co",
		// No verificado con datos reales: se conserva toda la ruta que ya permitía next.config.
		ruta: "/",
		motivo: "Fotos de platos y categorías que envía el API (Supabase Storage)",
	},
];

/** Orígenes a los que el navegador se conecta (fetch, XHR), además del propio. */
export const HOSTS_CONEXION: readonly string[] = [
	// Subida de imágenes desde el admin con CldUploadButton.
	"https://api.cloudinary.com",
];

/** Hosts a los que se puede enlazar desde datos del API (redes y mapa), solo por https (PLAN 2.13). */
export const HOSTS_ENLACE: readonly string[] = [
	"www.facebook.com",
	"facebook.com",
	"www.instagram.com",
	"instagram.com",
	"maps.google.com",
	"www.google.com",
	"google.com",
	"maps.app.goo.gl",
];

/** Orígenes que se pueden incrustar en un marco. */
export const HOSTS_MARCO: readonly string[] = [
	// Mapa de /about (google.com/maps/embed).
	"https://www.google.com",
	// Widget de subida de CldUploadButton.
	"https://upload-widget.cloudinary.com",
];

/** Origen del API del backend, si la variable pública es una URL válida. */
export function origenApi(): string | null {
	const valor = process.env.NEXT_PUBLIC_API_URL?.trim();
	if (!valor) return null;
	try {
		return new URL(valor).origin;
	} catch {
		return null;
	}
}

/** Indica si una URL ya analizada apunta a un origen de imagen permitido. */
export function esImagenPermitida(url: URL): boolean {
	if (url.protocol !== "https:" || url.port || url.username || url.password) return false;
	return HOSTS_IMAGEN.some((h) => url.hostname === h.host && url.pathname.startsWith(h.ruta));
}
