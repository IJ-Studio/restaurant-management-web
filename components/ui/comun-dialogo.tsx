"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Piezas comunes de `Dialogo`, `PanelLateral` y `DialogoConfirmacion`.
 */

/** Título de diálogo y de panel: `--texto-titulo-interfaz` (DESIGN.md § Hierarchy). */
export const CLASE_TITULO_DIALOGO =
	"m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35] text-texto-principal text-balance";
export const CLASE_DESCRIPCION_DIALOGO =
	"m-0 max-w-(--ancho-lectura) text-(length:--texto-pequeno) leading-[1.55] text-texto-secundario";

/**
 * Devuelve el foco al elemento que lo tenía al abrir. Radix lo devuelve a su `Trigger`; sin
 * disparador (diálogo controlado o `useConfirmacion`), el foco se perdería en el `<body>`.
 */
export function useFocoDeRetorno(conDisparador: boolean) {
	const previo = useRef<HTMLElement | null>(null);
	return {
		onOpenAutoFocus: () => {
			if (!conDisparador) previo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		},
		onCloseAutoFocus: (evento: Event) => {
			if (conDisparador || !previo.current?.isConnected) return;
			evento.preventDefault();
			previo.current.focus();
			previo.current = null;
		},
	};
}

/**
 * Cuerpo desplazable. Si su contenido no cabe, se puede enfocar para desplazarlo con el teclado
 * (WCAG 2.1.1); si cabe, no añade una parada inútil al tabulador.
 */
export function CuerpoDialogo({ className, children }: { className?: string; children: ReactNode }) {
	const caja = useRef<HTMLDivElement>(null);
	const [desborda, setDesborda] = useState(false);
	useEffect(() => {
		const elemento = caja.current;
		if (!elemento) return;
		const medir = () => setDesborda(elemento.scrollHeight > elemento.clientHeight + 1);
		medir();
		const observador = new ResizeObserver(medir);
		observador.observe(elemento);
		for (const hijo of Array.from(elemento.children)) observador.observe(hijo);
		return () => observador.disconnect();
	}, []);
	return (
		<div ref={caja} tabIndex={desborda ? 0 : undefined} data-desborda={desborda || undefined} className={cn("cuerpo-dialogo", className)}>
			{children}
		</div>
	);
}
