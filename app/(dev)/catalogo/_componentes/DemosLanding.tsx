"use client";

import { Nosotros } from "@/components/landing/secciones/Nosotros";
import type { PlatoDestacado } from "@/lib/publico/seleccion-platos";

/**
 * Secciones de la landing con datos de ejemplo (PLAN 4.4 en adelante). En las pruebas contra el
 * build no hay backend; aquí se ven con datos. Las fotos son de la nube de la casa (D-18); la
 * tercera no tiene foto y muestra el respaldo de `Imagen`.
 */
export const PLATOS_EJEMPLO: PlatoDestacado[] = [
	{ id: 1, nombre: "Parrillada de la casa", categoria: "Carnes", precio: 420, imagenUrl: "food-3955317_1280_zstvf7.jpg", descripcion: "Para compartir." },
	{ id: 2, nombre: "Empanadas al horno", categoria: "Entrantes", precio: 140, imagenUrl: "meal-4840665_1280_azmrqq.jpg" },
	{ id: 3, nombre: "Plato sin foto", categoria: "Postres", precio: 110 },
];

/** Contenido de la sección «Landing» del catálogo. */
export function DemosLanding() {
	return (
		<div className="flex flex-col gap-10">
			<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="demo-nosotros">
				<Nosotros galeria={PLATOS_EJEMPLO} />
			</div>
		</div>
	);
}
