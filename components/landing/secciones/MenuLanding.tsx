import { ArrowRight } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Imagen } from "@/components/ui/Imagen";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { formatearPrecio } from "@/lib/formato/precio";
import type { PlatoDestacado } from "@/lib/publico/seleccion-platos";
import { SeccionLanding } from "./SeccionLanding";
import type { ReactNode } from "react";
import { EsqueletoTarjetas } from "./EsqueletoTarjetas";

/**
 * «Menú» (`#menu`, PLAN 4.5, D-19): una selección de platos reales del API, cada uno con su foto
 * (o el respaldo) y su contraetiqueta, y un único botón «Ver la carta completa» hacia `/menu`.
 * Las tarjetas no enlazan a otra parte: la única salida de la sección es ese botón.
 * Sin datos, el error cálido que recibe en `error`; con la carta vacía, una frase honesta.
 * Pulido: cada plato es una contraetiqueta de reserva («Partida 01…», numeración de los que se
 * muestran), con la sección real en la cabecera y el precio en la cartela.
 */
export function MenuLanding({ platos, error, cargando = false }: { platos: PlatoDestacado[]; error?: ReactNode; cargando?: boolean }) {
	return (
		<SeccionLanding
			id="menu"
			lote={2}
			edicion="Selección"
			rotulo="Menú"
			fondo="cafe"
			titulo="Platos de la casa"
			entradilla="Una selección de la carta. El resto te espera en la carta completa."
		>
			{cargando ? (
				<EsqueletoTarjetas columnas="sm:grid-cols-2 lg:grid-cols-4" />
			) : (
				error ??
				(platos.length > 0 ? (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-lg) p-0 sm:grid-cols-2 lg:grid-cols-4" data-prueba="platos-menu">
						{platos.map((p, i) => {
							const precio = formatearPrecio(p.precio);
							return (
								<li key={p.id}>
									<article className="zocalo-interactivo flex h-full flex-col gap-(--espacio-md) p-(--espacio-md)" aria-labelledby={`plato-${p.id}`}>
										<div className="flex items-baseline justify-between gap-(--espacio-sm) border-b border-borde-sutil pb-(--espacio-xs)">
											<span aria-hidden="true" className="numero-lote shrink-0">
												Partida {String(i + 1).padStart(2, "0")}
											</span>
											<span className="texto-rotulo truncate text-texto-tenue">
												<span className="solo-lectores">Sección: </span>
												{p.categoria}
											</span>
										</div>
										<div className="lamina-fotografia aspect-[4/3]">
											<Imagen src={p.imagenUrl} alt={p.nombre} fill sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 45vw, 100vw" className="object-cover" />
										</div>
										<h3 id={`plato-${p.id}`} className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.2] [text-wrap:balance]">
											{p.nombre}
										</h3>
										{p.descripcion && (
											<p className="m-0 line-clamp-3 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{p.descripcion}</p>
										)}
										{precio && (
											<div className="mt-auto rounded-control border border-borde-acento bg-superficie-cartela px-(--espacio-sm)">
												<Contraetiqueta
													sinFileteFinal
													className="[&>dd]:font-titulos [&>dd]:text-(length:--texto-titulo-interfaz) [&>dd]:text-acento [&>dd]:py-(--espacio-xs) [&>dt]:py-(--espacio-xs)"
													pares={[{ rotulo: "Precio", valor: precio }]}
												/>
											</div>
										)}
									</article>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="m-0 text-texto-secundario" data-prueba="menu-sin-platos">
						Todavía no hay platos publicados en la carta.
					</p>
				))
			)}
			<div>
				<BotonEnlace href="/menu" variante="secundario" icono={<ArrowRight />} posicionIcono="fin">
					Ver la carta completa
				</BotonEnlace>
			</div>
		</SeccionLanding>
	);
}
