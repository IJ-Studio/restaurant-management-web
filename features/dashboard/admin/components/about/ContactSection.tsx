"use client";

import React from "react";
import { MapPin, Phone, Mail, Globe, Instagram, Facebook, Twitter } from "lucide-react";
import { AboutSection } from "./AboutSection";
import { type RestaurantInfo } from "../../data/aboutMock";

interface ContactSectionProps {
  info: RestaurantInfo;
  onChange: <K extends keyof RestaurantInfo>(field: K, value: RestaurantInfo[K]) => void;
}

const inpClass = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-[13px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface";
const lblClass = "block text-[11px] font-black text-text-muted uppercase tracking-widest mb-1.5";

export function ContactSection({ info, onChange }: ContactSectionProps) {
  return (
    <AboutSection title="Contacto y Ubicación" icon={<MapPin size={18} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={lblClass}>Línea Telefónica</label>
          <div className="relative group">
            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
            <input 
              className={inpClass} 
              value={info.phone} 
              onChange={(e) => onChange("phone", e.target.value)} 
            />
          </div>
        </div>
        <div>
          <label className={lblClass}>Email de Reservaciones</label>
          <div className="relative group">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
            <input 
              type="email"
              className={inpClass} 
              value={info.email} 
              onChange={(e) => onChange("email", e.target.value)} 
            />
          </div>
        </div>
        <div>
          <label className={lblClass}>Sitio Web Oficial</label>
          <div className="relative group">
            <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
            <input 
              className={inpClass} 
              value={info.website} 
              onChange={(e) => onChange("website", e.target.value)} 
            />
          </div>
        </div>
        <div>
          <label className={lblClass}>Dirección Física</label>
          <div className="relative group">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
            <input 
              className={inpClass} 
              value={info.address} 
              onChange={(e) => onChange("address", e.target.value)} 
            />
          </div>
        </div>
        <div className="col-span-full">
          <label className={lblClass}>Enlace de Google Maps / Embed URL</label>
          <input 
            className={`${inpClass} pl-4 font-mono text-[11px]`} 
            value={info.mapEmbed} 
            onChange={(e) => onChange("mapEmbed", e.target.value)} 
            placeholder="Introduce la URL del mapa compartido o el link de Google Maps..."
          />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-border/60">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Presencia en el Ecosistema Social</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
             <label className={lblClass}>Instagram</label>
             <div className="relative group">
               <Instagram size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E1306C]" />
               <input className={inpClass} value={info.instagram} onChange={(e) => onChange("instagram", e.target.value)} />
             </div>
          </div>
          <div className="space-y-1.5">
             <label className={lblClass}>Facebook</label>
             <div className="relative group">
               <Facebook size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1877F2]" />
               <input className={inpClass} value={info.facebook} onChange={(e) => onChange("facebook", e.target.value)} />
             </div>
          </div>
          <div className="space-y-1.5">
             <label className={lblClass}>Twitter / X</label>
             <div className="relative group">
               <Twitter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text" />
               <input className={inpClass} value={info.twitter} onChange={(e) => onChange("twitter", e.target.value)} />
             </div>
          </div>
        </div>
      </div>
    </AboutSection>
  );
}
