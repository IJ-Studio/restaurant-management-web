import { SECCIONES_LANDING } from "@/config/navegacion-publica";

/**
 * Enlaces de la cabecera (D-19): solo anclas de la landing, ninguno a otra ruta. «Reservar» va
 * aparte, como botón, y también lleva a su sección.
 */
export const ENLACES_CABECERA = [
	SECCIONES_LANDING.portada,
	SECCIONES_LANDING.nosotros,
	SECCIONES_LANDING.menu,
	SECCIONES_LANDING.promociones,
	SECCIONES_LANDING.reservas,
	SECCIONES_LANDING.pedir,
	SECCIONES_LANDING.visitanos,
];
