"use client";

import React from "react";
import { type Order } from "@/features/shared/data/restaurantData";
import { OrderCard } from "./OrderCard";
import { Flame, Star, CheckCircle2 } from "lucide-react";

interface KanbanColumnProps {
  title: string;
  type: Order["status"];
  orders: Order[];
  onAvanzar: (id: string) => void;
}

const COLUMN_CONFIG = {
  nuevo: {
    color: "text-red-500",
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    icon: <Flame size={18} className="animate-pulse" />,
    label: "Nuevas Comandas"
  },
  preparando: {
    color: "text-amber-500",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    icon: <Star size={18} className="animate-spin duration-3000" />,
    label: "En Preparación"
  },
  listo: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
    icon: <CheckCircle2 size={18} />,
    label: "Listos para Mesa"
  }
};

export function KanbanColumn({ title, type, orders, onAvanzar }: KanbanColumnProps) {
  const cfg = COLUMN_CONFIG[type];

  return (
    <div className="flex flex-col gap-5 min-w-0">
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${cfg.bg} ${cfg.color} border ${cfg.border} shadow-sm`}>
            {cfg.icon}
          </div>
          <div>
            <h2 className="font-display font-black text-[15px] uppercase tracking-tighter text-text m-0">{title}</h2>
            <p className={`text-[10px] font-black uppercase tracking-widest leading-none mt-1 ${cfg.color}`}>{cfg.label}</p>
          </div>
        </div>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shadow-inner ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          {orders.length}
        </span>
      </div>

      <div className="space-y-5">
        {orders.map((pedido) => (
          <OrderCard key={pedido.id} pedido={pedido} onAvanzar={onAvanzar} />
        ))}
        {orders.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-border/40 rounded-[32px] opacity-20 group hover:opacity-40 transition-opacity">
            <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
               {cfg.icon}
            </div>
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Columna Vacía</p>
          </div>
        )}
      </div>
    </div>
  );
}
