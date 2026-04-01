"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Trash2, 
  Cloud, 
  RefreshCw, 
  Clock, 
  HardDrive 
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import { SettingRow } from "../SettingRow";
import { Toggle } from "../Toggle";
import { type Backup } from "../../data/settingsMock";

const inpClass = "px-3 py-2 border border-border rounded-xl text-[13px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface";

export function BackupSection({ API, isExternal }: { API: string, isExternal: boolean }) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFreq, setBackupFreq] = useState("diario");
  const [backupTime, setBackupTime] = useState("23:00");
  const [backupCloud, setBackupCloud] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch(`${API}/backups`)
      .then((r) => r.json())
      .then((data) => setBackups(Array.isArray(data) ? data : []))
      .catch(() => setBackups([]));
  }, [API]);

  function handleManualBackup() {
    setSyncing(true);
    fetch(`${API}/backups`, { method: "POST" })
      .then((r) => r.json())
      .then((newB) => {
        setBackups((bs) => [newB, ...bs]);
        setSyncing(false);
      })
      .catch(() => setSyncing(false));
  }

  async function handleDelete(id: number) {
    const url = isExternal ? `${API}/backups/${id}` : `${API}/backups?id=${id}`;
    await fetch(url, { method: "DELETE" });
    setBackups((bs) => bs.filter((x) => x.id !== id));
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const dashboardStats = [
    { label: "Total respaldos", value: backups.filter(b => b.status === "ok").length, icon: <Database size={16} />, color: "var(--color-info)" },
    { label: "Tamaño promedio", value: "41.2 MB", icon: <HardDrive size={16} />, color: "var(--color-brand)" },
    { label: "Almacenamiento", value: backupCloud ? "Nube + Local" : "Solo Local", icon: <Cloud size={16} />, color: "var(--color-purple-600)" }
  ];

  return (
    <SectionCard
      icon={<HardDrive size={20} />}
      title="Respaldos de datos"
      subtitle="Configuración de copias de seguridad automáticas y manuales"
      color="var(--color-info)"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Configuration Column */}
        <div className="flex flex-col gap-6 p-6 rounded-3xl bg-surface-alt/20 border border-border/50">
          <SettingRow label="Respaldo automático" description="Genera copias según el horario">
            <Toggle value={autoBackup} onChange={setAutoBackup} color="var(--color-info)" />
          </SettingRow>

          {autoBackup && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center justify-between">
                  <p className="text-[12px] font-black text-text m-0">Frecuencia</p>
                  <select value={backupFreq} onChange={(e) => setBackupFreq(e.target.value)} className={inpClass}>
                     {["diario", "semanal", "mensual"].map(f => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
                  </select>
               </div>
               <div className="flex items-center justify-between">
                  <p className="text-[12px] font-black text-text m-0">Hora de ejecución</p>
                  <input type="time" value={backupTime} onChange={(e) => setBackupTime(e.target.value)} className={inpClass} />
               </div>
            </div>
          )}

          <div className="pt-6 border-t border-border/50 space-y-4">
             <SettingRow label="Sincronización en la nube" description="Google Drive / Amazon S3">
                <Toggle value={backupCloud} onChange={setBackupCloud} color="var(--color-info)" />
             </SettingRow>
          </div>
        </div>

        {/* Dashboard Stats Column */}
        <div className="grid grid-cols-1 gap-3">
           {dashboardStats.map(s => (
              <div key={s.label} className="p-4 rounded-2xl bg-surface border border-border shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-white shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${s.color}15`, color: s.color }}
                >
                  {s.icon}
                </div>
                <div>
                   <p className="text-[9px] font-extrabold text-text-muted hover:text-brand transition-colors uppercase tracking-widest">{s.label}</p>
                   <p className="text-[15px] font-black text-text m-0" style={{ color: s.color }}>{s.value}</p>
                </div>
              </div>
           ))}
           <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-200 mt-1">
              <div>
                 <p className="text-[13px] font-black text-blue-700 m-0">Respaldo manual</p>
                 <p className="text-[10px] font-bold text-blue-600/70 uppercase">Copia instantánea ahora</p>
              </div>
              <button 
                onClick={handleManualBackup}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                  {syncing ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" /> Procesando...
                      </span>
                  ) : (
                      <span className="flex items-center gap-2">
                        <Database size={14} /> Respaldar Ya
                      </span>
                  )}
              </button>
           </div>
        </div>
      </div>

      <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-4">Historial de respaldos</p>
      <div className="space-y-2">
        {backups.map(b => (
           <div key={b.id} className="p-4 bg-surface-alt/20 rounded-2xl border border-border flex items-center justify-between group hov:bg-surface transition-colors">
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-white ${
                     b.status === "ok" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                 }`}>
                    {b.status === "ok" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-0.5">
                       <p className="text-[13px] font-black text-text m-0 group-hover:text-brand transition-colors tracking-tight font-mono">{b.name}</p>
                       {b.driveUrl && <Cloud size={14} className="text-blue-500" />}
                    </div>
                    <p className="text-[11px] font-bold text-text-muted m-0 uppercase tracking-wide">
                       {b.createdAt} · {formatSize(b.sizeBytes)} · 
                       <span className="ml-1 text-text-sec">{b.type.toUpperCase()}</span>
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-2 border border-border rounded-xl bg-white text-text-sec hover:text-brand hover:border-brand/40 shadow-sm transition-all active:scale-95">
                    <Download size={16} />
                 </button>
                 <button 
                  onClick={() => handleDelete(b.id)}
                  className="p-2 border border-border rounded-xl bg-white text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all active:scale-95"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>
           </div>
        ))}
        {backups.length === 0 && (
            <div className="p-10 border-2 border-dashed border-border rounded-3xl text-center">
               <p className="text-sm font-bold text-text-muted italic">No hay respaldos guardados recientemente.</p>
            </div>
        )}
      </div>
    </SectionCard>
  );
}
