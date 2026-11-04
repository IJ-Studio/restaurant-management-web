import { test, expect } from "@playwright/test";
import type { z } from "zod";
import {
	LONGITUD_MAXIMA_ENTRADA,
	sanearLinea,
	sanearMultilinea,
	sanearNombre,
} from "@/lib/validacion/saneamiento";
import {
	MENSAJES,
	codigoPostal,
	contrasenaNueva,
	correo,
	correoAcceso,
	nombrePersona,
	requisitosContrasena,
	rfc,
	telefono,
	tieneSecuenciaPredecible,
} from "@/lib/validacion/campos";
import {
	aPayloadRegistro,
	crearEsquemaReservaHorario,
	erroresPorCampo,
	esquemaAcceso,
	esquemaDatosFiscales,
	esquemaDireccionEnvio,
	esquemaFactura,
	esquemaMovimientoCaja,
	esquemaNomina,
	esquemaOrdenCompra,
	esquemaPerfil,
	esquemaPlatillo,
	esquemaPromocion,
	esquemaPropina,
	esquemaProveedor,
	esquemaRegistro,
	esquemaReservaContacto,
	esquemaReservaMesa,
	esquemaUsuarioEdicion,
	esquemaUsuarioNuevo,
} from "@/lib/validacion/formularios";
import { detectarFormato, esquemaImagen, verificarArchivo } from "@/lib/validacion/archivos";

/** Primer mensaje de error, o `null` si el valor es válido. */
function errorDe(esquema: z.ZodType, valor: unknown): string | null {
	const r = esquema.safeParse(valor);
	return r.success ? null : r.error.issues[0].message;
}

function valorDe<T extends z.ZodType>(esquema: T, valor: unknown): z.output<T> {
	const r = esquema.safeParse(valor);
	if (!r.success) throw new Error(`Se esperaba válido: ${JSON.stringify(r.error.issues)}`);
	return r.data;
}

test.describe("saneamiento", () => {
	test("quita controles y bidi, normaliza a NFC y recorta", () => {
		expect(sanearLinea("  Ana\u0000 \u202ELópez\u0007  ")).toBe("Ana López");
		expect(sanearLinea("uno\ndos\ttres")).toBe("uno dos tres");
		// «é» descompuesta (e + U+0301) pasa a un solo carácter.
		expect(sanearLinea("Jose\u0301")).toBe("José");
		expect(sanearLinea("Jose\u0301").length).toBe(4);
		expect(sanearNombre("  María   José ")).toBe("María José");
	});

	test("el texto de varias líneas conserva los saltos y unifica \\r\\n", () => {
		expect(sanearMultilinea(" Sin cebolla\r\nSin chile\u0000 ")).toBe("Sin cebolla\nSin chile");
	});

	test("conserva los emoji compuestos (unificador de ancho cero)", () => {
		const familia = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}";
		expect(sanearLinea(familia)).toBe(familia);
	});

	test("una entrada mayor que el tope se rechaza sin evaluar las expresiones", () => {
		const enorme = "a".repeat(LONGITUD_MAXIMA_ENTRADA + 1);
		expect(errorDe(correo, enorme)).toBe(MENSAJES.demasiadoLargo(LONGITUD_MAXIMA_ENTRADA));
		// Una entrada patológica para la expresión del correo termina enseguida.
		const inicio = Date.now();
		expect(errorDe(correoAcceso, `${"a".repeat(4_900)}!`)).toBe(MENSAJES.correo);
		expect(Date.now() - inicio).toBeLessThan(200);
	});
});

test.describe("campos", () => {
	test("correo del registro: formato y tamaños del API", () => {
		for (const ok of ["ana@ejemplo.mx", "ana.lopez@correo.com.mx", "a_b@dominio.digital"]) {
			expect(errorDe(correo, ok), ok).toBeNull();
		}
		expect(valorDe(correo, "  ana@ejemplo.mx ")).toBe("ana@ejemplo.mx");
		for (const malo of ["", "ana", "ana..lopez@x.mx", "ana@x", "ana@-x.mx", ".ana@x.mx", "ana@x.c"]) {
			expect(errorDe(correo, malo), malo).not.toBeNull();
		}
		expect(errorDe(correo, "")).toBe(MENSAJES.correoVacio);
		expect(errorDe(correo, `${"a".repeat(65)}@x.mx`)).toBe(MENSAJES.correo);
		expect(errorDe(correo, `a@${"b".repeat(64)}.mx`)).toBe(MENSAJES.correo);
		expect(errorDe(correo, `${"a".repeat(60)}@${"b".repeat(40)}.mx`)).toBe(MENSAJES.correo);
	});

	test("nombre: una o dos palabras, solo letras, con vocal y sin triples", () => {
		const nombre = nombrePersona("Escribe tu nombre.");
		for (const ok of ["Ana", "María José", "  Íñigo  ", "Müller"]) {
			expect(errorDe(nombre, ok), ok).toBeNull();
		}
		expect(valorDe(nombre, "  María   José ")).toBe("María José");
		expect(errorDe(nombre, "")).toBe("Escribe tu nombre.");
		for (const malo of ["Ana María José", "Ana3", "Brr", "Anna-Luisa", "Saaara", "Joooe", "a".repeat(31)]) {
			expect(errorDe(nombre, malo), malo).toBe(MENSAJES.nombre);
		}
		// Dos palabras de 30 suman 61: superan el límite de 50 de la columna.
		expect(errorDe(nombre, `${"Ana".repeat(10)} ${"Eva".repeat(10)}`)).toBe(MENSAJES.nombre);
	});

	test("teléfono: 10 dígitos, admite la lada +52 y separadores", () => {
		expect(valorDe(telefono, "5512345678")).toBe("5512345678");
		expect(valorDe(telefono, "55 1234-5678")).toBe("5512345678");
		expect(valorDe(telefono, "+52 55 1234 5678")).toBe("5512345678");
		for (const malo of ["", "551234567", "55123456789", "525512345678"]) {
			expect(errorDe(telefono, malo), malo).toBe(MENSAJES.telefono);
		}
	});

	test("contraseña nueva: los cinco requisitos y sin secuencias", () => {
		expect(requisitosContrasena("Quijote#29")).toEqual({
			length: true,
			lowercase: true,
			uppercase: true,
			number: true,
			special: true,
		});
		expect(errorDe(contrasenaNueva, "Quijote#29")).toBeNull();
		// Ocho caracteres justos bastan.
		expect(errorDe(contrasenaNueva, "Corta#1x")).toBeNull();
		// «*» no está entre los caracteres especiales admitidos hoy.
		for (const malo of ["Cort#1x", "sinmayuscula#29", "SINMINUSCULA#29", "SinNumero#", "SinEspecial29", "Quijote*29"]) {
			expect(errorDe(contrasenaNueva, malo), malo).toBe(MENSAJES.contrasenaRequisitos);
		}
		expect(errorDe(contrasenaNueva, `Aa1#${"x".repeat(61)}`)).toBe(MENSAJES.contrasenaRequisitos);
		for (const secuencia of ["Quijote#123", "Quijote#987", "Abc#2905zq", "Zyx#2905qa", "Quijjjote#29"]) {
			expect(tieneSecuenciaPredecible(secuencia), secuencia).toBe(true);
			expect(errorDe(contrasenaNueva, secuencia), secuencia).toBe(MENSAJES.contrasenaSecuencia);
		}
		// La contraseña no se sanea: los espacios cuentan.
		expect(contrasenaNueva.parse(" Quijote#29 ")).toBe(" Quijote#29 ");
	});

	test("RFC y código postal", () => {
		expect(valorDe(rfc, " xaxx010101000 ")).toBe("XAXX010101000");
		expect(errorDe(rfc, "ABC010101AB1")).toBeNull();
		for (const malo of ["", "XAXX0101010", "XAXX01010100Z0", "1234567890123"]) {
			expect(errorDe(rfc, malo), malo).toBe(MENSAJES.rfc);
		}
		expect(errorDe(codigoPostal(), "06600")).toBeNull();
		for (const malo of ["", "0660", "066000", "06a00"]) {
			expect(errorDe(codigoPostal(), malo), malo).toBe(MENSAJES.codigoPostal);
		}
	});
});

test.describe("formularios", () => {
	test("inicio de sesión: el formato de hoy y un mensaje genérico para la contraseña", () => {
		expect(valorDe(esquemaAcceso, { email: " ana@ejemplo.mx ", password: "12345678" })).toEqual({
			email: "ana@ejemplo.mx",
			password: "12345678",
		});
		expect(errorDe(esquemaAcceso, { email: "ana@ejemplo.mx", password: "1234567" })).toBe(
			MENSAJES.accesoIncorrecto,
		);
		expect(errorDe(esquemaAcceso, { email: "ana", password: "12345678" })).toBe(MENSAJES.correo);
	});

	const registroValido = {
		nombre: " Ana ",
		apellido: "López  Ruiz",
		correo: "ana.lopez@ejemplo.mx",
		lada: "+52",
		telefono: "5512345678",
		password: "Quijote#29",
		agreed: true,
	};

	test("registro: produce el contrato exacto de POST /auth/sign-up", () => {
		expect(aPayloadRegistro(valorDe(esquemaRegistro, registroValido))).toEqual({
			name: "Ana",
			lastname: "López Ruiz",
			email: "ana.lopez@ejemplo.mx",
			phone: "+525512345678",
			password: "Quijote#29",
			passwordConfirm: "Quijote#29",
		});
	});

	test("registro: datos personales en la contraseña, términos y lada", () => {
		for (const [password, motivo] of [
			["Lopez#2905", "apellido sin tilde"],
			["Ana.lopez#29", "usuario del correo"],
			["X#5592817364a", "teléfono"],
		]) {
			const r = esquemaRegistro.safeParse({ ...registroValido, telefono: "5592817364", password });
			expect(r.success, motivo).toBe(false);
			if (!r.success) expect(erroresPorCampo(r.error).password, motivo).toBe(MENSAJES.contrasenaPersonal);
		}
		// «Ana» tiene 3 letras: cuenta; un dato de 2 letras, no.
		expect(errorDe(esquemaRegistro, { ...registroValido, nombre: "Al", password: "Al#Quijote29" })).toBeNull();
		expect(errorDe(esquemaRegistro, { ...registroValido, agreed: false })).toBe(
			"Para crear tu cuenta, acepta los términos y el aviso de privacidad.",
		);
		expect(errorDe(esquemaRegistro, { ...registroValido, lada: "+1" })).toBe("Elige una lada válida.");
		// Claves desconocidas no pasan al payload.
		expect(valorDe(esquemaRegistro, { ...registroValido, rol: 1 })).not.toHaveProperty("rol");
	});

	test("perfil: obligatorios nombre, apellidos y teléfono; conserva claves extra", () => {
		// Con dirección, el API la pide completa: calle, CP, ciudad y estado (P5.9, D-32).
		const perfil = {
			name: "Ana",
			lastname: "López",
			email: "",
			phone: "+525512345678",
			calle: " Mayor ",
			numero: "1",
			colonia: "",
			ciudad: "Huejutla",
			estado: "Hidalgo",
			codigoPostal: "06600",
			indicaciones: "Tocar\r\nfuerte",
			id: 7,
		};
		expect(valorDe(esquemaPerfil, perfil)).toMatchObject({ calle: "Mayor", indicaciones: "Tocar\nfuerte", id: 7 });
		expect(errorDe(esquemaPerfil, { ...perfil, phone: " " })).toBe("Escribe tu teléfono.");
		expect(errorDe(esquemaPerfil, { ...perfil, codigoPostal: "066001" })).toBe(MENSAJES.demasiadoLargo(5));
		expect(errorDe(esquemaPerfil, { ...perfil, email: "ana@" })).toBe(MENSAJES.correo);
		expect(errorDe(esquemaPerfil, { ...perfil, estado: "" })).toBe("Escribe el estado.");
	});

	test("reserva: contacto, horario futuro y mesa", () => {
		expect(errorDe(esquemaReservaContacto, { clienteNombre: "Ana", clienteTelefono: "55", clienteEmail: "a@b.c", privacidad: true })).toBeNull();
		expect(errorDe(esquemaReservaContacto, { clienteNombre: " ", clienteTelefono: "55", clienteEmail: "a@b.c", privacidad: true })).toBe(
			"El nombre es requerido",
		);
		expect(errorDe(esquemaReservaContacto, { clienteNombre: "Ana", clienteTelefono: "55", clienteEmail: "ana" })).toBe(
			"Email inválido",
		);

		const ahora = () => new Date(2026, 10, 1, 12, 0);
		const horario = crearEsquemaReservaHorario(ahora);
		const base = { fecha: "2026-11-01", hora: "13:00", numComensales: 2, peticionesEspeciales: "", ocasion: "" };
		expect(errorDe(horario, base)).toBeNull();
		expect(errorDe(horario, { ...base, hora: "11:59" })).toBe("Debe ser una fecha futura");
		expect(errorDe(horario, { ...base, numComensales: 0 })).toBe("Mínimo 1 persona");
		expect(errorDe(horario, { ...base, numComensales: 1.5 })).toBe("Mínimo 1 persona");
		expect(errorDe(horario, { ...base, fecha: "" })).toBe("Elige una fecha");

		expect(errorDe(esquemaReservaMesa, { mesaId: 4 })).toBeNull();
		expect(errorDe(esquemaReservaMesa, { mesaId: undefined })).toBe(
			"Por favor, selecciona una mesa del mapa para continuar.",
		);
	});

	test("checkout: dirección y datos fiscales con los mensajes de hoy", () => {
		const direccion = {
			alias: "Casa",
			linea1: "Av. Reforma 1",
			linea2: "",
			colonia: "Centro",
			ciudad: "CDMX",
			estado: "CDMX",
			codigoPostal: "06600",
			referencias: "",
		};
		expect(errorDe(esquemaDireccionEnvio, direccion)).toBeNull();
		expect(errorDe(esquemaDireccionEnvio, { ...direccion, linea1: "" })).toBe("La calle y número son requeridos.");
		expect(errorDe(esquemaDireccionEnvio, { ...direccion, codigoPostal: "123" })).toBe(MENSAJES.codigoPostal);

		const fiscales = {
			rfc: "XAXX010101000",
			razonSocial: "Público en general",
			usoCfdi: "G03",
			regimenFiscal: "616",
			codigoPostalFiscal: "06600",
			email: "",
		};
		expect(errorDe(esquemaDatosFiscales, fiscales)).toBeNull();
		expect(errorDe(esquemaDatosFiscales, { ...fiscales, regimenFiscal: "" })).toBe("Selecciona un régimen fiscal.");
		expect(errorDe(esquemaDatosFiscales, { ...fiscales, codigoPostalFiscal: "1" })).toBe(
			"El código postal fiscal debe tener 5 dígitos.",
		);
		// Correo fiscal: vacío vale; escrito, se comprueba con la regla del registro (isValidEmail).
		expect(valorDe(esquemaDatosFiscales, { ...fiscales, email: "  facturas@casa.mx " })).toMatchObject({ email: "facturas@casa.mx" });
		expect(errorDe(esquemaDatosFiscales, { ...fiscales, email: "facturas@casa" })).toBe(MENSAJES.correo);
		expect(errorDe(esquemaDatosFiscales, { ...fiscales, email: `${"a".repeat(65)}@casa.mx` })).toBe(MENSAJES.correo);
	});

	test("usuarios del admin: alta y edición", () => {
		const usuario = { name: "Luis", lastname: "Pérez", email: "luis@casa.mx", phone: "5512345678", password: "12345678", roleId: 3 };
		expect(errorDe(esquemaUsuarioNuevo, usuario)).toBeNull();
		expect(errorDe(esquemaUsuarioNuevo, { ...usuario, password: "" })).toBe("Mínimo 8 caracteres.");
		// El alta no permite crear administradores (CREATABLE_ROLES).
		expect(errorDe(esquemaUsuarioNuevo, { ...usuario, roleId: 1 })).toBe("Elige un rol.");
		expect(errorDe(esquemaUsuarioNuevo, { ...usuario, email: "luis@" })).toBe(MENSAJES.correo);

		// El teléfono sale con la lada, como lo pide PATCH /users/:id (E.164).
		expect(valorDe(esquemaUsuarioNuevo, { ...usuario, phone: "55 1234 5678" })).toMatchObject({ phone: "+525512345678" });
		expect(errorDe(esquemaUsuarioNuevo, { ...usuario, phone: "123" })).toBe(MENSAJES.telefono);

		// En la edición no se validan correo ni contraseña (no se envían) y el rol puede ser el de admin.
		expect(errorDe(esquemaUsuarioEdicion, { ...usuario, email: "", password: "", roleId: 1 })).toBeNull();
		expect(valorDe(esquemaUsuarioEdicion, { ...usuario, phone: "+525512345678" })).toMatchObject({ phone: "+525512345678", roleId: 3 });
		expect(errorDe(esquemaUsuarioEdicion, { ...usuario, roleId: 9 })).toBe("Elige un rol.");
	});

	test("carta y promociones del admin", () => {
		const platillo = { id: "p1", name: "Tortilla", price: 120, prepTime: 10, calories: 0, tags: ["vegetariano"] };
		expect(valorDe(esquemaPlatillo, platillo)).toMatchObject({ id: "p1", tags: ["vegetariano"] });
		expect(errorDe(esquemaPlatillo, { ...platillo, name: "" })).toBe("Escribe el nombre del platillo.");
		expect(errorDe(esquemaPlatillo, { ...platillo, price: -1 })).toBe("El precio no puede ser negativo.");
		expect(errorDe(esquemaPlatillo, { ...platillo, price: Number.NaN })).toBe("El precio no puede ser negativo.");

		const promo = { title: "2×1", startDate: "2026-11-01", endDate: "2026-11-30", active: true };
		expect(errorDe(esquemaPromocion, promo)).toBeNull();
		expect(errorDe(esquemaPromocion, { ...promo, startDate: "", endDate: "" })).toBeNull();
		expect(errorDe(esquemaPromocion, { ...promo, endDate: "2026-10-31" })).toBe(
			"La fecha de fin no puede ser anterior a la de inicio.",
		);
	});

	test("factura, caja, propinas, nómina y proveedores del admin", () => {
		const factura = {
			clientName: "Empresa S.A.",
			clientRFC: "xaxx010101000",
			clientEmail: "",
			items: [{ description: "Banquete", qty: 1, unitPrice: 100 }],
		};
		expect(valorDe(esquemaFactura, factura)).toMatchObject({ clientRFC: "XAXX010101000" });
		expect(errorDe(esquemaFactura, { ...factura, clientRFC: "XAXX0101010000" })).toBe(MENSAJES.demasiadoLargo(13));
		// RFC: vacío sigue pidiendo que se escriba; escrito, se comprueba su formato (12 o 13).
		expect(errorDe(esquemaFactura, { ...factura, clientRFC: "" })).toBe("Escribe el RFC.");
		expect(errorDe(esquemaFactura, { ...factura, clientRFC: "ABC123" })).toBe(MENSAJES.rfc);
		expect(errorDe(esquemaFactura, { ...factura, clientRFC: "abc010101ab1" })).toBeNull();
		expect(errorDe(esquemaFactura, { ...factura, items: [{ description: "x", qty: 1, unitPrice: 0 }] })).toBe(
			"El precio debe ser mayor que 0.",
		);
		expect(errorDe(esquemaFactura, { ...factura, items: [] })).toBe("Añade al menos un concepto.");

		expect(errorDe(esquemaMovimientoCaja, { concept: "Gas", amount: 0 })).toBe("El importe debe ser mayor que 0.");
		expect(errorDe(esquemaPropina, { waiter: "", amount: 10 })).toBe("Escribe el nombre del mesero.");
		expect(errorDe(esquemaNomina, { role: "Chef", name: " ", weeklyPay: 100 })).toBe("Escribe el nombre.");
		expect(errorDe(esquemaProveedor, { name: "Lácteos", email: "ventas@lacteos.mx", deliveryDays: 0 })).toBeNull();
		expect(errorDe(esquemaOrdenCompra, { supplierId: 0, items: [{ productName: "Leche", quantity: 1 }] })).toBe(
			"Elige un proveedor.",
		);
		expect(errorDe(esquemaOrdenCompra, { supplierId: 2, items: [{ productName: "", quantity: 1 }] })).toBe(
			"Elige un producto.",
		);
	});
});

test.describe("archivos", () => {
	const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d];
	const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46];
	const WEBP = [...Buffer.from("RIFF"), 0x24, 0, 0, 0, ...Buffer.from("WEBPVP8 ")];
	const AVIF = [0, 0, 0, 0x1c, ...Buffer.from("ftypavif"), 0, 0, 0, 0];
	const XLSX = [0x50, 0x4b, 0x03, 0x04, 0x14, 0, 0x06, 0];
	const EXE = [0x4d, 0x5a, 0x90, 0, 0x03, 0, 0, 0];

	const archivo = (bytes: number[], nombre: string, type = "", relleno = 64) =>
		new File([new Uint8Array([...bytes, ...new Array(relleno).fill(0)])], nombre, { type });

	test("reconoce las firmas de bytes", () => {
		expect(detectarFormato(new Uint8Array(PNG))).toBe("png");
		expect(detectarFormato(new Uint8Array(JPEG))).toBe("jpeg");
		expect(detectarFormato(new Uint8Array(WEBP))).toBe("webp");
		expect(detectarFormato(new Uint8Array(AVIF))).toBe("avif");
		expect(detectarFormato(new Uint8Array(XLSX))).toBe("xlsx");
		expect(detectarFormato(new Uint8Array(EXE))).toBeNull();
		expect(detectarFormato(new Uint8Array([0x89, 0x50]))).toBeNull();
	});

	test("acepta imágenes y hojas válidas", async () => {
		expect(await verificarArchivo(archivo(PNG, "plato.png", "image/png"), "imagen")).toEqual({ valido: true, formato: "png" });
		expect(await verificarArchivo(archivo(JPEG, "plato.JPEG", "image/jpeg"), "imagen")).toMatchObject({ valido: true });
		expect(await verificarArchivo(archivo(WEBP, "plato.webp", "image/webp"), "imagen")).toMatchObject({ valido: true });
		// Sin tipo MIME (algunos sistemas no lo dan para AVIF): decide la firma.
		expect(await verificarArchivo(archivo(AVIF, "plato.avif"), "imagen")).toMatchObject({ valido: true });
		expect(
			await verificarArchivo(
				archivo(XLSX, "carta.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
				"hoja",
			),
		).toEqual({ valido: true, formato: "xlsx" });
	});

	test("rechaza un .exe renombrado a .png, aunque declare image/png", async () => {
		const exe = archivo(EXE, "plato.png", "image/png");
		expect(await verificarArchivo(exe, "imagen")).toEqual({
			valido: false,
			error: "Elige una imagen JPG, PNG, WebP o AVIF.",
		});
		const r = await esquemaImagen.safeParseAsync(exe);
		expect(r.success).toBe(false);
	});

	test("rechaza firma y extensión que no coinciden, tipos ajenos, vacíos y tamaños excesivos", async () => {
		expect(await verificarArchivo(archivo(PNG, "plato.jpg", "image/jpeg"), "imagen")).toMatchObject({ valido: false });
		expect(await verificarArchivo(archivo(PNG, "plato.png", "image/svg+xml"), "imagen")).toMatchObject({ valido: false });
		expect(await verificarArchivo(archivo(PNG, "plato.svg"), "imagen")).toMatchObject({ valido: false });
		expect(await verificarArchivo(archivo(PNG, "plato"), "imagen")).toMatchObject({ valido: false });
		expect(await verificarArchivo(archivo(XLSX, "carta.xls"), "hoja")).toMatchObject({ valido: false });
		expect(await verificarArchivo(archivo(PNG, "carta.xlsx"), "hoja")).toMatchObject({ valido: false });
		expect(await verificarArchivo(new File([], "vacio.png", { type: "image/png" }), "imagen")).toEqual({
			valido: false,
			error: "El archivo está vacío.",
		});

		const imagenGrande = archivo(PNG, "grande.png", "image/png", 5 * 1024 * 1024);
		expect(await verificarArchivo(imagenGrande, "imagen")).toEqual({
			valido: false,
			error: "El archivo supera el tamaño máximo de 5 MB.",
		});
		const hojaGrande = archivo(XLSX, "grande.xlsx", "", 2 * 1024 * 1024);
		expect(await verificarArchivo(hojaGrande, "hoja")).toEqual({
			valido: false,
			error: "El archivo supera el tamaño máximo de 2 MB.",
		});
		// Justo en el límite sí pasa.
		const limite = archivo(PNG, "limite.png", "image/png", 5 * 1024 * 1024 - PNG.length);
		expect(await verificarArchivo(limite, "imagen")).toMatchObject({ valido: true });
		// Un Blob sin nombre no se puede contrastar con su extensión.
		expect(await verificarArchivo(new Blob([new Uint8Array(PNG)], { type: "image/png" }), "imagen")).toMatchObject({
			valido: false,
		});
	});
});
