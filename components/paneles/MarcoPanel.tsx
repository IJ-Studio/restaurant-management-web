"use client";

import type { ReactNode } from "react";
import { ROLES } from "@/config/roles.config";
import { navegacionDeRol } from "@/config/navigation/por-rol";
import type { RolSesion } from "@/lib/sesion/dal";
import { useCerrarSesion } from "@/lib/sesion/cerrar-sesion";
import { Logo } from "@/components/marca/Logo";
import { BarraSuperiorPanel } from "./BarraSuperiorPanel";
import { NavegacionPanel } from "./NavegacionPanel";

/**
 * Marco de los paneles (PLAN 5.1, DESIGN.md § Paneles):
 * - «Saltar al contenido»;
 * - desde 1024 px, la barra lateral de 16rem, fija a la altura de la ventana y con su propio scroll;
 * - por debajo de 1024 px, el drawer de `BarraSuperiorPanel`;
 * - la barra superior, con la cuenta y el cierre de sesión único (2.14);
 * - el contenido en el único `<main>`, que ocupa todo el ancho restante, sin márgenes calculados
 *   en JavaScript.
 *
 * La navegación sale del rol de la sesión (`navegacionDeRol`). Solo el admin la tiene: caja,
 * cocina y mesero son una sola pantalla, y las entradas extra de `cajero.nav` y `cocina.nav`
 * apuntan a rutas que no existen (NP-37). Así un mesero nunca ve las entradas de admin.
 */
const PANELES: Record<Exclude<RolSesion, "cliente">, { nombre: string; rol: string; navegacion: boolean }> = {
	admin: { nombre: "Administración", rol: "Administración", navegacion: true },
	cajero: { nombre: "Caja", rol: "Caja", navegacion: false },
	cocina: { nombre: "Cocina", rol: "Cocina", navegacion: false },
	mesero: { nombre: "Sala", rol: "Servicio de sala", navegacion: false },
};

const ID_ROL: Record<Exclude<RolSesion, "cliente">, number> = {
	admin: ROLES.ADMIN,
	cajero: ROLES.CAJERO,
	cocina: ROLES.COCINA,
	mesero: ROLES.MESERO,
};

export interface MarcoPanelProps {
	rol: RolSesion;
	nombre: string;
	apellidos: string;
	children: ReactNode;
}

export function MarcoPanel({ rol, nombre, apellidos, children }: MarcoPanelProps) {
	const cerrarSesion = useCerrarSesion();
	const panel = rol === "cliente" ? null : PANELES[rol];
	const secciones = panel?.navegacion && rol !== "cliente" ? navegacionDeRol(ID_ROL[rol]) : [];
	const nombreCompleto = [nombre, apellidos].filter(Boolean).join(" ") || "tu cuenta";
	const etiqueta = `Navegación del panel de ${(panel?.nombre ?? "cuenta").toLowerCase()}`;

	return (
		<div className="marco-panel">
			<a href="#contenido-panel" className="saltar-contenido">
				Saltar al contenido
			</a>
			{secciones.length > 0 && (
				<aside
					aria-label="Barra lateral"
					className="marco-panel-lateral hidden border-e border-borde-sutil bg-superficie lg:flex"
					data-prueba="barra-lateral-panel"
				>
					<div className="flex h-(--alto-cabecera) shrink-0 items-center border-b border-borde-sutil px-4 text-texto-principal">
						<Logo className="h-10 w-auto" />
					</div>
					<NavegacionPanel secciones={secciones} etiqueta={etiqueta} className="min-h-0 flex-1 overflow-y-auto p-4" />
				</aside>
			)}
			<div className="flex min-w-0 flex-1 flex-col">
				<div className="sticky top-0 z-40">
					<BarraSuperiorPanel
						nombrePanel={panel?.nombre ?? "Tu cuenta"}
						secciones={secciones}
						usuario={{ nombre: nombreCompleto, rol: panel?.rol ?? "" }}
						alCerrarSesion={cerrarSesion}
					/>
				</div>
				<main id="contenido-panel" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
					{children}
				</main>
			</div>
		</div>
	);
}
