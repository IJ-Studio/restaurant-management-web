// Estas reglas deben ser un SUBCONJUNTO de las del API (POST /auth/sign-up, SignUpDto en
// restaurant-management-api): el formulario puede ser más estricto, nunca más permisivo, o el
// API rechazará con 400 datos que el formulario dio por buenos.

// Límites de las columnas de `users` y del DTO del API.
export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 100;
export const EMAIL_LOCAL_MAX_LENGTH = 64; // parte antes de la @ (límite del RFC que aplica el API)
export const PASSWORD_MAX_LENGTH = 64;

// Teléfono: la única lada disponible es +52 (México), que son exactamente 10 dígitos.
export const PHONE_DIGITS = 10;
export const phoneRegex = /^\d{10}$/;

// Correo: sin puntos consecutivos, y el dominio sin separadores al inicio, al final ni repetidos.
// La extensión (TLD) acepta de 2 a 24 letras: antes eran 2 o 3 y se rechazaban dominios válidos
// como .info, .tech, .online o .digital, también al iniciar sesión.
export const emailRegex =
  /^(?!.*[._-]{2})[a-zA-Z0-9_][a-zA-Z0-9._-]*[a-zA-Z0-9]+@[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,24}$/;

const EMAIL_DOMAIN_LABEL_MAX_LENGTH = 63; // cada parte del dominio entre puntos (RFC 1035)

/** Correo válido para el formulario: formato y los tamaños que acepta el API. */
export const isValidEmail = (value: string): boolean =>
  value.length <= EMAIL_MAX_LENGTH &&
  value.split("@")[0].length <= EMAIL_LOCAL_MAX_LENGTH &&
  emailRegex.test(value) &&
  (value.split("@")[1] ?? "")
    .split(".")
    .every((label) => label.length <= EMAIL_DOMAIN_LABEL_MAX_LENGTH);

// name regex
export const letters = /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ]{1,30}$/;
export const haveAnVowel = /[aeiouáéíóú]/i;
export const noRepeatMoreThreeTimes = /(.)\1{2,}/;
export const noRepeatConsonantsMoreThreeTimes = /(.)\1{2,}/;

// password regex
export const length = /^.{8,64}$/;
export const lowercase = /[a-z]/;
export const uppercase = /[A-Z]/;
export const number = /\d/;
export const specialChar = /[!@#$%&,.-]/;
