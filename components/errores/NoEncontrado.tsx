import { SearchX } from "lucide-react";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { BotonEnlace } from "@/components/ui/BotonEnlace";

/**
 * Contenido de `not-found.tsx` por segmento (PLAN 2.17): una frase genérica y una salida dentro
 * del mismo segmento. No repite la ruta pedida ni ningún detalle de la petición.
 */
export function NoEncontrado({ salida }: { salida: { href: string; texto: string } }) {
	return (
		<div data-no-encontrado className="mx-auto flex w-full max-w-xl flex-col px-4 py-16">
			<EstadoVacio
				icono={<SearchX />}
				nivelTitulo={2}
				titulo="No encontramos esta página"
				descripcion="Puede que el enlace esté mal escrito o que la página ya no exista."
				accion={
					<BotonEnlace href={salida.href} variante="secundario">
						{salida.texto}
					</BotonEnlace>
				}
			/>
		</div>
	);
}
