import { Lienzo, T } from "./Lienzo";

/** 500 y error del servidor: la olla que se ha pasado de hervor. */
export function OllaHumeante({ className }: { className?: string }) {
	return (
		<Lienzo nombre="olla-humeante" className={className}>
			<path d="M28 104h104" className="opacity-50" {...T} />
			<path d="M42 58h76M46 58v34q0 8 8 8h52q8 0 8-8V58M46 66h-8v8h8M114 66h8v8h-8" {...T} />
			<path d="M54 100l-4 4M106 100l4 4" {...T} />
			<path d="M52 66v24" className="opacity-40" {...T} />
			<g className="ilus-respira stroke-acento">
				<path d="M66 50c-4-6 4-10 0-16s4-10 0-16" {...T} />
				<path d="M80 48c-4-6 4-10 0-16s4-10 0-16" {...T} />
				<path d="M94 50c-4-6 4-10 0-16s4-10 0-16" {...T} />
			</g>
		</Lienzo>
	);
}
