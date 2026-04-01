"use client";

import React from "react";
import { PAYMENT_STATS } from "@/features/dashboard/cajero/data/cajeroMock";

export function PaymentDistribution() {
  return (
    <div className="bg-surface rounded-[32px] border border-border p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display font-black text-lg uppercase tracking-tight m-0">Métodos de Pago</h2>
        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface-alt px-3 py-1.5 rounded-full border border-border">
          Corte Parcial
        </span>
      </div>
      
      <div className="space-y-5">
        {PAYMENT_STATS.map((m: any) => (
          <div key={m.label} className="group">
            <div className="flex justify-between items-end mb-2">
              <div>
                 <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.15em] mb-0.5 leading-none">
                    {m.label}
                 </p>
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${m.color.replace('bg-', 'bg-')}`} />
                    <span className="text-[14px] font-black text-text">{m.pct}% del volumen</span>
                 </div>
              </div>
              <span className="text-[16px] font-black text-text tracking-tighter group-hover:scale-110 transition-transform origin-right">
                {m.pct}%
              </span>
            </div>
            
            <div className="h-3 bg-surface-alt rounded-full overflow-hidden border border-border/40">
              <div 
                className={`h-full ${m.color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.05)]`} 
                style={{ width: `${m.pct}%`, animation: 'slideRight 1.5s ease-out forwards' }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border/60">
         <div className="flex items-center justify-between p-4 bg-surface-alt/40 rounded-2xl border border-border/40 hover:bg-white transition-all cursor-pointer group">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Inferencia de Tendencia</span>
               <span className="text-[12px] font-black text-text-sec">Predominio de <span className="text-emerald-600">Efectivo</span></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:rotate-12 transition-transform">
               <span className="text-[10px] font-black">↑5%</span>
            </div>
         </div>
      </div>

      <style jsx>{`
        @keyframes slideRight {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}
