"use client";

import React, { useState } from "react";
import { 
  Pencil, 
  Trash2, 
  ImageOff, 
  Clock, 
  ToggleLeft, 
  ToggleRight 
} from "lucide-react";
import { type MenuItem } from "@/features/shared/data/restaurantData";
import { TagBadge } from "./TagBadge";

export function MenuCard({
  item,
  color,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  color: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`bg-surface rounded-3xl border border-border group transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col overflow-hidden ${
        item.available ? "opacity-100" : "opacity-70 bg-surface-alt/50"
      }`}
    >
      {/* Image / Placeholder Area */}
      <div 
        className="h-36 flex items-center justify-center relative shrink-0 overflow-hidden"
        style={{ backgroundColor: `${color}10` }}
      >
        <ImageOff className="opacity-30 group-hover:scale-110 transition-transform duration-500" size={32} style={{ color }} />
        
        {/* Hover Actions Overlay */}
        <div 
            className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300 backdrop-blur-[2px] bg-black/10 ${
                hover ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
        >
          <button
            onClick={onEdit}
            className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-brand hover:text-white transition-colors border-none cursor-pointer text-text"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-colors border-none cursor-pointer text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Status Badge */}
        <span 
          className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
            item.available 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-red-50 text-red-600 border-red-100"
          }`}
        >
          {item.available ? "Disponible" : "No disponible"}
        </span>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex justify-between items-start gap-4">
          <h4 className="font-display font-black text-[15px] text-text leading-snug m-0 group-hover:text-brand transition-colors">
            {item.name}
          </h4>
          <span className="font-display font-black text-lg text-brand shrink-0">
            ${item.price}
          </span>
        </div>

        <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 m-0 flex-1">
          {item.description}
        </p>

        <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-tight">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-text-muted" /> {item.prepTime} min
          </span>
          <span className="w-1 h-1 bg-border rounded-full" />
          <span>{item.calories} kcal</span>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {item.tags.map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
        )}

        <div className="mt-2 pt-4 border-t border-border/50">
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 text-xs font-bold border-none bg-transparent cursor-pointer transition-all p-0 ${
              item.available ? "text-emerald-600" : "text-text-muted"
            }`}
          >
            {item.available ? (
              <ToggleRight size={22} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={22} className="text-text-muted/40" />
            )}
            {item.available ? "Platillo Activo" : "Platillo Inactivo"}
          </button>
        </div>
      </div>
    </div>
  );
}
