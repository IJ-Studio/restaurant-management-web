import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Imagen } from "@/components/ui/Imagen";
import { Contraetiqueta, type ParContraetiqueta } from "@/components/marca/Contraetiqueta";
import { formatearPrecio } from "@/lib/formato/precio";
import type { PlatoDestacado } from "@/lib/publico/seleccion-platos";
import { SeccionLanding } from "./SeccionLanding";
import type { ReactNode } from "react";

/**
 * «Menú» (`#menu`, PLAN 4.5, D-19): una selección de platos reales del API, cada uno con su foto
 * (o el respaldo) y su contraetiqueta, y un único botón «Ver la carta completa» hacia `/menu`.
 * Las tarjetas no enlazan a otra parte: la única salida de la sección es ese botón.
 * Sin datos, el error cálido que recibe en `error`; con la carta vacía, una frase honesta.
 */
export function MenuLanding({ platos, error }: { platos: PlatoDestacado[]; error?: ReactNode }) {
	return (
		<SeccionLanding id="menu" lote={2} rotulo="Menú" titulo="Platos de la casa" entradilla="Una selección de la carta. El resto te espera en la carta completa.">
			{error ??
				(platos.length > 0 ? (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-xl) p-0 sm:grid-cols-2 lg:grid-cols-4" data-prueba="platos-menu">
						{platos.map((p) => {
							const precio = formatearPrecio(p.precio);
							const pares: ParContraetiqueta[] = [{ rotulo: "Sección", valor: p.categoria, tipo: "texto" }];
							if (precio) pares.push({ rotulo: "Precio", valor: precio });
							return (
								<li key={p.id}>
									<article className="flex h-full flex-col gap-(--espacio-md)" aria-labelledby={`plato-${p.id}`}>
										<div className="relative aspect-[4/5] overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie">
											<Imagen src={p.imagenUrl} alt={p.nombre} fill sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 45vw, 100vw" className="object-cover" />
										</div>
										<h3 id={`plato-${p.id}`} className="m-0 font-titulos text-(length:--texto-titulo-3) font-medium leading-[1.2] [text-wrap:balance]">
											{p.nombre}
										</h3>
										{p.descripcion && (
											<p className="m-0 line-clamp-3 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{p.descripcion}</p>
										)}
										<Contraetiqueta pares={pares} sinFileteFinal className="mt-auto" />
									</article>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="m-0 text-texto-secundario" data-prueba="menu-sin-platos">
						Todavía no hay platos publicados en la carta.
					</p>
				))}
			<div>
				<BotonEnlace href="/menu" variante="secundario">
					Ver la carta completa
				</BotonEnlace>
			</div>
		</SeccionLanding>
	);
}
