"use client";

import React from "react";
import { CheckCircle2, Clock, Package, UtensilsCrossed, ChevronRight } from "lucide-react";

interface TrackingTabProps {
  order: any;
  onGoToMenu: () => void;
}

export function TrackingTab({ order, onGoToMenu }: TrackingTabProps) {
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-surface-alt/50 border border-border rounded-[40px] flex items-center justify-center mb-6 text-text-muted shadow-sm">
           <Package size={40} className="opacity-20" />
        </div>
        <h2 className="font-display font-black text-2xl text-text m-0 mb-2">Sin Pedido Activo</h2>
        <p className="text-sm text-text-muted max-w-xs mb-8">Parece que aún no has pedido nada. ¡Explora nuestro menú y disfruta de la mejor cocina!</p>
        <button 
          onClick={onGoToMenu}
          className="bg-brand text-white font-display font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 transition-all active:scale-95"
        >
          Explorar Menú <ChevronRight size={16} className="inline ml-1" />
        </button>
      </div>
    );
  }

  const steps = [
    { label: 'Pedido recibido', icon: <CheckCircle2 size={16} />, done: true },
    { label: 'Preparando sabores', icon: <UtensilsCrossed size={16} />, done: order.estado !== 'confirmado' },
    { label: 'Listo para mesa', icon: <Package size={16} />, done: order.estado === 'listo' },
  ];

  return (
    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Estado Vital */}
      <section className="bg-gradient-to-br from-brand/10 to-brand-dark/5 border border-brand/20 rounded-[40px] p-12 text-center shadow-xl shadow-brand/5 relative overflow-hidden group">
        <div className="absolute top-[-20px] left-[-20px] text-8xl opacity-[0.03] rotate-[-15deg] group-hover:scale-110 transition-transform duration-1000">🍳</div>
        <div className="relative z-10">
          <div className="text-6xl mb-6 animate-bounce duration-[2000ms]">
            {order.estado === 'confirmado' ? '✅' : order.estado === 'preparando' ? '👨‍🍳' : '🥘'}
          </div>
          <p className="text-[11px] font-black text-brand uppercase tracking-[0.3em] mb-2 leading-none">Orden {order.id}</p>
          <h3 className="font-display font-black text-3xl text-text m-0 tracking-tight leading-none mb-4">
            {order.estado === 'confirmado' ? '¡Tu pedido fue confirmado!' : order.estado === 'preparando' ? 'El Chef está preparando...' : '¡Listo para servir!'}
          </h3>
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-brand/10 shadow-sm">
             <Clock size={16} className="text-brand" />
             <span className="text-[12px] font-bold text-text-sec uppercase tracking-widest leading-none">
                Entrega estimada en: <span className="text-brand font-black">{order.tiempo}</span>
             </span>
          </div>
        </div>
      </section>

      {/* Timeline Visual */}
      <section className="bg-surface border border-border rounded-[32px] p-8 shadow-sm">
        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-8 px-2">Hoja de Ruta del Sabor</h4>
        <div className="flex flex-col gap-6 relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border/40" />
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-6 relative z-10 group">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 shadow-lg ${
                  step.done 
                    ? 'bg-emerald-600 text-white scale-110' 
                    : 'bg-surface-alt text-text-muted border border-border flex flex-col group-hover:border-brand/40'
                }`}
              >
                {step.done ? step.icon : <div className="w-2.5 h-2.5 bg-text-muted/30 rounded-full group-hover:bg-brand/40 transition-colors" />}
              </div>
              <div className="flex flex-col">
                 <span className={`text-[14px] font-black uppercase tracking-tight transition-colors ${step.done ? 'text-text' : 'text-text-muted'}`}>
                    {step.label}
                 </span>
                 {step.done && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Completado</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resumen del Pedido Activo */}
      <section className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-border bg-surface-alt/30">
          <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] m-0">Detalle de Selección</h4>
        </div>
        <div className="p-8 space-y-4">
           {order.items.map((item: any) => (
             <div key={item.id} className="flex justify-between items-center group">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
                  <span className="text-[13px] font-bold text-text-sec transition-colors group-hover:text-text">{item.nombre} <span className="text-text-muted/60 opacity-60 ml-1">x{item.qty}</span></span>
               </div>
               <span className="text-[14px] font-black text-text tracking-tighter">${(item.precio * item.qty).toFixed(2)}</span>
             </div>
           ))}
           <div className="h-px bg-border/50 my-4" />
           <div className="flex justify-between items-center px-2">
             <span className="text-[12px] font-black text-text uppercase tracking-widest">Total del Pedido</span>
             <span className="text-3xl font-black text-brand tracking-tighter">${order.total.toFixed(2)}</span>
           </div>
        </div>
      </section>
    </div>
  );
}
