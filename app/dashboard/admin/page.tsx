"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardTopBar } from "@/features/dashboard/admin/components/DashboardTopBar";
import { KpiCard } from "@/features/dashboard/admin/components/KpiCard";
import { RecentOrdersTable } from "@/features/dashboard/admin/components/RecentOrdersTable";
import { HourBarsChart } from "@/features/dashboard/admin/components/HourBarsChart";
import { PaymentSplit } from "@/features/dashboard/admin/components/PaymentSplit";
import { TableStatusGrid } from "@/features/dashboard/admin/components/TableStatusGrid";
import { StockAlerts } from "@/features/dashboard/admin/components/StockAlerts";
import { QuickActions } from "@/features/dashboard/admin/components/QuickActions";
import { AlertTriangle, TrendingUp, Clock, Utensils } from "lucide-react";

import {
  OrderService,
  InventoryService,
  TableService,
} from "@/features/shared/services/dataService";
import type {
  Order,
  InventoryProduct,
  DiningTable,
} from "@/features/shared/data/restaurantData";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({ name: "Admin" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // El layout ya validó que el usuario esté autenticado
    // Solo cargar datos de los servicios
    try {
      setOrders(OrderService.getOrders());
      setInventory(InventoryService.getInventory());
      setTables(TableService.getTables());
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || !user) {
    return (
      <div className="p-10 text-text-muted animate-pulse">
        Cargando dashboard central...
      </div>
    );
  }

  // Cálculos reales desde los servicios
  const todaySales = orders
    .filter((o) => o.status !== "nuevo") // Simplificación: pedidos en proceso o listos
    .reduce((s, o) => s + o.total, 0);

  const activeOrders = orders.filter((o) => o.status !== "listo").length;

  const lowStockProducts = inventory.filter((p) => p.stock <= p.minStock);
  const criticalStock = lowStockProducts.filter(
    (p) => p.stock <= p.minStock / 2,
  ).length;

  const freeTables = tables.filter((t) => t.status === "libre").length;
  const occupiedTables = tables.filter((t) => t.status === "ocupada").length;

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="p-8 md:p-10 min-w-0 flex flex-col">
        <DashboardTopBar user={user} />

        {/* Titulo */}
        <div className="mb-5 text-text">
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1">
            Buenas noches, {user.name} 👋
          </h1>
          <p className="text-[13px] text-text-muted m-0">
            {today} · Restaurante El Quijote
          </p>
        </div>

        {/* Alerta de Stock */}
        {criticalStock > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-[13px] border border-red-200 mb-5">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              <p className="text-[13px] font-semibold text-red-600 m-0 leading-tight">
                <strong>{criticalStock} productos con stock crítico</strong>
                {" — "}Se recomienda generar una orden urgente.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/admin/inventory")}
              className="text-xs font-extrabold text-red-600 bg-transparent border-none cursor-pointer whitespace-nowrap underline"
            >
              Ver inventario →
            </button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
          <KpiCard
            label="Ventas activas"
            value={`$${todaySales.toLocaleString()}`}
            sub="en base actual"
            colorClass="text-brand"
            bgClass="bg-brand/10"
            icon={<TrendingUp size={18} />}
            change={12.5}
          />
          <KpiCard
            label="Pedidos pendientes"
            value={activeOrders}
            sub="en preparación"
            colorClass="text-blue-600"
            bgClass="bg-blue-100"
            icon={<Clock size={18} />}
          />
          <KpiCard
            label="Ocupación de mesas"
            value={`${occupiedTables}/${tables.length}`}
            sub={`${freeTables} disponibles`}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-100"
            icon={<Utensils size={18} />}
          />
          <KpiCard
            label="Alertas de stock"
            value={lowStockProducts.length}
            sub={`${criticalStock} críticos`}
            colorClass={criticalStock > 0 ? "text-red-600" : "text-amber-600"}
            bgClass={criticalStock > 0 ? "bg-red-100" : "bg-amber-100"}
            icon={<AlertTriangle size={18} />}
          />
        </div>

        {/* Main Grid: Orders & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_308px] gap-4 mb-4 items-start">
          <RecentOrdersTable />
          <div className="flex flex-col gap-3.5">
            <HourBarsChart todaySales={todaySales} />
            <PaymentSplit />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-10 flex-1">
          <TableStatusGrid />
          <StockAlerts />
          <QuickActions />
        </div>
    </main>
  );
}
