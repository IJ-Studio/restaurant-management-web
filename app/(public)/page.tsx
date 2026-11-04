import { Suspense } from "react";
import type { Metadata } from "next";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { MenuLanding } from "@/components/landing/secciones/MenuLanding";
import { Nosotros } from "@/components/landing/secciones/Nosotros";
import { Pedir } from "@/components/landing/secciones/Pedir";
import { PromocionesLanding } from "@/components/landing/secciones/PromocionesLanding";
import { Reservas } from "@/components/landing/secciones/Reservas";
import { Visitanos } from "@/components/landing/secciones/Visitanos";
import { Portada } from "@/components/landing/secciones/Portada";
import { ReintentarSeccion } from "@/components/landing/secciones/ReintentarSeccion";
import { obtenerCarta, obtenerPromociones, type CategoriaCarta, type Resultado } from "@/lib/publico/datos-landing";
import { seleccionarPlatos } from "@/lib/publico/seleccion-platos";
import type { Promotion } from "@/features/shared/data/promotions";
import { restaurantConfig } from "@/config/restaurant.config";

// Metadatos de la portada (D-17): la propuesta de PRODUCT.md, sin datos que no estén en la configuración.
export const metadata: Metadata = {
	title: { absolute: `${restaurantConfig.name} · Comida mexicana en Huejutla de Reyes` },
	description: "Comida mexicana en el centro de Huejutla de Reyes, Hidalgo. Consulta la carta, las promociones vigentes y reserva tu mesa.",
};

/**
 * Landing de una sola página (PLAN 4.2, D-19). Componente de servidor: pide la carta y las
 * promociones en paralelo y sin caché. La portada y las secciones sin datos salen al momento
 * (la foto de portada, su precarga y el LCP no esperan al API); cada sección con datos espera en
 * su propio `Suspense`, con esqueletos del mismo tamaño, y muestra su parte real o su error cálido.
 */
export default function Inicio() {
	// Las dos peticiones empiezan ya, en paralelo; cada sección espera solo a la suya.
	const carta = obtenerCarta();
	const promociones = obtenerPromociones();
	return (
		<>
			<Portada />
			<Suspense fallback={<Nosotros galeria={[]} />}>
				<NosotrosConDatos carta={carta} />
			</Suspense>
			<Suspense fallback={<MenuLanding platos={[]} cargando />}>
				<MenuConDatos carta={carta} />
			</Suspense>
			<Suspense fallback={<PromocionesLanding promociones={[]} cargando />}>
				<PromocionesConDatos promociones={promociones} />
			</Suspense>
			<Reservas />
			<Pedir />
			<Visitanos />
		</>
	);
}

const platosDe = (carta: Resultado<CategoriaCarta[]>) => seleccionarPlatos(carta.estado === "ok" ? carta.datos : []);

async function NosotrosConDatos({ carta }: { carta: Promise<Resultado<CategoriaCarta[]>> }) {
	return <Nosotros galeria={platosDe(await carta).galeria} />;
}

async function MenuConDatos({ carta }: { carta: Promise<Resultado<CategoriaCarta[]>> }) {
	const resultado = await carta;
	return (
		<MenuLanding
			platos={platosDe(resultado).menu}
			error={
				resultado.estado === "error" ? (
					<ReintentarSeccion
						titulo="No pudimos traer la carta"
						descripcion="A veces tarda un poco más de la cuenta. Vuelve a intentarlo o llámanos."
						accion={
							<BotonEnlace href={restaurantConfig.contact.phoneHref} variante="fantasma">
								Llamar al restaurante
							</BotonEnlace>
						}
					/>
				) : undefined
			}
		/>
	);
}

async function PromocionesConDatos({ promociones }: { promociones: Promise<Resultado<Promotion[]>> }) {
	const resultado = await promociones;
	return (
		<PromocionesLanding
			promociones={resultado.estado === "ok" ? resultado.datos : []}
			error={resultado.estado === "error" ? <ReintentarSeccion titulo="No pudimos traer las promociones" descripcion="Vuelve a intentarlo en un momento." /> : undefined}
		/>
	);
}
