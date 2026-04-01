"use client";

import React from "react";
import { CheckCircle2, History, RotateCcw, ChevronRight } from "lucide-react";
import { type ClientOrder, HISTORIAL } from "@/features/dashboard/cliente/data/clienteMock";

interface HistoryTabProps {
  onReorder: (order: ClientOrder) => void;
}

export function HistoryTab({ onReorder }: HistoryTabProps) {
  return (
    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-4 px-2">
         <div className="w-12 h-12 bg-surface border border-border rounded-2xl flex items-center justify-center text-text shadow-sm">
            <History size={20} />
         </div>
         <div>
            <h2 className="font-display font-black text-2xl text-text m-0 tracking-tight leading-none mb-1.5 underline-offset-4 decoration-brand">Historial de Pedidos</h2>
            <p className="text-[11px] font-black text-text-muted uppercase tracking-widest leading-none">Registros de tus experiencias pasadas</p>
         </div>
      </div>

      <div className="space-y-4 px-2">
        {HISTORIAL.map((pedido) => (
          <div 
            key={pedido.id} 
            className="bg-surface border border-border rounded-[32px] p-8 hover:border-brand/30 hover:shadow-xl transition-all duration-500 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110 shadow-inner">
                   <CheckCircle2 size={24} />
                </div>
                <div>
                   <p className="font-display font-black text-lg text-text m-0 leading-none mb-1">{pedido.id}</p>
                   <p className="text-[11px] font-black text-text-muted uppercase tracking-widest">{pedido.fecha}</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3.5 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Entregado
              </div>
            </div>

            <p className="text-[13px] font-bold text-text-sec mb-8 bg-surface-alt/40 p-4 rounded-2xl border border-border/30 italic">
               {pedido.items.join(', ')}
            </p>

            <div className="flex justify-between items-center pt-6 border-t border-border/60">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Importe Final</span>
                  <span className="font-display font-black text-2xl text-brand tracking-tighter leading-none">${pedido.total.toFixed(2)}</span>
               </div>
               <button
                  onClick={() => onReorder(pedido)}
                  className="flex items-center gap-3 bg-surface-alt hover:bg-brand text-text-sec hover:text-white border border-border hover:border-brand/40 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 group/btn"
               >
                  <RotateCcw size={16} className="group-hover/btn:rotate-[-180deg] transition-transform duration-700" /> Repetir Pedido
               </button>
            </div>
          </div>
        ))}

        {HISTORIAL.length === 0 && (
           <div className="py-32 text-center">
              <div className="w-20 h-20 bg-surface-alt rounded-[40px] flex items-center justify-center mx-auto mb-6 opacity-30 border-2 border-dashed border-text-muted">
                 <History size={32} />
              </div>
              <p className="text-[13px] font-black text-text-muted uppercase tracking-widest">Aún no tienes pedidos registrados.</p>
           </div>
        )}
      </div>
    </div>
  );
}
