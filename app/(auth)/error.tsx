"use client";

import { LimiteError } from "@/components/errores/LimiteError";

// Límite de error del segmento (PLAN 2.17): mensaje genérico, «Reintentar», salida y solo el digest.
export default function ErrorAutenticacion(props: { error: Error & { digest?: string }; reset: () => void }) {
	return <LimiteError {...props} contexto="autenticación" salida={{ href: "/", texto: "Ir al inicio" }} />;
}
