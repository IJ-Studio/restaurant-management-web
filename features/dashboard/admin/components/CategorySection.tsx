"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus 
} from "lucide-react";
import { type MenuCategory, type MenuItem } from "@/features/shared/data/restaurantData";
import { MenuCard } from "./MenuCard";

export function CategorySection({
  category,
  search,
  filterAvail,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: MenuCategory;
  search: string;
  filterAvail: "all" | "available" | "unavailable";
  onAdd: (id: string) => void;
  onToggle: (cId: string, iId: string | number) => void;
  onEdit: (cId: string, item: MenuItem) => void;
  onDelete: (cId: string, iId: string | number) => void;
}) {
  const [open, setOpen] = useState(true);
  const filtered = category.items.filter((i) => {
    const ms =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    const ma =
      filterAvail === "all"
        ? true
        : filterAvail === "available"
        ? i.available
        : !i.available;
    return ms && ma;
  });

  if (search && filtered.length === 0) return null;

  return (
    <div className="mb-12">
      <div 
        onClick={() => setOpen(!open)} 
        className="flex items-center justify-between mb-6 cursor-pointer group select-none"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-sm"
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
          >
            {category.icon}
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-text m-0 tracking-tight group-hover:text-brand transition-colors">
              {category.name}
            </h3>
            <p className="text-xs font-bold text-text-muted m-0 mt-0.5 uppercase tracking-wide">
              {filtered.length} platillo{filtered.length !== 1 ? "s" : ""} · {filtered.filter(i => i.available).length} activos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(category.id);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-none font-black text-xs cursor-pointer transition-all hover:shadow-lg active:scale-95"
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
          >
            <Plus size={14} /> Nuevo
          </button>
          <div className={`p-2 rounded-full transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"} text-text-muted/40`}>
             <ChevronUp size={20} />
          </div>
        </div>
      </div>

      <div 
          className="h-px w-full mb-6" 
          style={{ background: `linear-gradient(to right, ${category.color}40, transparent)` }} 
      />

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in slide-in-from-top-2 duration-500">
          {filtered.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              color={category.color}
              onToggle={() => onToggle(category.id, item.id)}
              onEdit={() => onEdit(category.id, item)}
              onDelete={() => onDelete(category.id, item.id)}
            />
          ))}
          
          <button
            onClick={() => onAdd(category.id)}
            className="group h-[320px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer hover:shadow-xl hover:translate-y-[-4px]"
            style={{ 
              borderColor: `${category.color}30`, 
              backgroundColor: `${category.color}05`,
              color: category.color
            }}
          >
            <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all"
                style={{ backgroundColor: `${category.color}15` }}
            >
              <Plus size={24} />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-text-sec group-hover:text-brand transition-colors">
              Agregar platillo
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
