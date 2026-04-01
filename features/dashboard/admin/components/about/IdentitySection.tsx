"use client";

import React from "react";
import { Star } from "lucide-react";
import { AboutSection } from "./AboutSection";
import { type RestaurantInfo } from "../../data/aboutMock";

interface IdentitySectionProps {
  info: RestaurantInfo;
  onChange: <K extends keyof RestaurantInfo>(field: K, value: RestaurantInfo[K]) => void;
}

const inpClass = "w-full px-4 py-2.5 rounded-xl border border-border text-[13px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface";
const lblClass = "block text-[11px] font-black text-text-muted uppercase tracking-widest mb-1.5";

export function IdentitySection({ info, onChange }: IdentitySectionProps) {
  return (
    <AboutSection title="Identidad y Presentación" icon={<Star size={18} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={lblClass}>Nombre del Restaurante</label>
          <input 
            className={inpClass} 
            value={info.name} 
            onChange={(e) => onChange("name", e.target.value)} 
          />
        </div>
        <div>
          <label className={lblClass}>Slogan / Tagline</label>
          <input 
            className={inpClass} 
            value={info.slogan} 
            onChange={(e) => onChange("slogan", e.target.value)} 
          />
        </div>
        <div>
          <label className={lblClass}>Razón Social</label>
          <input 
            className={inpClass} 
            value={info.razonSocial} 
            onChange={(e) => onChange("razonSocial", e.target.value)} 
          />
        </div>
        <div>
          <label className={lblClass}>RFC Fiscal</label>
          <input 
            className={`${inpClass} font-mono font-bold uppercase tracking-widest`} 
            value={info.rfc} 
            maxLength={13}
            onChange={(e) => onChange("rfc", e.target.value.toUpperCase())} 
          />
        </div>
        <div className="col-span-full">
          <label className={lblClass}>Descripción Corta</label>
          <textarea 
            className={`${inpClass} min-h-[80px] resize-none`} 
            rows={2} 
            value={info.description} 
            onChange={(e) => onChange("description", e.target.value)} 
          />
        </div>
        <div className="col-span-full">
          <label className={lblClass}>Acerca de Nosotros / Historia</label>
          <textarea 
            className={`${inpClass} min-h-[140px] resize-none`} 
            rows={4} 
            value={info.history} 
            onChange={(e) => onChange("history", e.target.value)} 
          />
        </div>
      </div>
    </AboutSection>
  );
}
