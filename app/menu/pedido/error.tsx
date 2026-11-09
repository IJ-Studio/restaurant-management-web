"use client";

import { LimiteError } from "@/components/errores/LimiteError";

// Límite de error del pedido y el pago (D-20, PLAN 4.23): sin trazas, con salida a tu pedido.
export default function ErrorPedido({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return <LimiteError error={error} reset={reset} contexto="pedido" salida={{ href: "/menu/pedido", texto: "Volver a tu pedido" }} />;
}
