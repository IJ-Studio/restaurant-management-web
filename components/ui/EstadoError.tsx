"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boton } from "./Boton";

/**
 * Estado de error de una carga (DESIGN.md § Otros componentes base y § Cards): dice qué no se
 * pudo cargar, nunca muestra un cero en su lugar, y ofrece «Reintentar».
 *
 * - El mensaje va en `role="alert"`: se anuncia al aparecer, sin leer el botón.
 * - `alReintentar` puede devolver una promesa: mientras dura, el botón carga y no admite otro clic.
 * - El icono y el título van en el color de error; la descripción, en el secundario.
 * - Redacción cálida y sin jerga (D-20): nunca un código, un mensaje de red ni el texto de la excepción.
 */
export interface EstadoErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	titulo?: ReactNode;
	descripcion?: ReactNode;
	alReintentar?: () => void | Promise<unknown>;
	textoReintentar?: string;
	/** Otra salida, además de reintentar (p. ej., «Llamar al restaurante»). */
	accion?: ReactNode;
	nivelTitulo?: 2 | 3 | 4;
	sinMarco?: boolean;
}

export function EstadoError({
	titulo = "No pudimos mostrar esta parte",
	descripcion = "Suele arreglarse al volver a intentarlo.",
	alReintentar,
	textoReintentar = "Reintentar",
	accion,
	nivelTitulo = 3,
	sinMarco = false,
	className,
	...resto
}: EstadoErrorProps) {
	const Titulo = `h${nivelTitulo}` as const;
	return (
		<div
			className={cn(
				"flex min-w-0 flex-col items-center gap-4 py-10 text-center",
				// Sin marco, el contenedor ya pone el relleno lateral.
				!sinMarco && "rounded-tarjeta border border-borde-sutil px-4 sm:px-6",
				className,
			)}
			{...resto}
		>
			<span aria-hidden="true" className="text-error [&_svg]:size-10 [&_svg]:stroke-1">
				<CircleAlert />
			</span>
			<div role="alert" className="flex max-w-[45ch] flex-col gap-1.5">
				<Titulo className="m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35] text-error [text-wrap:balance]">
					{titulo}
				</Titulo>
				{descripcion && (
					<p className="m-0 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{descripcion}</p>
				)}
			</div>
			{/* Una acción larga pasa a dos líneas antes que desbordar a 360 px con texto al 125 % (WCAG 1.4.10). */}
			{(alReintentar || accion) && (
				<div className="flex max-w-full flex-wrap justify-center gap-3 [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:text-center">
					{alReintentar && (
						<Boton variante="secundario" icono={<RotateCcw />} textoCargando="Reintentando…" onClick={alReintentar}>
							{textoReintentar}
						</Boton>
					)}
					{accion}
				</div>
			)}
		</div>
	);
}
