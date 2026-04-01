import React from 'react';
import { TableCard } from './TableCard';
import { type DiningTable } from '@/features/shared/data/restaurantData';
import { Inbox } from 'lucide-react';

interface TableGridProps {
  tables: DiningTable[];
  onOpenTable: (table: DiningTable) => void;
  onCallCajero: (id: string | number) => void;
  callingId: string | number | null;
}

export function TableGrid({ tables, onOpenTable, onCallCajero, callingId }: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface-alt/50 rounded-3xl border-2 border-dashed border-border/60">
        <Inbox size={48} className="text-text-muted/30 mb-4" />
        <p className="text-sm font-bold text-text-muted">No hay mesas configuradas.</p>
        <p className="text-xs text-text-muted/60 mt-1">Contacta al administrador para configurar el mapa del salón.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {tables.map(table => (
        <TableCard
          key={table.id}
          table={table}
          onOpen={onOpenTable}
          onCallCajero={onCallCajero}
          isCalling={callingId === table.id}
        />
      ))}
    </div>
  );
}
