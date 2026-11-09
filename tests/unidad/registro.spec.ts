import { test, expect } from "@playwright/test";
import { esControlDeNext, registrarError } from "../../lib/registro/registrar-error";

// Logger del cliente sin datos sensibles (PLAN 2.8). Sin navegador.
test.describe("registro de errores", () => {
	test("reconoce los errores de control de Next y no los registra", () => {
		const conDigest = (digest: string) => Object.assign(new Error("control"), { digest });
		expect(esControlDeNext(conDigest("NEXT_HTTP_ERROR_FALLBACK;404"))).toBe(true);
		expect(esControlDeNext(conDigest("NEXT_REDIRECT;replace;/login;307;"))).toBe(true);
		expect(esControlDeNext(conDigest("NEXT_NOT_FOUND"))).toBe(true);
		expect(esControlDeNext(new Error("fallo real"))).toBe(false);
		expect(esControlDeNext("texto")).toBe(false);
	});

	test("solo escribe el mensaje y el digest: ni la pila, ni el objeto, ni sus datos", () => {
		const escritos: unknown[][] = [];
		const original = console.error;
		console.error = (...args: unknown[]) => escritos.push(args);
		try {
			const error = Object.assign(new Error("No se pudo cargar"), { digest: "123abc", token: "secreto-123", cuerpo: { correo: "ana@correo.mx" } });
			registrarError(error, "prueba");
			registrarError(Object.assign(new Error("x"), { digest: "NEXT_HTTP_ERROR_FALLBACK;404" }));
		} finally {
			console.error = original;
		}
		expect(escritos).toEqual([["[prueba]", "No se pudo cargar", "digest=123abc"]]);
		expect(JSON.stringify(escritos)).not.toMatch(/secreto|correo|at /);
	});
});
