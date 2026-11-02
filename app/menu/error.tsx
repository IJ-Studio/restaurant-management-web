"use client";

import { LimiteError } from "@/components/errores/LimiteError";

// Límite de error del segmento (PLAN 2.17): mensaje genérico, «Reintentar», salida y solo el digest.
export default function ErrorMenu(props: { error: Error & { digest?: string }; reset: () => void }) {
	return <LimiteError {...props} contexto="menú" salida={{ href: "/menu", texto: "Ver el menú" }} />;
}
