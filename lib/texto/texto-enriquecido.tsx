import type { ReactNode } from "react";
import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";

/**
 * Texto con marcado que llega del API (título de la portada, descripción de «La casa») convertido
 * en elementos de React, nunca en innerHTML (PLAN 2.12, condición de D-03).
 *
 * - Lista blanca: `<br>`, `<em>`, `<strong>` y `<span>`, que pasa a `<em class="resaltado">`.
 * - Cualquier otra etiqueta se reduce a su texto; las que no tienen texto legible (`script`,
 *   `style`, `iframe`…) se descartan enteras.
 * - **Se descartan todos los atributos** (`on*`, `style`, `href`, `src`, `class`…).
 * - El texto lo escapa React: no queda HTML ejecutable.
 *
 * `html-react-parser` analiza con htmlparser2 en el servidor y con el DOMParser del navegador en
 * el cliente, sin innerHTML.
 */
const DESCARTADAS = new Set(["script", "style", "iframe", "object", "embed", "noscript", "template", "svg", "math", "head", "title"]);

const opciones: HTMLReactParserOptions = {
	replace(nodo) {
		if (!(nodo instanceof Element)) return undefined;
		const hijos = () => domToReact(nodo.children as DOMNode[], opciones);
		switch (nodo.name) {
			case "br":
				return <br />;
			case "em":
				return <em>{hijos()}</em>;
			case "strong":
				return <strong>{hijos()}</strong>;
			case "span":
				return <em className="resaltado">{hijos()}</em>;
			default:
				return DESCARTADAS.has(nodo.name) ? <></> : <>{hijos()}</>;
		}
	},
};

export function textoEnriquecido(html: string): ReactNode {
	return parse(html, opciones);
}
