"use client";

import { useEffect, useState } from "react";
import { Imagen } from "@/components/ui/Imagen";
import { pedirSitio, type SitioPublico } from "@/lib/publico/sitio-cliente";

/**
 * Fotos de la portada que sube el administrador (P1.5). La foto de siempre sale en el HTML (es el
 * LCP y no espera al API); estas se funden encima al llegar. Con varias, pasan cada 7 s; con
 * «reducir movimiento» o la pestaña oculta, se quedan quietas. El color de respaldo va detrás de todo.
 */
export function CarruselPortada() {
	const [sitio, setSitio] = useState<SitioPublico | null>(null);
	const [actual, setActual] = useState(0);
	const [visible, setVisible] = useState(false);
	const fotos = sitio?.portada ?? [];

	useEffect(() => {
		let vivo = true;
		void pedirSitio().then((s) => vivo && setSitio(s));
		return () => {
			vivo = false;
		};
	}, []);

	useEffect(() => {
		if (fotos.length === 0) return;
		const t0 = requestAnimationFrame(() => setVisible(true));
		if (fotos.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => cancelAnimationFrame(t0);
		const t = setInterval(() => {
			if (!document.hidden) setActual((i) => (i + 1) % fotos.length);
		}, 7000);
		return () => {
			cancelAnimationFrame(t0);
			clearInterval(t);
		};
	}, [fotos.length]);

	return (
		<>
			{sitio?.colorRespaldo && <span aria-hidden="true" className="absolute inset-0 -z-[3]" style={{ backgroundColor: sitio.colorRespaldo }} />}
			{fotos.map((f, i) => (
				<span
					key={f.url}
					aria-hidden="true"
					data-foto-portada={i === actual ? "actual" : ""}
					className="portada__foto transition-opacity duration-1000 ease-in-out motion-reduce:transition-none"
					style={{ opacity: visible && i === actual ? 1 : 0 }}
				>
					<Imagen src={f.url} decorativa fill sizes="100vw" loading={i === 0 ? "eager" : "lazy"} className="object-cover object-center" />
				</span>
			))}
		</>
	);
}
