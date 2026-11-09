/**
 * ¿Se llegó a esta página desde el propio sitio? Lo necesita «Volver» (PLAN 3.10): si sí, usa
 * el historial (conserva el desplazamiento de la página anterior); si no (enlace externo,
 * marcador, pestaña nueva), lleva a la sección de origen.
 *
 * - Una navegación de Next dentro del sitio no cambia `document.referrer`, así que se cuentan
 *   aparte: `registrarRuta` la llama `useRegistroRuta` en cada cambio de ruta.
 * - Una carga completa desde otra página del sitio deja un `referrer` del mismo origen.
 *
 * El estado vive en memoria (este módulo, por pestaña): no se guarda nada en el navegador.
 */

let rutaAnterior: string | null = null;
let navegacionesInternas = 0;

export function registrarRuta(ruta: string) {
	if (rutaAnterior !== null && rutaAnterior !== ruta) navegacionesInternas++;
	rutaAnterior = ruta;
}

export function vieneDelSitio(): boolean {
	if (navegacionesInternas > 0) return true;
	try {
		return document.referrer !== "" && new URL(document.referrer).origin === window.location.origin;
	} catch {
		return false;
	}
}

/** Solo para pruebas. */
export function reiniciarRegistro() {
	rutaAnterior = null;
	navegacionesInternas = 0;
}
