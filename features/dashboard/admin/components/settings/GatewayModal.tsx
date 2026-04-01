"use client";

import React from "react";
import { X, Lock, CheckCircle2, Globe, ShieldCheck } from "lucide-react";
import { type Gateway } from "../../data/settingsMock";

const inpClass = "w-full p-3 border border-border rounded-xl text-[14px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface";
const lblClass = "block text-[11px] font-black text-text-muted uppercase tracking-widest mb-1.5";

export function GatewayModal({ 
  gw, 
  onClose 
}: { 
  gw: Gateway, 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1a1208]/45 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface rounded-[32px] shadow-[0_32px_80px_rgba(26,18,8,0.2)] w-full max-w-[520px] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border bg-surface-alt flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl filter drop-shadow-sm">{gw.logo}</span>
            <div>
              <h3 className="font-display font-black text-2xl text-text m-0 tracking-tight leading-none mb-1.5">
                Configurar {gw.name}
              </h3>
              <p className="text-[11px] font-bold text-text-muted m-0 uppercase tracking-wide">
                Configuración técnica de la pasarela
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

        {/* Form Body */}
        <div className="px-8 py-7 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <label className={lblClass}>API Key (Producción)</label>
            <div className="relative group">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                defaultValue={gw.apiKey}
                className={`${inpClass} pl-10 font-mono text-[13px]`}
              />
            </div>
          </div>

          <div>
            <label className={lblClass}>Secret Key</label>
            <div className="relative group">
              <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                placeholder="••••••••••••••••••••••••••••"
                className={`${inpClass} pl-10`}
              />
            </div>
          </div>

          <div>
             <label className={lblClass}>Webhook URL</label>
             <div className="relative group">
               <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
               <input
                 defaultValue={`https://quijote.mx/api/webhooks/${gw.name.toLowerCase()}`}
                 className={`${inpClass} pl-10 text-text-sec text-[12px] font-medium`}
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className={lblClass}>Entorno</label>
                <select className={inpClass}>
                   <option>Producción (Live)</option>
                   <option>Sandbox (Test)</option>
                </select>
             </div>
             <div>
                <label className={lblClass}>Moneda Base</label>
                <select className={inpClass}>
                   <option>MXN – Peso Mexicano</option>
                   <option>USD – Dólar</option>
                </select>
             </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-4 animate-in fade-in duration-700">
             <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
             <p className="text-[12px] font-black text-emerald-800 m-0">
                Conexión verificada · Última prueba hace 5 min
             </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-surface-alt/50 flex justify-between items-center gap-4">
          <button 
            className="px-6 py-2.5 rounded-xl border border-border bg-white text-xs font-black text-text-sec hover:bg-surface transition-all active:scale-95 shadow-sm"
          >
            Probar Conexión
          </button>
          <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="px-6 py-2.5 rounded-xl border-none text-xs font-black text-text-muted hover:text-text transition-all bg-transparent"
             >
                Cancelar
             </button>
             <button 
               onClick={onClose}
               className="px-8 py-2.5 rounded-xl border-none bg-brand text-white text-xs font-black shadow-md hover:shadow-xl hover:-translate-y-px transition-all active:translate-y-0"
             >
                Guardar Cambios
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
