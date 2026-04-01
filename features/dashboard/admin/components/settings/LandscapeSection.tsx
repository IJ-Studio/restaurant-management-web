"use client";

import React from "react";
import { Layout, MessageSquare, List, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { SettingRow } from "../SettingRow";
import { type SystemSettings, type MenuCategory } from "@/features/shared/data/restaurantData";

interface LandscapeSectionProps {
  settings: SystemSettings;
  categories: MenuCategory[];
  onChange: (key: keyof SystemSettings, value: any) => void;
}

export function LandscapeSection({ settings, categories, onChange }: LandscapeSectionProps) {
  const toggleCategory = (id: string) => {
    const current = settings.featuredCategoryIds || [];
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    onChange("featuredCategoryIds", updated);
  };

  return (
    <SectionCard
      icon={<Layout size={20} />}
      title="Experiencia de Usuario (Landscape)"
      subtitle="Configura los textos y el contenido destacado en la pantalla principal del cliente"
      color="#2563eb"
    >
      <div className="space-y-10">
        {/* Banner Texts Group */}
        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-text-muted mb-4 flex items-center gap-2">
            <MessageSquare size={12} className="text-brand" /> Contenido del Hero Banner
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Título de Bienvenida</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => onChange("heroTitle", e.target.value)}
                className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-display font-black text-text focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Botón de Acción</label>
              <input
                type="text"
                value={settings.heroButtonText}
                onChange={(e) => onChange("heroButtonText", e.target.value)}
                className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-sec focus:border-brand-blue outline-none transition-all shadow-inner uppercase tracking-widest text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Subtítulo / Mensaje de Invitación</label>
            <textarea
              rows={2}
              value={settings.heroSubtitle}
              onChange={(e) => onChange("heroSubtitle", e.target.value)}
              className="w-full px-5 py-4 bg-surface-alt border border-border rounded-[24px] font-bold text-text-sec focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all shadow-inner resize-none"
            />
          </div>

          <div className="h-px bg-border/40 my-2" />

          {/* New Field for Login BG */}
          <div className="space-y-4 pt-2">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-text-muted mb-4 flex items-center gap-2">
              <ImageIcon size={12} className="text-brand" /> Personalización de Autenticación
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Imagen de Fondo (Login/Registro)</label>
              <div className="flex gap-4 items-center">
                 <input
                  type="text"
                  value={settings.loginBgImageUrl}
                  onChange={(e) => onChange("loginBgImageUrl", e.target.value)}
                  placeholder="URL de la imagen (Unsplash, Pixabay...)"
                  className="flex-1 px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-mono text-xs text-text-sec focus:border-brand-blue outline-none transition-all shadow-inner"
                />
                <div 
                  className="w-14 h-14 rounded-xl border border-border bg-cover bg-center overflow-hidden shrink-0 shadow-sm"
                  style={{ backgroundImage: `url(${settings.loginBgImageUrl})` }}
                  title="Vista previa"
                />
              </div>
              <p className="text-[9px] text-text-muted pl-1">
                * Se recomienda usar una URL de imagen de alta resolución (mínimo 1920x1080).
              </p>
            </div>
          </div>
        </div>

        {/* Featured Categories Selection */}
        <div className="pt-6 border-t border-border/60">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-text-muted mb-6 flex items-center gap-2">
            <List size={12} className="text-brand" /> Categorías Destacadas en Inicio
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const isSelected = settings.featuredCategoryIds?.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-4 rounded-[28px] border transition-all duration-300 flex flex-col items-center gap-3 group relative overflow-hidden ${
                    isSelected
                      ? "bg-brand/5 border-brand shadow-md"
                      : "bg-surface border-border/80 hover:border-brand/40"
                  }`}
                >
                  <div className={`text-2xl transition-transform duration-500 group-hover:scale-125 ${isSelected ? "animate-in zoom-in" : ""}`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? "text-brand" : "text-text-muted"}`}>
                    {cat.name}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-brand animate-in zoom-in">
                      <CheckCircle2 size={12} fill="currentColor" className="text-brand text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-[10px] font-medium text-text-muted italic">
            * Las categorías seleccionadas aparecerán en la pantalla de inicio del cliente para acceso rápido.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
