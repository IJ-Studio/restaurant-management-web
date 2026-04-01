import React from 'react';
import { TrendingDown, Calendar, User, Info } from 'lucide-react';
import { type Merma } from '@/features/shared/data/restaurantData';

interface MermaListProps {
  mermas: Merma[];
}

const REASON_MAP: Record<string, { label: string, color: string, bg: string }> = {
  caducidad: { label: "Caducidad", color: "text-red-700", bg: "bg-red-50" },
  accidente: { label: "Accidente", color: "text-amber-700", bg: "bg-amber-50" },
  calidad: { label: "Baja Calidad", color: "text-violet-700", bg: "bg-violet-50" },
  coccion: { label: "Merma Cocción", color: "text-sky-700", bg: "bg-sky-50" },
  otro: { label: "Otro", color: "text-gray-700", bg: "bg-gray-50" },
};

export function MermaList({ mermas }: MermaListProps) {
  if (mermas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface-alt/50 rounded-3xl border-2 border-dashed border-border/60">
        <TrendingDown size={48} className="text-text-muted/30 mb-4" />
        <p className="text-sm font-bold text-text-muted">No hay mermas registradas.</p>
        <p className="text-xs text-text-muted/60 mt-1">El historial de pérdidas se mostrará aquí.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {mermas.map((m) => {
        const reason = REASON_MAP[m.reason] || { label: m.reason, color: "text-gray-700", bg: "bg-gray-50" };
        
        return (
          <div key={m.id} className="bg-surface rounded-2xl border border-border p-5 flex gap-6 items-start hover:shadow-md transition-shadow group">
            <div className={`shrink-0 p-3 ${reason.bg} ${reason.color} rounded-xl shadow-sm self-start group-hover:scale-105 transition-transform`}>
              <TrendingDown size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <div>
                  <h4 className="font-display font-black text-base text-text m-0 group-hover:text-red-600 transition-colors">
                    {m.productName} 
                    <span className="text-text-muted font-normal ml-3 text-sm">−{m.quantity} {m.unit}</span>
                  </h4>
                  <div className="flex flex-wrap gap-4 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-text-muted font-bold">
                      <Calendar size={12}/> {m.date}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-text-muted font-bold">
                      <User size={12}/> {m.reportedBy}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${reason.bg} ${reason.color} border border-current/10`}>
                    {reason.label}
                  </span>
                  <span className="text-xl font-display font-black text-red-600">
                    −${m.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-surface-alt/50 rounded-2xl border border-border/50 text-[12px] text-text-sec leading-relaxed flex gap-3">
                <Info size={14} className="shrink-0 text-text-muted mt-0.5"/>
                <p className="m-0 font-medium whitespace-pre-wrap italic">
                  "{m.justification || 'Sin justificación detallada'}"
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
