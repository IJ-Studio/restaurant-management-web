"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { NavItem, SidebarSection } from "@/config/navigation/tipos";
import { cn } from "@/lib/utils";

/**
 * Navegación de los paneles (DESIGN.md § Navigation y § Paneles; PLAN-AMPLIACION D-29). Las
 * entradas llegan por rol desde `config/navigation/*` (ver `navegacionDeRol`).
 *
 * - Nada se pliega ni se esconde: las entradas con hijos son un rótulo y sus hijos se ven siempre.
 * - `lateral` (desde 1024 px): lista vertical con rótulo de grupo; la activa lleva relleno
 *   `--color-superficie-cafe` y el filete de acento al inicio (cambia el relleno, no solo el tinte).
 * - `compacta` (por debajo de 1024 px): todas las entradas a la vista, en una rejilla de enlaces de
 *   44 px de alto que se reparte el ancho; sin cajón ni botón de menú.
 * - `<Link>` con `aria-current="page"` en la activa: la de ruta más concreta que coincide con la
 *   actual (y con su consulta, si la lleva).
 */
export interface NavegacionPanelProps {
	secciones: SidebarSection[];
	etiqueta?: string;
	variante?: "lateral" | "compacta";
	/** Ruta con consulta que se toma como actual (catálogo y pruebas); por defecto, la del navegador. */
	rutaActual?: string;
	className?: string;
}

/** La entrada activa: la de ruta más larga que contiene la actual y cuya consulta coincide. */
export function claveActiva(secciones: SidebarSection[], ruta: string, busqueda: URLSearchParams): string | null {
	let mejor: { clave: string; puntos: number } | null = null;
	const visitar = (item: NavItem) => {
		item.children?.forEach(visitar);
		if (!item.href) return;
		const [camino, consulta = ""] = item.href.split("?");
		if (ruta !== camino && !ruta.startsWith(`${camino}/`)) return;
		const pedidos = new URLSearchParams(consulta);
		for (const [k, v] of pedidos) if (busqueda.get(k) !== v) return;
		// Sin consulta propia, no gana a una hermana cuya consulta sí coincide.
		const puntos = camino.length * 10 + [...pedidos].length;
		if (!mejor || puntos > mejor.puntos) mejor = { clave: item.key, puntos };
	};
	secciones.forEach((s) => s.items.forEach(visitar));
	return (mejor as { clave: string } | null)?.clave ?? null;
}

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco";
const ICONO = "[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]";
const ROTULO = "m-0 font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] text-texto-tenue";

const ENLACE_LATERAL =
	"flex min-h-11 w-full items-center gap-3 rounded-control border-s-2 border-transparent px-3 font-texto text-(length:--texto-pequeno) font-medium no-underline " +
	`text-texto-secundario transition-colors duration-(--duracion-breve) ease-estandar al-pasar:bg-superficie-cafe al-pasar:text-texto-principal ${FOCO} ${ICONO}`;
const ENLACE_COMPACTO =
	"flex min-h-11 min-w-0 items-center gap-2 rounded-control border border-borde-sutil bg-superficie px-3 font-texto text-(length:--texto-pequeno) font-medium no-underline " +
	`text-texto-secundario transition-colors duration-(--duracion-breve) ease-estandar al-pasar:bg-superficie-cafe al-pasar:text-texto-principal ${FOCO} ${ICONO}`;
const ACTIVA = "border-acento bg-superficie-cafe text-texto-principal";

function Enlace({ item, activa, compacta }: { item: NavItem; activa: string | null; compacta: boolean }) {
	const actual = item.key === activa;
	return (
		<li className="min-w-0">
			<Link href={item.href ?? "#"} aria-current={actual ? "page" : undefined} className={cn(compacta ? ENLACE_COMPACTO : ENLACE_LATERAL, actual && ACTIVA)}>
				{item.icon}
				<span className="min-w-0 truncate">{item.label}</span>
			</Link>
		</li>
	);
}

/** Barra lateral: grupos con su rótulo; las entradas con hijos, rótulo con icono y los hijos debajo. */
function Lateral({ secciones, activa }: { secciones: SidebarSection[]; activa: string | null }) {
	return (
		<div className="flex flex-col gap-6">
			{secciones.map((s) => (
				<div key={s.label} className="flex flex-col gap-1">
					{/* Rótulo, no encabezado: la barra lateral va antes del h1 de la página. */}
					<p className={cn(ROTULO, "px-3 pb-1")}>{s.label}</p>
					<ul aria-label={s.label} className="m-0 flex list-none flex-col gap-0.5 p-0">
						{s.items.map((item) =>
							item.children?.length ? (
								<li key={item.key} className="flex flex-col gap-0.5">
									<p className={cn("m-0 flex min-h-11 items-center gap-3 px-3 font-texto text-(length:--texto-pequeno) font-medium text-texto-principal", ICONO)}>
										{item.icon}
										{item.label}
									</p>
									<ul aria-label={item.label} className="m-0 flex list-none flex-col gap-0.5 p-0 ps-8">
										{item.children.map((h) => (
											<Enlace key={h.key} item={{ ...h, icon: null }} activa={activa} compacta={false} />
										))}
									</ul>
								</li>
							) : (
								<Enlace key={item.key} item={item} activa={activa} compacta={false} />
							),
						)}
					</ul>
				</div>
			))}
		</div>
	);
}

/** Móvil y tableta: cada grupo, su rótulo y todos sus enlaces en una rejilla (los hijos, con el nombre del grupo). */
function Compacta({ secciones, activa }: { secciones: SidebarSection[]; activa: string | null }) {
	return (
		<div className="flex flex-col gap-(--espacio-sm)">
			{secciones.map((s) => {
				const hojas = s.items.flatMap((item) =>
					item.children?.length ? item.children.map((h) => ({ ...h, label: `${item.label}: ${h.label.toLowerCase()}` })) : [item],
				);
				return (
					<div key={s.label} className="flex flex-col gap-2">
						<p className={ROTULO}>{s.label}</p>
						<ul aria-label={s.label} className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 md:grid-cols-4">
							{hojas.map((item) => (
								<Enlace key={item.key} item={item} activa={activa} compacta />
							))}
						</ul>
					</div>
				);
			})}
		</div>
	);
}

function Lista({ secciones, activa, variante }: { secciones: SidebarSection[]; activa: string | null; variante: "lateral" | "compacta" }) {
	return variante === "compacta" ? <Compacta secciones={secciones} activa={activa} /> : <Lateral secciones={secciones} activa={activa} />;
}

type PropsLista = { secciones: SidebarSection[]; variante: "lateral" | "compacta" };

/** Con la consulta del navegador: `useSearchParams` necesita un `Suspense` por encima. */
function ConConsulta(props: PropsLista) {
	const ruta = usePathname();
	const busqueda = useSearchParams();
	return <Lista {...props} activa={claveActiva(props.secciones, ruta, new URLSearchParams(busqueda.toString()))} />;
}

/** Mientras llega la consulta: la activa solo por ruta. */
function SoloRuta(props: PropsLista) {
	const ruta = usePathname();
	return <Lista {...props} activa={claveActiva(props.secciones, ruta, new URLSearchParams())} />;
}

export function NavegacionPanel({ secciones, etiqueta = "Navegación del panel", variante = "lateral", rutaActual, className }: NavegacionPanelProps) {
	let contenido;
	if (rutaActual !== undefined) {
		const [ruta, consulta = ""] = rutaActual.split("?");
		contenido = <Lista secciones={secciones} variante={variante} activa={claveActiva(secciones, ruta, new URLSearchParams(consulta))} />;
	} else {
		contenido = (
			<Suspense fallback={<SoloRuta secciones={secciones} variante={variante} />}>
				<ConConsulta secciones={secciones} variante={variante} />
			</Suspense>
		);
	}
	return (
		<nav aria-label={etiqueta} className={className}>
			{contenido}
		</nav>
	);
}
