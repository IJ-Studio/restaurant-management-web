"use client";

import React, { useState } from "react";
import { 
  X, 
  ToggleLeft, 
  ToggleRight, 
  ChefHat 
} from "lucide-react";
import { type MenuItem, type MenuCategory } from "@/features/shared/data/restaurantData";
import { type TagKey, TAG_CONFIG } from "../data/menuMock";

const inpClass =
  "w-full px-4 py-3 border border-border bg-surface rounded-2xl text-[14px] text-text font-body outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm";
const lblClass = "block text-[11px] font-black text-text-muted uppercase tracking-widest mb-2";

export function ItemModal({
  catId,
  categories,
  item,
  onClose,
  onSave,
}: {
  catId: string;
  categories: MenuCategory[];
  item: MenuItem | null;
  onClose: () => void;
  onSave: (cId: string, data: Partial<MenuItem>) => void;
}) {
  const [form, setForm] = useState<Partial<MenuItem>>(
    item ?? {
      name: "",
      description: "",
      price: 0,
      available: true,
      tags: [],
      prepTime: 10,
      calories: 0,
    }
  );

  const tagKeys = Object.keys(TAG_CONFIG) as TagKey[];
  const cat = categories.find((c) => c.id === catId);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface rounded-[32px] shadow-[0_32px_80px_rgba(26,18,8,0.2)] w-full max-w-[560px] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-7 border-b border-border bg-surface-alt flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white"
                style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}
            >
              {cat?.icon || <ChefHat size={20} />}
            </div>
            <div>
              <h2 className="font-display font-black text-2xl text-text m-0 tracking-tight leading-none mb-1.5">
                {item ? "Editar platillo" : "Nuevo platillo"}
              </h2>
              <p className="text-xs font-bold text-text-muted m-0 uppercase tracking-wide">
                Categoría: <span style={{ color: cat?.color }}>{cat?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white border border-border rounded-xl cursor-pointer flex text-text-muted/40 hover:text-text hover:bg-border transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-8 py-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
          <div>
            <label className={lblClass}>Nombre del platillo *</label>
            <input
              className={inpClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Pollo en salsa verde"
            />
          </div>

          <div>
            <label className={lblClass}>Descripción</label>
            <textarea
              className={`${inpClass} min-h-[100px] resize-none py-3`}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe los ingredientes principales y el modo de preparación..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lblClass}>Precio ($)</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={lblClass}>Prep. (min)</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.prepTime}
                onChange={(e) => setForm({ ...form, prepTime: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={lblClass}>Calorías</label>
              <input
                type="number"
                min={0}
                className={inpClass}
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className={lblClass}>Etiquetas del menú</label>
            <div className="flex flex-wrap gap-2.5 p-4 bg-surface-alt rounded-[22px] border border-border">
              {tagKeys.map((t) => {
                const cfg = TAG_CONFIG[t];
                const selected = form.tags?.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        tags: selected
                          ? form.tags?.filter((x) => x !== t)
                          : [...(form.tags ?? []), t],
                      })
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight cursor-pointer transition-all border-2 ${
                      selected
                        ? `${cfg.bgClass} ${cfg.colorClass} border-[currentColor]`
                        : "bg-surface text-text-muted/40 border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-surface-alt rounded-[22px] border border-border shadow-sm">
            <div>
                <p className="text-[14px] font-black text-text m-0">Disponibilidad inmediata</p>
                <p className="text-[11px] text-text-muted m-0 font-medium tracking-wide uppercase mt-1">Habilita o deshabilita este platillo en el menú</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`w-14 h-8 rounded-full border-none cursor-pointer transition-all relative flex items-center p-1 ${
                form.available ? "bg-emerald-500 shadow-[0_2px_12px_rgba(16,185,129,0.3)]" : "bg-border"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${
                  form.available ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-surface-alt flex justify-end gap-3.5">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-[13px] font-black border-none cursor-pointer bg-white text-text-muted hover:bg-border hover:text-text transition-all tracking-widest uppercase"
          >
            Cancelar
          </button>
          <button
            disabled={!form.name}
            onClick={() => {
              onSave(catId, form);
              onClose();
            }}
            className={`px-8 py-3 rounded-2xl text-[13px] font-black border-none cursor-pointer text-white transition-all tracking-widest uppercase ${
              form.name
                ? "bg-brand shadow-[0_8px_24px_rgba(232,93,4,0.3)] hover:-translate-y-px active:translate-y-px"
                : "bg-border text-text-muted"
            }`}
          >
            {item ? "Guardar cambios" : "Publicar platillo"}
          </button>
        </div>
      </div>
    </div>
  );
}
