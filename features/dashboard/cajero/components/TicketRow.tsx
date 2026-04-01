"use client";

import React from "react";
import { Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { type Ticket } from "@/features/dashboard/cajero/data/cajeroMock";

interface TicketRowProps {
  ticket: Ticket;
  onAction: (ticket: Ticket) => void;
}

export function TicketRow({ ticket, onAction }: TicketRowProps) {
  const isPending = ticket.estado === 'pendiente';

  return (
    <div className="flex items-center justify-between px-6 py-5 hover:bg-surface-alt/40 transition-all group border-b border-border last:border-none">
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-sm shadow-inner border transition-transform group-hover:scale-110 duration-500 ${
          isPending 
            ? "bg-orange-50 text-orange-600 border-orange-100" 
            : "bg-emerald-50 text-emerald-600 border-emerald-100"
        }`}>
          {ticket.mesa.replace(/\D/g, '') || "P"}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-display font-black text-[15px] m-0 text-text leading-none">{ticket.mesa}</p>
            {!isPending && <CheckCircle2 size={12} className="text-emerald-500" />}
          </div>
          <p className="text-[11px] font-bold text-text-muted m-0 uppercase tracking-widest leading-none">
            {ticket.cliente} • {ticket.items} items • {ticket.tiempo}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className={`text-lg font-black m-0 leading-none mb-1 ${isPending ? "text-text" : "text-emerald-600"}`}>
            ${ticket.total.toFixed(2)}
          </p>
          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest m-0 leading-none">
            {isPending ? "Pendiente" : `Cobrado ${ticket.cobradoAt || ""}`}
          </p>
        </div>

        {isPending ? (
          <button
            onClick={() => onAction(ticket)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-[11px] font-black rounded-xl shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-x-1 transition-all active:scale-95"
          >
            Cobrar <ChevronRight size={14} />
          </button>
        ) : (
          <div className="w-[100px] flex justify-end">
             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">
                Cerrado
             </span>
          </div>
        )}
      </div>
    </div>
  );
}
