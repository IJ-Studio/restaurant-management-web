import { Facebook, Instagram, MapPin } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { restaurantConfig } from "@/config/restaurant.config";
import { TelefonoSitio, WhatsAppSitio } from "./ContactoSitio";
import { SeccionLanding } from "./SeccionLanding";

/**
 * «Visítanos» (`#visitanos`, PLAN 4.9, D-19): dirección, horario y teléfono de la configuración en
 * contraetiqueta, el mapa **enlazado** (sin iframe: no carga terceros ni rastreo hasta que la
 * persona lo pide) y las redes con nombre accesible. Los enlaces externos abren en otra pestaña
 * y lo dicen.
 */
export function Visitanos() {
	const { name, contact, hours } = restaurantConfig;
	const redes = [
		{ nombre: "Facebook", href: contact.facebook, icono: <Facebook aria-hidden="true" /> },
		{ nombre: "Instagram", href: contact.instagram, icono: <Instagram aria-hidden="true" /> },
	];
	return (
		<SeccionLanding id="visitanos" lote={6} rotulo="Visítanos" fondo="cafe" titulo="Te esperamos en el centro" entradilla="En la plazuela Hidalgo, en el corazón de Huejutla de Reyes.">
			<div className="grid gap-(--espacio-2xl) md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
				<div className="flex flex-col gap-(--espacio-lg)">
					<Contraetiqueta
						pares={[
							{ rotulo: "Dirección", valor: contact.address, tipo: "texto" },
							{ rotulo: "Horario", valor: hours.display, tipo: "texto" },
							{
								rotulo: "Teléfono",
								// P1.5: el teléfono y el WhatsApp que guarda el administrador; si no, los de la configuración.
								valor: <TelefonoSitio porDefecto={contact.phone} />,
							},
							{ rotulo: "WhatsApp", valor: <WhatsAppSitio porDefecto={contact.whatsapp} mensaje={`Hola, quiero información de ${name}.`} /> },
						]}
					/>
					<div className="[&>*]:max-w-full [&>*]:whitespace-normal">
						<BotonEnlace href={contact.googleMaps} variante="secundario" icono={<MapPin />} target="_blank" rel="noopener noreferrer">
							Cómo llegar
							<span className="solo-lectores"> (abre el mapa en otra pestaña)</span>
						</BotonEnlace>
					</div>
				</div>
				<div className="flex flex-col gap-(--espacio-md)">
					<h3 className="m-0 font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] text-texto-secundario">
						Síguenos
					</h3>
					<ul className="m-0 flex list-none flex-col p-0">
						{redes.map((r) => (
							<li key={r.nombre} className="border-b border-borde-sutil">
								<a
									href={r.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex min-h-12 items-center gap-3 text-texto-principal no-underline al-pasar:text-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
								>
									{r.icono}
									<span>{r.nombre}</span>
									<span className="solo-lectores">{` de ${name} (abre en otra pestaña)`}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</SeccionLanding>
	);
}
