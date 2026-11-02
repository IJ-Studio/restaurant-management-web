import { ROLES } from "@/config/roles.config";
import { ADMIN_NAV_SECTIONS } from "./admin.nav";
import { CAJERO_NAV_SECTIONS } from "./cajero.nav";
import { COCINA_NAV_SECTIONS } from "./cocina.nav";
import type { SidebarSection } from "./tipos";

/**
 * Entradas de la navegación del panel según el rol (PLAN 3.13). El mesero y el comensal no tienen
 * aún una navegación configurada: se devuelve una lista vacía y el panel no pinta la barra
 * lateral (anotado en NOTAS-PENDIENTES).
 */
export function navegacionDeRol(rol: number): SidebarSection[] {
	switch (rol) {
		case ROLES.ADMIN:
			return ADMIN_NAV_SECTIONS;
		case ROLES.CAJERO:
			return CAJERO_NAV_SECTIONS;
		case ROLES.COCINA:
			return COCINA_NAV_SECTIONS;
		default:
			return [];
	}
}
