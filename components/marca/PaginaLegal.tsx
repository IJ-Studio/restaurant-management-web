import type { ReactNode } from "react";
import { EncabezadoPublico } from "./EncabezadoPublico";

/**
 * Páginas legales y de ayuda (PLAN 4.22): de servidor, con migas y «Volver», el título en
 * Fraunces y cada apartado como una sección con su `h2`. La redacción legal no cambia (D-17:
 * solo el estilo). El ancho de lectura y el ritmo los pone el layout del grupo `(legales)`.
 */
export function PaginaLegal({ ruta, titulo, entradilla, children }: { ruta: string; titulo: string; entradilla?: string; children: ReactNode }) {
	return (
		<>
			<EncabezadoPublico ruta={ruta} titulo={titulo} entradilla={entradilla} />
			<div className="flex flex-col">{children}</div>
		</>
	);
}

/** `id` crea un ancla estable (p. ej. `/privacidad#eliminacion`, que se captura en Google Play). */
export function SeccionLegal({ titulo, id, children }: { titulo: string; id?: string; children: ReactNode }) {
	return (
		<section id={id} className="flex scroll-mt-24 flex-col gap-(--espacio-sm) border-t border-borde-sutil py-(--espacio-xl)">
			<h2 className="m-0 font-titulos text-(length:--texto-titulo-3) font-medium leading-[1.2] [text-wrap:balance]">{titulo}</h2>
			<div className="flex max-w-(--ancho-lectura) flex-col gap-(--espacio-sm) leading-[1.65] text-texto-secundario [text-wrap:pretty] [&_a]:text-texto-principal [&_a]:underline [&_a]:decoration-acento [&_a]:decoration-1 [&_a]:underline-offset-4 [&_li]:ms-5 [&_strong]:text-texto-principal [&_ul]:m-0 [&_ul]:list-disc [&_ul]:p-0 [&_p]:m-0">
				{children}
			</div>
		</section>
	);
}
