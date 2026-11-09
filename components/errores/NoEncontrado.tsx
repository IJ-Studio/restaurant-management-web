import { ArrowLeft } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO, type TextoEstado } from "@/components/marca/textos-estado";

/**
 * «No encontrado» de un segmento (PLAN 2.17, con el diseño de D-21 en el 4.23): el plato con la
 * campana vacía, sin repetir la ruta pedida, y una salida propia del segmento.
 */
export function NoEncontrado({ salida, textos = TEXTOS_ESTADO.noEncontrado }: { salida: { href: string; texto: string }; textos?: TextoEstado }) {
	return (
		<div data-no-encontrado="">
			<PaginaEstado
				{...textos}
				pantallaCompleta={false}
				acciones={
					<BotonEnlace href={salida.href} variante="primario" icono={<ArrowLeft />}>
						{salida.texto}
					</BotonEnlace>
				}
			/>
		</div>
	);
}
