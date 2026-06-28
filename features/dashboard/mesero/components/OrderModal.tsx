import React, { useState } from 'react';
import { X, Plus, UtensilsCrossed, ShoppingBag, Send } from 'lucide-react';
import { type DiningTable, type MenuCategory, type MenuItem, type OrderItem } from '@/features/shared/data/restaurantData';

interface OrderModalProps {
  table: DiningTable;
  menu: MenuCategory[];
  onClose: () => void;
  onSendOrder: (tableId: string | number, items: OrderItem[], discount: number) => void;
}

export function OrderModal({ table, menu, onClose, onSendOrder }: OrderModalProps) {
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(menu[0]?.id || '');
  const [discountType, setDiscountType] = useState<string>("none");
  const [discountValue, setDiscountValue] = useState<number>(0);

  const addItem = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeItem = (id: string | number) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(i => i.item.id !== id);
      return prev.map(i => i.item.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = subtotal * (Math.min(100, Math.max(0, discountValue)) / 100);
  } else if (discountType === "fixed") {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleSend = () => {
    const orderItems: OrderItem[] = cart.map(c => ({
      name: c.item.name,
      qty: c.qty,
      notes: ''
    }));
    onSendOrder(table.id, orderItems, discountAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-1 block">Nuevo Pedido</span>
            <h2 className="font-display font-black text-3xl text-white m-0">{table.name}</h2>
          </div>
          <button onClick={onClose} className="p-3 text-text-muted hover:text-white hover:bg-white/10 rounded-2xl transition-all">
            <X size={24}/>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {menu.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
                activeCategory === cat.id 
                  ? 'bg-brand border-brand text-white shadow-xl shadow-brand/20' 
                  : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1">
          {menu.find(c => c.id === activeCategory)?.items.map(item => (
            <button
              key={item.id}
              onClick={() => addItem(item)}
              className="w-full flex justify-between items-center bg-white/5 hover:bg-brand/10 border border-white/5 hover:border-brand/30 rounded-2xl px-6 py-5 mb-3 transition-all group text-left animate-in slide-in-from-left-4"
              disabled={!item.available}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-black text-base text-white">{item.name}</p>
                  {!item.available && (
                    <span className="text-[9px] font-black uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md">Agotado</span>
                  )}
                </div>
                <p className="text-xs text-text-muted line-clamp-1">{item.description}</p>
                <p className="text-brand font-black text-sm mt-1.5 flex items-center gap-1">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover:bg-brand group-hover:text-white transition-all shadow-inner">
                <Plus size={20}/>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full max-w-sm bg-[#0a0a0e] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right-8 duration-500">
        <div className="p-6 border-b border-white/10 bg-white/2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <ShoppingBag size={20}/>
            </div>
            <h3 className="font-display font-black text-xl text-white">Comanda</h3>
          </div>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{cart.length} platillos seleccionados</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <UtensilsCrossed size={48} className="mb-4"/>
              <p className="text-sm font-bold text-text-muted">La comanda está vacía</p>
              <p className="text-xs text-text-muted mt-1 px-10">Selecciona platillos del menú para agregarlos al pedido</p>
            </div>
          ) : (
            cart.map(cartItem => (
              <div key={cartItem.item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group animate-in zoom-in-95">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-sm text-white truncate">{cartItem.item.name}</p>
                  <p className="text-brand text-xs font-black mt-0.5">${(cartItem.item.price * cartItem.qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-xl border border-white/5 shadow-inner">
                  <button onClick={() => removeItem(cartItem.item.id)} className="w-8 h-8 rounded-lg bg-black/20 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-sm font-black transition-all">-</button>
                  <span className="w-6 text-center font-black text-sm text-white">{cartItem.qty}</span>
                  <button onClick={() => addItem(cartItem.item)} className="w-8 h-8 rounded-lg bg-black/20 hover:bg-brand/20 hover:text-brand flex items-center justify-center text-sm font-black transition-all">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white/2 border-t border-white/10 space-y-4 shadow-2xl">
          {/* Aplicar Descuento */}
          {cart.length > 0 && (
            <div className="space-y-2 border-b border-white/10 pb-4">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest">Aplicar Descuento</label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) => { setDiscountType(e.target.value); setDiscountValue(0); }}
                  className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand"
                >
                  <option value="none" className="bg-[#0a0a0e]">Sin Descuento</option>
                  <option value="percentage" className="bg-[#0a0a0e]">Porcentaje (%)</option>
                  <option value="fixed" className="bg-[#0a0a0e]">Monto Fijo ($)</option>
                </select>
                
                {discountType !== "none" && (
                  <input
                    type="number"
                    min="0"
                    max={discountType === "percentage" ? 100 : undefined}
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-24 bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand"
                    placeholder={discountType === "percentage" ? "%" : "$"}
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Estimado</p>
              <p className="font-display font-black text-3xl text-brand leading-none">${finalTotal.toFixed(2)}</p>
            </div>
            <p className="text-[10px] text-text-muted font-bold">Incluye Iva*</p>
          </div>

          <button
            onClick={handleSend}
            disabled={cart.length === 0}
            className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-brand-alt disabled:bg-white/5 disabled:text-text-muted/20 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-brand/20 active:scale-95 group"
          >
            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
            ENVIAR A COCINA
          </button>
        </div>
      </div>
    </div>
  );
}
