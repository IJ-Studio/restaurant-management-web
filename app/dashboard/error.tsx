"use client";

import { LimiteError } from "@/components/errores/LimiteError";

// Límite de error del segmento (PLAN 2.17): mensaje genérico, «Reintentar», salida y solo el digest.
export default function ErrorPanel(props: { error: Error & { digest?: string }; reset: () => void }) {
	return <LimiteError {...props} contexto="paneles" salida={{ href: "/dashboard", texto: "Ir al panel" }} />;
}
