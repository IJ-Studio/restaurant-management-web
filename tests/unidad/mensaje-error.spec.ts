import { test, expect } from "@playwright/test";
import { APIError, MENSAJES_ERROR, mensajeDeError } from "@/lib/api";

const GENERICO = "No pudimos añadirlo a tu pedido.";

test.describe("mensajeDeError: un texto por tipo de fallo", () => {
	const casos: [string, unknown, string][] = [
		["regla de negocio (400) con el texto del API", new APIError("Cocina recibe pedidos de 08:00 a 21:30.", 400, "BAD_REQUEST"), "Cocina recibe pedidos de 08:00 a 21:30."],
		["validación: el primer motivo, no «Datos inválidos.»", new APIError("Datos inválidos.", 400, "BAD_REQUEST", ["Teléfono inválido", "Email inválido"]), "Teléfono inválido"],
		["conflicto (409)", new APIError("Esa mesa ya está reservada a esa hora.", 409, "CONFLICT"), "Esa mesa ya está reservada a esa hora."],
		["no existe (404)", new APIError("Platillo no encontrado", 404, "NOT_FOUND"), "Platillo no encontrado"],
		["sesión (401)", new APIError("Token de autorización es requerido", 401, "UNAUTHORIZED"), MENSAJES_ERROR.sesion],
		["permiso (403)", new APIError("Forbidden", 403, "FORBIDDEN"), MENSAJES_ERROR.permiso],
		["límite (429)", new APIError("ThrottlerException", 429, "TOO_MANY_REQUESTS"), MENSAJES_ERROR.limite],
		["servidor (500): genérico, sin detalles internos", new APIError("Error interno del servidor.", 500, "INTERNAL"), GENERICO],
		["red (fetch rechazado)", new TypeError("Failed to fetch"), MENSAJES_ERROR.red],
		["desconocido", new Error("x"), GENERICO],
		["4xx sin mensaje", new APIError("", 400, "BAD_REQUEST"), GENERICO],
	];
	for (const [nombre, error, esperado] of casos) test(nombre, () => expect(mensajeDeError(error, GENERICO)).toBe(esperado));
});
