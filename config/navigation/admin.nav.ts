/**
 * config/navigation/admin.nav.ts
 *
 * Admin navigation sections and items.
 * Separated from the Sidebar component to keep it data-driven and generic.
 *
 * To add/remove items: edit this file only.
 * Import the Sidebar component and pass these sections as props.
 */
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Settings,
  Package,
  DollarSign,
  BarChart2,
  Truck,
  FileText,
  Info,
  Database,
  Wallet,
} from "lucide-react";
import type { SidebarSection } from "@/components/layout/Sidebar";

// React.createElement is used here to keep this file as a plain config
// (no JSX syntax needed — avoids requiring "use client" on a config file).
import React from "react";

const icon = (Icon: React.FC<{ size?: number }>, size = 17) =>
  React.createElement(Icon, { size });

export const ADMIN_NAV_SECTIONS: SidebarSection[] = [
  {
    label: "Menú Principal",
    items: [
      {
        key:   "dashboard",
        label: "Dashboard",
        icon:  icon(LayoutDashboard),
        href:  "/dashboard/admin",
      },
      {
        key:   "menu",
        label: "Catálogo Menú",
        icon:  icon(UtensilsCrossed),
        href:  "/dashboard/admin/menu",
      },
      {
        key:   "users",
        label: "Personal",
        icon:  icon(Users),
        href:  "/dashboard/admin/users",
      },
      {
        key:   "inventory",
        label: "Inventario",
        icon:  icon(Package),
        children: [
          {
            key:   "inventory",
            label: "Productos & Stock",
            icon:  icon(Package, 15),
            href:  "/dashboard/admin/inventory",
          },
          {
            key:   "suppliers",
            label: "Proveedores",
            icon:  icon(Truck, 15),
            href:  "/dashboard/admin/inventory/suppliers",
          },
        ],
      },
      {
        key:   "finance",
        label: "Finanzas & Caja",
        icon:  icon(DollarSign),
        children: [
          {
            key:   "finance",
            label: "Caja & Propinas",
            icon:  icon(DollarSign, 15),
            href:  "/dashboard/admin/finance",
          },
          {
            key:   "invoices",
            label: "Facturas",
            icon:  icon(FileText, 15),
            href:  "/dashboard/admin/finance/invoices",
          },
          {
            key:   "payroll",
            label: "Nómina",
            icon:  icon(Wallet, 15),
            href:  "/dashboard/admin/payroll",
          },
        ],
      },
      {
        key:   "reports",
        label: "Reportes",
        icon:  icon(BarChart2),
        href:  "/dashboard/admin/reports",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        key:   "performance",
        label: "Base de datos",
        icon:  icon(Database),
        href:  "/dashboard/admin/db-performance",
      },
      {
        key:   "settings",
        label: "Configuración",
        icon:  icon(Settings),
        href:  "/dashboard/admin/settings",
      },
      {
        key:   "about",
        label: "Acerca del restaurante",
        icon:  icon(Info),
        href:  "/dashboard/admin/about",
      },
    ],
  },
];
