"use client";

import { useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode, type Ref } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { clasesBoton, type OpcionesBoton } from "./estilos-boton";

export interface BotonProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "onClick">,
		Omit<OpcionesBoton, "className"> {
	ref?: Ref<HTMLButtonElement>;
	/** Icono de Lucide; se pinta a 1rem y con trazo 1.5. */
	icono?: ReactNode;
	posicionIcono?: "inicio" | "fin";
	/** No disponible: sigue siendo enfocable y lo anuncia aria-disabled. */
	deshabilitado?: boolean;
	/** Operación en curso controlada desde fuera. */
	cargando?: boolean;
	textoCargando?: string;
	/** Si devuelve una promesa, el botón queda cargando hasta que termine. */
	onClick?: (evento: MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
}

/**
 * Botón con los estados de DESIGN.md. Mientras está deshabilitado o cargando ignora
 * los clics (también los repetidos antes de que React vuelva a pintar) y no envía
 * el formulario.
 */
export function Boton({
	ref,
	variante,
	tamano,
	anchoCompleto,
	soloIcono,
	icono,
	posicionIcono = "inicio",
	deshabilitado = false,
	cargando = false,
	textoCargando = "Enviando…",
	type = "button",
	className,
	children,
	onClick,
	...resto
}: BotonProps) {
	const [pendiente, setPendiente] = useState(false);
	const enCurso = useRef(false);
	const ocupado = cargando || pendiente;
	const bloqueado = deshabilitado || ocupado;

	function alPulsar(evento: MouseEvent<HTMLButtonElement>) {
		if (bloqueado || enCurso.current) {
			evento.preventDefault();
			return;
		}
		const resultado = onClick?.(evento);
		if (resultado instanceof Promise) {
			enCurso.current = true;
			setPendiente(true);
			resultado.finally(() => {
				enCurso.current = false;
				setPendiente(false);
			});
		}
	}

	const giro = <LoaderCircle className="animate-spin motion-reduce:animate-none in-data-[movimiento=reducido]:animate-none" />;
	// Con icono, el giro ocupa su sitio; sin icono, va junto a «Enviando…» dentro de la celda.
	const iconoVisible = ocupado && (icono || soloIcono) ? giro : icono;

	return (
		<button
			ref={ref}
			type={type}
			aria-disabled={deshabilitado || undefined}
			aria-busy={ocupado || undefined}
			className={clasesBoton({ variante, tamano, anchoCompleto, soloIcono, className })}
			onClick={alPulsar}
			{...resto}
		>
			{soloIcono ? (
				<>
					<span aria-hidden="true">{iconoVisible}</span>
					<span className="solo-lectores">{ocupado ? textoCargando : children}</span>
				</>
			) : (
				<>
					{posicionIcono === "inicio" && iconoVisible && <span aria-hidden="true">{iconoVisible}</span>}
					{/* Las dos etiquetas ocupan la misma celda: el ancho no cambia al pasar a «Enviando…». */}
					<span className="grid">
						<span className={cn("col-start-1 row-start-1", ocupado && "invisible")}>{children}</span>
						<span
							className={cn("col-start-1 row-start-1 inline-flex items-center justify-center gap-2", !ocupado && "invisible")}
							aria-hidden={!ocupado}
						>
							{!icono && <span aria-hidden="true">{giro}</span>}
							{textoCargando}
						</span>
					</span>
					{posicionIcono === "fin" && iconoVisible && <span aria-hidden="true">{iconoVisible}</span>}
				</>
			)}
		</button>
	);
}
