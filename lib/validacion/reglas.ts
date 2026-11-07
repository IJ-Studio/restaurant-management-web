/**
 * Límites y expresiones de validación, **sin zod**: es la fuente única de las reglas. Las
 * importan los esquemas de `campos.ts` y, mientras existan, las páginas heredadas a través de
 * `utils/validators.tsx`, sin cargar zod en su bundle.
 *
 * Son las reglas de hoy, alineadas con el API en HU-01; no se relajan sin acuerdo con el API (NP-06).
 */

// Límites de las columnas de `users` y del DTO del API.
export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 100;
export const EMAIL_LOCAL_MAX_LENGTH = 64; // parte antes de la @ (límite del RFC que aplica el API)
export const PASSWORD_MAX_LENGTH = 64;
export const EMAIL_DOMAIN_LABEL_MAX_LENGTH = 63; // cada parte del dominio entre puntos (RFC 1035)

// Teléfono: la única lada disponible es +52 (México), que son exactamente 10 dígitos.
export const LADA_MEXICO = "+52";
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

// Nombre: cada palabra solo con letras (1–30), con al menos una vocal y sin un carácter
// repetido tres veces seguidas.
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
