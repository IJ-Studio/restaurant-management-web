import { LOGO } from "./trazados";

/**
 * Logo de El Quijote en SVG local (decisión D-07). Se pinta con currentColor: hereda el
 * color del texto del contenedor, así que cambia con el tema sin cargar otra imagen.
 * El tamaño lo da `className` (alto o ancho; el otro lado se ajusta a la proporción).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOGO.viewBox}
      fill="currentColor"
      role="img"
      aria-label="El Quijote, restaurante"
      focusable="false"
      className={className}
    >
      <path d={LOGO.d} />
    </svg>
  );
}
