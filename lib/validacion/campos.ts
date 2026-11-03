/**
 * Esquemas de campo con zod (D-05). Reproducen **las mismas reglas que hoy** aplican los
 * formularios; las de registro e inicio de sesión son las alineadas con el API en HU-01
 * (POST /auth/sign-up, SignUpDto en restaurant-management-api). El formulario puede ser más
 * estricto que el API, nunca más permisivo, o el API rechazará con 400 datos que el formulario
 * dio por buenos. Estas reglas no se relajan sin acuerdo con el API (NP-06).
 *
 * Cada campo de texto se sanea antes de validarse (ver `saneamiento.ts`), y el valor que sale
 * del esquema es el saneado: es el que se envía.
 *
 * Los límites de longitud de zod 4 cuentan caracteres (puntos de código), igual que un
 * `varchar(n)` de Postgres; el `maxLength` del navegador cuenta unidades UTF-16 y solo difiere
 * con emoji y otros caracteres fuera del plano básico.
 */
import "./configurar-zod";
import { z } from "zod";
import {
	LONGITUD_MAXIMA_ENTRADA,
	normalizarParaComparar,
	sanearLinea,
	sanearMultilinea,
	sanearNombre,
	soloDigitos,
} from "./saneamiento";
import {
	NAME_MAX_LENGTH,
	EMAIL_MAX_LENGTH,
	PASSWORD_MAX_LENGTH,
	LADA_MEXICO,
	PHONE_DIGITS,
	phoneRegex,
	emailRegex,
	emailNavegadorRegex,
	letters,
	haveAnVowel,
	noRepeatMoreThreeTimes,
	noRepeatConsonantsMoreThreeTimes,
	length,
	lowercase,
	uppercase,
	number,
	specialChar,
	RFC_REGEX,
	CP_REGEX,
	isValidEmail,
} from "./reglas";

// Las reglas se reexportan para que los esquemas y sus reglas se importen desde un solo sitio.
export * from "./reglas";

// ─── Mensajes ──────────────────────────────────────────────────────────────────────────────

export const MENSAJES = {
	/** Único mensaje ante un fallo de inicio de sesión: no revela si el correo existe (NP-15). */
	accesoIncorrecto: "Correo o contraseña incorrectos.",
	correo: "Ingresa un correo electrónico válido.",
	correoVacio: "Escribe tu correo electrónico.",
	nombre: "Solo letras: máximo 30 por palabra y 50 en total.",
	telefono: "Debe contener 10 dígitos.",
	contrasenaRequisitos: "La contraseña no cumple todos los requisitos.",
	contrasenaSecuencia: "La contraseña contiene secuencias predecibles.",
	contrasenaPersonal: "La contraseña contiene información personal.",
	rfc: "El RFC no tiene un formato válido.",
	codigoPostal: "El código postal debe tener 5 dígitos.",
	demasiadoLargo: (max: number) => `Máximo ${max} caracteres.`,
} as const;

// ─── Piezas comunes ────────────────────────────────────────────────────────────────────────

/**
 * Texto crudo con tope de seguridad. El tope corta el análisis (`abort`) antes de aplicar
 * expresiones a una entrada enorme.
 */
const textoCrudo = (vacio: string) =>
	z
		.string({ error: vacio })
		.max(LONGITUD_MAXIMA_ENTRADA, { error: MENSAJES.demasiadoLargo(LONGITUD_MAXIMA_ENTRADA), abort: true });

/** Línea obligatoria, saneada. */
export const lineaRequerida = (vacio: string, max = LONGITUD_MAXIMA_ENTRADA) =>
	textoCrudo(vacio)
		.transform(sanearLinea)
		.pipe(z.string().min(1, { error: vacio }).max(max, { error: MENSAJES.demasiadoLargo(max) }));

/** Línea opcional, saneada (vacía se queda en `""`). */
export const lineaOpcional = (max = LONGITUD_MAXIMA_ENTRADA) =>
	textoCrudo("Texto no válido.")
		.transform(sanearLinea)
		.pipe(z.string().max(max, { error: MENSAJES.demasiadoLargo(max) }));

/** Texto de varias líneas opcional (notas, peticiones, descripciones), saneado. */
export const textoLibre = (max = LONGITUD_MAXIMA_ENTRADA) =>
	textoCrudo("Texto no válido.")
		.transform(sanearMultilinea)
		.pipe(z.string().max(max, { error: MENSAJES.demasiadoLargo(max) }));

// ─── Nombre ────────────────────────────────────────────────────────────────────────────────

/** La regla de nombre del registro, sobre el texto ya saneado. */
export function esNombreValido(nombre: string): boolean {
	if (!nombre || nombre.length > NAME_MAX_LENGTH) return false;
	const partes = nombre.split(" ");
	if (partes.length < 1 || partes.length > 2) return false;
	return partes.every(
		(p) =>
			letters.test(p) &&
			haveAnVowel.test(p) &&
			!noRepeatMoreThreeTimes.test(p) &&
			!noRepeatConsonantsMoreThreeTimes.test(p),
	);
}

/** Nombre o apellido del registro (HU-01): una o dos palabras, solo letras, 50 en total. */
export const nombrePersona = (vacio: string) =>
	textoCrudo(vacio)
		.transform(sanearNombre)
		.pipe(
			z
				.string()
				.min(1, { error: vacio, abort: true })
				.refine(esNombreValido, { error: MENSAJES.nombre }),
		);

// ─── Correo ────────────────────────────────────────────────────────────────────────────────

/** Correo del registro (HU-01): formato y tamaños del API. */
export const correo = textoCrudo(MENSAJES.correoVacio)
	.transform(sanearLinea)
	.pipe(
		z
			.string()
			.min(1, { error: MENSAJES.correoVacio, abort: true })
			// El tamaño se mira antes que la expresión, para no evaluarla sobre textos largos.
			.max(EMAIL_MAX_LENGTH, { error: MENSAJES.correo, abort: true })
			.refine(isValidEmail, { error: MENSAJES.correo }),
	);

/** Correo del inicio de sesión: el mismo formato que hoy (`emailRegex`), sin revelar nada más. */
export const correoAcceso = textoCrudo(MENSAJES.correoVacio)
	.transform(sanearLinea)
	.pipe(
		z
			.string()
			.min(1, { error: MENSAJES.correoVacio, abort: true })
			// Ninguna cuenta puede tener más: es el límite de la columna.
			.max(EMAIL_MAX_LENGTH, { error: MENSAJES.correo, abort: true })
			.regex(emailRegex, { error: MENSAJES.correo }),
	);

/** Correo con la regla del navegador (`type="email"`), obligatorio. La usan los formularios del admin. */
export const correoBasico = (vacio: string = MENSAJES.correoVacio) =>
	textoCrudo(vacio)
		.transform(sanearLinea)
		.pipe(
			z
				.string()
				.min(1, { error: vacio, abort: true })
				.max(EMAIL_MAX_LENGTH, { error: MENSAJES.correo, abort: true })
				.regex(emailNavegadorRegex, { error: MENSAJES.correo }),
		);

/** Igual que `correoBasico`, pero admite el campo vacío. */
export const correoBasicoOpcional = textoCrudo(MENSAJES.correo)
	.transform(sanearLinea)
	.pipe(
		z
			.string()
			.max(EMAIL_MAX_LENGTH, { error: MENSAJES.correo, abort: true })
			.refine((v) => v === "" || emailNavegadorRegex.test(v), { error: MENSAJES.correo }),
	);

// ─── Teléfono ──────────────────────────────────────────────────────────────────────────────

/**
 * Teléfono de México: 10 dígitos. Admite que se escriba con espacios o guiones, o con la lada
 * `+52` delante (como se guarda tras el registro); el valor que sale son los 10 dígitos.
 */
export const telefono = textoCrudo(MENSAJES.telefono)
	.transform((valor) => {
		const digitos = soloDigitos(valor);
		const conLada = valor.trim().startsWith(LADA_MEXICO) && digitos.length === PHONE_DIGITS + 2;
		return conLada ? digitos.slice(2) : digitos;
	})
	.pipe(z.string().regex(phoneRegex, { error: MENSAJES.telefono }));

/** Lada del registro: hoy la única opción es +52. */
export const lada = z.literal(LADA_MEXICO, { error: "Elige una lada válida." });

/** Teléfono completo con lada, como lo espera el API del registro (`+52` + 10 dígitos). */
export const telefonoConLada = (diezDigitos: string) => `${LADA_MEXICO}${diezDigitos}`;

// ─── Contraseña ────────────────────────────────────────────────────────────────────────────

/** Los cinco requisitos visibles del registro (los que muestra `PasswordRequirements`). */
export function requisitosContrasena(contrasena: string) {
	return {
		length: length.test(contrasena),
		lowercase: lowercase.test(contrasena),
		uppercase: uppercase.test(contrasena),
		number: number.test(contrasena),
		special: specialChar.test(contrasena),
	};
}

const SECUENCIA_MINIMA = 3;
const SECUENCIAS = ["0123456789", "9876543210", "abcdefghijklmnopqrstuvwxyz", "zyxwvutsrqponmlkjihgfedcba"];

/** Tres caracteres iguales seguidos o tres seguidos de una secuencia (123, 321, abc, cba). */
export function tieneSecuenciaPredecible(contrasena: string): boolean {
	if (/(.)\1{2,}/.test(contrasena)) return true;
	const minusculas = contrasena.toLowerCase();
	return SECUENCIAS.some((serie) => {
		for (let i = 0; i <= serie.length - SECUENCIA_MINIMA; i++) {
			// Los dígitos se comparan tal cual y las letras sin distinguir mayúsculas, como hoy.
			const trozo = serie.slice(i, i + SECUENCIA_MINIMA);
			if ((/\d/.test(trozo) ? contrasena : minusculas).includes(trozo)) return true;
		}
		return false;
	});
}

/** La contraseña contiene el usuario del correo, el teléfono o una palabra del nombre (≥ 3 letras). */
export function contieneDatosPersonales(
	contrasena: string,
	datos: { nombre: string; apellido: string; correo: string; telefono: string },
): boolean {
	const clave = normalizarParaComparar(contrasena);
	const personales = [
		normalizarParaComparar(datos.correo.split("@")[0] ?? ""),
		datos.telefono.replace(/\D/g, ""),
		...normalizarParaComparar(datos.nombre).split(/\s+/),
		...normalizarParaComparar(datos.apellido).split(/\s+/),
	].filter((v) => v && v.length >= 3);
	return personales.some((dato) => clave.includes(dato));
}

/**
 * Contraseña nueva (registro). No se sanea: se envía exactamente lo que se escribió. La regla de
 * datos personales necesita el resto del formulario y la aplica `esquemaRegistro`.
 */
export const contrasenaNueva = z
	.string({ error: MENSAJES.contrasenaRequisitos })
	.max(PASSWORD_MAX_LENGTH, { error: MENSAJES.contrasenaRequisitos, abort: true })
	.refine((v) => Object.values(requisitosContrasena(v)).every(Boolean), {
		error: MENSAJES.contrasenaRequisitos,
		abort: true,
	})
	.refine((v) => !tieneSecuenciaPredecible(v), { error: MENSAJES.contrasenaSecuencia });

/** Contraseña del inicio de sesión: hoy solo se exige un mínimo de 8 caracteres. */
/**
 * Correo opcional con la regla del registro (`isValidEmail`): vacío se admite y, si se escribe,
 * se comprueba el formato y los tamaños que acepta el API. Lo usa el correo fiscal del checkout.
 */
export const correoOpcionalValidado = textoCrudo(MENSAJES.correo)
	.transform(sanearLinea)
	.pipe(z.string().refine((v) => v === "" || isValidEmail(v), { error: MENSAJES.correo }));

export const contrasenaAcceso = z
	.string({ error: MENSAJES.accesoIncorrecto })
	.min(8, { error: MENSAJES.accesoIncorrecto })
	.max(LONGITUD_MAXIMA_ENTRADA, { error: MENSAJES.accesoIncorrecto });

// ─── Datos fiscales y dirección ────────────────────────────────────────────────────────────

/** RFC de persona física (13) o moral (12), en mayúsculas. */
export const rfc = textoCrudo(MENSAJES.rfc)
	.transform((v) => sanearLinea(v).toUpperCase())
	.pipe(z.string().regex(RFC_REGEX, { error: MENSAJES.rfc }));

/** Código postal de México: 5 dígitos. */
export const codigoPostal = (mensaje: string = MENSAJES.codigoPostal) =>
	textoCrudo(mensaje)
		.transform(sanearLinea)
		.pipe(z.string().regex(CP_REGEX, { error: mensaje }));

// ─── Números ───────────────────────────────────────────────────────────────────────────────

/** Número (zod ya rechaza NaN e Infinity) con mínimo (los `type="number"` del admin con `min`). */
export const numeroDesde = (minimo: number, mensaje: string) =>
	z.number({ error: mensaje }).min(minimo, { error: mensaje });

/** Número estrictamente mayor que el límite (importes que no pueden ser 0). */
export const numeroMayorQue = (limite: number, mensaje: string) =>
	z.number({ error: mensaje }).gt(limite, { error: mensaje });
