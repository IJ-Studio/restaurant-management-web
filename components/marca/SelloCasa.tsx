import { MOLINO } from "./trazados";

// El molino ocupa el 56 % del alto del sello, centrado dentro del filete interior.
const ALTO_MOLINO = 56;
const [, , anchoMolino, altoMolino] = MOLINO.viewBox.split(" ").map(Number);
const escala = ALTO_MOLINO / altoMolino;
const desplazamiento = `translate(${(100 - anchoMolino * escala) / 2} ${(100 - ALTO_MOLINO) / 2}) scale(${escala})`;

/**
 * Sello de la casa (DESIGN.md § Signature components): el molino del logo dentro de un
 * círculo con filete doble en acento. Una vez por página, como firma. Decorativo.
 * El molino usa currentColor; los filetes miden 1 px a cualquier tamaño.
 */
export function SelloCasa({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={`size-[4.5rem] md:size-24 ${className}`}
    >
      <g fill="none" className="stroke-acento" strokeWidth="1">
        <circle cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="50" r="45" vectorEffect="non-scaling-stroke" />
      </g>
      <path d={MOLINO.d} fill="currentColor" transform={desplazamiento} />
    </svg>
  );
}
