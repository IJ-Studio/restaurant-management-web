import { Bike, Phone, UtensilsCrossed } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { restaurantConfig } from "@/config/restaurant.config";
import { SeccionLanding } from "./SeccionLanding";

/**
 * «Pedir» (`#pedir`, PLAN 4.8, D-19): los dos modos que ya existen, con enlaces a sus páginas
 * (la carta para pedir en mesa y `/menu/pedido?tab=domicilio`), el horario y el teléfono de la
 * configuración. Sin prometer tiempos, zonas de reparto ni costes que no estén en ningún dato.
 */
const MODOS = [
	{
		id: "mesa",
		icono: <UtensilsCrossed />,
		titulo: "En tu mesa",
		texto: "Elige desde la carta con el número de tu mesa: el pedido queda ligado a ella y lo sigues desde tu móvil.",
		accion: { href: "/menu", texto: "Pedir desde la carta" },
	},
	{
		id: "domicilio",
		icono: <Bike />,
		titulo: "A domicilio",
		texto: "Arma tu pedido desde la carta, págalo en línea y consulta su estado cuando quieras.",
		accion: { href: "/menu/pedido?tab=domicilio", texto: "Ver mis pedidos a domicilio" },
	},
] as const;

export function Pedir() {
	const { hours, contact } = restaurantConfig;
	return (
		<SeccionLanding id="pedir" lote={5} rotulo="Pedir" titulo="Pide en tu mesa o en tu casa" entradilla="La misma carta, en la sala o en tu puerta.">
			<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-xl) p-0 md:grid-cols-2" data-prueba="modos-pedido">
				{MODOS.map((m) => (
					<li key={m.id}>
						<article
							aria-labelledby={`pedir-${m.id}`}
							className="flex h-full flex-col gap-(--espacio-md) border-t border-borde-control pt-(--espacio-lg)"
						>
							<span aria-hidden="true" className="text-acento [&_svg]:size-6 [&_svg]:stroke-[1.5]">
								{m.icono}
							</span>
							<h3 id={`pedir-${m.id}`} className="m-0 font-titulos text-(length:--texto-titulo-3) font-medium leading-[1.2]">
								{m.titulo}
							</h3>
							<p className="m-0 max-w-[48ch] text-texto-secundario [text-wrap:pretty]">{m.texto}</p>
							<div className="mt-auto max-w-full pt-(--espacio-xs) [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:text-center">
								<BotonEnlace href={m.accion.href} variante="secundario">
									{m.accion.texto}
								</BotonEnlace>
							</div>
						</article>
					</li>
				))}
			</ul>
			<Contraetiqueta
				columnas={2}
				pares={[
					{ rotulo: "Horario", valor: hours.display, tipo: "texto" },
					{
						rotulo: "Por teléfono",
						valor: (
							<a href={contact.phoneHref} className="enlace-subrayado inline-flex items-center gap-2 [&_svg]:size-4 [&_svg]:stroke-[1.5]">
								<Phone aria-hidden="true" />
								{contact.phone}
							</a>
						),
					},
				]}
			/>
		</SeccionLanding>
	);
}
