"use client";

import { Suspense, useId, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { NavItem, SidebarSection } from "@/config/navigation/tipos";
import { cn } from "@/lib/utils";

/**
 * Navegación de los paneles (DESIGN.md § Navigation y § Paneles, PLAN 3.13). Las entradas llegan
 * por rol desde `config/navigation/*` (ver `navegacionDeRol`).
 *
 * - `<nav>` con nombre; grupos con rótulo en `--texto-etiqueta`; `<Link>` con `aria-current="page"`
 *   en la entrada activa, que lleva relleno `--color-superficie-cafe` y un filete de acento al
 *   inicio: cambia el relleno, no solo el tinte.
 * - Las entradas con hijos se despliegan con un botón (`aria-expanded`); la que contiene la
 *   activa empieza abierta.
 * - La activa es la de ruta más concreta que coincide con la actual; si su `href` lleva consulta
 *   (`?filter=pending`), también tiene que coincidir esa consulta.
 */
export interface NavegacionPanelProps {
	secciones: SidebarSection[];
	etiqueta?: string;
	/** Ruta con consulta que se toma como actual (catálogo y pruebas); por defecto, la del navegador. */
	rutaActual?: string;
	/** Al pulsar un enlace (el panel lateral móvil se cierra). */
	alNavegar?: () => void;
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

const contiene = (item: NavItem, clave: string | null): boolean =>
	item.key === clave || (item.children ?? []).some((h) => contiene(h, clave));

const CLASE_ENTRADA =
	"flex min-h-11 w-full items-center gap-3 rounded-control border-s-2 border-transparent px-3 text-start font-texto text-(length:--texto-pequeno) font-medium no-underline " +
	"text-texto-secundario transition-colors duration-(--duracion-breve) ease-estandar al-pasar:bg-superficie-cafe al-pasar:text-texto-principal " +
	"focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]";
const CLASE_ACTIVA = "border-acento bg-superficie-cafe text-texto-principal";

function Entrada({ item, activa, alNavegar, nivel }: { item: NavItem; activa: string | null; alNavegar?: () => void; nivel: number }) {
	const id = useId();
	const [abierta, setAbierta] = useState(() => contiene(item, activa));
	if (item.children?.length) {
		return (
			<li>
				<button
					type="button"
					aria-expanded={abierta}
					aria-controls={`${id}-hijos`}
					onClick={() => setAbierta((a) => !a)}
					className={cn(CLASE_ENTRADA, contiene(item, activa) && "text-texto-principal")}
				>
					<span aria-hidden="true">{item.icon}</span>
					<span className="flex-1">{item.label}</span>
					<ChevronDown aria-hidden="true" className={cn("transition-transform duration-(--duracion-breve)", abierta && "rotate-180")} />
				</button>
				<ul id={`${id}-hijos`} hidden={!abierta} className="m-0 flex list-none flex-col gap-0.5 p-0 ps-8">
					{item.children.map((h) => (
						<Entrada key={h.key} item={h} activa={activa} alNavegar={alNavegar} nivel={nivel + 1} />
					))}
				</ul>
			</li>
		);
	}
	const actual = item.key === activa;
	return (
		<li>
			<Link
				href={item.href ?? "#"}
				aria-current={actual ? "page" : undefined}
				onClick={alNavegar}
				className={cn(CLASE_ENTRADA, actual && CLASE_ACTIVA)}
			>
				{nivel === 0 && <span aria-hidden="true">{item.icon}</span>}
				<span>{item.label}</span>
			</Link>
		</li>
	);
}

function Lista({ secciones, activa, alNavegar }: { secciones: SidebarSection[]; activa: string | null; alNavegar?: () => void }) {
	const base = useId();
	return (
		<div className="flex flex-col gap-6">
			{secciones.map((s, i) => (
				<div key={s.label} className="flex flex-col gap-1">
					{/* Rótulo, no encabezado: la barra lateral va antes del h1 de la página. */}
					<p
						id={`${base}-grupo-${i}`}
						className="m-0 px-3 pb-1 font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] text-texto-tenue"
					>
						{s.label}
					</p>
					<ul aria-labelledby={`${base}-grupo-${i}`} className="m-0 flex list-none flex-col gap-0.5 p-0">
						{s.items.map((item) => (
							<Entrada key={item.key} item={item} activa={activa} alNavegar={alNavegar} nivel={0} />
						))}
					</ul>
				</div>
			))}
		</div>
	);
}

/** Con la consulta del navegador: `useSearchParams` necesita un `Suspense` por encima. */
function ConConsulta(props: Omit<NavegacionPanelProps, "rutaActual" | "etiqueta" | "className">) {
	const ruta = usePathname();
	const busqueda = useSearchParams();
	return <Lista {...props} activa={claveActiva(props.secciones, ruta, new URLSearchParams(busqueda.toString()))} />;
}

/** Mientras llega la consulta: la activa solo por ruta. */
function SoloRuta(props: Omit<NavegacionPanelProps, "rutaActual" | "etiqueta" | "className">) {
	const ruta = usePathname();
	return <Lista {...props} activa={claveActiva(props.secciones, ruta, new URLSearchParams())} />;
}

export function NavegacionPanel({ secciones, etiqueta = "Navegación del panel", rutaActual, alNavegar, className }: NavegacionPanelProps) {
	let contenido;
	if (rutaActual !== undefined) {
		const [ruta, consulta = ""] = rutaActual.split("?");
		contenido = <Lista secciones={secciones} alNavegar={alNavegar} activa={claveActiva(secciones, ruta, new URLSearchParams(consulta))} />;
	} else {
		contenido = (
			<Suspense fallback={<SoloRuta secciones={secciones} alNavegar={alNavegar} />}>
				<ConConsulta secciones={secciones} alNavegar={alNavegar} />
			</Suspense>
		);
	}
	return (
		<nav aria-label={etiqueta} className={className}>
			{contenido}
		</nav>
	);
}
