import "server-only";
import { cache } from "react";
import { getSession } from "@/lib/session";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Capa de acceso a datos de sesión (PLAN 2.11), según la guía de autenticación de Next: la
 * comprobación segura se hace cerca de los datos, no solo en el layout (los layouts no se vuelven
 * a ejecutar al navegar). `server-only` impide importarla desde un componente cliente.
 *
 * Devuelve un DTO mínimo: nunca el payload del token ni el usuario completo del API. `apellidos`
 * se incluye porque la barra lateral muestra las iniciales de nombre y apellido.
 * `cache` deduplica la verificación dentro de una misma petición.
 */
export type RolSesion = "admin" | "cajero" | "mesero" | "cocina" | "cliente";

export interface SesionDTO {
	id: string;
	nombre: string;
	apellidos: string;
	rol: RolSesion;
}

const ROLES_POR_ID: Record<number, RolSesion> = { 1: "admin", 2: "cajero", 3: "mesero", 4: "cocina", 5: "cliente" };
// Sin respaldo a localhost: el build exige la variable (PLAN 2.16).
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export const verificarSesion = cache(async (): Promise<SesionDTO | null> => {
	const sesion = await getSession();
	if (!sesion?.id || !sesion.roleId) return null;
	const rol = ROLES_POR_ID[sesion.roleId];
	if (!rol) return null;

	const dto: SesionDTO = { id: String(sesion.id), nombre: "", apellidos: "", rol };
	try {
		const respuesta = await fetch(`${API}/users/${encodeURIComponent(dto.id)}`, {
			cache: "no-store",
			headers: { "Content-Type": "application/json" },
		});
		if (respuesta.ok) {
			const usuario = (await respuesta.json()) as { name?: unknown; lastname?: unknown };
			dto.nombre = typeof usuario.name === "string" ? usuario.name : "";
			dto.apellidos = typeof usuario.lastname === "string" ? usuario.lastname : "";
		}
	} catch (error) {
		// El nombre es opcional: sin él, la sesión sigue siendo válida.
		registrarError(error, "sesión: nombre del usuario");
	}
	return dto;
});
