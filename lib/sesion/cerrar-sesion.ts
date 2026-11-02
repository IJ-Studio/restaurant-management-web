"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { sesionCerrada } from "@/store/slices/authSlice";
import { olvidarSesion } from "./sesion-cliente";

/**
 * Cierre de sesión único (PLAN 2.14). Lo usan la barra lateral de los paneles, el panel de
 * mesero, el menú de la cabecera antigua y, como `alCerrarSesion`, `MenuCuenta` y
 * `BarraSuperiorPanel`.
 *
 * 1. `POST /api/auth/logout` (sin caché). Si falla o no hay red, se limpia igual.
 * 2. Caduca las cookies de sesión y borra `authToken`, `user` y `num_mesa`.
 * 3. Reinicia el store de Redux (`sesionCerrada`).
 * 4. Borra cualquier caché del navegador que quede, como defensa: ya no hay service worker (D-11).
 * 5. `router.replace("/login")`: la página privada no queda en el historial.
 */

/** Claves de `localStorage` que pertenecen a la sesión. */
export const CLAVES_SESION = ["authToken", "user", "num_mesa"] as const;
/** Cookies de sesión legibles desde el cliente; la ruta de cierre también las caduca. */
const COOKIES_SESION = ["session", "access_token"] as const;

function leerToken(): string | null {
	try {
		return localStorage.getItem("authToken");
	} catch {
		return null;
	}
}

/** Pasos 1, 2 y 4: todo lo que no depende de React. */
export async function limpiarSesionDelNavegador(): Promise<void> {
	const token = leerToken();
	try {
		await fetch("/api/auth/logout", {
			method: "POST",
			cache: "no-store",
			credentials: "same-origin",
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});
	} catch {
		/* sin red: la limpieza local sigue */
	}

	for (const nombre of COOKIES_SESION) document.cookie = `${nombre}=; Max-Age=0; path=/; SameSite=Lax`;
	for (const clave of CLAVES_SESION) {
		try {
			localStorage.removeItem(clave);
		} catch {
			/* almacenamiento bloqueado: no hay nada que borrar */
		}
	}

	if (typeof caches !== "undefined") {
		try {
			const nombres = await caches.keys();
			await Promise.all(nombres.map((n) => caches.delete(n)));
		} catch {
			/* Cache Storage no disponible (contexto no seguro o bloqueado) */
		}
	}
}

/** Devuelve la función de cierre de sesión. */
export function useCerrarSesion(): () => Promise<void> {
	const router = useRouter();
	const dispatch = useDispatch();
	return useCallback(async () => {
		await limpiarSesionDelNavegador();
		olvidarSesion();
		dispatch(sesionCerrada());
		router.replace("/login");
	}, [router, dispatch]);
}
