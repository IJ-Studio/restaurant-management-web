"use client";

import React, { useState } from "react";
import { Search, Star, Clock, Plus, Tag, Filter } from "lucide-react";
import { 
  type MenuItem, 
  type MenuCategory 
} from "@/features/shared/data/restaurantData";

interface MenuTabProps {
  menu: MenuCategory[];
  onAddToCart: (item: MenuItem) => void;
}

export function MenuTab({ menu, onAddToCart }: MenuTabProps) {
  const [categoria, setCategoria] = useState("Todo");
  const [busqueda, setBusqueda] = useState("");

  const categoriasUnicas = ["Todo", ...menu.map((c) => c.name)];

  const allItems = menu.flatMap((c) => c.items);
  const filtrados = allItems.filter((item) => {
    const coincideCat = categoria === "Todo" || menu.find((c) => c.name === categoria)?.items.some((i) => i.id === item.id);
    const coincideBusq = item.name.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusq;
  });

  return (
    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface border border-border rounded-2xl flex items-center justify-center text-brand shadow-sm">
               <Filter size={20} />
            </div>
            <div>
               <h2 className="font-display font-black text-2xl text-text m-0 tracking-tight leading-none mb-1.5">Nuestro Menú Completto</h2>
               <p className="text-[11px] font-black text-text-muted uppercase tracking-widest leading-none">Delicias españolas e internacionales</p>
            </div>
         </div>

         {/* Search Bar */}
         <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={16}/>
            <input
               value={busqueda}
               onChange={e => setBusqueda(e.target.value)}
               placeholder="Busca por platillo..."
               className="w-full bg-surface-alt/40 border border-border/80 rounded-2xl py-3.5 pl-11 pr-5 text-[13px] font-bold focus:outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5 focus:bg-surface transition-all shadow-sm"
            />
         </div>
      </div>

      {/* Categorías Slider */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide px-2">
        {categoriasUnicas.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all duration-300 border-2 active:scale-95 ${
              categoria === cat
                ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 -translate-y-1"
                : "bg-surface-alt/50 border-transparent text-text-muted hover:border-brand/20 hover:text-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
        {filtrados.map((item) => (
          <div
            key={item.id}
            className="bg-surface border border-border rounded-[32px] overflow-hidden flex group hover:border-brand/30 hover:shadow-xl transition-all duration-500"
          >
            <div className="relative w-36 sm:w-44 shrink-0 overflow-hidden bg-surface-alt">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl">🥘</div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="absolute top-3 left-3 bg-brand text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg border border-white/20">
                  <Tag size={10} /> {item.tags[0]}
                </div>
              )}
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <p className="font-display font-black text-[15px] text-text m-0 leading-tight mb-2 uppercase tracking-tight">
                  {item.name}
                </p>
                <div className="flex items-center gap-4 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1 font-bold">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" /> 4.9
                  </span>
                  <span className="flex items-center gap-1 font-bold uppercase tracking-widest">
                    <Clock size={11} /> {item.prepTime ?? 15} min
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="text-brand font-black text-2xl tracking-tighter leading-none">
                  ${item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-surface-alt hover:bg-brand text-text hover:text-white border border-border hover:border-brand/40 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-90 flex items-center gap-2 group/btn"
                >
                  <Plus size={14} className="group-hover/btn:rotate-90 transition-transform" /> Agregar
                </button>
              </div>
            </div>
          </div>
        ))}

         {filtrados.length === 0 && (
            <div className="col-span-full py-24 text-center">
               <div className="w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-6 opacity-30 border-2 border-dashed border-text-muted">
                  <Search size={32} />
               </div>
               <p className="text-[13px] font-black text-text-muted uppercase tracking-widest">No encontramos platillos con ese filtro...</p>
               <button 
                  onClick={() => { setCategoria('Todo'); setBusqueda(''); }}
                  className="mt-6 text-brand font-black text-[11px] uppercase tracking-widest hover:underline"
               >
                  Ver todos los sabores
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
