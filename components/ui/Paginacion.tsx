import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Paginación (DESIGN.md § Otros componentes base). Son enlaces: la página va en la URL
 * (`?pagina=3`), se puede compartir y funciona sin JavaScript y con «atrás».
 *
 * - En móvil: «Anterior», «Página 3 de 12» y «Siguiente».
 * - Desde 640 px: además, los números, con la primera, la última y las vecinas de la actual.
 * - La actual lleva `aria-current="page"`, relleno café y filete de acento (cambia el relleno,
 *   no solo el tinte).
 */

export interface PaginacionProps {
	pagina: number;
	totalPaginas: number;
	/** Ruta de cada página. Por defecto, `?pagina=N` sobre `parametros`. */
	hrefDe?: (pagina: number) => string;
	/** Parámetros de la URL que se conservan (filtros, pestaña…). */
	parametros?: Record<string, string | undefined>;
	parametro?: string;
	etiqueta?: string;
	className?: string;
}

/** Los números visibles: primera, última, la actual y una a cada lado; `null` es un salto («…»). */
export function paginasVisibles(pagina: number, total: number): (number | null)[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const centro = new Set([1, total, pagina - 1, pagina, pagina + 1].filter((n) => n >= 1 && n <= total));
	// Cerca de un extremo se muestran cinco seguidas, para que la barra no cambie de ancho.
	if (pagina <= 4) [2, 3, 4, 5].forEach((n) => centro.add(n));
	if (pagina >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach((n) => centro.add(n));
	const orden = [...centro].sort((a, b) => a - b);
	const salida: (number | null)[] = [];
	orden.forEach((n, i) => {
		if (i > 0 && n - orden[i - 1] > 1) salida.push(null);
		salida.push(n);
	});
	return salida;
}

/** Une `parametros` con el de la página; la 1 no se escribe en la URL. */
export function hrefConParametro(parametros: Record<string, string | undefined>, clave: string, valor: number | string | null) {
	const busqueda = new URLSearchParams();
	for (const [k, v] of Object.entries(parametros)) if (v !== undefined && v !== "" && k !== clave) busqueda.set(k, v);
	if (valor !== null && String(valor) !== "1") busqueda.set(clave, String(valor));
	const texto = busqueda.toString();
	return texto ? `?${texto}` : "?";
}

const CLASE_ENLACE =
	"area-tactil-minima gap-1 rounded-control border border-transparent px-3 font-texto text-(length:--texto-pequeno) font-medium text-texto-principal no-underline " +
	"transition-[background-color,border-color] duration-(--duracion-breve) ease-estandar " +
	"al-pasar:border-borde-control al-pasar:bg-superficie-cafe " +
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco [&_svg]:size-4 [&_svg]:stroke-[1.5]";

export function Paginacion({
	pagina,
	totalPaginas,
	hrefDe,
	parametros = {},
	parametro = "pagina",
	etiqueta = "Paginación",
	className,
}: PaginacionProps) {
	if (totalPaginas <= 1) return null;
	const actual = Math.min(Math.max(1, Math.trunc(pagina) || 1), totalPaginas);
	const href = hrefDe ?? ((n: number) => hrefConParametro(parametros, parametro, n));

	const extremo = (direccion: "anterior" | "siguiente") => {
		const destino = direccion === "anterior" ? actual - 1 : actual + 1;
		const contenido =
			direccion === "anterior" ? (
				<>
					<ChevronLeft aria-hidden="true" />
					{/* En móvil, solo la flecha: el nombre accesible ya lo da aria-label. */}
					<span className="max-sm:hidden">Anterior</span>
				</>
			) : (
				<>
					<span className="max-sm:hidden">Siguiente</span>
					<ChevronRight aria-hidden="true" />
				</>
			);
		// En el extremo no hay a dónde ir: se quita del árbol de accesibilidad y conserva su hueco.
		if (destino < 1 || destino > totalPaginas)
			return (
				<span aria-hidden="true" className={cn(CLASE_ENLACE, "invisible")}>
					{contenido}
				</span>
			);
		return (
			<Link
				href={href(destino)}
				rel={direccion === "anterior" ? "prev" : "next"}
				aria-label={`${direccion === "anterior" ? "Página anterior" : "Página siguiente"}, ${destino}`}
				className={CLASE_ENLACE}
				data-prueba={`pagina-${direccion}`}
			>
				{contenido}
			</Link>
		);
	};

	return (
		<nav aria-label={etiqueta} className={cn("flex items-center justify-between gap-2 sm:justify-center", className)}>
			{extremo("anterior")}
			<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario whitespace-nowrap numeros-tabulares sm:hidden">
				Página {actual} de {totalPaginas}
			</p>
			<ol className="m-0 hidden list-none items-center gap-1 p-0 sm:flex">
				{paginasVisibles(actual, totalPaginas).map((n, i) =>
					n === null ? (
						<li key={`salto-${i}`} aria-hidden="true" className="px-1 text-texto-tenue">
							…
						</li>
					) : (
						<li key={n}>
							<Link
								href={href(n)}
								aria-current={n === actual ? "page" : undefined}
								aria-label={`Página ${n}`}
								className={cn(
									CLASE_ENLACE,
									"min-w-11 px-2 numeros-tabulares",
									n === actual && "border-b-acento bg-superficie-cafe font-semibold al-pasar:border-b-acento",
								)}
							>
								{n}
							</Link>
						</li>
					),
				)}
			</ol>
			{extremo("siguiente")}
		</nav>
	);
}
