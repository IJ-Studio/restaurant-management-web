"use client";

import React from "react";
import { Palette, Type, Square, Layout, Check } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { SettingRow } from "../SettingRow";
import { type SystemAppearance } from "@/features/shared/data/restaurantData";

interface AppearanceSectionProps {
  appearance: SystemAppearance;
  onChange: (key: keyof SystemAppearance, value: any) => void;
}

const FONT_OPTIONS = [
  { label: "Serif Elegante (Fraunces)", value: "Fraunces" },
  { label: "Sans Moderno (DM Sans)", value: "DM Sans" },
  { label: "Geométrico (Inter)", value: "Inter" },
  { label: "Sistema (system-ui)", value: "system-ui" },
];

const RADIUS_OPTIONS: { label: string; value: SystemAppearance["borderRadius"] }[] = [
  { label: "Recto", value: "none" },
  { label: "Sutil", value: "small" },
  { label: "Estándar", value: "medium" },
  { label: "Redondeado", value: "large" },
  { label: "Extra", value: "full" },
];

export function AppearanceSection({ appearance, onChange }: AppearanceSectionProps) {
  return (
    <SectionCard
      icon={<Palette size={20} />}
      title="Sistema de Diseño y Apariencia"
      subtitle="Personaliza los colores, tipografía y formas de la interfaz"
      color="#8b5cf6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Colors Column */}
        <div className="space-y-8">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-text-muted mb-6 flex items-center gap-2">
            <Palette size={12} className="text-purple-500" /> Paleta de Colores
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-text-sec pl-1">Color de Marca (Primario)</label>
              <div className="flex items-center gap-3 p-3 bg-surface-alt border border-border rounded-2xl">
                <input
                  type="color"
                  value={appearance.primaryColor}
                  onChange={(e) => onChange("primaryColor", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={appearance.primaryColor}
                  onChange={(e) => onChange("primaryColor", e.target.value)}
                  className="flex-1 bg-transparent border-none font-mono text-xs font-bold text-text outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-text-sec pl-1">Color Secundario</label>
              <div className="flex items-center gap-3 p-3 bg-surface-alt border border-border rounded-2xl">
                <input
                  type="color"
                  value={appearance.secondaryColor}
                  onChange={(e) => onChange("secondaryColor", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input
                  type="text"
                  value={appearance.secondaryColor}
                  onChange={(e) => onChange("secondaryColor", e.target.value)}
                  className="flex-1 bg-transparent border-none font-mono text-xs font-bold text-text outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
             <p className="text-[11px] text-purple-700 font-medium m-0 leading-relaxed">
               <strong>Tip:</strong> El sistema generará automáticamente variantes de estos colores para estados como 
               <em> hover, active y focus</em>, manteniendo la armonía visual.
             </p>
          </div>
        </div>

        {/* Typography & Radius Column */}
        <div className="space-y-8">
           <p className="text-[10px] font-black uppercase tracking-[.2em] text-text-muted mb-6 flex items-center gap-2">
            <Type size={12} className="text-purple-500" /> Tipografía y Formas
          </p>

          <div className="space-y-6">
             <div className="space-y-3">
                <label className="text-[11px] font-bold text-text-sec pl-1">Fuente para Títulos (Display)</label>
                <select
                  value={appearance.fontDisplay}
                  onChange={(e) => onChange("fontDisplay", e.target.value)}
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-bold text-text outline-none appearance-none cursor-pointer"
                >
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
             </div>

             <div className="space-y-3">
                <label className="text-[11px] font-bold text-text-sec pl-1">Fuente para Cuerpo de Texto (Body)</label>
                <select
                  value={appearance.fontBody}
                  onChange={(e) => onChange("fontBody", e.target.value)}
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-bold text-text outline-none appearance-none cursor-pointer"
                >
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
             </div>

             <div className="space-y-3">
                <label className="text-[11px] font-bold text-text-sec pl-1">Intensidad de Redondeo (Bordes)</label>
                <div className="grid grid-cols-5 gap-2">
                   {RADIUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onChange("borderRadius", opt.value)}
                        className={`py-2 text-[10px] font-black uppercase border rounded-xl transition-all ${
                          appearance.borderRadius === opt.value
                            ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20"
                            : "bg-surface border-border text-text-muted hover:border-purple-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
