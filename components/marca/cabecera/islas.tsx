"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { CircleUserRound, LogIn, LogOut, Menu, UserRound } from "lucide-react";
import { rutaPublica } from "@/config/navegacion-publica";
import { cn } from "@/lib/utils";
import { Boton } from "@/components/ui/Boton";
import { CerrarDialogo, PanelLateral } from "@/components/ui/Dialogo";
import { useRegistroRuta } from "@/components/ui/BotonVolver";
import { PanelAccesibilidad } from "@/components/accesibilidad/PanelAccesibilidad";
import { useCerrarSesion } from "@/lib/sesion/cerrar-sesion";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/index";
import { ENLACES_CABECERA } from "./enlaces";

/**
 * Islas de cliente de `CabeceraSitio` (D-09): la sombra al desplazar, la sección activa, la
 * cuenta y el menú móvil. Lo demás de la cabecera se pinta en el servidor.
 */

const suscribirDesplazamiento = (avisar: () => void) => {
	window.addEventListener("scroll", avisar, { passive: true });
	window.addEventListener("resize", avisar);
	return () => {
		window.removeEventListener("scroll", avisar);
		window.removeEventListener("resize", avisar);
	};
};

/** ¿Queda la cabecera encima de la foto de la portada (`#inicio[data-portada]`)? */
function cabeceraSobrePortada() {
	const portada = document.querySelector<HTMLElement>("#inicio[data-portada]");
	if (!portada) return false;
	const cabecera = document.querySelector<HTMLElement>(".cabecera-sitio")?.offsetHeight ?? 64;
	return portada.getBoundingClientRect().bottom > cabecera;
}

/**
 * Marco de la cabecera: añade la sombra cuando la página se ha desplazado y, en la landing,
 * se vuelve transparente con tinta clara mientras está sobre la foto de la portada (PLAN 4.3).
 */
export function MarcoCabecera({ children, fija = true }: { children: ReactNode; fija?: boolean }) {
	const enLanding = usePathname() === "/";
	const desplazada = useSyncExternalStore(suscribirDesplazamiento, () => window.scrollY > 8, () => false);
	// En el servidor, la landing empieza arriba del todo: sobre la portada, sin parpadeo al hidratar.
	const sobrePortada = useSyncExternalStore(suscribirDesplazamiento, cabeceraSobrePortada, () => enLanding);
	useRegistroRuta();
	const transparente = fija && enLanding && sobrePortada;
	return (
		<header
			className={cn("cabecera-sitio", transparente && "sobre-fotografia")}
			data-fija={fija ? undefined : "no"}
			data-desplazada={(fija && desplazada && !transparente) || undefined}
			data-sobre-portada={transparente || undefined}
		>
			{children}
		</header>
	);
}

/**
 * Sección activa: en la landing, la que ocupa el centro de la pantalla; en una página de acción,
 * la de su origen (`/menu` → «La carta»).
 */
function useSeccionActiva(): string | null {
	const ruta = usePathname();
	const [visible, setVisible] = useState<string | null>(null);
	const esLanding = ruta === "/";

	useEffect(() => {
		if (!esLanding) return;
		const secciones = ENLACES_CABECERA.map((e) => document.getElementById(e.href.split("#")[1])).filter(
			(e): e is HTMLElement => e !== null,
		);
		if (!secciones.length) return;
		const observador = new IntersectionObserver(
			(entradas) => {
				for (const entrada of entradas) if (entrada.isIntersecting) setVisible(`/#${entrada.target.id}`);
			},
			{ rootMargin: "-45% 0px -50% 0px" },
		);
		secciones.forEach((s) => observador.observe(s));
		return () => observador.disconnect();
	}, [esLanding]);

	if (esLanding) return visible;
	return rutaPublica(ruta)?.origen.href ?? null;
}

const CLASE_ENLACE =
	"relative inline-flex min-h-11 items-center px-1 font-texto text-(length:--texto-pequeno) font-medium no-underline " +
	"transition-colors duration-(--duracion-breve) ease-estandar al-pasar:text-texto-principal " +
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco " +
	"after:absolute after:inset-x-1 after:bottom-2 after:h-px after:bg-acento after:content-[''] after:transition-opacity";

/** Enlaces a las secciones de la landing, con la activa marcada (`aria-current="true"` y filete de acento). */
export function NavegacionSecciones({ className }: { className?: string }) {
	const activa = useSeccionActiva();
	return (
		<nav aria-label="Principal" className={className}>
			<ul className="m-0 flex list-none items-center gap-5 p-0">
				{ENLACES_CABECERA.map((e) => {
					const actual = e.href === activa;
					return (
						<li key={e.href}>
							<Link
								href={e.href}
								aria-current={actual ? "true" : undefined}
								className={cn(CLASE_ENLACE, actual ? "text-texto-principal after:opacity-100" : "text-texto-secundario after:opacity-0")}
							>
								{e.nombre}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

export interface UsuarioCabecera {
	nombre: string;
	correo?: string;
}

/**
 * Usuario de la cabecera. Si la cabecera recibe uno (el catálogo), se usa ese; si no
 * (`undefined`), sale del store, que hidrata una sola lectura de `/api/auth/me` por carga
 * (PLAN 2.15). Así la cuenta no se queda desfasada al navegar dentro del mismo layout.
 */
function useUsuarioCabecera(usuario: UsuarioCabecera | null | undefined): UsuarioCabecera | null {
	const delStore = useSelector((estado: RootState) => estado.auth.user) as { name?: unknown; email?: unknown } | null;
	if (usuario !== undefined) return usuario;
	if (!delStore) return null;
	const nombre = typeof delStore.name === "string" && delStore.name ? delStore.name : "comensal";
	return { nombre, correo: typeof delStore.email === "string" ? delStore.email : undefined };
}

/**
 * Cuenta del comensal. Sin sesión, un enlace a «Iniciar sesión». Con sesión, un menú con su
 * nombre, «Tu cuenta» y «Cerrar sesión». El cierre llega como `alCerrarSesion`: la
 * implementación única es del paso 2.14 (`lib/sesion/cerrar-sesion.ts`); sin ella, no se ofrece.
 */
export function MenuCuenta({ usuario, alCerrarSesion }: { usuario: UsuarioCabecera | null; alCerrarSesion?: () => void | Promise<unknown> }) {
	if (!usuario)
		return (
			<Link
				href="/login"
				className="area-tactil-minima gap-2 rounded-control px-2 font-texto text-(length:--texto-pequeno) font-medium text-texto-principal no-underline al-pasar:bg-superficie-cafe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
			>
				<LogIn aria-hidden="true" />
				<span className="max-xl:solo-lectores">Iniciar sesión</span>
			</Link>
		);
	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<Boton variante="fantasma" soloIcono icono={<CircleUserRound />} data-prueba="abrir-cuenta">
					{`Tu cuenta, ${usuario.nombre}`}
				</Boton>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					align="end"
					sideOffset={8}
					aria-label="Tu cuenta"
					className="menu-flotante z-[110] flex w-64 flex-col rounded-dialogo border border-borde-sutil bg-superficie-elevada p-2 text-texto-principal shadow-flotante"
				>
					<div className="flex flex-col gap-0.5 border-b border-borde-sutil px-3 pt-2 pb-3">
						<span className="truncate font-semibold">{usuario.nombre}</span>
						{usuario.correo && <span className="truncate text-(length:--texto-pequeno) text-texto-secundario">{usuario.correo}</span>}
					</div>
					<Link
						href="/profile"
						className="mt-1 flex min-h-11 items-center gap-3 rounded-control px-3 no-underline al-pasar:bg-superficie-cafe focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
					>
						<UserRound aria-hidden="true" />
						Tu cuenta
					</Link>
					{alCerrarSesion && (
						<button
							type="button"
							onClick={() => void alCerrarSesion()}
							className="flex min-h-11 items-center gap-3 rounded-control px-3 text-start text-error al-pasar:bg-superficie-cafe focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
						>
							<LogOut aria-hidden="true" />
							Cerrar sesión
						</button>
					)}
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}

/** Menú móvil (por debajo de 1024 px): las secciones y la cuenta en un `PanelLateral`. */
/** `MenuCuenta` con el cierre de sesión único (PLAN 2.14), para la cabecera de servidor. */
export function MenuCuentaConSesion({ usuario }: { usuario?: UsuarioCabecera | null }) {
	const cerrarSesion = useCerrarSesion();
	return <MenuCuenta usuario={useUsuarioCabecera(usuario)} alCerrarSesion={cerrarSesion} />;
}

export function MenuMovil({ usuario: recibido, pie }: { usuario?: UsuarioCabecera | null; pie?: ReactNode }) {
	const activa = useSeccionActiva();
	const usuario = useUsuarioCabecera(recibido);
	const cerrarSesion = useCerrarSesion();
	return (
		<PanelLateral
			lado="fin"
			titulo="Menú"
			disparador={
				<Boton variante="fantasma" soloIcono icono={<Menu />} className="xl:hidden" data-prueba="abrir-menu-movil">
					Abrir el menú
				</Boton>
			}
			pie={pie}
		>
			<nav aria-label="Principal">
				<ul className="m-0 flex list-none flex-col p-0">
					{ENLACES_CABECERA.map((e) => (
						<li key={e.href} className="border-b border-borde-sutil">
							<CerrarDialogo asChild>
								<Link
									href={e.href}
									aria-current={e.href === activa ? "true" : undefined}
									className="flex min-h-12 items-center font-titulos text-(length:--texto-titulo-3) text-texto-principal no-underline aria-[current=true]:text-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
								>
									{e.nombre}
								</Link>
							</CerrarDialogo>
						</li>
					))}
				</ul>
			</nav>
			<div className="mt-6 flex flex-col gap-1">
				{/* Por debajo de 640 px, las opciones de accesibilidad no caben en la barra: van aquí. */}
				<div className="sm:hidden">
					<PanelAccesibilidad conTexto className="-ms-3 text-texto-principal" />
				</div>
				{usuario ? (
					<>
						<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Sesión de {usuario.nombre}</p>
						<CerrarDialogo asChild>
							<Link href="/profile" className="flex min-h-11 items-center gap-3 text-texto-principal no-underline [&_svg]:size-5 [&_svg]:stroke-[1.5]">
								<UserRound aria-hidden="true" />
								Tu cuenta
							</Link>
						</CerrarDialogo>
						{/* NP-42: el cierre de sesión único (PLAN 2.14) también desde el menú móvil. */}
						<CerrarDialogo asChild>
							<button
								type="button"
								onClick={() => void cerrarSesion()}
								className="flex min-h-11 items-center gap-3 text-start text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
							>
								<LogOut aria-hidden="true" />
								Cerrar sesión
							</button>
						</CerrarDialogo>
					</>
				) : (
					<CerrarDialogo asChild>
						<Link href="/login" className="flex min-h-11 items-center gap-3 text-texto-principal no-underline [&_svg]:size-5 [&_svg]:stroke-[1.5]">
							<LogIn aria-hidden="true" />
							Iniciar sesión
						</Link>
					</CerrarDialogo>
				)}
			</div>
		</PanelLateral>
	);
}
