import Link from "next/link";
import { PanelAccesibilidad } from "@/components/accesibilidad/PanelAccesibilidad";
import { Logo } from "@/components/marca/Logo";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { MarcoCabecera, MenuCuenta, MenuMovil, NavegacionSecciones, type UsuarioCabecera } from "./islas";

/**
 * Cabecera del sitio público (DESIGN.md § Navigation, D-09). Componente de servidor con islas de
 * cliente para la sombra al desplazar, la sección activa, la cuenta y el menú móvil.
 *
 * - Fija, de `--alto-cabecera` más la zona segura superior, sobre `--color-fondo`; al desplazar
 *   la página gana `--sombra-cabecera`.
 * - Logo (enlace al inicio), enlaces a las secciones de la landing (desde 1024 px), opciones de
 *   accesibilidad, cuenta y el único llamado persistente: «Reservar» (secundario, compacto,
 *   siempre visible, también en móvil junto al botón de menú).
 * - Por debajo de 1024 px, las secciones van en un `PanelLateral`; por debajo de 640 px, también
 *   la cuenta y las opciones de accesibilidad.
 *
 * La variante transparente sobre la portada se hace en el paso 4.3, con la fotografía real y su
 * comprobación de contraste.
 */
export interface CabeceraSitioProps {
	/** Sesión del comensal (en la fase 4, de la capa de datos de sesión del paso 2.11). */
	usuario?: UsuarioCabecera | null;
	/** `false` la deja en el flujo de la página (catálogo). */
	fija?: boolean;
}

export function CabeceraSitio({ usuario = null, fija = true }: CabeceraSitioProps) {
	return (
		<MarcoCabecera fija={fija}>
			<div className="contenedor-pagina flex h-(--alto-cabecera) items-center justify-between gap-3">
				<Link
					href="/"
					className="inline-flex min-h-11 shrink-0 items-center rounded-control text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
				>
					<Logo className="h-8 w-auto sm:h-9" />
				</Link>

				<NavegacionSecciones className="hidden lg:block" />

				<div className="flex shrink-0 items-center gap-1">
					{/* Por debajo de 640 px, accesibilidad y cuenta van en el menú: si no, con texto al 125 % no cabe. */}
					<div className="hidden sm:block">
						<PanelAccesibilidad className="text-texto-principal" />
					</div>
					<div className="hidden sm:block">
						<MenuCuenta usuario={usuario} />
					</div>
					<BotonEnlace href="/reservations" variante="secundario" tamano="compacto" className="ms-1">
						Reservar
					</BotonEnlace>
					<MenuMovil usuario={usuario} />
				</div>
			</div>
		</MarcoCabecera>
	);
}
