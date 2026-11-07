import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { MarcoSitio } from "@/components/marca/MarcoSitio";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";

// 404 de la raíz (PLAN 4.23, D-21): dentro del marco público y con el plato de la campana vacía.
export default function NoEncontradoRaiz() {
	return (
		<MarcoSitio>
			<PaginaEstado
				{...TEXTOS_ESTADO.noEncontrado}
				acciones={
					<>
						<BotonEnlace href="/" variante="primario" icono={<ArrowLeft />}>
							Volver al inicio
						</BotonEnlace>
						<BotonEnlace href="/menu" variante="secundario" icono={<UtensilsCrossed />}>
							Ver la carta
						</BotonEnlace>
					</>
				}
			/>
		</MarcoSitio>
	);
}
