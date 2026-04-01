"use client";

import React from "react";
import { Clock, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { type Order } from "@/features/shared/data/restaurantData";

interface OrderCardProps {
  pedido: Order;
  onAvanzar: (id: string) => void;
}

const ESTADO_UI = {
  nuevo: {
    bg: "bg-red-50",
    border: "border-red-100",
    accent: "bg-red-500",
    text: "text-red-600",
    label: "Nuevo",
    btn: "bg-orange-500 hover:bg-orange-400 text-black",
    next: "Iniciar Cocina"
  },
  preparando: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    accent: "bg-amber-500",
    text: "text-amber-600",
    label: "En Cocina",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-black",
    next: "Marcar Listo"
  },
  listo: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    accent: "bg-emerald-500",
    text: "text-emerald-600",
    label: "Listo",
    btn: "bg-emerald-100 text-emerald-700",
    next: "Entregado"
  }
};

export function OrderCard({ pedido, onAvanzar }: OrderCardProps) {
  const ui = ESTADO_UI[pedido.status];
  const isReady = pedido.status === "listo";

  return (
    <div className={`${ui.bg} border ${ui.border} rounded-[32px] p-6 shadow-sm group hover:shadow-xl hover:scale-[1.02] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-display font-black text-xl text-text m-0 tracking-tight leading-none mb-1.5">
            {pedido.id}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
            <Clock size={12} className={ui.text} />
            {pedido.timestamp} · <span className="text-text">{pedido.table}</span>
          </div>
        </div>
        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${ui.accent} bg-opacity-10 ${ui.text} border-current/10 tracking-widest`}>
          {ui.label}
        </span>
      </div>

      <div className="space-y-3 mb-6 bg-white/40 p-4 rounded-2xl border border-white/60 shadow-inner">
        {pedido.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
             <div className={`w-6 h-6 rounded-lg ${ui.bg} ${ui.text} flex items-center justify-center font-black text-[11px] shrink-0 border ${ui.border}`}>
                {item.qty}
             </div>
             <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] text-text-sec leading-tight m-0">{item.name}</p>
                {item.notes && (
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {item.notes}
                  </p>
                )}
             </div>
          </div>
        ))}
      </div>

      {!isReady ? (
        <button
          onClick={() => onAvanzar(pedido.id)}
          className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${ui.btn}`}
        >
          {ui.next}
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      ) : (
        <div className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-emerald-200 bg-emerald-100 flex items-center justify-center gap-2 text-emerald-700">
           <CheckCircle2 size={16} /> Entregado al Mesero
        </div>
      )}
    </div>
  );
}
