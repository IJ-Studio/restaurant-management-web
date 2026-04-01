import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface StockAlertBannerProps {
  criticosCount: number;
  onViewInventory: () => void;
  onDismiss: () => void;
}

export function StockAlertBanner({ criticosCount, onViewInventory, onDismiss }: StockAlertBannerProps) {
  if (criticosCount === 0) return null;

  return (
    <div className="mb-8 bg-red-50 border border-red-100 rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-red-500/5 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/20">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="font-display font-black text-lg text-red-900 m-0">¡Atención, Stock Crítico Detectado!</h4>
          <p className="text-[12px] font-bold text-red-600/80 m-0 uppercase tracking-widest mt-1">
            {criticosCount} ingredientes necesitan reposición inmediata para evitar paros en cocina.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button 
          onClick={onViewInventory}
          className="flex-1 sm:flex-initial px-8 py-3.5 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/20 hover:shadow-red-600/30 hover:-translate-y-1 transition-all active:scale-95"
        >
          Ver Inventario
        </button>
        <button 
          onClick={onDismiss}
          className="p-3.5 bg-white border border-red-200 text-red-400 rounded-2xl hover:bg-red-50 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
