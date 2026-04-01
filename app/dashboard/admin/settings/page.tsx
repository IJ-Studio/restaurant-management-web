"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  GATEWAYS_DEFAULT,
  type Gateway,
} from "@/features/dashboard/admin/data/settingsMock";

import { OfflineSection } from "@/features/dashboard/admin/components/settings/OfflineSection";
import { BackupSection } from "@/features/dashboard/admin/components/settings/BackupSection";
import { GatewaySection } from "@/features/dashboard/admin/components/settings/GatewaySection";
import { GatewayModal } from "@/features/dashboard/admin/components/settings/GatewayModal";
import { BrandingSection } from "@/features/dashboard/admin/components/settings/BrandingSection";
import { LandscapeSection } from "@/features/dashboard/admin/components/settings/LandscapeSection";
import { AppearanceSection } from "@/features/dashboard/admin/components/settings/AppearanceSection";

import { SettingsService, MenuService } from "@/features/shared/services/dataService";
import { type SystemSettings, type MenuCategory, type SystemAppearance } from "@/features/shared/data/restaurantData";
import { Save, CheckCircle2 } from "lucide-react";

// API Base configuration
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE : "/api").replace(/\/$/, "");
const IS_EXTERNAL_API = API.startsWith("http");

export default function SettingsPage() {
  const [gateways, setGateways] = useState<Gateway[]>(GATEWAYS_DEFAULT);
  const [gwModal, setGwModal] = useState<Gateway | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(SettingsService.getSettings());
  const [categories, setCategories] = useState<MenuCategory[]>(MenuService.getMenu());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

  function handleSettingsChange(key: keyof SystemSettings, value: any) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }

  function handleAppearanceChange(key: keyof SystemAppearance, value: any) {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value }
    }));
    setSaveSuccess(false);
  }

  function saveAllSettings() {
    setIsSaving(true);
    SettingsService.saveSettings(settings);
    // Dispatch event to update dynamic style provider
    window.dispatchEvent(new CustomEvent("design-system-update"));
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  }

  function toggleGwStatus(id: number) {
    setGateways((gs) =>
      gs.map((g) =>
        g.id !== id
          ? g
          : { ...g, status: g.status === "activo" ? "inactivo" : "activo" }
      )
    );
  }

  return (
    <main className="p-8 md:p-10 min-w-0">
      {/* Header Section */}
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
            Configuración del Sistema
          </h1>
          <p className="text-sm text-text-muted m-0">
            Gestiona la identidad de marca, experiencia de usuario y configuraciones técnicas.
          </p>
        </div>

        <button
          onClick={saveAllSettings}
          disabled={isSaving}
          className={`px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl ${
            saveSuccess 
              ? "bg-emerald-500 text-white shadow-emerald-500/20" 
              : "bg-brand text-white shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 active:translate-y-0 active:scale-95"
          }`}
        >
          {isSaving ? "Guardando..." : saveSuccess ? (<><CheckCircle2 size={16} /> Guardado</>) : (<><Save size={16} /> Guardar Cambios</>)}
        </button>
      </header>

      {/* Settings Sections Grid */}
      <div className="flex flex-col gap-8 max-w-[1200px] pb-20">
        {/* 1. Branding Identity */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <BrandingSection settings={settings} onChange={handleSettingsChange} />
        </div>

        {/* 2. UX & Landscape */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
          <LandscapeSection settings={settings} categories={categories} onChange={handleSettingsChange} />
        </div>

        {/* 3. Global Appearance */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <AppearanceSection appearance={settings.appearance} onChange={handleAppearanceChange} />
        </div>

        <div className="h-px bg-border/40 my-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted px-2">Configuración Técnica</p>

        {/* 3. Offline Mode */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <OfflineSection />
        </div>

        {/* 2. Backups & Database */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          <BackupSection API={API} isExternal={IS_EXTERNAL_API} />
        </div>

        {/* 3. Payment Gateways */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          <GatewaySection
            gateways={gateways}
            onToggle={toggleGwStatus}
            onConfigure={setGwModal}
          />
        </div>
      </div>

      {/* Gateway Configuration Modal */}
      {gwModal && (
        <GatewayModal 
          gw={gwModal} 
          onClose={() => setGwModal(null)} 
        />
      )}

      {/* Global Animations Style */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
