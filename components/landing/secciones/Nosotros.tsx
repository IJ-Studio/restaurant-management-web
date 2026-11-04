import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Imagen } from "@/components/ui/Imagen";
import { MolinoAnimado } from "@/components/marca/MolinoAnimado";
import type { PlatoDestacado } from "@/lib/publico/seleccion-platos";
import { SeccionLanding } from "./SeccionLanding";

/**
 * «Nosotros» (`#nosotros`, PLAN 4.4, D-19): el contenido de `/about` reescrito con D-17, el molino
 * de la casa y una galería con fotos de platos que envía el API (D-18: la casa no tiene todavía
 * fotos propias de sala ni de fachada; la de Google de `/about` queda fuera). Sin fotos, no hay
 * galería: nunca un hueco vacío.
 */
export function Nosotros({ galeria }: { galeria: PlatoDestacado[] }) {
	return (
		<SeccionLanding
			id="nosotros"
			lote={1}
			rotulo="Nosotros"
			titulo="Una casa con nombre de caballero andante"
			entradilla="Comida mexicana en el centro de Huejutla de Reyes, servida sin prisa."
		>
			<div className="grid items-center gap-(--espacio-2xl) md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
				<div className="flex max-w-(--ancho-lectura) flex-col gap-(--espacio-md) text-texto-secundario [text-wrap:pretty]">
					<p className="m-0">
						En El Quijote cocinamos con calma y servimos con cuidado. La carta reúne cocina nacional e internacional, con la comida
						mexicana al centro de la mesa.
					</p>
					<p className="m-0">Queremos que cada visita sea una sobremesa que apetezca alargar.</p>
					<div className="pt-(--espacio-xs)">
						<BotonEnlace href="/about" variante="secundario">
							Conoce la casa
						</BotonEnlace>
					</div>
				</div>
				<MolinoAnimado className="mx-auto max-w-[18rem] text-acento md:max-w-[22rem]" />
			</div>
			{galeria.length > 0 && (
				<ul aria-label="De nuestra cocina" className="m-0 grid list-none grid-cols-1 gap-(--espacio-lg) p-0 sm:grid-cols-3" data-prueba="galeria-nosotros">
					{galeria.map((p) => (
						<li key={p.id}>
							<figure className="m-0 flex flex-col gap-(--espacio-xs)">
								<div className="relative aspect-[4/5] overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie">
									<Imagen src={p.imagenUrl} alt={p.nombre} fill sizes="(min-width: 40rem) 30vw, 100vw" className="object-cover" />
								</div>
								<figcaption className="text-(length:--texto-pequeno) text-texto-secundario">{p.nombre}</figcaption>
							</figure>
						</li>
					))}
				</ul>
			)}
		</SeccionLanding>
	);
}
