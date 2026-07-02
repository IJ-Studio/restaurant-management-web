'use client';
import { useEffect, useState } from 'react';
import { getTableMap } from '@/app/api/reservations/route';

interface Table {
  id: number;
  numero: string;
  capacidad: number;
  areaId: number;
  areaNombre: string;
  posicionX: number;
  posicionY: number;
  forma: string;
  estado: 'disponible' | 'ocupada';
  activa: boolean;
}

interface Props {
  selectedTableId?: number;
  onSelectTable: (tableId: number) => void;
  fechaHora?: string;
}

export default function TableMap({ selectedTableId, onSelectTable, fechaHora }: Props) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      if (!fechaHora) return;
      try {
        setLoading(true);
        const data = await getTableMap(fechaHora);
        setTables(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [fechaHora]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-surface border border-border rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand"></div>
        <span className="ml-3 text-text-sec text-sm mt-2">Buscando mesas disponibles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
        {error}
      </div>
    );
  }

  const areas = tables.reduce((acc, t) => {
    if (!acc[t.areaId]) acc[t.areaId] = { nombre: t.areaNombre, tables: [] };
    acc[t.areaId].tables.push(t);
    return acc;
  }, {} as Record<number, { nombre: string; tables: Table[] }>);

  return (
    <div className="space-y-8 bg-surface border border-border p-6 rounded-xl shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-text">Selecciona tu Mesa</h2>
        <p className="text-xs text-text-sec">Haz clic sobre la mesa disponible de tu preferencia.</p>
      </div>
      {Object.entries(areas).map(([areaId, area]) => (
        <div key={areaId}>
          <h3 className="text-sm font-bold tracking-wider text-text-sec uppercase mb-4 border-b border-border pb-1">
            {area.nombre}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {area.tables.map((table) => (
              <button
                key={table.id}
                type="button"
                onClick={() => {
                  if (table.estado === 'disponible') onSelectTable(table.id);
                }}
                disabled={table.estado === 'ocupada'}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-left w-full
                  ${table.estado === 'ocupada'
                    ? 'bg-surface-muted border-border cursor-not-allowed opacity-40'
                    : 'bg-surface hover:shadow-md hover:border-brand/50 cursor-pointer'
                  }
                  ${selectedTableId === table.id
                    ? 'border-brand ring-2 ring-brand/30 bg-brand/5'
                    : 'border-border'
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-base font-bold text-text">Mesa {table.numero}</span>
                  <span className="text-xs text-text-sec mt-0.5">Cap: {table.capacidad} pers.</span>
                  <div className="mt-2 text-[11px] font-medium">
                    {table.estado === 'disponible' ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                        Disponible
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                        Ocupada
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
