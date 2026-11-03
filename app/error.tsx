"use client";

import { LimiteError } from "@/components/errores/LimiteError";

// Límite de error de la raíz (PLAN 2.17 y 4.23): el mismo diseño de página de estado (D-21).
export default function ErrorRaiz({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<main id="contenido">
			<LimiteError error={error} reset={reset} contexto="raíz" salida={{ href: "/", texto: "Ir al inicio" }} pantallaCompleta />
		</main>
	);
}
