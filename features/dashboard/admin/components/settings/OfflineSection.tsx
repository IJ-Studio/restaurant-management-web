"use client";

import React, { useState } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle 
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import { SettingRow } from "../SettingRow";
import { Toggle } from "../Toggle";

export function OfflineSection() {
  const [offline, setOffline] = useState(false);
  const [offlineSync, setOfflineSync] = useState(true);
  const [offlinePedidos, setOfflinePedidos] = useState(true);
  const [offlineCaja, setOfflineCaja] = useState(true);
  const [offlineMenu, setOfflineMenu] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "pending">("synced");

  const modules = [
    { label: "Pedidos en mesa", desc: "Toma y gestión de pedidos sin internet", val: offlinePedidos, set: setOfflinePedidos },
    { label: "Caja y cobros", desc: "Registro de pagos y movimientos de caja", val: offlineCaja, set: setOfflineCaja },
    { label: "Catálogo menú", desc: "Visualización del menú para tomar pedidos", val: offlineMenu, set: setOfflineMenu },
  ];

  return (
    <SectionCard
      icon={offline ? <WifiOff size={20} /> : <Wifi size={20} />}
      title="Modo sin conexión (Offline)"
      subtitle="Permite operar el sistema sin internet y sincronizar al reconectarse"
      color={offline ? "var(--color-warn)" : "var(--color-ok)"}
    >
      {/* Status banner */}
      <div className={`p-5 rounded-[22px] mb-8 border transition-all duration-300 flex items-center justify-between ${
          offline ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full relative shadow-sm ${
              offline ? "bg-amber-500 shadow-[0_0_0_4px_var(--color-amber-200)]" : "bg-emerald-500 shadow-[0_0_0_4px_var(--color-emerald-200)]"
          }`}>
             <span className="absolute inset-x-0 h-full w-full rounded-full bg-inherit opacity-75 animate-ping"></span>
          </div>
          <div>
            <p className={`text-[14px] font-black m-0 leading-none mb-1 ${offline ? "text-amber-700" : "text-emerald-700"}`}>
              {offline ? "Sistema en modo sin conexión" : "Sistema en línea"}
            </p>
            <p className="text-[11px] font-bold text-text-muted m-0 uppercase tracking-wide">
              {offline ? "Operando localmente · Sincronización pendiente" : "Última sincronización: hace 2 minutos"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {offline && (
            <button
                onClick={() => {
                   setSyncStatus("syncing");
                   setTimeout(() => { setOffline(false); setSyncStatus("synced"); }, 1500);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer hover:bg-emerald-700 transition-all shadow-md active:scale-95"
            >
              <RefreshCw size={14} className={syncStatus === "syncing" ? "animate-spin" : ""} />
              {syncStatus === "syncing" ? "Sincronizando..." : "Sincronizar ahora"}
            </button>
          )}
          <Toggle value={offline} onChange={setOffline} color="var(--color-warn)" />
        </div>
      </div>

      <SettingRow
        label="Sincronización automática"
        description="Los datos se sincronizan automáticamente cuando recupera conexión"
      >
        <Toggle value={offlineSync} onChange={setOfflineSync} color="var(--color-ok)" />
      </SettingRow>

      <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-6 mt-8">
        Módulos disponibles offline
      </p>

      {modules.map((m, i) => (
        <SettingRow key={m.label} label={m.label} description={m.desc} border={i < modules.length - 1}>
           <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-tight ${m.val ? "text-emerald-600" : "text-text-muted"}`}>
                 {m.val ? "Habilitado" : "Deshabilitado"}
              </span>
              <Toggle value={m.val} onChange={m.set} color="var(--color-ok)" />
           </div>
        </SettingRow>
      ))}

      <div className="mt-8 p-4 bg-surface-alt/50 rounded-2xl border border-border/50 flex items-start gap-4">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium text-text-sec m-0 leading-relaxed">
          En modo offline, las facturas electrónicas y consultas de inventario avanzadas no están disponibles. 
          Las órdenes de compra se enviarán automáticamente al reconectarse.
        </p>
      </div>
    </SectionCard>
  );
}
