import { 
  DollarSign, 
  Receipt, 
  FileText, 
  CreditCard, 
  Clock 
} from "lucide-react";
import type { SidebarSection } from "@/components/layout/Sidebar";
import React from "react";

const icon = (Icon: React.FC<{ size?: number }>, size = 17) =>
  React.createElement(Icon, { size });

export const CAJERO_NAV_SECTIONS: SidebarSection[] = [
  {
    label: "OPERACIONES",
    items: [
      {
        key: "caja",
        label: "Caja Principal",
        href: "/dashboard/cajero",
        icon: icon(DollarSign),
      },
      {
        key: "pending",
        label: "Tickets Pendientes",
        href: "/dashboard/cajero?filter=pending",
        icon: icon(Clock),
      },
      {
        key: "history",
        label: "Historial Cobros",
        href: "/dashboard/cajero?filter=history",
        icon: icon(Receipt),
      },
    ],
  },
  {
    label: "EXTRAS",
    items: [
      {
        key: "report",
        label: "Corte de Turno",
        href: "/dashboard/cajero/report",
        icon: icon(FileText),
      },
      {
        key: "methods",
        label: "Métodos de Pago",
        href: "/dashboard/cajero/methods",
        icon: icon(CreditCard),
      },
    ],
  },
];
