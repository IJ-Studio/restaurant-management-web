"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * «Volver arriba» discreto para páginas largas (la carta en móvil). Aparece tras desplazarse
 * `umbral` px (opacidad y desplazamiento de 8 px, 240 ms, sin saltos de diseño porque es fijo);
 * con movimiento reducido salta sin animar. Es un botón de 44 px con nombre accesible.
 */
export function VolverArriba({ umbral = 900 }: { umbral?: number }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const alDesplazar = () => setVisible(window.scrollY > umbral);
		alDesplazar();
		window.addEventListener("scroll", alDesplazar, { passive: true });
		return () => window.removeEventListener("scroll", alDesplazar);
	}, [umbral]);

	return (
		<button
			type="button"
			tabIndex={visible ? 0 : -1}
			aria-hidden={!visible}
			aria-label="Volver arriba"
			onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
			className={cn(
				"fixed right-4 bottom-4 z-50 inline-flex size-11 items-center justify-center rounded-control border border-borde-control bg-superficie-elevada text-texto-principal",
				// translate-* y scale-* de Tailwind v4 son las propiedades `translate` y `scale`, no `transform`.
				"transition-[opacity,translate,scale,background-color] duration-(--duracion-media) ease-salida motion-reduce:transition-none",
				"al-pasar:bg-superficie-cafe active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco",
				visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
			)}
		>
			<ArrowUp aria-hidden="true" className="size-4" strokeWidth={1.5} />
		</button>
	);
}
