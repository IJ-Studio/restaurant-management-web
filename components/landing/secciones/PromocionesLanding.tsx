import type { ReactNode } from "react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Imagen } from "@/components/ui/Imagen";
import { Insignia } from "@/components/ui/Insignia";
import { Contraetiqueta, type ParContraetiqueta } from "@/components/marca/Contraetiqueta";
import type { Promotion } from "@/features/shared/data/promotions";
import { formatearDia } from "@/lib/formato/fecha";
import { formatearPrecio } from "@/lib/formato/precio";
import { SeccionLanding } from "./SeccionLanding";

const MAXIMO = 3;

/** Una promoción: foto si la tiene, la insignia del admin, título, texto y contraetiqueta. */
export function TarjetaPromocion({ promocion: p, nivelTitulo = 3 }: { promocion: Promotion; nivelTitulo?: 2 | 3 }) {
	const Titulo = `h${nivelTitulo}` as const;
	const antes = formatearPrecio(p.originalPrice);
	const ahora = formatearPrecio(p.discountedPrice);
	const hasta = formatearDia(p.endDate);
	const pares: ParContraetiqueta[] = [];
	if (antes && ahora && antes !== ahora) pares.push({ rotulo: "Antes", valor: <s className="text-texto-tenue">{antes}</s> });
	if (ahora) pares.push({ rotulo: "Precio", valor: ahora });
	if (hasta) pares.push({ rotulo: "Hasta el", valor: hasta, tipo: "texto" });
	return (
		<article
			className="flex h-full flex-col gap-(--espacio-md) overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)"
			aria-labelledby={`promo-${p.id}`}
		>
			{p.imageUrl && (
				<div className="relative -mx-(--espacio-lg) -mt-(--espacio-lg) aspect-[3/2] overflow-hidden">
					<Imagen src={p.imageUrl} decorativa fill sizes="(min-width: 48rem) 30vw, 100vw" className="object-cover" />
				</div>
			)}
			{p.badge && (
				<div>
					<Insignia tono="acento">{p.badge}</Insignia>
				</div>
			)}
			<Titulo id={`promo-${p.id}`} className="m-0 font-titulos text-(length:--texto-titulo-3) font-medium leading-[1.2] [text-wrap:balance]">
				{p.title}
			</Titulo>
			{p.description && <p className="m-0 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{p.description}</p>}
			{pares.length > 0 && <Contraetiqueta pares={pares} sinFileteFinal className="mt-auto" />}
		</article>
	);
}

/**
 * «Promociones» (`#promociones`, PLAN 4.6, D-19): las vigentes del API (activas y dentro de sus
 * fechas), como mucho tres, sin el emoji ni el degradado de color del diseño anterior. Enlace a
 * `/promociones` (D-08). Sin datos, el error cálido; sin vigentes, una frase honesta.
 */
export function PromocionesLanding({ promociones, error }: { promociones: Promotion[]; error?: ReactNode }) {
	const visibles = promociones.slice(0, MAXIMO);
	return (
		<SeccionLanding id="promociones" lote={3} rotulo="Promociones" titulo="Para esta temporada" entradilla="Las propuestas vigentes de la casa.">
			{error ??
				(visibles.length > 0 ? (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-xl) p-0 md:grid-cols-3" data-prueba="promociones-landing">
						{visibles.map((p) => (
							<li key={p.id}>
								<TarjetaPromocion promocion={p} />
							</li>
						))}
					</ul>
				) : (
					<p className="m-0 text-texto-secundario" data-prueba="promociones-vacias">
						Ahora mismo no hay promociones vigentes.
					</p>
				))}
			{!error && promociones.length > 0 && (
				<div>
					<BotonEnlace href="/promociones" variante="secundario">
						Ver todas las promociones
					</BotonEnlace>
				</div>
			)}
		</SeccionLanding>
	);
}
