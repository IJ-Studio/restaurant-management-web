import { Lienzo, T } from "./Lienzo";

/** 404 y plato o categoría no encontrados: la campana levantada sobre un plato vacío. */
export function PlatoCloche({ className }: { className?: string }) {
	return (
		<Lienzo nombre="plato-cloche" className={className}>
			<path d="M16 102h128" className="opacity-50" {...T} />
			<ellipse cx="80" cy="95" rx="46" ry="7" {...T} />
			<ellipse cx="80" cy="94" rx="30" ry="4" className="opacity-50" {...T} />
			<g className="ilus-flota">
				<g transform="rotate(-14 112 62) translate(8 -16)">
					<path d="M40 62h80M44 62c0-22 16-34 36-34s36 12 36 34M76 28v-4h8v4" {...T} />
					<circle cx="80" cy="20" r="3" {...T} />
					<path d="M54 54c2-9 7-15 15-18" className="stroke-acento" {...T} />
				</g>
			</g>
		</Lienzo>
	);
}
