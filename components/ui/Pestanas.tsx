"use client";

import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pestañas (DESIGN.md § Otros componentes base), según el patrón de pestañas de WAI-ARIA:
 * `tablist`/`tab`/`tabpanel`, un solo `tab` en el orden del tabulador y flechas, Inicio y Fin
 * para moverse; al llegar a una pestaña se activa.
 *
 * Con `parametroUrl`, la pestaña va en la URL (`?pestana=pagos`) mediante `history.replaceState`:
 * se puede compartir y recargar sin crear una entrada nueva en el historial por cada clic. Para
 * que la primera pintura ya sea la correcta, la página pasa `valorInicial` desde sus `searchParams`;
 * si no, se lee de la URL al montar.
 */

// La URL no avisa de sus cambios; basta con leerla al pintar.
const suscribirNada = () => () => {};

export interface Pestana {
	valor: string;
	titulo: string;
	/** Cifra junto al título («Pendientes 3»), con su descripción para lectores. */
	contador?: { valor: number; descripcion: string };
	contenido: ReactNode;
}

export interface PestanasProps {
	/** Nombre de la lista de pestañas para los lectores. */
	etiqueta: string;
	pestanas: Pestana[];
	valorInicial?: string;
	/** Parámetro de la URL que guarda la pestaña. Sin él, la pestaña no se refleja en la URL. */
	parametroUrl?: string;
	alCambiar?: (valor: string) => void;
	className?: string;
}

export function Pestanas({ etiqueta, pestanas, valorInicial, parametroUrl, alCambiar, className }: PestanasProps) {
	const base = useId();
	const valida = (v: string | null | undefined) => (v && pestanas.some((p) => p.valor === v) ? v : null);
	// Sin `valorInicial`, la URL manda (enlaces compartidos, recargas). En el servidor y en la
	// hidratación vale `null`; después, React vuelve a pintar con el valor real, sin desajuste.
	const deUrl = useSyncExternalStore(
		suscribirNada,
		() => (parametroUrl ? new URLSearchParams(window.location.search).get(parametroUrl) : null),
		() => null,
	);
	const [elegida, setElegida] = useState<string | null>(null);
	const activa = valida(elegida) ?? valida(valorInicial) ?? (valorInicial === undefined ? valida(deUrl) : null) ?? pestanas[0]?.valor;
	const botones = useRef<Record<string, HTMLButtonElement | null>>({});

	const activar = (valor: string, enfocar = false) => {
		setElegida(valor);
		if (enfocar) botones.current[valor]?.focus();
		if (parametroUrl) {
			const url = new URL(window.location.href);
			if (valor === pestanas[0].valor) url.searchParams.delete(parametroUrl);
			else url.searchParams.set(parametroUrl, valor);
			window.history.replaceState(window.history.state, "", url);
		}
		alCambiar?.(valor);
	};

	const alTeclear = (evento: KeyboardEvent<HTMLDivElement>) => {
		const indice = pestanas.findIndex((p) => p.valor === activa);
		const ultimo = pestanas.length - 1;
		// En RTL, las flechas se invierten como el orden visual.
		const rtl = getComputedStyle(evento.currentTarget).direction === "rtl";
		const destino = {
			ArrowRight: rtl ? indice - 1 : indice + 1,
			ArrowLeft: rtl ? indice + 1 : indice - 1,
			Home: 0,
			End: ultimo,
		}[evento.key];
		if (destino === undefined) return;
		evento.preventDefault();
		activar(pestanas[(destino + pestanas.length) % pestanas.length].valor, true);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			{/* La lista se desplaza en horizontal si no cabe; las pestañas no se encogen ni se cortan. */}
			<div className="overflow-x-auto border-b border-borde-sutil [scrollbar-width:thin]">
				<div role="tablist" aria-label={etiqueta} onKeyDown={alTeclear} className="flex w-max min-w-full gap-1">
					{pestanas.map((p) => {
						const seleccionada = p.valor === activa;
						return (
							<button
								key={p.valor}
								ref={(e) => {
									botones.current[p.valor] = e;
								}}
								type="button"
								role="tab"
								id={`${base}-pestana-${p.valor}`}
								aria-controls={`${base}-panel-${p.valor}`}
								aria-selected={seleccionada}
								tabIndex={seleccionada ? 0 : -1}
								onClick={() => activar(p.valor)}
								className={cn(
									"relative inline-flex min-h-11 shrink-0 items-center gap-2 px-3 pb-1",
									"font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] whitespace-nowrap",
									"transition-colors duration-(--duracion-breve) ease-estandar",
									"focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco",
									// Filete doble de acento bajo la seleccionada (DESIGN.md: cambia el filete, no solo el tinte).
									"after:absolute after:inset-x-3 after:bottom-0 after:h-[calc(var(--grosor-filete)*2+3px)] after:border-y after:border-acento after:content-['']",
									seleccionada
										? "text-texto-principal after:opacity-100"
										: "text-texto-secundario after:opacity-0 al-pasar:text-texto-principal",
								)}
							>
								{p.titulo}
								{p.contador && (
									<span className="rounded-pastilla border border-borde-control px-1.5 py-px tracking-normal numeros-tabulares">
										<span aria-hidden="true">{p.contador.valor}</span>
										<span className="solo-lectores">{p.contador.descripcion}</span>
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>
			{pestanas.map((p) => (
				<div
					key={p.valor}
					role="tabpanel"
					id={`${base}-panel-${p.valor}`}
					aria-labelledby={`${base}-pestana-${p.valor}`}
					hidden={p.valor !== activa}
					// El panel se enfoca para llegar a su contenido con el tabulador aunque no tenga controles.
					tabIndex={0}
					className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foco"
				>
					{p.contenido}
				</div>
			))}
		</div>
	);
}
