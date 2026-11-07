import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Lienzo común de las ilustraciones de marca (PLAN 4.0.2, D-21): 160 × 120, trazo de línea de
 * 1,5 px a cualquier tamaño en `currentColor`, como `MolinoAnimado` y `Plato`. Decorativas
 * (`aria-hidden`); los detalles de acento usan `.stroke-acento` o `.fill-acento`, nunca un hex.
 * La animación (`.ilustracion` en styles/componentes.css) es breve, se repite pocas veces y se
 * detiene con movimiento reducido.
 */
export function Lienzo({ children, className, nombre }: { children: ReactNode; className?: string; nombre: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 160 120"
			aria-hidden="true"
			focusable="false"
			data-ilustracion={nombre}
			className={cn("ilustracion h-auto w-full", className)}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{children}
		</svg>
	);
}

/** Atributo común: el trazo no engorda ni adelgaza al escalar. */
export const T = { vectorEffect: "non-scaling-stroke" } as const;
