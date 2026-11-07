import { Lienzo, T } from "./Lienzo";

/** Error genérico: la copa volcada sobre el mantel y la última gota. */
export function CopaVolcada({ className }: { className?: string }) {
	return (
		<Lienzo nombre="copa-volcada" className={className}>
			<path d="M12 100h140" className="opacity-50" {...T} />
			<g transform="translate(-34 -40) scale(1.4)">
				<ellipse cx="44" cy="89" rx="2.5" ry="9" {...T} />
				<path d="M46.5 89H66M66 89c4-8 18-10 30-10M66 89c4 8 18 10 30 10" {...T} />
				<ellipse cx="96" cy="89" rx="3" ry="10" {...T} />
				<path d="M100 100c8-3 26-3 34 0" className="stroke-acento" {...T} />
				<path d="M101 90q2 3 0 4.5q-2-1.5 0-4.5z" className="ilus-cae fill-acento stroke-acento" {...T} />
			</g>
		</Lienzo>
	);
}
