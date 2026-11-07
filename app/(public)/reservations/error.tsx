"use client";

import { LimiteError } from "@/components/errores/LimiteError";

// Límite de error de las reservas (D-20, PLAN 4.23): sin trazas, con salida a la sección de reservas.
export default function ErrorReservas({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return <LimiteError error={error} reset={reset} contexto="reservas" salida={{ href: "/#reservas", texto: "Volver a «Reservas»" }} />;
}
