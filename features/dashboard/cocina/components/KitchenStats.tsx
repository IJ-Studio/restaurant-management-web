"use client";

import React from "react";
import { Flame, Clock, Package } from "lucide-react";

interface KitchenStatsProps {
  pedidosCount: number;
  criticosCount: number;
  promedioMinutos: number;
}

export function KitchenStats({ pedidosCount, criticosCount, promedioMinutos }: KitchenStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      
      {/* Pedidos Activos */}
      <div className="bg-surface border border-border rounded-[32px] p-6 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
         <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 shadow-inner group-hover:scale-110 transition-transform">
            <Flame size={24} className="animate-pulse" />
         </div>
         <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mb-1.5">En Fuego</p>
            <h3 className="font-display font-black text-3xl text-text m-0 tracking-tighter">{pedidosCount} Comandas</h3>
         </div>
      </div>

      {/* Tiempo Promedio */}
      <div className="bg-surface border border-border rounded-[32px] p-6 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
         <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100 shadow-inner group-hover:scale-110 transition-transform">
            <Clock size={24} />
         </div>
         <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mb-1.5">Tiempo de Preparación</p>
            <h3 className="font-display font-black text-3xl text-text m-0 tracking-tighter">{promedioMinutos}m Avg</h3>
         </div>
      </div>

      {/* Insumos Críticos */}
      <div className={`border rounded-[32px] p-6 shadow-sm flex items-center gap-5 group transition-all duration-500 ${criticosCount > 0 ? "bg-red-50 border-red-100 animate-in fade-in" : "bg-surface border-border hover:shadow-xl"}`}>
         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${criticosCount > 0 ? "bg-red-500 text-white" : "bg-surface-alt text-text-muted border border-border"}`}>
            <Package size={24} />
         </div>
         <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mb-1.5">Insumos Críticos</p>
            <h3 className="font-display font-black text-3xl text-text m-0 tracking-tighter">{criticosCount} Faltantes</h3>
         </div>
      </div>

    </div>
  );
}
