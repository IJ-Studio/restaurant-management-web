/**
 * App de operaciones del personal (PLAN-AMPLIACION D-37).
 *
 * Para mostrar el bloque con el código QR en los paneles de caja, cocina y sala:
 * 1. Guarda la imagen del QR en `public/` (por ejemplo, `public/app-operaciones/qr.png`).
 * 2. Escribe aquí su ruta pública (`"/app-operaciones/qr.png"`).
 * Con la ruta vacía, el bloque no se muestra. No se escribe ninguna dirección de tienda de
 * aplicaciones: el QR es lo único que se publica.
 */
export const APP_OPERACIONES = {
	/** Ruta pública de la imagen del QR, bajo `public/`. Vacía: el bloque no aparece. */
	rutaImagenQr: "",
} as const;
