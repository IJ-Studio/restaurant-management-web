"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Contenido de un límite de error (PLAN 2.17, con el diseño de D-21 en el 4.23). Nunca muestra
 * `error.message` ni la pila. Un error del servidor (trae `digest`) es la olla humeante del 500;
 * uno del navegador, la copa volcada. Con «Reintentar» (`router.refresh()` y `reset()`), una salida
 * y el `digest` como código para soporte. El registro guarda solo el mensaje y el `digest` (2.8).
 */
export interface LimiteErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
	salida: { href: string; texto: string };
	/** Dónde ocurrió, para el registro (p. ej., «menú»). */
	contexto: string;
	/** Dentro de un layout con cabecera; sin él (raíz), ocupa la pantalla entera. */
	pantallaCompleta?: boolean;
}

export function LimiteError({ error, reset, salida, contexto, pantallaCompleta = false }: LimiteErrorProps) {
	const router = useRouter();
	const [, iniciar] = useTransition();
	useEffect(() => {
		registrarError(error, `límite de error (${contexto})`);
	}, [error, contexto]);
	const textos = error.digest ? TEXTOS_ESTADO.errorServidor : TEXTOS_ESTADO.error;
	return (
		<div data-limite-error="">
			<PaginaEstado
				{...textos}
				pantallaCompleta={pantallaCompleta}
				acciones={
					<>
						<Boton variante="primario" icono={<RotateCcw />} onClick={() => iniciar(() => (router.refresh(), reset()))}>
							Reintentar
						</Boton>
						<BotonEnlace href={salida.href} variante="secundario">
							{salida.texto}
						</BotonEnlace>
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
		</div>
	);
}
