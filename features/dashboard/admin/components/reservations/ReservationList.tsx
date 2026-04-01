"use client";

import React from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Phone,
  Mail
} from "lucide-react";
import type { Reservation } from "@/features/shared/data/restaurantData";

interface ReservationListProps {
  reservations: Reservation[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onEdit: (res: Reservation) => void;
}

export function ReservationList({ reservations, onConfirm, onCancel, onEdit }: ReservationListProps) {
  const getStatusBadge = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmada":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold"><CheckCircle size={12}/> Confirmada</span>;
      case "cancelada":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold"><XCircle size={12}/> Cancelada</span>;
      case "modificada":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold"><AlertCircle size={12}/> Modificada</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold"><Clock size={12}/> Pendiente</span>;
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-border overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-wider">Fecha / Hora</th>
            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-wider">Personas</th>
            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-wider">Mesa</th>
            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reservations.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-text-muted text-sm">No hay reservas registradas.</td>
            </tr>
          ) : (
            reservations.map((res) => (
              <tr key={res.id} className="hover:bg-surface-alt transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-sec">{res.customerName}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-text-muted flex items-center gap-1"><Phone size={10}/> {res.customerPhone}</span>
                      <span className="text-[11px] text-text-muted flex items-center gap-1"><Mail size={10}/> {res.customerEmail}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-sec flex items-center gap-1.5">
                      <Calendar size={12} className="text-brand"/> {res.date}
                    </span>
                    <span className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                      <Clock size={12}/> {res.startTime} hrs
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-text-sec flex items-center gap-1.5">
                    <Users size={14} className="text-text-muted"/> {res.guests} comensales
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-text-sec">
                    {res.tableId ? `Mesa ${res.tableId}` : "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(res.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {res.status === "pendiente" && (
                      <button 
                        onClick={() => onConfirm(res.id)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Confirmar"
                      >
                        <CheckCircle size={16}/>
                      </button>
                    )}
                    <button 
                      onClick={() => onEdit(res)}
                      className="p-2 rounded-xl bg-surface-alt text-brand hover:bg-brand/10 transition-colors"
                      title="Editar"
                    >
                      <MoreVertical size={16}/>
                    </button>
                    {res.status !== "cancelada" && (
                      <button 
                        onClick={() => onCancel(res.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Cancelar"
                      >
                        <XCircle size={16}/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
