"use client";

import * as Popover from "@radix-ui/react-popover";
import { CircleUserRound, LogOut } from "lucide-react";
import { PanelAccesibilidad } from "@/components/accesibilidad/PanelAccesibilidad";
import { Boton } from "@/components/ui/Boton";

/**
 * Barra superior de los paneles (DESIGN.md § Paneles, PLAN 3.13): el nombre del panel, las opciones
 * de accesibilidad y la cuenta. La navegación ya no va en un cajón (D-29): la pinta `MarcoPanel`,
 * en la barra lateral desde 1024 px y a la vista bajo esta barra por debajo. Sin logo: en móvil,
 * con texto al 125 %, el nombre del panel no cabría, y es lo que orienta.
 *
 * El cierre de sesión llega como `alCerrarSesion`: la implementación única es del paso 2.14.
 */
export interface BarraSuperiorPanelProps {
	/** «Administración», «Caja», «Cocina»… */
	nombrePanel: string;
	usuario: { nombre: string; rol: string };
	alCerrarSesion?: () => void | Promise<unknown>;
}

export function BarraSuperiorPanel({ nombrePanel, usuario, alCerrarSesion }: BarraSuperiorPanelProps) {
	return (
		<div data-prueba="barra-superior-panel" className="flex h-(--alto-cabecera) items-center gap-2 border-b border-borde-sutil bg-fondo px-[calc(var(--margen-pagina)+env(safe-area-inset-left,0px))]">
			<p className="m-0 min-w-0 flex-1 truncate font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35]">
				{nombrePanel}
			</p>
			<PanelAccesibilidad className="text-texto-principal" />
			<Popover.Root>
				<Popover.Trigger asChild>
					<Boton variante="fantasma" soloIcono icono={<CircleUserRound />} className="-me-3" data-prueba="abrir-cuenta-panel">
						{`Cuenta de ${usuario.nombre}`}
					</Boton>
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Content
						align="end"
						sideOffset={8}
						collisionPadding={16}
						aria-label="Tu cuenta"
						className="menu-flotante z-[110] flex w-64 flex-col rounded-dialogo border border-borde-sutil bg-superficie-elevada p-2 text-texto-principal shadow-flotante"
					>
						<div className="flex flex-col gap-0.5 px-3 pt-2 pb-3">
							<span className="truncate font-semibold">{usuario.nombre}</span>
							<span className="text-(length:--texto-pequeno) text-texto-secundario">{usuario.rol}</span>
						</div>
						{alCerrarSesion ? (
							<button
								type="button"
								onClick={() => void alCerrarSesion()}
								className="flex min-h-11 items-center gap-3 rounded-control border-t border-borde-sutil px-3 text-start text-error al-pasar:bg-superficie-cafe focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
							>
								<LogOut aria-hidden="true" />
								Cerrar sesión
							</button>
						) : null}
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>
		</div>
	);
}
