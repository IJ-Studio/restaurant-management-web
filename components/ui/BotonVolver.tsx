"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { rutaPublica, type Miga } from "@/config/navegacion-publica";
import { registrarRuta, vieneDelSitio } from "@/lib/navegacion/historial";
import { cn } from "@/lib/utils";
import { clasesBoton } from "./estilos-boton";

/**
 * «Volver» (DESIGN.md § Navegación pública, PLAN 3.10). Es un enlace a la sección de origen
 * (`/#carta`), así que funciona sin JavaScript y se puede abrir en otra pestaña. Si se llegó
 * desde el propio sitio, usa el historial: vuelve exactamente a donde se estaba, con su
 * desplazamiento.
 *
 * El texto nombra el destino («Volver a la carta»), no solo «Volver».
 */
export interface BotonVolverProps {
	/** Destino si no se puede usar el historial; por defecto, el origen de la ruta actual. */
	origen?: Miga;
	className?: string;
}

/** Registra cada cambio de ruta para saber si se navega dentro del sitio. Lo usa también la cabecera. */
export function useRegistroRuta() {
	const ruta = usePathname();
	useEffect(() => registrarRuta(ruta), [ruta]);
}

export function BotonVolver({ origen, className }: BotonVolverProps) {
	const router = useRouter();
	const ruta = usePathname();
	useRegistroRuta();
	const destino = origen ?? rutaPublica(ruta)?.origen;
	if (!destino) return null;
	const texto = destino.volver ?? `Volver a «${destino.nombre}»`;

	return (
		<Link
			href={destino.href}
			data-prueba="boton-volver"
			// El destino puede ser largo («Volver a «La casa»» con texto al 125 %): pasa de línea antes que desbordar.
			className={clasesBoton({ variante: "fantasma", tamano: "compacto", className: cn("max-w-full whitespace-normal text-start", className) })}
			onClick={(evento) => {
				// Clic con modificador o con otro botón: el navegador abre otra pestaña con el destino.
				if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
				if (vieneDelSitio() && window.history.length > 1) {
					evento.preventDefault();
					router.back();
				}
			}}
		>
			<ArrowLeft aria-hidden="true" />
			{texto}
		</Link>
	);
}
