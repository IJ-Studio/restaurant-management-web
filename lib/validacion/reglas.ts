/**
 * Límites y expresiones de validación, **sin zod**: es la fuente única de las reglas. Las
 * importan los esquemas de `campos.ts` y, mientras existan, las páginas heredadas a través de
 * `utils/validators.tsx`, sin cargar zod en su bundle.
 *
 * Son las reglas de hoy, alineadas con el API en HU-01; no se relajan sin acuerdo con el API (NP-06).
 */

// Límites del API (`GET /reglas` → campos.limites; docs/validaciones-publicas.md §2, DV-03 y DV-04).
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;
export const NOMBRE_COMPLETO_MAX_LENGTH = 120;
export const EMAIL_MAX_LENGTH = 254;

/** `maxLength` de cada tipo de campo de texto (DV-11); los mismos que `LIMITES` del API. */
export const LIMITES_CAMPO = {
	nombre: 60,
	correo: 254,
	telefono: 15,
	contrasena: 64,
	contrasenaAcceso: 128,
	lineaCorta: 150,
	lineaMedia: 100,
	alias: 40,
	referencias: 300,
	notas: 500,
	codigoPostal: 5,
	rfc: 13,
	razonSocial: 300,
	buscador: 80,
} as const;
export const EMAIL_LOCAL_MAX_LENGTH = 64; // parte antes de la @ (límite del RFC que aplica el API)
export const PASSWORD_MAX_LENGTH = 64;
export const EMAIL_DOMAIN_LABEL_MAX_LENGTH = 63; // cada parte del dominio entre puntos (RFC 1035)

// Teléfono (DV-05): lada elegible, +52 por defecto; México son exactamente 10 dígitos y las demás
// ladas de 6 a 12. Se envía en E.164 (`+52XXXXXXXXXX`), igual que lo guarda el API.
export const LADA_MEXICO = "+52";
export const LADAS = [
	{ valor: "+52", texto: "México (+52)" },
	{ valor: "+1", texto: "EE. UU. y Canadá (+1)" },
	{ valor: "+502", texto: "Guatemala (+502)" },
	{ valor: "+57", texto: "Colombia (+57)" },
	{ valor: "+54", texto: "Argentina (+54)" },
	{ valor: "+56", texto: "Chile (+56)" },
	{ valor: "+51", texto: "Perú (+51)" },
	{ valor: "+34", texto: "España (+34)" },
] as const;
export const digitosDeLada = (lada: string) => (lada === LADA_MEXICO ? { min: 10, max: 10 } : { min: 6, max: 12 });
export const PHONE_DIGITS = 10;
export const phoneRegex = /^\d{10}$/;

// Correo: sin puntos consecutivos, y el dominio sin separadores al inicio, al final ni repetidos.
// La extensión (TLD) acepta de 2 a 24 letras (.info, .tech, .online, .digital…).
export const emailRegex =
	/^(?!.*[._-]{2})[a-zA-Z0-9_][a-zA-Z0-9._-]*[a-zA-Z0-9]+@[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,24}$/;

/**
 * Formato que valida el navegador en `<input type="email">` (WHATWG). Es el que aplican hoy los
 * formularios del admin, que no usan `emailRegex`.
 */
export const emailNavegadorRegex =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Nombre (DV-03): letras de cualquier alfabeto; espacio, guion o apóstrofo solo entre letras. Igual
// que `NOMBRE_PERSONA` del API.
export const NOMBRE_PERSONA = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

// Heredadas (las reexporta utils/validators.tsx); ya no las usa ningún esquema.
export const letters = /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ]{1,30}$/;
export const haveAnVowel = /[aeiouáéíóú]/i;
export const noRepeatMoreThreeTimes = /(.)\1{2,}/;
export const noRepeatConsonantsMoreThreeTimes = /(.)\1{2,}/;

// Contraseña.
export const length = /^.{8,64}$/;
export const lowercase = /[a-z]/;
export const uppercase = /[A-Z]/;
export const number = /\d/;
export const specialChar = /[!@#$%&,.-]/;

export const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
export const CP_REGEX = /^\d{5}$/;

/** Correo válido para el registro: formato y los tamaños que acepta el API. */
export const isValidEmail = (value: string): boolean =>
	value.length <= EMAIL_MAX_LENGTH &&
	value.split("@")[0].length <= EMAIL_LOCAL_MAX_LENGTH &&
	emailRegex.test(value) &&
	(value.split("@")[1] ?? "")
		.split(".")
		.every((label) => label.length <= EMAIL_DOMAIN_LABEL_MAX_LENGTH);
