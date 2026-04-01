"use client";

import React from "react";
import { 
  X, 
  Shield, 
  Check, 
  AlertTriangle, 
  Zap, 
  Lock 
} from "lucide-react";
import { 
  type StaffUser, 
  ROLES, 
  ALL_PERMS, 
  effectivePerms 
} from "../../data/usersMock";

export function AccessDrawer({
  user,
  onClose,
}: {
  user: StaffUser;
  onClose: () => void;
}) {
  const perms = effectivePerms(user);
  const r = ROLES[user.role];

  return (
    <div className="fixed inset-0 z-[110] flex animate-in slide-in-from-right duration-500 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="flex-1 bg-black/30 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Drawer Content */}
      <div 
        className="w-full max-w-[420px] bg-surface h-full shadow-[0_0_80px_rgba(26,18,8,0.3)] relative overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-8 border-b border-border bg-surface-alt/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-black text-xl text-text m-0 tracking-tight leading-none group">
              Accesos de <span className="text-brand group-hover:text-brand-dark transition-colors">{user.name}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 bg-white border border-border rounded-xl cursor-pointer flex text-text-muted/40 hover:text-text transition-all shadow-sm"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-border shadow-md flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
             <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white shrink-0"
                style={{ backgroundColor: `${r.color}15`, color: r.color }}
             >
                <Shield size={22} className="animate-pulse" />
             </div>
             <div>
                <p className="text-[14px] font-black m-0 leading-none mb-1.5" style={{ color: r.color }}>
                   Rol Central: {r.label}
                </p>
                <p className="text-[10px] font-bold text-text-muted m-0 uppercase tracking-widest leading-none">
                   Configuración operativa del sistema
                </p>
             </div>
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex-1 px-8 py-6 space-y-3">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[.2em] mb-4">Módulos del ecosistema</p>
          {ALL_PERMS.map((p) => {
            const has = perms.includes(p.key);
            const isCustom = user.customPerms.includes(p.key);
            const isRevoked = user.revokedPerms.includes(p.key);
            
            return (
              <div
                key={p.key}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  has ? "bg-surface border-emerald-100 shadow-sm" : "bg-surface-alt/40 border-border/40 opacity-50 grayscale select-none"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${has ? "scale-110" : "scale-100 opacity-50"}`}>{p.icon}</span>
                  <div>
                    <p className={`text-[13px] font-black m-0 leading-none mb-1 transition-colors ${has ? "text-text" : "text-text-muted"}`}>
                      {p.label}
                    </p>
                    <div className="flex gap-2">
                       {isCustom && (
                         <span className="text-[8px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20 uppercase">
                           Extra
                         </span>
                       )}
                       {isRevoked && (
                         <span className="text-[8px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 uppercase">
                           Restringido
                         </span>
                       )}
                    </div>
                  </div>
                </div>
                <div className={`p-1.5 rounded-xl border transition-all ${has ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-text-muted/40 border-border/50"}`}>
                   {has ? <Check size={14} /> : <Lock size={14} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="px-8 py-6 border-t border-border bg-surface-alt/10">
           <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-3">
                 <Zap size={16} className="text-brand" />
                 <p className="text-[11px] font-black text-text-sec uppercase tracking-widest leading-none">Cobertura de acceso</p>
              </div>
              <p className="text-[18px] font-black text-brand m-0 tracking-tight">{perms.length}/10</p>
           </div>
        </div>
      </div>
    </div>
  );
}
