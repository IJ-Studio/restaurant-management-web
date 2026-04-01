"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertCircle, 
  MessageSquare, 
  Plus, 
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  FileWarning,
  TrendingDown,
  TrendingUp,
  Search
} from "lucide-react";
import { IncidenceService, StaffService } from "@/features/shared/services/dataService";
import type { Incidence, StaffMember } from "@/features/shared/data/restaurantData";

export function IncidencePanel() {
  const [incidences, setIncidences] = useState<Incidence[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [newInc, setNewInc] = useState({
    employeeId: "",
    type: "operativa" as const,
    description: ""
  });

  useEffect(() => {
    setIncidences(IncidenceService.getIncidences());
    setStaff(StaffService.getStaff());
  }, []);

  const handleAddIncidence = () => {
    if (!newInc.employeeId || !newInc.description) return;
    
    const inc: Incidence = {
      id: `INC-${Date.now()}`,
      employeeId: newInc.employeeId,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: newInc.type,
      description: newInc.description
    };

    IncidenceService.addIncidence(inc);
    setIncidences(IncidenceService.getIncidences());
    setShowModal(false);
    setNewInc({ employeeId: "", type: "operativa", description: "" });
  };

  const getEmpName = (id: string) => {
    const e = staff.find(x => x.id === id);
    return e ? `${e.name} ${e.lastname}` : "Desconocido";
  };

  const filtered = incidences.filter(i => 
    getEmpName(i.employeeId).toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-8 rounded-[32px] border border-border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
              <AlertCircle size={28} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-text tracking-tight">Registro de Incidencias</h2>
              <p className="text-text-muted text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">Control de Desempeño y Observaciones Operativas</p>
           </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-3 rounded-2xl bg-amber-500 text-white text-xs font-black shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> REGISTRAR INCIDENCIA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Content */}
        <div className="lg:col-span-2 space-y-6">
           {/* Search */}
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={18} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por empleado o descripción..."
                className="w-full pl-12 pr-6 py-4 rounded-[24px] border border-border bg-surface outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 font-black text-sm transition-all"
              />
           </div>

           <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="p-20 bg-surface rounded-[40px] border border-dashed border-border text-center opacity-40">
                   <MessageSquare size={48} className="mx-auto mb-4" />
                   <p className="font-black uppercase tracking-widest text-sm italic">Sin incidencias registradas</p>
                </div>
              ) : (
                filtered.map(inc => (
                  <div key={inc.id} className="bg-surface p-6 rounded-[32px] border border-border shadow-sm hover:shadow-lg transition-all group flex gap-6">
                     <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${
                       inc.type === "operativa" ? "bg-blue-100 text-blue-600" :
                       inc.type === "rendimiento" ? "bg-purple-100 text-purple-600" :
                       inc.type === "asistencia" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                     }`}>
                        {inc.type === "operativa" ? <Activity size={24} /> : 
                         inc.type === "rendimiento" ? <TrendingDown size={24} /> : 
                         inc.type === "asistencia" ? <Clock size={24} /> : <FileWarning size={24} />}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-black text-text group-hover:text-brand transition-colors">{getEmpName(inc.employeeId)}</h4>
                           <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{inc.date} · {inc.time}</span>
                        </div>
                        <p className="text-sm font-medium text-text-muted leading-relaxed mb-4">{inc.description}</p>
                        <div className="flex gap-2">
                           <span className="px-3 py-1 rounded-full bg-gray-50 border border-border text-[9px] font-black uppercase tracking-tighter text-text-muted">
                              {inc.type}
                           </span>
                           <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-black uppercase tracking-tighter text-emerald-600 flex items-center gap-1">
                              <CheckCircle size={10} /> Registrada
                           </span>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
           <div className="bg-surface p-8 rounded-[40px] border border-border shadow-sm">
              <h3 className="text-sm font-black text-text uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <TrendingUp size={16} className="text-brand" /> Resumen Operativo
              </h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                       <span>Rendimiento General</span>
                       <span className="text-emerald-600">88%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[88%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                       <span>Puntualidad</span>
                       <span className="text-amber-500">72%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[72%]" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-surface p-8 rounded-[40px] border border-border shadow-sm">
              <h3 className="text-sm font-black text-text uppercase tracking-[0.2em] mb-6">Próximas Evaluaciones</h3>
              <div className="space-y-4">
                 {staff.slice(0, 3).map(e => (
                   <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-black text-[10px]">
                         {e.name[0]}{e.lastname[0]}
                      </div>
                      <div className="flex-1">
                         <p className="text-[11px] font-black text-text truncate">{e.name} {e.lastname}</p>
                         <p className="text-[9px] font-bold text-text-muted uppercase">Eval: 15 Abr</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Register Incidence Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-surface p-10 rounded-[48px] shadow-2xl border border-white/20 w-full max-w-lg animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-text mb-8 tracking-tight">Nueva Observación</h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Colaborador Relacionado</label>
                    <select 
                      value={newInc.employeeId}
                      onChange={e => setNewInc(s => ({ ...s, employeeId: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm outline-none focus:border-brand bg-gray-50 shadow-inner appearance-none"
                    >
                       <option value="">Selecciona personal...</option>
                       {staff.map(e => (
                         <option key={e.id} value={e.id}>{e.name} {e.lastname} ({e.position})</option>
                       ))}
                    </select>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Tipo de Evento</label>
                    <div className="grid grid-cols-2 gap-3">
                       {["operativa", "rendimiento", "asistencia", "otra"].map(t => (
                         <button 
                           key={t}
                           onClick={() => setNewInc(s => ({ ...s, type: t as any }))}
                           className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                             newInc.type === t ? "bg-brand text-white border-brand shadow-lg" : "bg-white border-border text-text-muted"
                           }`}
                         >
                            {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Descripción del Hallazgo</label>
                    <textarea 
                      value={newInc.description}
                      onChange={e => setNewInc(s => ({ ...s, description: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm transition-all focus:border-brand bg-gray-50 shadow-inner outline-none h-32 resize-none"
                      placeholder="Detalla lo sucedido u observado..."
                    />
                 </div>

                 <div className="flex gap-3 pt-4">
                    <button 
                     onClick={() => setShowModal(false)}
                     className="flex-1 py-4 text-xs font-black text-text-muted uppercase tracking-widest hover:text-text transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                     disabled={!newInc.employeeId || !newInc.description}
                     onClick={handleAddIncidence}
                     className="flex-1 py-4 bg-brand text-white text-xs font-black rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all uppercase tracking-widest disabled:opacity-30 disabled:grayscale"
                    >
                      GUARDAR REPORTE
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
