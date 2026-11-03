import type { ReactNode } from "react";
import { CabeceraSitio } from "./cabecera/CabeceraSitio";
import { PieSitio } from "./PieSitio";

/**
 * Marco de la parte pública (PLAN 4.1): «Saltar al contenido», la cabecera fija, el contenido en
 * `<main id="contenido">` y el pie, todo renderizado en el servidor. Lo usan los layouts de
 * `(public)`, `(auth)` y `menu`; los paneles tienen el suyo.
 *
 * La cuenta de la cabecera la leen sus islas del store (PLAN 2.15), así que el layout no
 * consulta la sesión: no se queda desfasada al navegar entre páginas del mismo grupo.
 */
export function MarcoSitio({ children }: { children: ReactNode }) {
	return (
		<>
			<a href="#contenido" className="saltar-contenido">
				Saltar al contenido
			</a>
			<CabeceraSitio />
			<main id="contenido" tabIndex={-1} className="marco-sitio-contenido">
				{children}
			</main>
			<PieSitio />
		</>
	);
}
