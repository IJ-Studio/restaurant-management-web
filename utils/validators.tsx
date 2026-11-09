// Reglas de validación heredadas. La fuente única es `lib/validacion/reglas.ts` (paso 3.1, D-05);
// este archivo solo las reexporta para las páginas que aún lo importan (login, registro y
// recuperación), y se retira cuando esas páginas pasen a los esquemas de zod (pasos 4.17–4.19).
export {
  NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  EMAIL_LOCAL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PHONE_DIGITS,
  phoneRegex,
  emailRegex,
  isValidEmail,
  letters,
  haveAnVowel,
  noRepeatMoreThreeTimes,
  noRepeatConsonantsMoreThreeTimes,
  length,
  lowercase,
  uppercase,
  number,
  specialChar,
} from "@/lib/validacion/reglas";
