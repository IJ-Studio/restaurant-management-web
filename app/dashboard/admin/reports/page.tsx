"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import ExportModal from "@/components/admin/ExportModal";
import AdminSidebar from "@/components/admin/AdminSidebar";

import {
  ClipboardList,
  Users,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
} from "lucide-react";

import {
  WEEKLY_SALES,
  MONTHLY_TREND,
  TOP_PRODUCTS,
  STAFF_METRICS,
  PAYMENT_DIST,
  PERIOD_STATS,
} from "@/features/dashboard/admin/data/reportsMock";

import { BarChart } from "@/features/dashboard/admin/components/charts/BarChart";
import { Sparkline } from "@/features/dashboard/admin/components/charts/Sparkline";
import { DonutChart } from "@/features/dashboard/admin/components/charts/DonutChart";
import { KpiCard } from "@/features/dashboard/admin/components/KpiCard";

const fmt = (n: number) =>
  n.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ReportsPage() {
  const [period, setPeriod] = useState<"semana" | "mes" | "año">("semana");
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const stats = PERIOD_STATS[period];
  const monthMax = Math.max(...MONTHLY_TREND.map((m) => m.total || 0));
  const weekMax = Math.max(...WEEKLY_SALES.map((d) => d.ventas || 0));
  const user = useSelector((state: RootState) => state.auth.user);

  const kpis = [
    {
      l: "Ventas totales",
      v: `$${fmt(stats.ventas)}`,
      c: "var(--color-brand)",
      icon: <TrendingUp size={16} />,
      change: stats.growth,
    },
    {
      l: "Pedidos",
      v: stats.pedidos,
      c: "var(--color-info)",
      icon: <ClipboardList size={16} />,
      change: 5.2,
    },
    {
      l: "Ticket promedio",
      v: `$${fmt(stats.ticket)}`,
      c: "var(--color-ok)",
      icon: <DollarSign size={16} />,
      change: -1.8,
    },
    {
      l: "Clientes únicos",
      v: stats.clientes,
      c: "#7c3aed",
      icon: <Users size={16} />,
      change: stats.growth,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="reports" user={user} />
      <main className="flex-1 ml-[260px] p-8 md:p-10 min-w-0">
        {/* Export modal */}
        {exportModalOpen && (
          <ExportModal onClose={() => setExportModalOpen(false)} />
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
              Analytics & Reportes
            </h1>
            <p className="text-sm text-text-muted m-0">
              Análisis de ventas, desempeño del equipo y comportamiento del cliente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-surface-alt rounded-2xl border border-border gap-1 shadow-sm overflow-hidden">
              {(["semana", "mes", "año"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-5 py-2 rounded-xl text-[12px] font-black tracking-tight cursor-pointer transition-all border-none uppercase ${
                    period === p
                      ? "bg-surface text-brand shadow-sm ring-1 ring-border"
                      : "bg-transparent text-text-muted hover:text-text-sec"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-none font-black text-[13px] tracking-tight cursor-pointer bg-brand text-white shadow-[0_4px_12px_rgba(232,93,4,0.3)] hover:-translate-y-px transition-all"
            >
              <Download size={16} /> Exportar
            </button>
          </div>
        </header>

        {/* KPI Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {kpis.map((k) => (
            <KpiCard
              key={k.l}
              label={k.l}
              value={k.v}
              change={k.change}
              icon={k.icon}
              color={k.c}
            />
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales by day */}
          <div className="bg-surface rounded-3xl border border-border p-7 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-display font-black text-[17px] text-text m-0 mb-1 leading-none group-hover:text-brand transition-colors">
                  Ventas por día
                </h3>
                <p className="text-[11px] font-black text-text-muted m-0 uppercase tracking-widest">
                  Tendencia semanal
                </p>
              </div>
              <p className="font-display font-black text-2xl text-brand m-0 leading-none">
                ${fmt(WEEKLY_SALES.reduce((s, d) => s + (d.ventas || 0), 0))}
              </p>
            </div>
            <div className="mb-4">
                 <BarChart data={WEEKLY_SALES} valueKey="ventas" maxVal={weekMax} color="var(--color-brand)" height={120} />
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-border/50">
              {[
                { l: "Mejor día", v: "Sábado $9,400", c: "text-emerald-600" },
                { l: "Peor día", v: "Martes $3,800", c: "text-red-500" },
                { l: "Promedio", v: `$${fmt(43050 / 7)}`, c: "text-text" },
              ].map((r) => (
                <div key={r.l}>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1.5">{r.l}</p>
                  <p className={`text-[13px] font-black m-0 leading-none ${r.c}`}>{r.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-surface rounded-3xl border border-border p-7 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-display font-black text-[17px] text-text m-0 mb-1 leading-none group-hover:text-brand transition-colors">
                  Ingresos Históricos
                </h3>
                <p className="text-[11px] font-black text-text-muted m-0 uppercase tracking-widest">
                  Últimos 7 meses
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[11px] font-black border border-emerald-100">+3.1% MoM</div>
            </div>
            <div className="mb-4">
                <BarChart data={MONTHLY_TREND} valueKey="total" maxVal={monthMax} color="var(--color-info)" height={120} />
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-border/50">
               {[
                  { l: "Mejor mes", v: "Diciembre", c: "text-text" },
                  { l: "MoM Actual", v: "+3.1%", c: "text-emerald-600" },
                  { l: "Proyección", v: "$148k", c: "text-brand" },
                ].map((r) => (
                  <div key={r.l}>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1.5">{r.l}</p>
                    <p className={`text-[13px] font-black m-0 leading-none ${r.c}`}>{r.v}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Row 2: Distribution and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 h-full">
           {/* Payment Dist */}
           <div className="bg-surface rounded-3xl border border-border p-7 shadow-sm hover:shadow-xl transition-all h-full">
              <h3 className="font-display font-black text-[17px] text-text m-0 mb-6 leading-none">
                  Distribución de Pagos
              </h3>
              <div className="flex items-center justify-center py-6">
                  <DonutChart segments={PAYMENT_DIST} />
              </div>
              <div className="mt-8 pt-6 border-t border-border/50">
                   <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest leading-none">Análisis de liquidez</p>
                   <p className="text-xs text-text-sec mt-2 m-0 font-medium">El efectivo sigue siendo el método predominante (48%), seguido por tarjetas (34%).</p>
              </div>
           </div>

           {/* Staff Performance */}
           <div className="bg-surface rounded-3xl border border-border p-7 shadow-sm hover:shadow-xl transition-all h-full overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                   <h3 className="font-display font-black text-[17px] text-text m-0 leading-none">
                      Desempeño del Equipo
                  </h3>
                  <span className="text-[11px] font-bold text-brand uppercase tracking-widest">Octubre 2026</span>
              </div>
              <div className="space-y-4">
                   {STAFF_METRICS.map(s => (
                      <div key={s.name} className="flex items-center justify-between p-4 bg-surface-alt rounded-2xl border border-border/40 hover:border-brand/40 transition-colors group cursor-default">
                          <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text shadow-sm group-hover:scale-105 transition-transform">{s.name[0]}</div>
                              <div>
                                  <p className="text-sm font-black text-text m-0">{s.name}</p>
                                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{s.rol} · {s.pedidos} órdenes</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="text-right">
                                  <p className="text-xs font-black text-emerald-600 m-0 leading-none mb-1">+${s.propinas}</p>
                                  <Sparkline data={[10, 15, 8, 25, 20, 35]} color="var(--color-ok)" width={40} height={15} />
                              </div>
                              <div className="w-px h-6 bg-border mx-1" />
                              <div className="text-center">
                                  <p className="text-xs font-black text-brand m-0">{s.satisfaccion}</p>
                                  <p className="text-[9px] font-bold text-text-muted uppercase">⭐</p>
                              </div>
                          </div>
                      </div>
                   ))}
              </div>
           </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all overflow-x-auto">
          <header className="px-7 py-5 bg-surface-alt border-b border-border flex justify-between items-center">
               <h3 className="font-display font-black text-[17px] text-text m-0 leading-none tracking-tight">Ventas por Producto</h3>
               <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Top 6 más vendidos</span>
          </header>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-alt/50 border-b border-border">
                {["Producto", "Ventas", "Ingreso Total", "Tendencia", ""].map((h) => (
                  <th key={h} className="px-7 py-4 text-[10px] font-bold text-text-muted tracking-widest uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((p) => (
                <tr key={p.name} className="border-b border-border/50 hover:bg-surface-alt transition-colors last:border-none group">
                  <td className="px-7 py-4">
                    <p className="text-[13px] font-black text-text m-0 group-hover:text-brand transition-colors tracking-tight">{p.name}</p>
                  </td>
                  <td className="px-7">
                     <p className="text-sm font-black text-text m-0">{p.ventas}</p>
                     <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">u. vendidas</p>
                  </td>
                  <td className="px-7">
                    <p className="text-[13px] font-black text-brand m-0">${p.ingreso.toLocaleString()}</p>
                  </td>
                  <td className="px-7">
                    <div className="flex items-center gap-3">
                      <Sparkline data={[20, 25, 40, 35, 50, 45]} color={p.trend > 0 ? "var(--color-ok)" : "var(--color-danger)"} width={60} height={18} />
                      <span className={`text-[11px] font-black flex items-center gap-0.5 ${p.trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {p.trend > 0 ? "+" : ""}{p.trend}%
                      </span>
                    </div>
                  </td>
                  <td className="px-7 text-right">
                      <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-brand transition-colors bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm">Detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
