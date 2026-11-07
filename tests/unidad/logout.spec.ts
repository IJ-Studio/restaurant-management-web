import { test, expect } from "@playwright/test";
import { resultadoCierre } from "../../lib/sesion/resultado-cierre";

// POST /api/auth/logout: con la sesión caducada el API responde 401 (reproducido contra el API
// local el 2026-11-04) y la ruta ya no lo propaga al navegador.
test.describe("cierre de sesión", () => {
	test("sesión caducada o revocada (401/403): 200", () => {
		expect(resultadoCierre(401).status).toBe(200);
		expect(resultadoCierre(403).status).toBe(200);
	});
	test("sin token (no se llama al API) y cierre correcto: 200", () => {
		expect(resultadoCierre(null)).toEqual({ status: 200, cuerpo: { success: true } });
		expect(resultadoCierre(201).status).toBe(200);
	});
	test("otro fallo del API: 502 sin detalles del backend", () => {
		const r = resultadoCierre(500);
		expect(r.status).toBe(502);
		expect(JSON.stringify(r.cuerpo)).not.toMatch(/stack|Unauthorized|token/i);
	});
});
