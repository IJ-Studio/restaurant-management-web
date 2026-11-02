"use client";

import { useId, useRef, type ReactNode } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLASE_CONTROL } from "./Campo";

/**
 * Buscador (PLAN 3.14). Un formulario `role="search"` con etiqueta (visible o solo para lectores), campo
 * `type="search"`, lupa, botón «Borrar búsqueda» y una región `aria-live` que anuncia el
 * resultado («8 platillos», «Sin resultados para…») sin mover el foco.
 *
 * El filtrado lo hace quien lo usa con `useFiltroLocal` (lista en memoria) o
 * `useBusquedaRemota` (API, espera de 300 ms y cancelación), de `hooks/useBusqueda.ts`.
 * Esc borra la consulta. No envía nada: Enter no recarga la página.
 */
export interface BuscadorProps {
	etiqueta: string;
	/** Muestra la etiqueta encima del campo; si no, solo la leen los lectores. */
	etiquetaVisible?: boolean;
	valor: string;
	alCambiar: (valor: string) => void;
	marcador?: string;
	/** Mientras busca (remota) o filtra (diferida): aria-busy y un giro en lugar de la lupa. */
	ocupado?: boolean;
	/** Lo que se anuncia al cambiar el resultado. */
	anuncio?: string;
	/** Ayuda bajo el campo («Escribe al menos 2 letras»). */
	ayuda?: ReactNode;
	className?: string;
}

export function Buscador({
	etiqueta,
	etiquetaVisible = false,
	valor,
	alCambiar,
	marcador,
	ocupado = false,
	anuncio = "",
	ayuda,
	className,
}: BuscadorProps) {
	const id = useId();
	const campo = useRef<HTMLInputElement>(null);
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<form role="search" aria-label={etiqueta} onSubmit={(e) => e.preventDefault()} className="contents">
				<label
					htmlFor={`${id}-campo`}
					className={etiquetaVisible ? "font-texto text-(length:--texto-pequeno) font-semibold text-texto-principal" : "solo-lectores"}
				>
					{etiqueta}
				</label>
				<div className="relative">
					<span
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-texto-secundario [&_svg]:size-5 [&_svg]:stroke-[1.5]"
					>
						{ocupado ? <LoaderCircle className="animate-spin motion-reduce:animate-none in-data-[movimiento=reducido]:animate-none" /> : <Search />}
					</span>
					<input
						ref={campo}
						id={`${id}-campo`}
						type="search"
						value={valor}
						onChange={(e) => alCambiar(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape" && valor) {
								e.preventDefault();
								alCambiar("");
							}
						}}
						placeholder={marcador}
						autoComplete="off"
						spellCheck={false}
						enterKeyHint="search"
						aria-busy={ocupado || undefined}
						aria-describedby={ayuda ? `${id}-ayuda` : undefined}
						className={cn(
							CLASE_CONTROL,
							"ps-11 pe-12 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
						)}
					/>
					{valor && (
						<button
							type="button"
							aria-label="Borrar búsqueda"
							onClick={() => {
								alCambiar("");
								campo.current?.focus();
							}}
							className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-control text-texto-secundario al-pasar:text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
						>
							<X aria-hidden="true" />
						</button>
					)}
				</div>
				{ayuda && (
					<p id={`${id}-ayuda`} className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
						{ayuda}
					</p>
				)}
			</form>
			<p role="status" aria-live="polite" aria-atomic="true" className="solo-lectores" data-prueba="anuncio-buscador">
				{anuncio}
			</p>
		</div>
	);
}
