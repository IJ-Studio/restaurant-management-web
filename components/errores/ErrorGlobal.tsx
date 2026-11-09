"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { clasesBoton } from "@/components/ui/estilos-boton";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Contenido de `app/global-error.tsx` (PLAN 2.17; diseño de D-21 en el 4.23): sustituye al layout
 * raíz cuando es él el que falla, así que pone su propio `<html>` y `<body>` y no depende del
 * router ni de los proveedores. La copa volcada, «Reintentar», salida al inicio con navegación
 * completa y solo el `digest`; nunca `error.message` ni la pila.
 */
export function ErrorGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		registrarError(error, "límite de error (raíz)");
	}, [error]);
	return (
		<html lang="es">
			<body className="min-h-dvh bg-fondo font-texto text-texto-principal">
				<main data-limite-error="">
					<PaginaEstado
						{...TEXTOS_ESTADO.error}
						pantallaCompleta
						className="min-h-dvh"
						acciones={
							<>
								<Boton variante="primario" icono={<RotateCcw />} onClick={reset}>
									Reintentar
								</Boton>
								{/* Navegación completa a propósito: el layout raíz falló y hay que cargarlo de nuevo. */}
								{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
								<a href="/" className={clasesBoton({ variante: "secundario" })}>
									Ir al inicio
								</a>
							</>
						}
						pie={
							error.digest ? (
								<p className="m-0 text-(length:--texto-pequeno) text-texto-tenue">
									Código para soporte: <code className="numeros-tabulares [overflow-wrap:anywhere]">{error.digest}</code>
								</p>
							) : undefined
						}
					/>
				</main>
			</body>
		</html>
	);
}
