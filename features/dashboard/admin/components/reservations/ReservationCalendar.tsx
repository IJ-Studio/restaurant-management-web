"use client";

import React from "react";
import { Table, Calendar, Info } from "lucide-react";
import type { DiningTable, Reservation } from "@/features/shared/data/restaurantData";

interface ReservationCalendarProps {
  tables: DiningTable[];
  reservations: Reservation[];
  selectedDate: string;
}

export function ReservationCalendar({ tables, reservations, selectedDate }: ReservationCalendarProps) {
  // Generar slots de tiempo (ej: 18:00 a 23:00)
  const timeSlots = Array.from({ length: 6 }, (_, i) => `${18 + i}:00`);

  const getReservationInSlot = (tableId: number | string, date: string, time: string) => {
    return reservations.find(r => 
      r.status === "confirmada" && 
      r.tableId === tableId && 
      r.date === date && 
      r.startTime === time
    );
  };

  return (
    <div className="bg-white rounded-[24px] border border-border p-6 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-black text-text-sec flex items-center gap-2">
          <Table size={20} className="text-brand"/> Mapa de Disponibilidad
        </h3>
        <span className="text-xs font-bold text-text-muted flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-xl">
          <Calendar size={14}/> {selectedDate}
        </span>
      </div>

      <div className="min-w-[800px]">
        {/* Cabecera de Horas */}
        <div className="grid grid-cols-[160px_1fr] border-b border-border mb-4">
          <div className="p-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Mesa / Zona</div>
          <div className="grid grid-cols-6">
            {timeSlots.map(slot => (
              <div key={slot} className="p-3 text-[10px] font-black text-text-muted text-center border-l border-border/50 uppercase tracking-widest">
                {slot}
              </div>
            ))}
          </div>
        </div>

        {/* Filas por Mesa */}
        <div className="flex flex-col gap-2">
          {tables.map(table => (
            <div key={table.id} className="grid grid-cols-[160px_1fr] bg-surface-alt/50 rounded-2xl group hover:bg-surface-alt transition-colors">
              <div className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl text-white ${table.status === 'libre' ? 'bg-emerald-500' : 'bg-brand shadow-sm'}`}>
                  <Table size={16}/>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-sec">{table.name}</span>
                  <span className="text-[10px] font-bold text-text-muted">Cap: {table.capacity}p</span>
                </div>
              </div>
              
              <div className="grid grid-cols-6 p-1 gap-1">
                {timeSlots.map(slot => {
                  const res = getReservationInSlot(table.id, selectedDate, slot);
                  return (
                    <div 
                      key={slot} 
                      className={`h-full min-h-[60px] rounded-xl flex items-center justify-center border border-dashed transition-all ${
                        res 
                          ? 'bg-brand/90 text-white border-brand shadow-sm scale-[0.98]' 
                          : 'border-border bg-white group-hover:border-brand/30 hover:border-brand cursor-pointer'
                      }`}
                    >
                      {res ? (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase text-white/90">Reservado</span>
                          <span className="text-[9px] font-bold text-white/80">{res.customerName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-text-muted uppercase opacity-0 group-hover:opacity-100">+ Reservar</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md border border-dashed border-border bg-white"></div>
          <span className="text-[11px] font-bold text-text-muted">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-brand shadow-sm"></div>
          <span className="text-[11px] font-bold text-text-muted">Confirmada</span>
        </div>
        <div className="flex items-center gap-2 ml-auto text-[11px] text-text-muted bg-brand/5 px-4 py-2 rounded-xl border border-brand/10">
          <Info size={14} className="text-brand"/> Cada bloque representa 90 minutos de permanencia estimada.
        </div>
      </div>
    </div>
  );
}
