import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SECCIONES_LANDING, rutaPublica, type Miga } from "@/config/navegacion-publica";
import { cn } from "@/lib/utils";

/**
 * Migas de pan (DESIGN.md § Navegación pública): `<nav aria-label="Migas de pan">` con `<ol>`;
 * la última es la página actual, sin enlace y con `aria-current="page"`. El separador es un
 * icono oculto a los lectores. Son de servidor.
 *
 * Con `ruta`, las migas salen de `config/navegacion-publica.ts`; `actual` sustituye el nombre de
 * la página (la categoría o el plato). Con `migas`, se pasan a mano.
 */
export interface MigasDePanProps {
	ruta?: string;
	/** Nombre de la página actual; por defecto, el título de la ruta. */
	actual?: string;
	/** Migas intermedias a mano (sin «Inicio» ni la actual). */
	migas?: Miga[];
	className?: string;
}

export function MigasDePan({ ruta, actual, migas, className }: MigasDePanProps) {
	const config = ruta ? rutaPublica(ruta) : null;
	const intermedias = migas ?? config?.padres ?? [];
	const nombreActual = actual ?? config?.titulo;
	if (!nombreActual) return null;
	const enlaces: Miga[] = [SECCIONES_LANDING.inicio, ...intermedias];

	return (
		<nav aria-label="Migas de pan" className={cn("text-(length:--texto-pequeno) leading-[1.5]", className)}>
			<ol className="m-0 flex list-none flex-wrap items-center gap-x-1 p-0">
				{enlaces.map((m) => (
					<li key={m.href} className="inline-flex items-center gap-1">
						<Link
							href={m.href}
							className="enlace-subrayado inline-flex min-h-11 items-center rounded-control text-texto-secundario al-pasar:text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
						>
							{m.nombre}
						</Link>
						<ChevronRight aria-hidden="true" className="size-4 shrink-0 stroke-[1.5] text-texto-tenue" />
					</li>
				))}
				<li className="inline-flex min-h-11 min-w-0 items-center">
					<span aria-current="page" className="font-medium text-texto-principal">
						{nombreActual}
					</span>
				</li>
			</ol>
		</nav>
	);
}
