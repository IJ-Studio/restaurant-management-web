"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  Lock 
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import { Toggle } from "../Toggle";
import { type Gateway, STATUS_CFG } from "../../data/settingsMock";

export function GatewaySection({ 
    gateways, 
    onToggle, 
    onConfigure 
}: { 
    gateways: Gateway[], 
    onToggle: (id: number) => void, 
    onConfigure: (gw: Gateway) => void 
}) {
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});

  return (
    <SectionCard
      icon={<CreditCard size={20} />}
      title="Pasarelas de pago"
      subtitle="Integración con plataformas de cobro con tarjeta y transferencia"
      color="var(--color-purple-600)"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gateways.map((gw) => {
          const sc = STATUS_CFG[gw.status];
          const keyVisible = showKeys[gw.id];
          return (
            <div
              key={gw.id}
              className={`p-6 rounded-[24px] border ${
                gw.status === "activo" ? "border-emerald-200 bg-emerald-50/20 shadow-sm" : "border-border bg-surface-alt/20"
              } transition-all duration-300 hover:shadow-lg group`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{gw.logo}</div>
                  <div>
                    <h4 className="font-display font-black text-lg text-text m-0 tracking-tight leading-none mb-1.5 group-hover:text-brand transition-colors">
                      {gw.name}
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sc.bgClass} ${sc.colorClass}`}>
                      {sc.label}
                    </span>
                  </div>
                </div>
                <Toggle 
                  value={gw.status === "activo"} 
                  onChange={() => onToggle(gw.id)} 
                  color="var(--color-ok)"
                />
              </div>

              {/* Commission & Methods */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 bg-surface rounded-2xl border border-border/50 shadow-sm">
                  <p className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1 leading-none">Comisión</p>
                  <p className="text-[15px] font-black text-brand m-0">{gw.commission}%</p>
                </div>
                <div className="col-span-2 p-3 bg-surface rounded-2xl border border-border/50 shadow-sm">
                   <p className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-2 leading-none">Métodos</p>
                   <div className="flex flex-wrap gap-1.5">
                      {gw.methods.map(m => (
                         <span key={m} className="px-2 py-0.5 bg-surface-alt/50 rounded-lg text-[9px] font-black text-text-sec uppercase border border-border/40 leading-none">
                            {m}
                         </span>
                      ))}
                   </div>
                </div>
              </div>

              {/* API Key View */}
              <div className="flex items-center gap-3 p-3 bg-surface rounded-2xl border border-border/50 mb-6 group/key hover:border-brand/40 transition-colors cursor-default">
                 <Lock size={14} className="text-text-muted shrink-0" />
                 <code className="text-[11px] font-mono font-black text-text-sec flex-1 truncate select-none border-none bg-transparent">
                    {keyVisible ? gw.apiKey.replace(/•/g, "x") : gw.apiKey}
                 </code>
                 <button 
                  onClick={() => setShowKeys(sk => ({ ...sk, [gw.id]: !sk[gw.id] }))}
                  className="p-1 px-2 hover:bg-surface-alt rounded-lg text-text-muted hover:text-brand transition-all border-none bg-transparent cursor-pointer"
                 >
                    {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                 </button>
              </div>

              <button
                onClick={() => onConfigure(gw)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-white font-black text-xs text-text-sec hover:bg-brand hover:text-white hover:border-brand shadow-sm transition-all"
              >
                <Settings size={14} /> Configurar Integración
              </button>
            </div>
          );
        })}
      </div>

      <button className="flex items-center justify-center gap-3 w-full mt-6 py-4 rounded-3xl border-2 border-dashed border-border-med text-sm font-black text-text-muted hover:border-brand hover:text-brand bg-transparent cursor-pointer transition-all active:scale-95">
        <Plus size={18} /> Agregar nueva pasarela
      </button>
    </SectionCard>
  );
}
