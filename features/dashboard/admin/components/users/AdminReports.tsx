"use client";

import React from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  FileText,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export function AdminReports() {
  const stats = [
    { label: "Nómina Mensual Est.", value: "$142,500", trend: "+2.4%", up: false, icon: <DollarSign className="text-emerald-500" /> },
    { label: "Personal Activo", value: "24", trend: "+3", up: true, icon: <Users className="text-blue-500" /> },
    { label: "Horas Laboradas", value: "1,240h", trend: "-5%", up: true, icon: <Clock className="text-purple-500" /> },
    { label: "Incidencias / Mes", value: "8", trend: "-12%", up: true, icon: <FileText className="text-amber-500" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-8 rounded-[32px] border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-text tracking-tight flex items-center gap-3">
             <BarChart3 className="text-brand" /> Reportes de Gestión Laboral
          </h2>
          <p className="text-text-muted text-sm font-medium mt-1">Análisis detallado de capital humano y costos operativos.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 rounded-2xl border border-border bg-white text-xs font-black text-text-muted hover:text-brand hover:border-brand/40 transition-all flex items-center gap-2">
              <Calendar size={16} /> ÚLTIMOS 30 DÍAS
           </button>
           <button className="px-8 py-3 rounded-2xl bg-surface border-2 border-brand text-brand text-xs font-black shadow-lg shadow-brand/5 hover:bg-brand hover:text-white transition-all flex items-center gap-2">
              <Download size={16} /> EXPORTAR PDF
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((s, idx) => (
           <div key={idx} className="bg-surface p-8 rounded-[40px] border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {s.icon}
                 </div>
                 <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 ${
                   s.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                 }`}>
                    {s.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {s.trend}
                 </span>
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <h4 className="text-3xl font-black text-text tracking-tighter">{s.value}</h4>
           </div>
         ))}
      </div>

      {/* Main Charts Mockup/Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-surface p-10 rounded-[48px] border border-border shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="font-black text-lg text-text tracking-tight">Distribución por Área</h3>
               <button className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">VER LISTADO <ArrowUpRight size={14} /></button>
            </div>
            <div className="flex flex-col gap-6">
               {[
                 { area: "Cocina", count: 8, color: "bg-orange-400" },
                 { area: "Salón", count: 12, color: "bg-blue-400" },
                 { area: "Barra", count: 4, color: "bg-purple-400" },
                 { area: "Admin", count: 2, color: "bg-emerald-400" },
               ].map(a => (
                 <div key={a.area} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-text-sec">
                       <span>{a.area}</span>
                       <span>{Math.round((a.count / 26) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                       <div className={`h-full ${a.color}`} style={{ width: `${(a.count / 26) * 100}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-surface p-10 rounded-[48px] border border-border shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-brand/5 border border-brand/20 flex items-center justify-center mb-6">
               <TrendingUp className="text-brand" size={40} />
            </div>
            <h3 className="text-xl font-black text-text mb-2">Análisis de Productividad</h3>
            <p className="text-sm font-medium text-text-muted max-w-sm mb-8">
               El rendimiento general de los equipos ha incrementado un <strong className="text-emerald-600">14%</strong> en comparación con el trimestre anterior.
            </p>
            <div className="flex gap-4">
               <div className="px-6 py-4 bg-gray-50 rounded-3xl border border-border">
                  <p className="text-[10px] font-black text-text-muted uppercase mb-1">Mejor Área</p>
                  <p className="text-lg font-black text-text uppercase">Terraza / Salón</p>
               </div>
               <div className="px-6 py-4 bg-gray-50 rounded-3xl border border-border">
                  <p className="text-[10px] font-black text-text-muted uppercase mb-1">Puntualidad Avg.</p>
                  <p className="text-lg font-black text-text uppercase">92.4%</p>
               </div>
            </div>
         </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-gray-50 border border-border p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h4 className="text-lg font-black text-text mb-1 flex items-center gap-2">
               <Filter size={18} className="text-brand" /> Generar Reporte Personalizado
            </h4>
            <p className="text-sm font-medium text-text-muted">Seleccione filtros avanzados para exportar datos específicos a Excel o CSV.</p>
         </div>
         <button className="px-12 py-5 bg-brand text-white text-xs font-black rounded-2xl shadow-2xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all uppercase tracking-widest">
            INICIAR CONFIGURACIÓN
         </button>
      </div>
    </div>
  );
}
