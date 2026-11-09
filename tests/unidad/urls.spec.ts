import { test, expect } from "@playwright/test";
import { cantidadSegura, destinoTrasLogin, esRutaInternaSegura, rutaConParametros, urlExternaPermitida } from "../../lib/seguridad/urls";

// URLs seguras (PLAN 2.13). Sin navegador.
test.describe("urls seguras", () => {
	test("ruta interna segura", () => {
		for (const buena of ["/", "/menu", "/menu/producto/5?x=1#a", "/dashboard/cajero"]) expect(esRutaInternaSegura(buena), buena).toBe(true);
		const control = `/menu${String.fromCharCode(10)}x`;
		for (const mala of ["", null, undefined, "menu", "//ejemplo.org", "/\\ejemplo.org", "https://ejemplo.org", "javascript:alert(1)", control])
			expect(esRutaInternaSegura(mala), String(mala)).toBe(false);
	});

	test("enlace externo: solo https y hosts de la lista", () => {
		expect(urlExternaPermitida("https://www.facebook.com/ElQuijote.Huejutla")).toBe("https://www.facebook.com/ElQuijote.Huejutla");
		expect(urlExternaPermitida("https://maps.google.com/?cid=1")).toBe("https://maps.google.com/?cid=1");
		for (const mala of ["http://www.facebook.com/x", "javascript:alert(1)", "https://ejemplo.org", "https://usuario:clave@www.facebook.com/", "//www.facebook.com", "", null])
			expect(urlExternaPermitida(mala), String(mala)).toBeNull();
	});

	test("ruta con parámetros: codifica, suma a los existentes y omite los vacíos", () => {
		expect(rutaConParametros("/register", { callbackUrl: "/menu/producto/5", action: "", cantidad: 2 })).toBe(
			"/register?callbackUrl=%2Fmenu%2Fproducto%2F5&cantidad=2",
		);
		expect(rutaConParametros("/menu/producto/5?mesaQuery=4", { autoExecute: "pedir_mesa" })).toBe("/menu/producto/5?mesaQuery=4&autoExecute=pedir_mesa");
		expect(rutaConParametros("/x", { a: "1&b=2" })).toBe("/x?a=1%26b%3D2");
	});

	test("cantidad: entero entre 1 y 20", () => {
		expect([null, "", "abc", "0", "-3", "1", "3.7", "20", "50"].map(cantidadSegura)).toEqual([1, 1, 1, 1, 1, 1, 3, 20, 20]);
	});

	test("destino tras el login", () => {
		const base = { rol: "cliente", accion: "pedir_mesa", cantidad: "3" };
		expect(destinoTrasLogin({ ...base, callbackUrl: "https://ejemplo.org" })).toBe("/");
		expect(destinoTrasLogin({ ...base, callbackUrl: "//ejemplo.org" })).toBe("/");
		expect(destinoTrasLogin({ ...base, callbackUrl: null })).toBe("/menu");
		expect(destinoTrasLogin({ ...base, callbackUrl: "/menu/producto/5", cantidad: "99" })).toBe("/menu/producto/5?autoExecute=pedir_mesa&qty=20");
		expect(destinoTrasLogin({ ...base, callbackUrl: "/menu/producto/5", accion: "borrar_todo" })).toBe("/menu/producto/5");
		expect(destinoTrasLogin({ ...base, rol: "cajero", callbackUrl: "https://ejemplo.org" })).toBe("/dashboard/cajero");
	});
});
