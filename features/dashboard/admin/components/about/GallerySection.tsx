"use client";

import React, { useState } from "react";
import { Camera, Trash2, Plus, ImagePlus } from "lucide-react";
import { AboutSection } from "./AboutSection";
import { type Gallery } from "../../data/aboutMock";

interface GallerySectionProps {
  gallery: Gallery[];
  onAdd: (url: string, caption: string) => void;
  onRemove: (id: number) => void;
}

const inpClass = "w-full px-4 py-2.5 rounded-xl border border-border text-[13px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface";

export function GallerySection({ gallery, onAdd, onRemove }: GallerySectionProps) {
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");

  function handleAdd() {
    if (!newUrl.trim()) return;
    onAdd(newUrl.trim(), newCaption.trim());
    setNewUrl("");
    setNewCaption("");
  }

  return (
    <AboutSection title="Galería Visual" icon={<Camera size={18} />}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {gallery.map((g) => (
          <div 
            key={g.id} 
            className="group relative aspect-square rounded-2xl border border-border overflow-hidden bg-surface-alt/50 shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.02] active:scale-95"
          >
             <img 
               src={g.url} 
               alt={g.caption} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"; }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
               <p className="text-[11px] font-black text-white m-0 truncate leading-none mb-2 drop-shadow-lg">{g.caption || "Sin descripción"}</p>
               <button 
                 onClick={() => onRemove(g.id)} 
                 className="flex items-center justify-center gap-2 w-full py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 transition-colors shadow-lg"
               >
                 <Trash2 size={12} /> Eliminar
               </button>
             </div>
          </div>
        ))}
        <div className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 group hover:border-brand/40 hover:bg-brand/5 hover:text-brand transition-all cursor-pointer select-none">
           <div className="w-10 h-10 rounded-full bg-surface-alt border border-border flex items-center justify-center group-hover:bg-white transition-colors group-hover:scale-110">
              <ImagePlus size={18} />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-text-muted transition-colors group-hover:text-brand">Cargar Imagen</span>
        </div>
      </div>

      <div className="p-6 bg-surface-alt/40 rounded-3xl border border-border/60 space-y-4">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Integrar nuevo recurso audiovisual</p>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
           <div className="flex flex-col gap-1.5 flex-1 w-full">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">URL de la imagen (JPG, PNG, WEBP)</label>
              <input 
               className={inpClass} 
               value={newUrl} 
               onChange={(e) => setNewUrl(e.target.value)} 
               placeholder="https://images.unsplash.com/photo-..." 
              />
           </div>
           <div className="flex flex-col gap-1.5 flex-1 w-full">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Descripción corta</label>
              <input 
               className={inpClass} 
               value={newCaption} 
               onChange={(e) => setNewCaption(e.target.value)} 
               placeholder="Ej. Salón principal al atardecer..." 
              />
           </div>
           <button 
             onClick={handleAdd} 
             className="flex items-center justify-center gap-2 px-8 py-2.5 bg-brand text-white text-sm font-black rounded-xl shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 shrink-0"
           >
             <Plus size={16} /> Agregar Requisito
           </button>
        </div>
      </div>
    </AboutSection>
  );
}
