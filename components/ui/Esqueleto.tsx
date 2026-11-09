import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Esqueleto de carga (DESIGN.md § Otros componentes base): bloques con pulso de opacidad, sin
 * pulso si el movimiento está reducido (`.esqueleto` en `styles/componentes.css`). Es decorativo:
 * va oculto a los lectores; quien lo usa pone `aria-busy` en el contenedor y un «Cargando…»
 * para lectores (o usa `ZonaCargando`).
 *
 * `sobre="superficie"` cambia el relleno a la superficie café: dentro de una tarjeta o tabla, la
 * superficie elevada es blanca sobre hueso en el tema claro y no se ve.
 */
export interface EsqueletoProps extends HTMLAttributes<HTMLSpanElement> {
	sobre?: "fondo" | "superficie";
}

export function Esqueleto({ sobre = "fondo", className, ...resto }: EsqueletoProps) {
	return <span aria-hidden="true" data-sobre={sobre} className={cn("esqueleto block h-3.5", className)} {...resto} />;
}

const ANCHOS = ["w-full", "w-11/12", "w-2/3", "w-5/6", "w-3/4"];

/** Varias líneas de texto, con anchos distintos para que parezca un párrafo. */
export function EsqueletoLineas({ lineas = 3, sobre, className }: { lineas?: number; sobre?: EsqueletoProps["sobre"]; className?: string }) {
	return (
		<span aria-hidden="true" className={cn("flex flex-col gap-2.5", className)}>
			{Array.from({ length: lineas }, (_, i) => (
				<Esqueleto key={i} sobre={sobre} className={ANCHOS[i % ANCHOS.length]} />
			))}
		</span>
	);
}

/** Contenedor que anuncia la carga: `aria-busy` y un texto para lectores. */
export function ZonaCargando({
	cargando,
	texto = "Cargando…",
	className,
	children,
	...resto
}: HTMLAttributes<HTMLDivElement> & { cargando: boolean; texto?: string }) {
	return (
		<div aria-busy={cargando || undefined} className={className} {...resto}>
			{cargando && (
				<span role="status" className="solo-lectores">
					{texto}
				</span>
			)}
			{children}
		</div>
	);
}
