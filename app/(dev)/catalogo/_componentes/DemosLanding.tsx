"use client";

import { MenuLanding } from "@/components/landing/secciones/MenuLanding";
import { Nosotros } from "@/components/landing/secciones/Nosotros";
import { PromocionesLanding } from "@/components/landing/secciones/PromocionesLanding";
import type { Promotion } from "@/features/shared/data/promotions";
import type { PlatoDestacado } from "@/lib/publico/seleccion-platos";

/**
 * Secciones de la landing con datos de ejemplo (PLAN 4.4 en adelante). En las pruebas contra el
 * build no hay backend; aquí se ven con datos. Las fotos son de la nube de la casa (D-18); la
 * tercera no tiene foto y muestra el respaldo de `Imagen`.
 */
export const PLATOS_EJEMPLO: PlatoDestacado[] = [
	{ id: 1, nombre: "Parrillada de la casa", categoria: "Carnes", precio: 420, imagenUrl: "image_l57jar", descripcion: "Para compartir." },
	{ id: 2, nombre: "Enchiladas de la casa", categoria: "Platos fuertes", precio: 140, imagenUrl: "image_l57jar" },
	{ id: 3, nombre: "Plato sin foto", categoria: "Postres", precio: 110 },
];

export const PROMOCIONES_EJEMPLO: Promotion[] = [
	{ id: 1, title: "Menú de mediodía", description: "Entrante, principal y postre de la carta del día.", badge: "De la casa", color: "", originalPrice: 480, discountedPrice: 390, endDate: "2026-11-30", active: true, order: 1 },
	{ id: 2, title: "Comida en familia", description: "Platos para compartir al centro de la mesa.", color: "", active: true, order: 2, imageUrl: "image_l57jar" },
];

/** Contenido de la sección «Landing» del catálogo. */
export function DemosLanding() {
	return (
		<div className="flex flex-col gap-10">
			<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="demo-nosotros">
				<Nosotros galeria={PLATOS_EJEMPLO} />
			</div>
			<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="demo-menu">
				<MenuLanding platos={PLATOS_EJEMPLO} />
			</div>
			<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="demo-promociones">
				<PromocionesLanding promociones={PROMOCIONES_EJEMPLO} />
			</div>
			<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="demo-promociones-vacias">
				<PromocionesLanding promociones={[]} />
			</div>
			<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="demo-menu-vacio">
				<MenuLanding platos={[]} />
			</div>
		</div>
	);
}
