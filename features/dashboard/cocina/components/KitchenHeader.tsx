import React from 'react';
import { Bell } from 'lucide-react';

interface KitchenHeaderProps {
  user: any;
  newOrdersCount: number;
  onInventoryClick: () => void;
  criticosCount: number;
}

export function KitchenHeader({ user, newOrdersCount, onInventoryClick, criticosCount }: KitchenHeaderProps) {
  const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
      <div>
        <h1 className="font-display font-black text-4xl tracking-tight leading-none mb-2 text-text m-0">
          Estación de Cocina
        </h1>
        <div className="flex items-center gap-3">
           <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" /> En Turno Activo
           </span>
           <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
              {time} · Tiempo Real
           </span>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
         <button 
           onClick={onInventoryClick}
           className={`flex-1 md:flex-initial flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
             criticosCount > 0 
               ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
               : "bg-surface border-border text-text-muted hover:border-brand/40"
           }`}
         >
            Inventario {criticosCount > 0 && `(${criticosCount})`}
         </button>
         
         <button className="p-3.5 bg-surface border border-border rounded-2xl text-text-muted hover:text-brand transition-all relative">
            <Bell size={20} />
            {newOrdersCount > 0 && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />}
         </button>

         <div className="hidden sm:flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-2.5 shadow-sm">
           <div className="w-9 h-9 bg-brand/10 text-brand rounded-xl flex items-center justify-center font-display font-black text-xs border border-brand/10 shadow-inner">
             {user?.name?.[0]}{user?.lastname?.[0] || 'C'}
           </div>
           <div className="min-w-0">
             <p className="text-[13px] font-black leading-none mb-1 truncate">{user?.name || 'Chef'}</p>
             <p className="text-[9px] text-brand uppercase font-black tracking-widest leading-none">Estación A</p>
           </div>
         </div>
      </div>
    </header>
  );
}
