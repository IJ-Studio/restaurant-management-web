"use client";

import React from "react";
import { Type, Smile, Hash, Star } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { SettingRow } from "../SettingRow";
import { type SystemSettings } from "@/features/shared/data/restaurantData";

interface BrandingSectionProps {
  settings: SystemSettings;
  onChange: (key: keyof SystemSettings, value: any) => void;
}

export function BrandingSection({ settings, onChange }: BrandingSectionProps) {
  return (
    <SectionCard
      icon={<Star size={20} />}
      title="Identidad de Marca"
      subtitle="Define el nombre, logo y estilo visual de tu restaurante"
      color="var(--color-brand)"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Restaurante Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Type size={12} /> Nombre del Restaurante
          </label>
          <input
            type="text"
            value={settings.restaurantName}
            onChange={(e) => onChange("restaurantName", e.target.value)}
            className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-display font-black text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-inner"
            placeholder="Ej. El Quijote"
          />
        </div>

        {/* Short Name / Logo Text */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Hash size={12} /> Iniciales / Logo Corto
          </label>
          <input
            type="text"
            maxLength={3}
            value={settings.shortName}
            onChange={(e) => onChange("shortName", e.target.value)}
            className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-display font-black text-center text-brand text-xl focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-inner uppercase"
            placeholder="Q"
          />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Tagline / Slogan */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Star size={12} /> Eslogan o Lema
          </label>
          <input
            type="text"
            value={settings.tagline}
            onChange={(e) => onChange("tagline", e.target.value)}
            className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-bold text-text-sec focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all shadow-inner"
            placeholder="Sabor con Alma"
          />
        </div>

        {/* Logo Emoji */}
        <SettingRow 
          label="Icono de Marca (Emoji)" 
          description="Se utiliza como alternativa al logo en notificaciones y decoraciones"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-surface-alt border border-border rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                {settings.logoEmoji}
             </div>
             <input
               type="text"
               value={settings.logoEmoji}
               onChange={(e) => onChange("logoEmoji", e.target.value)}
               className="w-20 px-4 py-3 bg-white border border-border rounded-xl text-center text-xl focus:border-brand outline-none transition-all"
               placeholder="🍔"
             />
          </div>
        </SettingRow>
      </div>
    </SectionCard>
  );
}
