import { cn } from "@/lib/utils";

/**
 * Cargador de marca (DESIGN.md § Motion y PLAN 4.0.1, D-20): un molino de trazo fino sobre un
 * plato visto desde arriba, con las aspas girando despacio. Sustituye a «Cargando…», «Redirigiendo…»
 * y a cualquier texto de proceso en pantalla.
 *
 * - `role="status"` con el texto solo para lectores; el dibujo va oculto (`aria-hidden`).
 * - Las aspas se detienen con `prefers-reduced-motion` y con «Movimiento: reducido» del panel
 *   (`.cargador-marca` en styles/componentes.css). Es el único bucle permitido: solo existe
 *   mientras algo carga.
 * - Colores solo de tokens: el plato en acento (trazo, no relleno: no gasta el «solo oro») y el
 *   molino en `currentColor` (texto principal). Trazos de 1,5 px a cualquier tamaño.
 * - `pagina` lo centra en un hueco de pantalla para `loading.tsx` y las redirecciones.
 */
export interface CargadorMarcaProps {
	/** Lo que oye un lector de pantalla. Cálido y sin jerga: «Preparando la carta…». */
	texto?: string;
	tamano?: "compacto" | "normal" | "amplio";
	/** Ocupa el alto de la pantalla menos la cabecera y se centra. */
	pagina?: boolean;
	className?: string;
}

const TAMANOS = {
	compacto: "size-10",
	normal: "size-16",
	amplio: "size-24 md:size-28",
} as const;

// Un aspa: el brazo desde el eje y la vela con dos listones. Las otras tres son esta misma girada.
function Aspa({ giro }: { giro: number }) {
	return (
		<g transform={`rotate(${giro} 50 40)`}>
			<path d="M50 40V14M51.5 16l6.5 1-1 19H51.5zM51.5 23h6.2M51.5 30h5.8" vectorEffect="non-scaling-stroke" />
		</g>
	);
}

export function CargadorMarca({ texto = "Un momento, por favor…", tamano = "normal", pagina = false, className }: CargadorMarcaProps) {
	return (
		<div
			role="status"
			className={cn(
				"flex items-center justify-center text-texto-principal",
				pagina && "min-h-[calc(100dvh-var(--alto-cabecera))] w-full p-(--margen-pagina)",
				className,
			)}
			data-cargador-marca=""
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 100 100"
				aria-hidden="true"
				focusable="false"
				className={cn("cargador-marca shrink-0", TAMANOS[tamano])}
			>
				<g fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
					{/* El plato: ala y fondo. */}
					<circle cx="50" cy="50" r="47" className="stroke-acento" vectorEffect="non-scaling-stroke" />
					<circle cx="50" cy="50" r="39" className="stroke-acento opacity-60" vectorEffect="non-scaling-stroke" />
					{/* La torre, el suelo y la puerta. */}
					<g stroke="currentColor">
						<path d="M41 77l4-31q5-6 10 0l4 31zM34 77h32M47.5 77v-8q2.5-3 5 0v8" vectorEffect="non-scaling-stroke" />
						<g className="cargador-marca__aspas">
							{[0, 90, 180, 270].map((giro) => (
								<Aspa key={giro} giro={giro} />
							))}
							<circle cx="50" cy="40" r="3" fill="currentColor" />
						</g>
					</g>
				</g>
			</svg>
			<span className="sr-only">{texto}</span>
		</div>
	);
}
