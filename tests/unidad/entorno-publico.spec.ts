import { test, expect } from "@playwright/test";
import { problemasEntornoPublico, validarEntornoPublico } from "../../lib/config/entorno-publico";

// Variables públicas del build (PLAN 2.16). Sin navegador. Los valores son ficticios.
const BUENO = {
	NEXT_PUBLIC_API_URL: "https://api.ejemplo.mx",
	NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "nube-ficticia",
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_ficticia",
};

test.describe("entorno público", () => {
	test("un entorno completo y https no tiene problemas", () => {
		expect(problemasEntornoPublico(BUENO, true)).toEqual([]);
		// El build de las pruebas sirve la API en el mismo equipo por http.
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_API_URL: "http://localhost:3100" }, true)).toEqual([]);
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_API_URL: "http://127.0.0.1:10000" }, true)).toEqual([]);
	});

	test("faltan variables", () => {
		const p = problemasEntornoPublico({ NEXT_PUBLIC_API_URL: " " }, true);
		expect(p).toEqual([
			"NEXT_PUBLIC_API_URL no está definida.",
			"NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está definida.",
			"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está definida.",
		]);
	});

	test("API: https en producción, URL válida y sin credenciales", () => {
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_API_URL: "http://api.ejemplo.mx" }, true)).toHaveLength(1);
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_API_URL: "http://api.ejemplo.mx" }, false)).toEqual([]);
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_API_URL: "api.ejemplo.mx" }, true)).toEqual(["NEXT_PUBLIC_API_URL no es una URL válida."]);
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_API_URL: "ftp://api.ejemplo.mx" }, false)).toHaveLength(1);
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_API_URL: "https://u:c@api.ejemplo.mx" }, true)).toHaveLength(1);
	});

	test("Stripe: solo la clave publicable", () => {
		expect(problemasEntornoPublico({ ...BUENO, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "sk_test_ficticia" }, true)).toHaveLength(1);
	});

	test("rechaza NEXT_PUBLIC_* con nombre de secreto", () => {
		const p = problemasEntornoPublico(
			{ ...BUENO, NEXT_PUBLIC_JWT_SECRET: "x", NEXT_PUBLIC_SUPABASE_SERVICE_ROLE: "x", NEXT_PUBLIC_DB_PASSWORD: "x", NEXT_PUBLIC_PRIVATE_KEY: "x", JWT_SECRET: "x" },
			true,
		);
		expect(p.map((x) => x.split(":")[0])).toEqual([
			"NEXT_PUBLIC_DB_PASSWORD",
			"NEXT_PUBLIC_JWT_SECRET",
			"NEXT_PUBLIC_PRIVATE_KEY",
			"NEXT_PUBLIC_SUPABASE_SERVICE_ROLE",
		]);
	});

	test("el error nombra las variables y nunca sus valores", () => {
		const valor = "valor-que-no-debe-salir";
		let mensaje = "";
		try {
			validarEntornoPublico({ NEXT_PUBLIC_API_URL: `http://${valor}.mx`, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: `sk_${valor}`, NEXT_PUBLIC_TOKEN_SECRET: valor }, true);
		} catch (e) {
			mensaje = (e as Error).message;
		}
		expect(mensaje).toContain("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está definida.");
		expect(mensaje).toContain("NEXT_PUBLIC_TOKEN_SECRET");
		expect(mensaje).not.toContain(valor);
	});
});
