import { Lienzo, T } from "./Lienzo";

const ASPA = "M50 40V14M51.5 16l6.5 1-1 19H51.5zM51.5 23h6.2M51.5 30h5.8";

/** Sin conexión: el molino con las aspas quietas, y apenas un hilo de viento que se va. */
export function MolinoQuieto({ className }: { className?: string }) {
	return (
		<Lienzo nombre="molino-quieto" className={className}>
			<path d="M24 104h112" className="opacity-50" {...T} />
			<path d="M22 44c10-5 20 5 30 0M30 56c8-4 16 4 24 0" className="ilus-viento opacity-50" {...T} />
			<g transform="translate(25 16) scale(1.1)">
				<path d="M41 80l4-34q5-6 10 0l4 34zM47.5 80v-8q2.5-3 5 0v8" {...T} />
				<g transform="rotate(45 50 40)">
					{[0, 90, 180, 270].map((giro) => (
						<path key={giro} d={ASPA} transform={`rotate(${giro} 50 40)`} {...T} />
					))}
				</g>
				<circle cx="50" cy="40" r="3" className="fill-acento stroke-acento" {...T} />
			</g>
		</Lienzo>
	);
}
