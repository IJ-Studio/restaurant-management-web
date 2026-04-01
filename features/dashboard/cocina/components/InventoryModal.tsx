"use client";

import React, { useState } from "react";
import { X, Package, AlertTriangle, CheckCircle2, ShoppingCart } from "lucide-react";
import { type InventoryProduct } from "@/features/shared/data/restaurantData";
import { InventoryService } from "@/features/shared/services/dataService";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const [notifEnviada, setNotifEnviada] = useState<string | null>(null);
  const [inventario, setInventario] = useState<InventoryProduct[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setInventario(InventoryService.getInventory());
    }
  }, [isOpen]);

  const enviarAlerta = (item: string) => {
    setNotifEnviada(item);
    setTimeout(() => setNotifEnviada(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-surface rounded-[40px] border border-border shadow-[0_32px_80px_rgba(26,18,8,0.15)] overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header Modal */}
        <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-surface-alt/20">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-brand/10 text-brand rounded-2xl flex items-center justify-center border border-brand/10">
                <Package size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Insumos Críticos</p>
                <h2 className="font-display font-black text-2xl text-text m-0 tracking-tight leading-none">Inventario de Cocina</h2>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white border border-border rounded-2xl hover:bg-surface-alt transition-all shadow-sm active:scale-95"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Listado de Insumos */}
        <div className="p-8 pb-10 space-y-4 max-h-[60vh] overflow-y-auto">
          {inventario.map((item) => {
            const pct = Math.min(100, (item.stock / (item.minStock * 1.5)) * 100);
            const isCrit = item.stock <= item.minStock;

             return (
               <div key={item.nombre} className={`p-6 rounded-[28px] border transition-all duration-300 group hover:shadow-xl ${isCrit ? "bg-red-50/40 border-red-100" : "bg-surface border-border/60"}`}>
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <p className="font-display font-black text-[15px] text-text m-0 leading-tight mb-1.5 uppercase tracking-tight">{item.nombre}</p>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isCrit ? "text-red-600" : "text-text-muted"}`}>
                              {item.stock} {item.unidad} disponibles
                           </span>
                           {isCrit && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
                        </div>
                     </div>

                     {isCrit && (
                        <button
                          onClick={() => enviarAlerta(item.nombre)}
                          className={`text-[9px] font-black uppercase px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-90 border tracking-widest ${
                             notifEnviada === item.nombre
                               ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20"
                               : "bg-red-500 text-white border-red-500 shadow-red-500/20 hover:bg-red-400"
                          }`}
                        >
                           {notifEnviada === item.nombre ? "Enviado ✓" : "Reponer"}
                        </button>
                     )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                     <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden border border-border/40 shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isCrit ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"}`}
                          style={{ width: `${pct}%` }}
                        />
                     </div>
                     <div className="flex justify-between text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">
                        <span>Mínimo: {item.minimo} {item.unidad}</span>
                        <span>{Math.round(pct)}%</span>
                     </div>
                  </div>
               </div>
             );
          })}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-border bg-surface-alt/10 flex gap-4">
           <button 
             className="flex-1 py-4 bg-brand text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 flex items-center justify-center gap-3 group"
           >
              Abrir Orden de Compra <ShoppingCart size={16} className="group-hover:rotate-12 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
}
