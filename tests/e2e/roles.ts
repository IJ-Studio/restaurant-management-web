export const ROLES = {
	admin: { roleId: 1, ruta: "/dashboard/admin" },
	cajero: { roleId: 2, ruta: "/dashboard/cajero" },
	mesero: { roleId: 3, ruta: "/dashboard/mesero" },
	cocina: { roleId: 4, ruta: "/dashboard/cocina" },
	cliente: { roleId: 5, ruta: "/profile" },
} as const;

export type Rol = keyof typeof ROLES;

/** Rol con el que se recorre cada ruta de panel. */
export function rolParaRuta(ruta: string): Rol {
	if (ruta.startsWith("/dashboard/cajero")) return "cajero";
	if (ruta.startsWith("/dashboard/mesero")) return "mesero";
	if (ruta.startsWith("/dashboard/cocina")) return "cocina";
	if (ruta.startsWith("/profile") || ruta.startsWith("/menu/pedido")) return "cliente";
	return "admin";
}

export const archivoSesion = (rol: Rol) => `playwright/.auth/${rol}.json`;
