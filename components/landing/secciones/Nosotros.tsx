import { Imagen } from "@/components/ui/Imagen";
import { MolinoAnimado } from "@/components/marca/MolinoAnimado";
import type { PlatoDestacado } from "@/lib/publico/seleccion-platos";
import { SeccionLanding } from "./SeccionLanding";
import { TextoSitio } from "./TextoSitio";

// Numeración decorativa de las láminas que sí se renderizan.
const ROMANOS = ["I", "II", "III", "IV", "V", "VI"];

/**
 * «Nosotros» (`#nosotros`, PLAN 4.4, D-19): el contenido de `/about` reescrito con D-17, el molino
 * de la casa y una galería con fotos de platos que envía el API (D-18: la casa no tiene todavía
 * fotos propias de sala ni de fachada; la de Google de `/about` queda fuera). Sin fotos, no hay
 * galería: nunca un hueco vacío.
 * Pulido: capitular sobre el relato editable, el molino como emblema en un marco de etiqueta y
 * cada foto como lámina numerada.
 */
export function Nosotros({ galeria }: { galeria: PlatoDestacado[] }) {
	return (
		<SeccionLanding
			id="nosotros"
			lote={1}
			edicion="Anverso"
			rotulo="Nosotros"
			titulo="Una casa con nombre de caballero andante"
			entradilla="Comida mexicana en el centro de Huejutla de Reyes, servida sin prisa."
		>
			<div className="grid items-center gap-(--espacio-2xl) md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
				<div className="flex max-w-(--ancho-lectura) flex-col gap-(--espacio-md) text-texto-secundario [text-wrap:pretty]">
					<p className="capitular-etiqueta m-0 text-(length:--texto-entradilla) leading-[1.6]">
						<TextoSitio
							campo="nosotros"
							porDefecto="En El Quijote cocinamos con calma y servimos con cuidado. La carta reúne cocina nacional e internacional, con la comida mexicana al centro de la mesa."
						/>
					</p>
					<p className="m-0">Queremos que cada visita sea una sobremesa que apetezca alargar.</p>
				</div>
				<div className="marco-etiqueta mx-auto w-full max-w-[22rem]">
					<div className="marco-etiqueta__interior esquinas-imprenta flex flex-col items-center gap-(--espacio-sm) p-(--espacio-xl)">
						<span aria-hidden="true" className="esquinas-imprenta__cruz" />
						<MolinoAnimado className="molino-animado--cartela w-full max-w-[16rem] text-acento" />
						<span aria-hidden="true" className="ornamento-axial numero-lote">
							El Quijote
						</span>
					</div>
				</div>
			</div>
			{galeria.length > 0 && (
				<ul aria-label="De nuestra cocina" className="m-0 grid list-none grid-cols-1 gap-(--espacio-lg) p-0 sm:grid-cols-3" data-prueba="galeria-nosotros">
					{galeria.map((p, i) => (
						<li key={p.id}>
							<figure className="zocalo-interactivo m-0 flex h-full flex-col gap-(--espacio-md) p-(--espacio-md)">
								<div className="lamina-fotografia aspect-[4/3]">
									<Imagen src={p.imagenUrl} alt={p.nombre} fill sizes="(min-width: 40rem) 30vw, 100vw" className="object-cover" />
								</div>
								{/* En tres columnas estrechas (de sm a lg), la cartela va sobre el nombre para no apelmazarlo. */}
								<figcaption className="mt-auto flex items-center justify-between gap-(--espacio-sm) border-t border-borde-sutil pt-(--espacio-sm) sm:max-lg:flex-col sm:max-lg:items-start">
									<span aria-hidden="true" className="cartela-metadato shrink-0">
										Lámina {ROMANOS[i] ?? i + 1}
									</span>
									<span className="numero-lote text-end text-texto-secundario [text-wrap:balance] sm:max-lg:text-start">{p.nombre}</span>
								</figcaption>
							</figure>
						</li>
					))}
				</ul>
			)}
		</SeccionLanding>
	);
}
