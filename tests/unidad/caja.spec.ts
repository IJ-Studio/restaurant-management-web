import { test, expect } from "@playwright/test";
import { nombrePropio, primeraMayuscula } from "../../lib/formato/caja";

// Presentación de los textos que el API guarda en MAYÚSCULAS. Sin navegador.
test.describe("formato de caja", () => {
	test("primera mayúscula y el resto en minúsculas", () => {
		expect(primeraMayuscula("ENCHILADAS SUIZAS")).toBe("Enchiladas suizas");
		expect(primeraMayuscula("¡CAFÉ DE OLLA!")).toBe("¡Café de olla!");
		expect(primeraMayuscula("")).toBe("");
		expect(primeraMayuscula(null)).toBe("");
	});

	test("respeta siglas fiscales, correos, URL y claves con dígitos", () => {
		expect(primeraMayuscula("PRECIO CON IVA Y CFDI 4.0")).toBe("Precio con IVA y CFDI 4.0");
		expect(primeraMayuscula("RFC XAXX010101000 DE LA EMPRESA")).toBe("RFC XAXX010101000 de la empresa");
		expect(primeraMayuscula("ESCRIBE A ana@correo.mx")).toBe("Escribe a ana@correo.mx");
		expect(primeraMayuscula("COMERCIAL QUIJOTE S.A. DE C.V.")).toBe("Comercial quijote S.A. de C.V.");
	});

	test("un texto que ya trae minúsculas no se toca", () => {
		expect(primeraMayuscula("Mole de olla de Huejutla")).toBe("Mole de olla de Huejutla");
	});

	test("nombres de persona con partículas", () => {
		expect(nombrePropio("MARÍA DE LA PEÑA")).toBe("María de la Peña");
		expect(nombrePropio("JOSÉ-LUIS ÑAÑEZ")).toBe("José-Luis Ñañez");
	});
});
