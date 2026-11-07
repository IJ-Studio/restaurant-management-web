import { Lienzo, T } from "./Lienzo";

/** 403: la puerta de la casa bajo su arco de piedra, cerrada con candado. */
export function PuertaCandado({ className }: { className?: string }) {
	return (
		<Lienzo nombre="puerta-candado" className={className}>
			<path d="M28 108h104M36 104h88" className="opacity-50" {...T} />
			<path d="M40 104V50c0-24 18-40 40-40s40 16 40 40v54" {...T} />
			<path d="M50 104V52c0-18 13-30 30-30s30 12 30 30v52" {...T} />
			<path d="M65 26v78M80 22v82M95 26v78" className="opacity-30" {...T} />
			<path d="M50 50h60M50 90h60" {...T} />
			<path d="M56 50v.5M104 50v.5M56 90v.5M104 90v.5" strokeWidth="3" {...T} />
			<g className="ilus-mece ilus-mece--candado">
				<path d="M76 70v-5a4 4 0 0 1 8 0v5" className="stroke-acento" {...T} />
				<rect x="72" y="70" width="16" height="13" rx="2" className="stroke-acento" {...T} />
				<path d="M80 75v3" className="stroke-acento" {...T} />
			</g>
		</Lienzo>
	);
}
