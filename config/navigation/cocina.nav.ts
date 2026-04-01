import { 
  Flame, 
  Package, 
  BarChart3, 
  Settings, 
  History 
} from "lucide-react";
import type { SidebarSection } from "@/components/layout/Sidebar";
import React from "react";

const icon = (Icon: React.FC<{ size?: number }>, size = 17) =>
  React.createElement(Icon, { size });

export const COCINA_NAV_SECTIONS: SidebarSection[] = [
  {
    label: "OPERACIONES",
    items: [
      {
        key: "cocina",
        label: "Tablero Kitchen",
        href: "/dashboard/cocina",
        icon: icon(Flame),
      },
      {
        key: "inventario",
        label: "Insumos Críticos",
        href: "/dashboard/cocina?view=inventory",
        icon: icon(Package),
      },
    ],
  },
  {
    label: "REPORTES & CONFIG",
    items: [
      {
        key: "stats",
        label: "Rendimiento",
        href: "/dashboard/cocina/stats",
        icon: icon(BarChart3),
      },
      {
        key: "historial",
        label: "Historial de Comandas",
        href: "/dashboard/cocina/history",
        icon: icon(History),
      },
      {
        key: "settings",
        label: "Personalizar Estación",
        href: "/dashboard/cocina/settings",
        icon: icon(Settings),
      },
    ],
  },
];
