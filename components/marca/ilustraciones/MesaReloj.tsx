import { Lienzo, T } from "./Lienzo";

/** Mantenimiento: la mesa a medio preparar y el reloj de arena corriendo. */
export function MesaReloj({ className }: { className?: string }) {
	return (
		<Lienzo nombre="mesa-reloj" className={className}>
			<path d="M24 76h112M34 76v28M126 76v28M24 76v8M136 76v8" {...T} />
			<ellipse cx="58" cy="73" rx="16" ry="3" {...T} />
			<path d="M36 64v10M38 64v4h-4M80 64v10" className="opacity-60" {...T} />
			<path d="M84 52q0 11 5 11t5-11zM89 63v10M85 74h8" {...T} />
			<path d="M100 40h20M100 74h20M103 40c0 12 7 14 7 17s-7 5-7 17M117 40c0 12-7 14-7 17s7 5 7 17" {...T} />
			<path d="M105.5 47h9L110 54z" className="fill-acento stroke-acento" {...T} />
			<path d="M104 74q6-7 12 0z" className="fill-acento stroke-acento" {...T} />
			<path d="M110 57v14" className="ilus-arena stroke-acento" strokeDasharray="2 3" {...T} />
		</Lienzo>
	);
}
