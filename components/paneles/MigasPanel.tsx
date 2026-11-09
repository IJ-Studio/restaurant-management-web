import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Migas de una pantalla de panel que cuelga de otra (Finanzas › Facturas). Las públicas
 * (`MigasDePan`) empiezan siempre en «Inicio» de la web; aquí se nombra solo el camino dentro del
 * panel. Van en el `antetitulo` de `EncabezadoPagina`.
 */
export function MigasPanel({ migas, actual }: { migas: { nombre: string; href: string }[]; actual: string }) {
	return (
		<nav aria-label="Migas de pan">
			<ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
				{migas.map((m) => (
					<li key={m.href} className="flex items-center gap-2">
						<Link
							href={m.href}
							className="rounded-control text-texto-secundario underline decoration-borde-control underline-offset-4 al-pasar:text-texto-principal al-pasar:decoration-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
						>
							{m.nombre}
						</Link>
						<ChevronRight aria-hidden="true" className="size-4 stroke-[1.5] text-texto-tenue" />
					</li>
				))}
				<li aria-current="page" className="text-texto-principal">
					{actual}
				</li>
			</ol>
		</nav>
	);
}
