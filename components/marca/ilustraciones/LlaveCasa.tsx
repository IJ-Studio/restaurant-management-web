import { Lienzo, T } from "./Lienzo";

/** 401: la llave de la casa colgada de su clavo, con su etiqueta. */
export function LlaveCasa({ className }: { className?: string }) {
	return (
		<Lienzo nombre="llave-casa" className={className}>
			<path d="M68 12h24" className="opacity-50" {...T} />
			<g className="ilus-mece ilus-mece--llave">
				<circle cx="80" cy="18" r="4" {...T} />
				<path d="M84 19l12 6" {...T} />
				<path d="M96 22l16 7-4 9-16-7z" className="stroke-acento" {...T} />
				<circle cx="98.5" cy="27.5" r="1" className="stroke-acento" {...T} />
				<circle cx="80" cy="36" r="13" {...T} />
				<circle cx="80" cy="36" r="5" {...T} />
				<path d="M80 49v52M75 55h10M75 60h10M80 88h12v12h-5v-5h-3v5h-4" {...T} />
			</g>
		</Lienzo>
	);
}
