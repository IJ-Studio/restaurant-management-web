"use client";

import React, { useState } from "react";
import {
  Eye,
  CheckCircle2,
  Save,
  RefreshCw,
  Globe
} from "lucide-react";

import {
  INITIAL_ABOUT_INFO,
  type RestaurantInfo,
  type Schedule
} from "@/features/dashboard/admin/data/aboutMock";

import { AboutPreviewModal } from "@/features/dashboard/admin/components/AboutPreviewModal";

import { IdentitySection } from "@/features/dashboard/admin/components/about/IdentitySection";
import { ContactSection } from "@/features/dashboard/admin/components/about/ContactSection";
import { ScheduleSection } from "@/features/dashboard/admin/components/about/ScheduleSection";
import { FeaturesSection } from "@/features/dashboard/admin/components/about/FeaturesSection";
import { GallerySection } from "@/features/dashboard/admin/components/about/GallerySection";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AboutPage() {
  const [info, setInfo] = useState<RestaurantInfo>(INITIAL_ABOUT_INFO);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  // Field Handlers
  function updateField<K extends keyof RestaurantInfo>(field: K, value: RestaurantInfo[K]) {
    setInfo((prev) => ({ ...prev, [field]: value }));
  }

  function updateSchedule(idx: number, field: keyof Schedule, value: string | boolean) {
    setInfo((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s, j) => (j !== idx ? s : { ...s, [field]: value })),
    }));
  }

  function addFeature(icon: string, text: string) {
    setInfo((prev) => ({
      ...prev,
      features: [...prev.features, { id: Date.now(), icon, text }],
    }));
  }

  function removeFeature(id: number) {
    setInfo((prev) => ({ ...prev, features: prev.features.filter((f) => f.id !== id) }));
  }

  function addGallery(url: string, caption: string) {
    setInfo((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        { id: Date.now(), url, caption, order: prev.gallery.length + 1 },
      ],
    }));
  }

  function removeGallery(id: number) {
    setInfo((prev) => ({ ...prev, gallery: prev.gallery.filter((g) => g.id !== id) }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="about" user={{ name: "Admin" }} />
      <main className="flex-1 ml-[260px] p-8 md:p-10 min-w-0 max-w-[1200px]">
        {/* Header */}
        <header className="flex justify-between items-start mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
              Información del Restaurante
            </h1>
            <p className="text-sm text-text-muted m-0 font-medium">
              Personaliza el escaparate digital de tu marca. Estos datos alimentan la landing page pública.
            </p>
          </div>

          <div className="flex gap-3">   
            <button
              onClick={() => setPreview(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-border bg-white text-text-sec hover:bg-surface-alt hover:shadow-md transition-all active:scale-95 shadow-sm"
            >
              <Eye size={16} /> Vista Previa
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-none text-white transition-all shadow-lg
                ${saved
                  ? "bg-emerald-600 shadow-emerald-600/20"
                  : "bg-brand hover:shadow-brand/30 hover:-translate-y-1 active:translate-y-0 active:scale-95"
                }
              `}
            >
              {saved ? (
                <><CheckCircle2 size={16} className="animate-in zoom-in" /> Publicado</>
              ) : (
                <><Save size={16} /> Publicar Cambios</>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Sections Grid */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">

          {/* 1. Identity & Presentation */}
          <IdentitySection info={info} onChange={updateField} />

          {/* 2. Contact & Location */}
          <ContactSection info={info} onChange={updateField} />

          {/* 3. Schedule Logic */}
          <ScheduleSection schedule={info.schedule} onChange={updateSchedule} />

          {/* 4. Brand Features */}
          <FeaturesSection
            features={info.features}
            onAdd={addFeature}
            onRemove={removeFeature}
          />

          {/* 5. Visual Gallery */}
          <GallerySection
            gallery={info.gallery}
            onAdd={addGallery}
            onRemove={removeGallery}
          />
        </div>

        {/* Footer Floating Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-700">
           <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-xl px-4 py-3 rounded-full border border-border shadow-2xl ring-1 ring-black/5 min-w-[340px] justify-between">
              <button
                onClick={() => setInfo(INITIAL_ABOUT_INFO)}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-text-sec hover:bg-surface hover:text-red-500 transition-all font-body border border-transparent hover:border-red-100"
              >
                 <RefreshCw size={14} /> Restablecer
              </button>

              <div className="w-px h-6 bg-border mx-2" />

              <div className="flex items-center gap-2">
                 <button
                  onClick={() => setPreview(true)}
                  className="p-2 rounded-full border border-border bg-white text-text-muted hover:text-brand hover:border-brand/40 transition-colors shadow-sm"
                 >
                    <Globe size={18} />
                 </button>
                 <button
                   onClick={handleSave}
                   className={`flex items-center gap-2 px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none text-white transition-all
                     ${saved ? "bg-emerald-600" : "bg-brand hover:shadow-lg"}
                   `}
                 >
                    {saved ? "Éxito" : "Finalizar Edición"}
                 </button>
              </div>
           </div>
        </div>

        {/* Spacing for floating bar */}
        <div className="h-32" />

        {/* Modal Preview */}
        {preview && (
          <AboutPreviewModal
            info={info}
            onClose={() => setPreview(false)}
          />
        )}
      </main>
    </div>
  );
}
