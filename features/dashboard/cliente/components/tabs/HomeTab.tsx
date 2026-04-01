"use client";

import React from "react";
import { ChevronRight, Tag, Flame, CheckCircle2, Star, Plus } from "lucide-react";
import { 
  type MenuItem, 
  type MenuCategory 
} from "@/features/shared/data/restaurantData";
import { 
  type Promotion, 
  type ClientOrder, 
  PROMOCIONES, 
  HISTORIAL 
} from "@/features/dashboard/cliente/data/clienteMock";
import { SettingsService } from "@/features/shared/services/dataService";

interface HomeTabProps {
  user: any;
  menu: MenuCategory[];
  onGoToMenu: () => void;
  onAddToCart: (item: MenuItem) => void;
  onReorder: (order: ClientOrder) => void;
}

export function HomeTab({ user, menu, onGoToMenu, onAddToCart, onReorder }: HomeTabProps) {
  const settings = SettingsService.getSettings();
  const allItems = menu.flatMap(c => c.items);
  const trending = allItems.filter(i => i.tags?.includes("popular"));
  const lastOrder = HISTORIAL[0];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-brand/10 to-brand-dark/5 border border-brand/20 rounded-[40px] p-10 overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-700">
        <div className="absolute -right-10 -top-10 text-[180px] opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 duration-1000">
          {settings.logoEmoji}
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="text-brand text-[11px] font-black uppercase tracking-[0.3em] mb-3">{settings.heroTitle}</p>
          <h1 className="text-4xl font-display font-black tracking-tight mb-3 text-text">
            Hola, <span className="text-brand">{user?.name || 'Comensal'}</span> 👋
          </h1>
          <p className="text-text-muted text-sm mb-8 font-medium">{settings.heroSubtitle}</p>
          <button
            onClick={onGoToMenu}
            className="group/btn bg-brand text-white font-display font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 active:translate-y-0 active:scale-95 flex items-center gap-3"
          >
            {settings.heroButtonText} 
            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Promociones Grid */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="font-display font-black text-xl text-text m-0 tracking-tight">Especiales del Chef</h2>
          <span className="text-[10px] font-black text-brand bg-brand/5 border border-brand/10 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2">
             <Tag size={12} /> {PROMOCIONES.length} Activos
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROMOCIONES.map(promo => (
            <div 
              key={promo.id} 
              className={`bg-gradient-to-br ${promo.color} rounded-[32px] p-7 p-6 relative overflow-hidden shadow-lg shadow-black/5 group hover:-translate-y-1 transition-all duration-500`}
            >
              <div className="absolute right-[-10px] top-[-10px] text-7xl opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700">{promo.emoji}</div>
              <div className="relative z-10">
                <p className="font-display font-black text-xl text-white leading-tight mb-2 m-0">{promo.titulo}</p>
                <p className="text-white/80 text-[13px] font-medium mb-4 m-0">{promo.desc}</p>
                <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                   Válido: {promo.hasta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Más Vendidos Horizontal Scroll / Grid */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="font-display font-black text-xl text-text m-0 tracking-tight flex items-center gap-3">
             <Flame size={20} className="text-brand animate-pulse" /> Tendencias
          </h2>
          <button 
            onClick={onGoToMenu} 
            className="text-[10px] font-black text-brand uppercase tracking-widest hover:translate-x-1 transition-transform"
          >
            Ver Catálogo <ChevronRight size={14} className="inline ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {trending.map(item => (
            <div 
              key={item.id} 
              className="bg-surface border border-border rounded-[32px] overflow-hidden group hover:border-brand/40 hover:shadow-xl transition-all duration-500"
            >
              <div className="relative h-40 overflow-hidden bg-surface-alt">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl">🍔</div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[9px] font-black px-2.5 py-1.5 rounded-full text-brand uppercase tracking-widest border border-white/10 shadow-lg">
                    {item.tags[0]}
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="font-display font-black text-[14px] text-text mb-2 truncate leading-none">{item.name}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                     <span className="text-brand font-black text-lg tracking-tighter">${item.price.toFixed(2)}</span>
                     <div className="flex items-center gap-1 opacity-60">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold text-text-muted">4.8</span>
                     </div>
                  </div>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="w-10 h-10 bg-brand text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:scale-110 active:scale-95"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reciente Re-Ordering */}
      {lastOrder && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <h2 className="font-display font-black text-xl text-text mb-6 px-2">Repetir Pedido Favorito</h2>
          <div className="bg-surface border border-border rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-500 group">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-[24px] flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <p className="font-display font-black text-xl text-text m-0">{lastOrder.id}</p>
                   <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest border border-emerald-100">Entregado</span>
                </div>
                <p className="text-xs text-text-muted font-bold m-0">{lastOrder.items.join(', ')}</p>
                <p className="text-[10px] text-text-muted/60 mt-1.5 uppercase font-black tracking-widest">{lastOrder.fecha}</p>
              </div>
            </div>
            <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
              <div className="flex-1 md:flex-initial text-center md:text-right">
                <p className="text-[11px] font-black text-text-muted m-0 uppercase tracking-widest">Importe Total</p>
                <p className="font-display font-black text-2xl text-brand tracking-tighter m-0">${lastOrder.total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => onReorder(lastOrder)}
                className="flex-1 md:flex-initial bg-surface-alt hover:bg-brand/10 text-text-sec hover:text-brand border border-border hover:border-brand/20 font-display font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
