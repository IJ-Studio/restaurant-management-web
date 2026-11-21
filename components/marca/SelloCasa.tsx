import { useId } from "react";
import { MOLINO } from "./trazados";

// El molino ocupa el 34 % del alto del sello, centrado dentro del anillo interior.
const ALTO_MOLINO = 34;
const [, , anchoMolino, altoMolino] = MOLINO.viewBox.split(" ").map(Number);
const escala = ALTO_MOLINO / altoMolino;
const desplazamiento = `translate(${(100 - anchoMolino * escala) / 2} ${(100 - ALTO_MOLINO) / 2}) scale(${escala})`;
// Texto curvado: el nombre de la casa y su ciudad (datos reales), repartido en la circunferencia.
const LEYENDA = "El Quijote · Huejutla de Reyes · Hidalgo ·";

/**
 * Sello de la casa (DESIGN.md § Signature components): sello circular de doble anillo con el
 * nombre de la casa curvado y el molino del logo al centro. Una vez por página, como firma.
 * Decorativo. El molino usa currentColor; los filetes miden 1 px a cualquier tamaño.
 */
export function SelloCasa({ className = "" }: { className?: string }) {
	const idCurva = useId();
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			aria-hidden="true"
			focusable="false"
			className={`size-[7.5rem] md:size-36 ${className}`}
		>
			<defs>
				<path id={idCurva} d="M50 50m-39.5 0a39.5 39.5 0 1 1 79 0a39.5 39.5 0 1 1-79 0" />
			</defs>
			<g fill="none" className="stroke-acento" strokeWidth="1">
				<circle cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke" />
				<circle cx="50" cy="50" r="46.5" vectorEffect="non-scaling-stroke" />
				<circle cx="50" cy="50" r="31" vectorEffect="non-scaling-stroke" />
			</g>
			<text className="fill-acento font-texto" fontSize="6.4" fontWeight="600" letterSpacing="1.15">
				<textPath href={`#${idCurva}`} textLength="244" lengthAdjust="spacing">
					{LEYENDA.toUpperCase()}
				</textPath>
			</text>
			<path d={MOLINO.d} fill="currentColor" transform={desplazamiento} />
		</svg>
	);
}
