"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Trash2,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2
} from "lucide-react";
import { ShiftService, StaffService } from "@/features/shared/services/dataService";
import type { Shift, StaffMember } from "@/features/shared/data/restaurantData";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function ShiftCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShift, setNewShift] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    zone: "Salón",
    type: "apertura" as const
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShifts(ShiftService.getShifts());
    setStaff(StaffService.getStaff().filter(s => s.status === "activo"));
    setLoading(false);
  }, []);

  const handleAddShift = () => {
    if (!newShift.employeeId) {
      setError("Selecciona un empleado");
      return;
    }

    const shift: Shift = {
      id: `SH-${Date.now()}`,
      ...newShift
    };

    const err = ShiftService.addShift(shift);
    if (err) {
      setError(err);
      return;
    }

    setShifts(ShiftService.getShifts());
    setShowAddModal(false);
    setNewShift({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      zone: "Salón",
      type: "apertura"
    });
    setError(null);
  };

  const handleDeleteShift = (id: string) => {
    if (confirm("¿Eliminar este turno?")) {
      ShiftService.deleteShift(id);
      setShifts(ShiftService.getShifts());
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Cargando Agenda Operativa...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-8 rounded-[32px] border border-border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shadow-inner">
              <CalendarIcon size={28} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-text tracking-tight">Agenda Semanal de Turnos</h2>
              <p className="text-text-muted text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">Semana Actual · 01 Abr - 07 Abr</p>
           </div>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-gray-100 p-1 rounded-2xl border border-border">
              <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all text-text-muted hover:text-brand"><ChevronLeft size={20} /></button>
              <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm transition-all text-text-muted hover:text-brand"><ChevronRight size={20} /></button>
           </div>
           <button 
            onClick={() => setShowAddModal(true)}
            className="px-8 py-3 rounded-2xl bg-brand text-white text-xs font-black shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
           >
            <Plus size={18} /> ASIGNAR TURNO
           </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map((day, idx) => (
          <div key={day} className="flex flex-col gap-4">
            <div className="text-center py-3 border-b-4 border-brand/20">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{day}</p>
               <p className="text-xl font-black text-text">{idx + 1}</p>
            </div>
            
            <div className="space-y-3 min-h-[400px] bg-gray-50/50 rounded-[28px] p-3 border border-dashed border-border">
               {shifts.filter(s => {
                 // Mocking day match for current week 
                 const d = new Date(s.date).getDay();
                 const target = (idx + 1) % 7;
                 return d === target;
               }).map(s => {
                 const emp = staff.find(e => e.id === s.employeeId);
                 return (
                   <div 
                    key={s.id} 
                    className="bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-brand/40 transition-all group relative cursor-default"
                   >
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-text-muted border border-border">
                           {emp ? emp.name[0] + emp.lastname[0] : "??"}
                        </div>
                        <p className="text-[11px] font-black text-text truncate">{emp ? `${emp.name} ${emp.lastname[0]}.` : "Desconocido"}</p>
                     </div>
                     <div className="space-y-1.5 opacity-60">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                           <Clock size={12} className="text-brand" />
                           {s.startTime} - {s.endTime}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                           <MapPin size={12} className="text-brand" />
                           {s.zone}
                        </div>
                     </div>
                     
                     <button 
                      onClick={() => handleDeleteShift(s.id)}
                      className="absolute top-2 right-2 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                     >
                       <Trash2 size={12} />
                     </button>

                     <div className={`mt-3 h-1 w-full rounded-full ${
                       s.type === "apertura" ? "bg-emerald-400" :
                       s.type === "cierre" ? "bg-purple-400" : "bg-blue-400"
                     }`} />
                   </div>
                 );
               })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-surface p-10 rounded-[48px] shadow-2xl border border-white/20 w-full max-w-lg animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-text tracking-tight flex items-center gap-3">
                    <Clock className="text-brand" /> Asignar Nuevo Turno
                 </h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                    <Trash2 size={20} className="text-text-muted" />
                 </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                   <AlertTriangle size={18} />
                   <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Colaborador Disponible</label>
                    <select 
                      value={newShift.employeeId}
                      onChange={e => setNewShift(s => ({ ...s, employeeId: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm outline-none focus:border-brand bg-gray-50 shadow-inner appearance-none"
                    >
                       <option value="">Selecciona personal...</option>
                       {staff.map(e => (
                         <option key={e.id} value={e.id}>{e.name} {e.lastname} ({e.position})</option>
                       ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Fecha</label>
                       <input 
                        type="date"
                        value={newShift.date}
                        onChange={e => setNewShift(s => ({ ...s, date: e.target.value }))}
                        className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm outline-none focus:border-brand bg-gray-50 shadow-inner"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Zona Asignada</label>
                       <input 
                        value={newShift.zone}
                        onChange={e => setNewShift(s => ({ ...s, zone: e.target.value }))}
                        className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm outline-none focus:border-brand bg-gray-50 shadow-inner"
                        placeholder="Ej. Terraza"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Hora Inicio</label>
                       <input 
                        type="time"
                        value={newShift.startTime}
                        onChange={e => setNewShift(s => ({ ...s, startTime: e.target.value }))}
                        className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm outline-none focus:border-brand bg-gray-50 shadow-inner"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">Hora Fin</label>
                       <input 
                        type="time"
                        value={newShift.endTime}
                        onChange={e => setNewShift(s => ({ ...s, endTime: e.target.value }))}
                        className="w-full px-5 py-4 rounded-2xl border border-border font-black text-sm outline-none focus:border-brand bg-gray-50 shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="flex gap-3 pt-4">
                    <button 
                     onClick={() => setShowAddModal(false)}
                     className="flex-1 py-4 text-xs font-black text-text-muted uppercase tracking-widest hover:text-text transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                     onClick={handleAddShift}
                     className="flex-1 py-4 bg-brand text-white text-xs font-black rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all uppercase tracking-widest"
                    >
                      CONFIRMAR TURNO
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-6 p-6 bg-surface rounded-3xl border border-border shadow-sm">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Apertura</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Intermedio</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Cierre</span>
         </div>
      </div>
    </div>
  );
}
