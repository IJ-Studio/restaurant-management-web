"use client";

import React, { useState } from "react";
import { X, CheckCircle2, DollarSign, Wallet, CreditCard, Smartphone } from "lucide-react";
import { type Ticket, PAYMENT_METHODS, type PaymentMethod } from "@/features/dashboard/cajero/data/cajeroMock";

interface BillingModalProps {
  ticket: Ticket;
  onClose: () => void;
  onConfirm: (metodo: string, efectivo?: number) => void;
}

export function BillingModal({ ticket, onClose, onConfirm }: BillingModalProps) {
  const [metodo, setMetodo] = useState('efectivo');
  const [efectivo, setEfectivo] = useState("");

  const subtotal = ticket.total * 0.84;
  const iva = ticket.total * 0.16;
  const efectivoNum = parseFloat(efectivo) || 0;
  const cambio = Math.max(0, efectivoNum - ticket.total);
  const isValid = metodo !== 'efectivo' || (efectivoNum >= ticket.total);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-surface rounded-[40px] border border-border shadow-[0_32px_80px_rgba(26,18,8,0.15)] overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header Modal */}
        <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-surface-alt/20">
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Operación de Caja</p>
            <h2 className="font-display font-black text-3xl text-text m-0 tracking-tight leading-none">
              Cobrar <span className="text-brand">Ticket {ticket.id}</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white border border-border rounded-2xl hover:bg-surface-alt transition-colors shadow-sm"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Detalle Ticket */}
        <div className="px-10 py-8 space-y-5">
           <div className="p-6 rounded-[28px] bg-surface border border-emerald-100/60 shadow-inner flex flex-col gap-4">
              <div className="flex justify-between items-center">
                 <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">Mesa • Comensal</span>
                 <span className="text-[13px] font-black text-text-sec">{ticket.mesa} • {ticket.cliente}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-text-muted font-bold">Subtotal Imponible</span>
                 <span className="text-text font-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-text-muted font-bold">IVA (16%)</span>
                 <span className="text-text font-black">${iva.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border/50 my-1" />
              <div className="flex justify-between items-center">
                 <span className="text-md font-black text-text uppercase tracking-widest">Importe Total</span>
                 <span className="text-4xl font-black text-emerald-600 tracking-tighter">${ticket.total.toFixed(2)}</span>
              </div>
           </div>

           {/* Métodos Pago */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Selección de Método de Pago</p>
              <div className="grid grid-cols-3 gap-3">
                 {PAYMENT_METHODS.map((m: PaymentMethod) => {
                    const active = metodo === m.id;
                    return (
                       <button
                         key={m.id}
                         onClick={() => setMetodo(m.id)}
                         className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[24px] border transition-all duration-300 active:scale-95 ${
                            active 
                               ? "bg-emerald-50 border-emerald-500/20 text-emerald-600 shadow-lg shadow-emerald-500/10" 
                               : "bg-surface border-border text-text-muted hover:border-emerald-500/10 hover:bg-emerald-50/20"
                         }`}
                       >
                          <div className={`p-2.5 rounded-xl transition-colors ${active ? "bg-emerald-500 text-white" : "bg-surface-alt/50"}`}>
                             {m.icon}
                          </div>
                          <span className="text-[12px] font-black uppercase tracking-widest">{m.label}</span>
                       </button>
                    )
                 })}
              </div>
           </div>

           {/* Entrada Efectivo */}
           {metodo === 'efectivo' && (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Efectivo Recibido</p>
                 <div className="relative group">
                    <DollarSign size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
                    <input 
                      type="number"
                      autoFocus
                      className="w-full pl-12 pr-6 py-4 bg-surface border-2 border-border/80 rounded-2xl text-2xl font-black focus:outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5 shadow-inner transition-all placeholder:text-text-muted/20"
                      placeholder={`Min. $${ticket.total.toFixed(2)}`}
                      value={efectivo}
                      onChange={(e) => setEfectivo(e.target.value)}
                    />
                 </div>
                 {efectivoNum > 0 && efectivoNum < ticket.total && (
                   <p className="text-[11px] font-black text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-2">
                      La cantidad ingresada es inferior al total.
                   </p>
                 )}
                 {efectivoNum >= ticket.total && (
                    <div className="flex justify-between items-center p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in fade-in duration-700">
                       <span className="text-[12px] font-black text-emerald-700 uppercase tracking-widest">Cambio Sugerido</span>
                       <span className="text-2xl font-black text-emerald-600">${cambio.toFixed(2)}</span>
                    </div>
                 )}
              </div>
           )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-border bg-surface-alt/10 flex gap-4">
           <button 
             onClick={onClose}
             className="flex-1 py-4 text-[13px] font-black uppercase tracking-widest text-text-muted hover:bg-white rounded-2xl border border-transparent hover:border-border transition-all transition-colors active:scale-95"
           >
              Cancelar
           </button>
           <button 
             disabled={!isValid}
             onClick={() => onConfirm(metodo, efectivoNum)}
             className="flex-[2] py-4 bg-emerald-600 text-white text-[13px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0"
           >
              Confirmar Cobro Exitoso
           </button>
        </div>
      </div>
    </div>
  );
}
