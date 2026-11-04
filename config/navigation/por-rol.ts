import { ROLES } from "@/config/roles.config";
import { ADMIN_NAV_SECTIONS } from "./admin.nav";
import type { SidebarSection } from "./tipos";

/**
 * Navegación de cada rol. Solo el administrador tiene varias pantallas; caja, cocina y sala son una
 * sola pantalla cada una, sin navegación de panel (NP-37: se retiraron sus configuraciones, que
 * apuntaban a rutas inexistentes).
 */
export function navegacionDeRol(rol: number): SidebarSection[] {
	return rol === ROLES.ADMIN ? ADMIN_NAV_SECTIONS : [];
}
