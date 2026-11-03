/**
 * Esquemas de formulario (D-05). Las claves son **las mismas que usa hoy el estado de cada
 * formulario**, y las reglas, las mismas que aplica hoy (también los textos de error, donde
 * existían). Así, al sustituir los formularios en las fases 4 y 5, ni el comportamiento ni los
 * payloads cambian. Endurecer una regla es una decisión aparte.
 *
 * - Los formularios cuyo payload se construye a mano (acceso y registro) usan `z.object`, que
 *   descarta claves desconocidas.
 * - Los que hoy envían su estado entero (perfil y CRUD del admin) usan `z.looseObject`, para que
 *   las claves que el esquema no valida (`id`, `tags`, `imageUrl`…) lleguen intactas al API.
 */
import { z } from "zod";
import { CREATABLE_ROLES, ROLES } from "@/config/roles.config";
import {
	MENSAJES,
	RFC_REGEX,
	codigoPostal,
	contieneDatosPersonales,
	contrasenaAcceso,
	contrasenaNueva,
	correo,
	correoAcceso,
	correoBasico,
	correoBasicoOpcional,
	correoOpcionalValidado,
	lada,
	lineaOpcional,
	lineaRequerida,
	nombrePersona,
	numeroDesde,
	numeroMayorQue,
	rfc,
	telefono,
	telefonoConLada,
	textoLibre,
} from "./campos";

// ─── Autenticación (HU-01) ─────────────────────────────────────────────────────────────────

/** Inicio de sesión: payload `{ email, password }`. */
export const esquemaAcceso = z.object({
	email: correoAcceso,
	password: contrasenaAcceso,
});
export type DatosAcceso = z.output<typeof esquemaAcceso>;

/** Registro de clientes. `aPayloadRegistro` produce el contrato exacto de POST /auth/sign-up. */
export const esquemaRegistro = z
	.object({
		nombre: nombrePersona("Escribe tu nombre."),
		apellido: nombrePersona("Escribe tu apellido."),
		correo,
		lada,
		telefono,
		password: contrasenaNueva,
		agreed: z.literal(true, { error: "Debes aceptar los términos y condiciones." }),
	})
	.superRefine((datos, ctx) => {
		if (contieneDatosPersonales(datos.password, datos)) {
			ctx.addIssue({ code: "custom", path: ["password"], message: MENSAJES.contrasenaPersonal });
		}
	});
export type DatosRegistro = z.output<typeof esquemaRegistro>;

/** Contrato de POST /auth/sign-up (SignUpDto): solo estos campos; cualquier otro da 400. */
export function aPayloadRegistro(datos: DatosRegistro) {
	return {
		name: datos.nombre,
		lastname: datos.apellido,
		email: datos.correo,
		phone: telefonoConLada(datos.telefono),
		password: datos.password,
		passwordConfirm: datos.password,
	};
}

// ─── Perfil del cliente ────────────────────────────────────────────────────────────────────

/** `/profile`: hoy solo son obligatorios nombre, apellidos y teléfono; el CP admite hasta 5. */
export const esquemaPerfil = z.looseObject({
	name: lineaRequerida("Escribe tu nombre."),
	lastname: lineaRequerida("Escribe tus apellidos."),
	email: correoBasicoOpcional,
	phone: lineaRequerida("Escribe tu teléfono."),
	calle: lineaOpcional(),
	numero: lineaOpcional(),
	colonia: lineaOpcional(),
	ciudad: lineaOpcional(),
	codigoPostal: lineaOpcional(5),
	indicaciones: textoLibre(),
});
export type DatosPerfil = z.output<typeof esquemaPerfil>;

// ─── Reserva ───────────────────────────────────────────────────────────────────────────────

/** Paso 1 de `ReservationSidebar`: datos de contacto. */
export const esquemaReservaContacto = z.object({
	clienteNombre: lineaRequerida("El nombre es requerido"),
	clienteTelefono: lineaRequerida("El teléfono es requerido"),
	clienteEmail: lineaRequerida("El correo es requerido").pipe(
		z.string().regex(/\S+@\S+\.\S+/, { error: "Email inválido" }),
	),
});

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^\d{2}:\d{2}$/;

/**
 * Paso 2: fecha, hora y comensales. La fecha y la hora juntas deben ser futuras respecto a
 * `ahora` (inyectable para las pruebas), en la hora local, como hoy.
 */
export const crearEsquemaReservaHorario = (ahora: () => Date = () => new Date()) =>
	z
		.object({
			fecha: z.string({ error: "Elige una fecha" }).regex(FECHA, { error: "Elige una fecha" }),
			hora: z.string({ error: "Elige un horario" }).regex(HORA, { error: "Elige un horario" }),
			numComensales: z
				.number({ error: "Mínimo 1 persona" })
				.int({ error: "Mínimo 1 persona" })
				.min(1, { error: "Mínimo 1 persona" }),
			peticionesEspeciales: textoLibre(),
			ocasion: lineaOpcional(),
		})
		.superRefine((datos, ctx) => {
			const elegida = new Date(`${datos.fecha}T${datos.hora}`);
			if (Number.isNaN(elegida.getTime()) || elegida < ahora()) {
				ctx.addIssue({ code: "custom", path: ["fecha"], message: "Debe ser una fecha futura" });
			}
		});

/** Paso 3: la mesa elegida en el mapa. */
export const esquemaReservaMesa = z.object({
	mesaId: z
		.number({ error: "Por favor, selecciona una mesa del mapa para continuar." })
		.int()
		.positive({ error: "Por favor, selecciona una mesa del mapa para continuar." }),
});

// ─── Checkout ──────────────────────────────────────────────────────────────────────────────

/** Paso 2 del checkout: dirección nueva. */
export const esquemaDireccionEnvio = z.object({
	alias: lineaOpcional(),
	linea1: lineaRequerida("La calle y número son requeridos."),
	linea2: lineaOpcional(),
	colonia: lineaRequerida("La colonia es requerida."),
	ciudad: lineaRequerida("La ciudad es requerida."),
	estado: lineaRequerida("El estado es requerido."),
	codigoPostal: codigoPostal(),
	referencias: textoLibre(),
});

/** Paso 3 del checkout: datos fiscales, solo si se pide factura. */
export const esquemaDatosFiscales = z.object({
	rfc,
	razonSocial: lineaRequerida("La razón social es requerida."),
	usoCfdi: lineaOpcional(),
	regimenFiscal: lineaRequerida("Selecciona un régimen fiscal."),
	codigoPostalFiscal: codigoPostal("El código postal fiscal debe tener 5 dígitos."),
	// Opcional; si se escribe, se comprueba el formato con la regla del registro (decisión del usuario, 2026-11-01).
	email: correoOpcionalValidado,
});

// ─── CRUD del admin ────────────────────────────────────────────────────────────────────────

const roles = Object.values(ROLES) as number[];

/** Alta de usuario (`/dashboard/admin/users`): contraseña obligatoria de al menos 8. */
export const esquemaUsuarioNuevo = z.looseObject({
	name: lineaRequerida("Escribe el nombre."),
	lastname: lineaRequerida("Escribe los apellidos."),
	email: correoBasico("Escribe el correo."),
	phone: lineaRequerida("Escribe el teléfono."),
	password: z.string({ error: "Mínimo 8 caracteres." }).min(8, { error: "Mínimo 8 caracteres." }),
	roleId: z
		.number({ error: "Elige un rol." })
		.refine((r) => (CREATABLE_ROLES as readonly number[]).includes(r), { error: "Elige un rol." }),
});

/**
 * Edición de usuario: la contraseña vacía significa «no cambiarla» y se quita del payload, como
 * hoy. El rol puede ser cualquiera de los existentes (se puede editar a un administrador).
 */
export const esquemaUsuarioEdicion = esquemaUsuarioNuevo
	.extend({
		password: z
			.string()
			.refine((v) => v === "" || v.length >= 8, { error: "Mínimo 8 caracteres." })
			.optional(),
		roleId: z.number({ error: "Elige un rol." }).refine((r) => roles.includes(r), { error: "Elige un rol." }),
	})
	.transform(({ password, ...resto }) => (password ? { ...resto, password } : resto));

/** Platillo de la carta (`DialogoPlatillo`, PLAN 5.9). */
export const esquemaPlatillo = z.looseObject({
	name: lineaRequerida("Escribe el nombre del platillo."),
	description: textoLibre().optional(),
	price: numeroDesde(0, "El precio no puede ser negativo.").optional(),
	prepTime: numeroDesde(0, "El tiempo no puede ser negativo.").optional(),
	calories: numeroDesde(0, "Las calorías no pueden ser negativas.").optional(),
});

/**
 * Promoción (`PromoModal`). Además de las reglas de hoy, la fecha de inicio no puede ser
 * posterior a la de fin: lo exige el paso 5.10 del PLAN.
 */
export const esquemaPromocion = z
	.looseObject({
		title: lineaRequerida("Escribe el título de la promoción."),
		description: textoLibre().optional(),
		badge: lineaOpcional().optional(),
		emoji: lineaOpcional(4).optional(),
		originalPrice: numeroDesde(0, "El precio no puede ser negativo.").optional(),
		discountedPrice: numeroDesde(0, "El precio no puede ser negativo.").optional(),
		startDate: z.union([z.literal(""), z.string().regex(FECHA, { error: "Fecha no válida." })]).optional(),
		endDate: z.union([z.literal(""), z.string().regex(FECHA, { error: "Fecha no válida." })]).optional(),
	})
	.superRefine((p, ctx) => {
		if (p.startDate && p.endDate && p.startDate > p.endDate) {
			ctx.addIssue({
				code: "custom",
				path: ["endDate"],
				message: "La fecha de fin no puede ser anterior a la de inicio.",
			});
		}
	});

/** Concepto de una factura (`InvoiceModal`): hoy se exige cantidad y precio mayores que 0. */
const conceptoFactura = z.looseObject({
	description: lineaRequerida("Describe el concepto."),
	qty: numeroMayorQue(0, "La cantidad debe ser mayor que 0."),
	unitPrice: numeroMayorQue(0, "El precio debe ser mayor que 0."),
});

/**
 * Factura manual (`InvoiceModal`). El RFC es obligatorio, en mayúsculas y de hasta 13; una vez
 * escrito, se comprueba también su formato con `RFC_REGEX` (decisión del usuario, 2026-11-01).
 */
export const esquemaFactura = z.looseObject({
	clientName: lineaRequerida("Escribe el nombre o la razón social."),
	clientRFC: lineaRequerida("Escribe el RFC.", 13)
		.transform((v) => v.toUpperCase())
		.refine((v) => v === "" || RFC_REGEX.test(v), { error: MENSAJES.rfc }),
	clientEmail: correoBasicoOpcional.optional(),
	notes: textoLibre().optional(),
	items: z.array(conceptoFactura).min(1, { error: "Añade al menos un concepto." }),
});

/** Movimiento de caja (`MovementModal`). */
export const esquemaMovimientoCaja = z.looseObject({
	concept: lineaRequerida("Escribe el concepto."),
	amount: numeroMayorQue(0, "El importe debe ser mayor que 0."),
	responsible: lineaOpcional().optional(),
	notes: textoLibre().optional(),
});

/** Propina (`TipModal`). */
export const esquemaPropina = z.looseObject({
	waiter: lineaRequerida("Escribe el nombre del mesero."),
	tableRef: lineaOpcional().optional(),
	amount: numeroMayorQue(0, "El importe debe ser mayor que 0."),
});

/** Puesto de nómina (`PayrollModal`). */
export const esquemaNomina = z.looseObject({
	role: lineaRequerida("Escribe el puesto."),
	name: lineaRequerida("Escribe el nombre."),
	weeklyPay: numeroMayorQue(0, "El pago semanal debe ser mayor que 0."),
});

/** Proveedor (`SupplierModal` de `/dashboard/admin/inventory/suppliers`). */
export const esquemaProveedor = z.looseObject({
	name: lineaRequerida("Escribe el nombre del proveedor."),
	email: correoBasicoOpcional.optional(),
	deliveryDays: numeroDesde(0, "Los días de entrega no pueden ser negativos.").optional(),
	products: z.array(lineaRequerida("Escribe el producto.")).optional(),
});

/** Orden de compra (`OrderModal`): proveedor y un producto por línea. */
export const esquemaOrdenCompra = z.looseObject({
	supplierId: z.number({ error: "Elige un proveedor." }).int().positive({ error: "Elige un proveedor." }),
	items: z
		.array(
			z.looseObject({
				productName: lineaRequerida("Elige un producto."),
				quantity: numeroDesde(1, "La cantidad mínima es 1."),
			}),
		)
		.min(1, { error: "Añade al menos un producto." }),
});

// ─── Utilidad para los formularios ─────────────────────────────────────────────────────────

/**
 * Convierte los errores de zod en `{ campo: mensaje }` (el primero de cada campo), que es lo
 * que pintan los campos y lo que el hook de envío del paso 3.3 usará para enfocar el primero.
 */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
	const errores: Record<string, string> = {};
	for (const issue of error.issues) {
		const clave = issue.path.map(String).join(".") || "_formulario";
		errores[clave] ??= issue.message;
	}
	return errores;
}
