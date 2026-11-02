"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Contenedor con desplazamiento horizontal. Solo entra en el orden del tabulador cuando su
 * contenido desborda (WCAG 2.1.1: así se desplaza con el teclado), como el cuerpo del diálogo.
 */
export function RegionDesplazable({ className, children, ...resto }: HTMLAttributes<HTMLDivElement> & { "aria-label": string }) {
	const caja = useRef<HTMLDivElement>(null);
	const [desborda, setDesborda] = useState(false);

	useEffect(() => {
		const elemento = caja.current;
		if (!elemento) return;
		const medir = () => setDesborda(elemento.scrollWidth > elemento.clientWidth + 1);
		medir();
		const observador = new ResizeObserver(medir);
		observador.observe(elemento);
		if (elemento.firstElementChild) observador.observe(elemento.firstElementChild);
		return () => observador.disconnect();
	}, []);

	return (
		<div
			ref={caja}
			role="region"
			tabIndex={desborda ? 0 : undefined}
			data-desborda={desborda || undefined}
			className={cn("overflow-x-auto overscroll-x-contain focus-visible:outline-offset-[-2px]", className)}
			{...resto}
		>
			{children}
		</div>
	);
}
