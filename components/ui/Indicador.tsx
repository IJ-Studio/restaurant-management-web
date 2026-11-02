"use client";

import { useId, type HTMLAttributes, type ReactNode } from "react";
import { CircleAlert, Minus, RotateCcw, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boton } from "./Boton";
import { Esqueleto } from "./Esqueleto";
import { Insignia } from "./Insignia";
import { formatoPorcentaje } from "./graficas/formato";

/**
 * Indicador (DESIGN.md § Cards / Containers): rótulo en `--texto-etiqueta`, cifra en
 * `--texto-cifra-destacada` (Fraunces, cifras tabulares para que no bailen al actualizarse) y
 * comparación en `--texto-pequeno` con icono de tendencia y texto.
 *
 * Estados: cargando (esqueleto del mismo tamaño), error («No se pudo cargar» y Reintentar; nunca
 * un cero en su lugar), sin comparación (no se muestra la línea) y datos de ejemplo (insignia).
 *
 * El color de la comparación dice si es buena o mala noticia, no si sube o baja: con
 * `mejorSiSube={false}` (cancelaciones, mermas), subir es malo. El color nunca va solo: el
 * signo, el icono y un texto para lectores («mejora» o «empeora») dicen lo mismo.
 */
export interface ComparacionIndicador {
	/** Cambio relativo: 0.08 es +8 %. */
	cambio: number;
	/** Frente a qué: «frente al martes pasado». */
	referencia: string;
	mejorSiSube?: boolean;
}

export interface IndicadorProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
	rotulo: string;
	/** La cifra ya formateada («$ 18 420», «148»). */
	valor?: ReactNode;
	comparacion?: ComparacionIndicador;
	/** Periodo o fuente, en pequeño bajo la cifra. */
	detalle?: ReactNode;
	estado?: "listo" | "cargando" | "error";
	alReintentar?: () => void | Promise<unknown>;
	datosDeEjemplo?: boolean;
}


export function Indicador({
	rotulo,
	valor,
	comparacion,
	detalle,
	estado = "listo",
	alReintentar,
	datosDeEjemplo = false,
	className,
	...resto
}: IndicadorProps) {
	const id = useId();
	const sube = (comparacion?.cambio ?? 0) > 0;
	const igual = comparacion?.cambio === 0;
	const buena = comparacion && !igual && sube === (comparacion.mejorSiSube ?? true);

	return (
		<article
			aria-labelledby={`${id}-rotulo`}
			aria-busy={estado === "cargando" || undefined}
			data-estado={estado}
			className={cn("flex min-w-0 flex-col gap-3 rounded-tarjeta border border-borde-sutil bg-superficie p-6 text-texto-principal", className)}
			{...resto}
		>
			<div className="flex flex-wrap items-start justify-between gap-2">
				<h3
					id={`${id}-rotulo`}
					className="m-0 font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] text-texto-secundario"
				>
					{rotulo}
				</h3>
				{datosDeEjemplo && <Insignia tono="aviso">Datos de ejemplo</Insignia>}
			</div>

			{estado === "cargando" ? (
				<>
					<span role="status" className="solo-lectores">
						Cargando…
					</span>
					{/* Mismo alto que la cifra y la comparación, para que nada salte al llegar el dato. */}
					<Esqueleto sobre="superficie" className="h-(--texto-cifra-destacada) w-2/3" />
					<Esqueleto sobre="superficie" className="w-1/2" />
				</>
			) : estado === "error" ? (
				<div className="flex flex-col items-start gap-3">
					<p className="m-0 flex items-center gap-2 text-error [&_svg]:size-4 [&_svg]:stroke-[1.5]">
						<CircleAlert aria-hidden="true" />
						<span>No se pudo cargar</span>
					</p>
					{alReintentar && (
						<Boton variante="secundario" tamano="compacto" icono={<RotateCcw />} textoCargando="Reintentando…" onClick={alReintentar}>
							Reintentar
						</Boton>
					)}
				</div>
			) : (
				<>
					<p className="texto-cifra-destacada m-0 text-texto-principal">{valor}</p>
					{comparacion && (
						<p
							className={cn(
								"m-0 flex items-center gap-1.5 text-(length:--texto-pequeno) leading-[1.5] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
								igual ? "text-texto-secundario" : buena ? "text-exito" : "text-error",
							)}
						>
							{igual ? <Minus aria-hidden="true" /> : sube ? <TrendingUp aria-hidden="true" /> : <TrendingDown aria-hidden="true" />}
							<span>
								<span className="font-semibold numeros-tabulares">{formatoPorcentaje(comparacion.cambio, true)}</span>{" "}
								<span className="text-texto-secundario">{comparacion.referencia}</span>
								{!igual && <span className="solo-lectores">{buena ? ", mejora" : ", empeora"}</span>}
							</span>
						</p>
					)}
					{detalle && <p className="m-0 text-(length:--texto-pequeno) leading-[1.5] text-texto-tenue">{detalle}</p>}
				</>
			)}
		</article>
	);
}
