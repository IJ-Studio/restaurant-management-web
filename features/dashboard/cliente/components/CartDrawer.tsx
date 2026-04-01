"use client";

import React from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { type MenuItem } from "@/features/dashboard/cliente/data/clienteMock";

interface CartItem extends MenuItem {
  qty: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQty, onCheckout }: CartDrawerProps) {
  const total = items.reduce((s, i) => s + i.precio * i.qty, 0);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
        onClick={onClose} 
      />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-surface h-full flex flex-col shadow-[0_0_80px_rgba(26,18,8,0.3)] animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center bg-surface-alt/20">
          <div>
            <h3 className="font-display font-black text-2xl text-text m-0 tracking-tight">Tu Pedido</h3>
            <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mt-1">
              {totalItems} platillos seleccionados
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white border border-border rounded-2xl hover:bg-surface-alt transition-all shadow-sm active:scale-95"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
              <div className="w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mb-4 border border-border">
                <ShoppingBag size={32} className="text-text-muted" />
              </div>
              <p className="font-display font-black text-lg text-text mb-1">Carrito vacío</p>
              <p className="text-sm text-text-muted">Agrega deliciosos platillos de nuestro menú para comenzar.</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-4 rounded-3xl bg-surface border border-border shadow-sm group hover:border-brand/30 transition-all"
              >
                <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden">
                   <img src={item.img} alt={item.nombre} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black text-[14px] text-text m-0 truncate leading-none mb-1.5">{item.nombre}</p>
                  <p className="text-[15px] font-black text-brand m-0 leading-none">
                    ${(item.precio * item.qty).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-surface-alt/50 p-1.5 rounded-xl border border-border/40">
                  <button 
                    onClick={() => onUpdateQty(item.id, -1)} 
                    className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                  >
                    {item.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="w-6 text-center font-black text-sm text-text">{item.qty}</span>
                  <button 
                    onClick={() => onUpdateQty(item.id, 1)} 
                    className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-text-muted hover:text-brand hover:border-brand/10 transition-all active:scale-90"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 border-t border-border bg-surface shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="text-[13px] font-black text-text-muted uppercase tracking-[0.2em]">Total a pagar</span>
              <span className="text-3xl font-black text-text tracking-tighter">${total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={onCheckout}
              className="w-full py-5 bg-brand text-white font-display font-black text-sm uppercase tracking-widest rounded-3xl shadow-xl shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 flex items-center justify-center gap-3 group"
            >
              Confirmar Pedido <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-[10px] font-bold text-text-muted mt-5 uppercase tracking-[0.1em]">
              Impuestos incluidos • Pago al recibir en mesa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
