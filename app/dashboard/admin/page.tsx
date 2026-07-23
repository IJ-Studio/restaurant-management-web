"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KpiCard } from "@/features/dashboard/admin/components/KpiCard";
import { RecentOrdersTable } from "@/features/dashboard/admin/components/RecentOrdersTable";
import { HourBarsChart } from "@/features/dashboard/admin/components/HourBarsChart";
// import { TableStatusGrid } from "@/features/dashboard/admin/components/TableStatusGrid";
// import { StockAlerts } from "@/features/dashboard/admin/components/StockAlerts";
import { AlertTriangle, TrendingUp, Clock, Utensils } from "lucide-react";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (match) return match[1];
  return localStorage.getItem("authToken");
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user] = useState<any>({ name: "Admin" });

  const [stats, setStats] = useState({
    totalVentas: 0,
    pedidosPendientes: 0,
    pedidosEnPreparacion: 0,
    mesasOcupadas: 0,
    mesasLibres: 0,
    totalMesas: 0,
  });
  const [lowStockCount, setLowStockCount] = useState(0);
  const [criticalStockCount, setCriticalStockCount] = useState(0);
  const [loadingKpi, setLoadingKpi] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingKpi(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const resStats = await fetch(`${API_URL}/dashboard/admin/stats`, { headers });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      try {
        const resStock = await fetch(`${API_URL}/api/inventory/products`, { headers });
        const products = await resStock.json();
        if (resStock.ok && Array.isArray(products)) {
          const low = products.filter((p: any) => p.stock <= p.minStock);
          const critical = low.filter((p: any) => p.stock <= p.minStock / 2);
          setLowStockCount(low.length);
          setCriticalStockCount(critical.length);
        }
      } catch {}
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoadingKpi(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loadingKpi) {
    return (
      <div className="p-10 text-text-muted animate-pulse">
        Cargando dashboard central...
      </div>
    );
  }

  return (
    <main className="p-8 md:p-10 min-w-0 flex flex-col">
      <div className="mb-5 text-text">
        <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1">
          Buenas noches, {user.name}
        </h1>
      </div>

      {criticalStockCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-[13px] border border-red-200 mb-5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <p className="text-[13px] font-semibold text-red-600 m-0 leading-tight">
              <strong>{criticalStockCount} productos con stock crítico</strong>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <KpiCard
          label="Ventas activas"
          value={`$${stats.totalVentas.toLocaleString()}`}
          sub="hoy"
          colorClass="text-brand"
          bgClass="bg-brand/10"
          icon={<TrendingUp size={18} />}
        />
        <KpiCard
          label="Pedidos pendientes"
          value={`${stats.pedidosPendientes} pendientes`}
          sub={`${stats.pedidosEnPreparacion} en preparación`}
          colorClass="text-blue-600"
          bgClass="bg-blue-100"
          icon={<Clock size={18} />}
        />
        <KpiCard
          label="Ocupación de mesas"
          value={`${stats.mesasOcupadas}/${stats.totalMesas}`}
          sub={`${stats.mesasLibres} disponibles`}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
          icon={<Utensils size={18} />}
        />
        <KpiCard
          label="Alertas de stock"
          value={lowStockCount}
          sub={`${criticalStockCount} críticos`}
          colorClass={criticalStockCount > 0 ? "text-red-600" : "text-amber-600"}
          bgClass={criticalStockCount > 0 ? "bg-red-100" : "bg-amber-100"}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_308px] gap-4 mb-4 items-start">
        <RecentOrdersTable />
        <div className="flex flex-col gap-3.5">
          <HourBarsChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-10 flex-1">
        {/* <TableStatusGrid />
        <StockAlerts /> */}
      </div>
    </main>
  );
}
