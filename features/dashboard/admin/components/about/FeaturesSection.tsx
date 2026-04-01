"use client";

import React, { useState } from "react";
import { Star, Plus, X } from "lucide-react";
import { AboutSection } from "./AboutSection";
import { type Feature } from "../../data/aboutMock";

interface FeaturesSectionProps {
  features: Feature[];
  onAdd: (icon: string, text: string) => void;
  onRemove: (id: number) => void;
}

const inpClass = "px-4 py-2.5 rounded-xl border border-border text-[13px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface";

export function FeaturesSection({ features, onAdd, onRemove }: FeaturesSectionProps) {
  const [newFeature, setNewFeature] = useState("");
  const [newIcon, setNewIcon] = useState("✨");

  function handleAdd() {
    if (!newFeature.trim()) return;
    onAdd(newIcon, newFeature.trim());
    setNewFeature("");
    setNewIcon("✨");
  }

  return (
    <AboutSection title="Características y Servicios" icon={<Star size={18} />}>
      <div className="flex flex-wrap gap-3 mb-8 animate-in fade-in duration-500">
        {features.map((f) => (
          <div 
            key={f.id} 
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-surface border border-border shadow-sm group hover:border-brand/40 hover:shadow-md transition-all duration-300 active:scale-95"
          >
            <span className="text-lg animate-in zoom-in-50 duration-700">{f.icon}</span>
            <span className="text-[13px] font-black text-text-sec transition-colors group-hover:text-text">{f.text}</span>
            <button 
              onClick={() => onRemove(f.id)} 
              className="p-1 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {features.length === 0 && (
          <p className="text-[13px] font-bold text-text-muted italic py-4">No hay características definidas aún.</p>
        )}
      </div>

      <div className="p-6 bg-surface-alt/40 rounded-3xl border border-border/60 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
        <div className="flex flex-col gap-1.5 w-full sm:w-24">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Icono</label>
          <input 
            className={`${inpClass} text-center text-lg`} 
            value={newIcon} 
            onChange={(e) => setNewIcon(e.target.value)} 
            placeholder="✨" 
            maxLength={2} 
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1 w-full">
           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Descripción de la ventaja</label>
           <input 
            className={inpClass} 
            value={newFeature} 
            onChange={(e) => setNewFeature(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleAdd()} 
            placeholder="Ej. Estacionamiento incluido, Vista panorámica..." 
           />
        </div>
        <button 
          onClick={handleAdd} 
          className="flex items-center justify-center gap-2 px-8 py-2.5 bg-brand text-white text-sm font-black rounded-xl shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 shrink-0"
        >
          <Plus size={16} /> Agregar Beneficio
        </button>
      </div>
    </AboutSection>
  );
}
