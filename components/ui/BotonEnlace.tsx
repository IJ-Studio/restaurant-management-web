import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { clasesBoton, type OpcionesBoton } from "./estilos-boton";

export interface BotonEnlaceProps extends Omit<ComponentProps<typeof Link>, "className">, OpcionesBoton {
	icono?: ReactNode;
	posicionIcono?: "inicio" | "fin";
}

/** Enlace con aspecto de botón: navega con next/link, sin router.push en un botón. */
export function BotonEnlace({
	variante,
	tamano,
	anchoCompleto,
	soloIcono,
	icono,
	posicionIcono = "inicio",
	className,
	children,
	...resto
}: BotonEnlaceProps) {
	return (
		<Link className={clasesBoton({ variante, tamano, anchoCompleto, soloIcono, className })} {...resto}>
			{posicionIcono === "inicio" && icono && <span aria-hidden="true">{icono}</span>}
			{soloIcono ? <span className="solo-lectores">{children}</span> : <span>{children}</span>}
			{posicionIcono === "fin" && icono && <span aria-hidden="true">{icono}</span>}
		</Link>
	);
}
