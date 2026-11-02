/**
 * Cabeceras de seguridad de todas las respuestas (PLAN 2.2). Las aplica `next.config.ts`; la
 * Content-Security-Policy no está aquí porque necesita un nonce por petición (`proxy.ts`, 2.3).
 *
 * - No se activa `Cross-Origin-Embedder-Policy`: rompería las imágenes de Cloudinary y Stripe.
 * - `Cross-Origin-Opener-Policy` permite los popups de 3-D Secure de Stripe.
 * - `Permissions-Policy` deja el micrófono (búsqueda por voz) y la geolocalización (distancia al
 *   restaurante) al propio sitio, y el pago a Stripe.
 */
/**
 * Rutas con datos personales o de sesión: ni el navegador ni un proxy intermedio guardan copia
 * (PLAN 2.6). Los estáticos versionados de /_next/static conservan su caché inmutable.
 */
export const RUTAS_SIN_CACHE = [
	"/dashboard/:path*",
	"/profile",
	"/menu/pedido/:path*",
	"/login",
	"/register",
	"/reset",
	"/frm_reset",
];
export const CABECERA_SIN_CACHE = { key: "Cache-Control", value: "private, no-store, max-age=0" };

export const CABECERAS_SEGURIDAD = [
	{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	// Redundante con frame-ancestors de la CSP, para navegadores antiguos.
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value: 'camera=(), microphone=(self), geolocation=(self), payment=(self "https://js.stripe.com"), usb=(), browsing-topics=()',
	},
	{ key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
	{ key: "Cross-Origin-Resource-Policy", value: "same-site" },
	{ key: "Origin-Agent-Cluster", value: "?1" },
];
