import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { MenuLanding } from "@/components/landing/secciones/MenuLanding";
import { Nosotros } from "@/components/landing/secciones/Nosotros";
import { Pedir } from "@/components/landing/secciones/Pedir";
import { PromocionesLanding } from "@/components/landing/secciones/PromocionesLanding";
import { Reservas } from "@/components/landing/secciones/Reservas";
import { Portada } from "@/components/landing/secciones/Portada";
import { SeccionLanding } from "@/components/landing/secciones/SeccionLanding";
import { ReintentarSeccion } from "@/components/landing/secciones/ReintentarSeccion";
import { obtenerCarta, obtenerPromociones } from "@/lib/publico/datos-landing";
import { seleccionarPlatos } from "@/lib/publico/seleccion-platos";
import { restaurantConfig } from "@/config/restaurant.config";

// Metadatos de la portada (D-17): la propuesta de PRODUCT.md, sin datos que no estén en la configuración.
export const metadata: Metadata = {
	title: { absolute: `${restaurantConfig.name} · Cocina española de alta gama` },
	description: "Cocina española de alta gama y carta de vinos en el centro de Huejutla de Reyes. Consulta la carta, las promociones vigentes y reserva tu mesa.",
};

/**
 * Landing de una sola página (PLAN 4.2, D-19). Componente de servidor: pide la carta y las
 * promociones en paralelo y sin caché, y cada sección muestra su parte real o su error cálido.
 * Las anclas son las de `SECCIONES_LANDING`; la sección activa la marca la cabecera.
 */
export default async function Inicio() {
	const [carta, promociones] = await Promise.all([obtenerCarta(), obtenerPromociones()]);
	const { contact } = restaurantConfig;
	const seleccion = seleccionarPlatos(carta.estado === "ok" ? carta.datos : []);
	const llamar = (
		<BotonEnlace href={contact.phoneHref} variante="fantasma">
			Llamar al restaurante
		</BotonEnlace>
	);

	return (
		<>
			<Portada />

			<Nosotros galeria={seleccion.galeria} />

			<MenuLanding
				platos={seleccion.menu}
				error={
					carta.estado === "error" ? (
						<ReintentarSeccion titulo="No pudimos traer la carta" descripcion="A veces tarda un poco más de la cuenta. Vuelve a intentarlo o llámanos." accion={llamar} />
					) : undefined
				}
			/>

			<PromocionesLanding
				promociones={promociones.estado === "ok" ? promociones.datos : []}
				error={promociones.estado === "error" ? <ReintentarSeccion titulo="No pudimos traer las promociones" descripcion="Vuelve a intentarlo en un momento." /> : undefined}
			/>

			<Reservas />

			<Pedir />

			<SeccionLanding id="visitanos" lote={6} rotulo="Visítanos" fondo="cafe" titulo="Te esperamos" entradilla={contact.address}>
				<div>
					<BotonEnlace href={contact.googleMaps} variante="secundario" icono={<MapPin />} target="_blank" rel="noopener noreferrer">
						Cómo llegar
					</BotonEnlace>
				</div>
			</SeccionLanding>
		</>
	);
}
