import React from 'react';
import { Table2, Clock, Plus, PhoneCall } from 'lucide-react';
import { type DiningTable } from '@/features/shared/data/restaurantData';

interface TableCardProps {
  table: DiningTable;
  onOpen: (table: DiningTable) => void;
  onCallCajero: (id: string | number) => void;
  isCalling: boolean;
}

const STATUS_CONFIG: Record<string, any> = {
  libre: { bg: 'bg-white/5', border: 'border-white/5', text: 'text-gray-500', badge: 'bg-gray-500/10 text-gray-500', label: 'Libre' },
  ocupada: { bg: 'bg-brand/5', border: 'border-brand/15', text: 'text-brand-sec', badge: 'bg-brand/15 text-brand', label: 'Ocupada' },
  lista: { bg: 'bg-amber-500/8', border: 'border-amber-500/20', text: 'text-amber-300', badge: 'bg-amber-500/15 text-amber-400', label: 'Lista p/cobrar' },
};

export function TableCard({ table, onOpen, onCallCajero, isCalling }: TableCardProps) {
  const cfg = STATUS_CONFIG[table.status];

  return (
    <div className={`relative ${cfg.bg} border ${cfg.border} rounded-3xl p-5 transition-all group hover:shadow-lg hover:shadow-brand/5`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${table.status === 'libre' ? 'bg-white/5' : 'bg-brand/15'}`}>
          <Table2 size={18} className={cfg.text}/>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <p className="font-display font-black text-base">{table.name}</p>
      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Capacidad: {table.capacity}</p>

      {table.status !== 'libre' ? (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-text-muted flex items-center gap-1.5 font-bold">
            <Clock size={12}/> {table.lastUpdate || 'Activa'}
          </p>
          {table.currentOrderId && (
            <p className="text-[10px] text-brand/60 font-mono font-bold">{table.currentOrderId}</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-muted/40 mt-3 font-bold italic">Esperando clientes</p>
      )}

      {/* Actions */}
      <div className="mt-5 space-y-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
        {table.status === 'libre' && (
          <button
            onClick={() => onOpen(table)}
            className="w-full bg-brand hover:bg-brand-alt text-white text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20"
          >
            <Plus size={14}/> Tomar Pedido
          </button>
        )}
        {table.status === 'ocupada' && (
          <button
            onClick={() => onOpen(table)}
            className="w-full bg-white/10 hover:bg-brand/20 text-text-sec text-xs font-black py-2.5 rounded-xl transition-all"
          >
            Agregar Items
          </button>
        )}
        {(table.status === 'ocupada' || table.status === 'lista') && (
          <button
            onClick={() => onCallCajero(table.id)}
            className={`w-full text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isCalling
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 hover:bg-amber-500/15 hover:text-amber-400 text-text-muted border border-transparent'
            }`}
          >
            <PhoneCall size={13}/>
            {isCalling ? '¡Cajero notificado!' : 'Llamar Cajero'}
          </button>
        )}
      </div>
    </div>
  );
}
