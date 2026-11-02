"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EstadoError } from "@/components/ui/EstadoError";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Contenido de un límite de error (PLAN 2.17). Nunca muestra `error.message` ni la pila: en el
 * cliente el mensaje puede traer detalles internos. Solo:
 *
 * - un mensaje genérico;
 * - «Reintentar», que vuelve a pedir los datos del servidor (`router.refresh()`) y monta de
 *   nuevo el segmento (`reset()`);
 * - un enlace de salida;
 * - el `digest`, si lo hay, para que soporte encuentre el error en el registro del servidor.
 *
 * El registro (`registrarError`, PLAN 2.8) guarda solo el mensaje y el `digest`.
 */
export interface LimiteErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
	salida: { href: string; texto: string };
	/** Dónde ocurrió, para el registro (p. ej., «menú»). */
	contexto: string;
}

export function LimiteError({ error, reset, salida, contexto }: LimiteErrorProps) {
	const router = useRouter();
	const [, iniciar] = useTransition();

	useEffect(() => {
		registrarError(error, `límite de error (${contexto})`);
	}, [error, contexto]);

	return (
		<div data-limite-error className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-16">
			<EstadoError
				nivelTitulo={2}
				titulo="Algo salió mal"
				descripcion="No pudimos mostrar esta página. Inténtalo de nuevo; si sigue fallando, vuelve más tarde."
				alReintentar={() =>
					iniciar(() => {
						router.refresh();
						reset();
					})
				}
				accion={
					<BotonEnlace href={salida.href} variante="fantasma">
						{salida.texto}
					</BotonEnlace>
				}
			/>
			{error.digest && (
				<p className="m-0 text-center text-(length:--texto-pequeno) text-texto-secundario">
					Código para soporte: <code className="font-mono [overflow-wrap:anywhere]">{error.digest}</code>
				</p>
			)}
		</div>
	);
}
