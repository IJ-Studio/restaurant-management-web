/**
 * Navegación del administrador (PLAN-AMPLIACION D-27, D-29 y D-30).
 *
 * - D-30: sin «Sistema» (predicción, base de datos, configuración y «acerca de»).
 * - D-27: Reportes, Nómina y Caja y propinas son paneles del Inicio, no entradas propias.
 * - D-29: las entradas con hijos no se pliegan; sus hijos se ven siempre.
 *
 * Solo datos: la barra lateral y la navegación móvil los pintan con `NavegacionPanel`.
 */
import { createElement, type FC } from "react";
import { CalendarDays, FileText, LayoutDashboard, Package, Tag, Truck, Users, UtensilsCrossed, Boxes } from "lucide-react";
import type { SidebarSection } from "./tipos";

const icono = (Icono: FC<{ "aria-hidden"?: boolean }>) => createElement(Icono, { "aria-hidden": true });

export const ADMIN_NAV_SECTIONS: SidebarSection[] = [
	{
		label: "Servicio",
		items: [
			{ key: "inicio", label: "Inicio", icon: icono(LayoutDashboard), href: "/dashboard/admin" },
			{ key: "reservas", label: "Reservas", icon: icono(CalendarDays), href: "/dashboard/admin/reservations" },
			{ key: "carta", label: "Carta", icon: icono(UtensilsCrossed), href: "/dashboard/admin/menu" },
			{ key: "promociones", label: "Promociones", icon: icono(Tag), href: "/dashboard/admin/promociones" },
		],
	},
	{
		label: "Gestión",
		items: [
			{
				key: "inventario",
				label: "Inventario",
				icon: icono(Package),
				children: [
					{ key: "existencias", label: "Existencias", icon: icono(Boxes), href: "/dashboard/admin/inventory" },
					{ key: "proveedores", label: "Proveedores", icon: icono(Truck), href: "/dashboard/admin/inventory/suppliers" },
				],
			},
			{ key: "personal", label: "Personal", icon: icono(Users), href: "/dashboard/admin/users" },
			{ key: "facturas", label: "Facturas", icon: icono(FileText), href: "/dashboard/admin/finance/invoices" },
		],
	},
];
