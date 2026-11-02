"use client";

import { useEffect } from "react";
import { EstadoError } from "@/components/ui/EstadoError";
import { clasesBoton } from "@/components/ui/estilos-boton";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Contenido de `app/global-error.tsx` (PLAN 2.17): sustituye al layout raíz cuando es él el que
 * falla, así que pone su propio `<html>` y `<body>` y no depende del router ni de los proveedores.
 * Va aparte para poder probarlo sin navegador; los estilos los importa `global-error.tsx`.
 *
 * Mensaje genérico, «Reintentar», salida al inicio y solo el `digest`; nunca `error.message`
 * ni la pila.
 */
export function ErrorGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		registrarError(error, "límite de error (raíz)");
	}, [error]);

	return (
		<html lang="es">
			<body className="min-h-dvh bg-fondo font-texto text-texto-principal">
				<main data-limite-error className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-16">
					<h1 className="solo-lectores">El Quijote</h1>
					<EstadoError
						nivelTitulo={2}
						titulo="Algo salió mal"
						descripcion="No pudimos mostrar esta página. Inténtalo de nuevo; si sigue fallando, vuelve más tarde."
						alReintentar={reset}
						accion={
							// Navegación completa a propósito: el layout raíz falló y hay que cargarlo de nuevo.
							// eslint-disable-next-line @next/next/no-html-link-for-pages
							<a href="/" className={clasesBoton({ variante: "fantasma" })}>
								Ir al inicio
							</a>
						}
					/>
					{error.digest && (
						<p className="m-0 text-center text-(length:--texto-pequeno) text-texto-secundario">
							Código para soporte: <code className="font-mono [overflow-wrap:anywhere]">{error.digest}</code>
						</p>
					)}
				</main>
			</body>
		</html>
	);
}
