"use client";

import React from "react";
import { Clock, ShieldAlert } from "lucide-react";
import { AboutSection } from "./AboutSection";
import { type Schedule } from "../../data/aboutMock";

interface ScheduleSectionProps {
  schedule: Schedule[];
  onChange: (idx: number, field: keyof Schedule, value: string | boolean) => void;
}

const inpClass = "px-4 py-2 rounded-xl border border-border text-[13px] font-black outline-none focus:border-brand transition-all bg-surface disabled:opacity-50 disabled:bg-surface-alt";

export function ScheduleSection({ schedule, onChange }: ScheduleSectionProps) {
  return (
    <AboutSection title="Horarios de Atención" icon={<Clock size={18} />}>
      <div className="flex flex-col gap-3">
        {schedule.map((s, i) => (
          <div 
            key={s.day} 
            className={`flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 ${
              s.closed ? "bg-red-50/40 border-red-200 opacity-80" : "bg-surface-alt/40 border-border group hover:bg-surface-alt/60"
            }`}
          >
            <div className="flex items-center gap-3 w-32 shrink-0">
               <span className={`text-[14px] font-black tracking-tight ${s.closed ? "text-red-700" : "text-text"}`}>
                 {s.day}
               </span>
            </div>

            <div className="flex items-center gap-6 flex-1">
               <label className="flex items-center gap-2.5 cursor-pointer select-none">
                 <input 
                   type="checkbox" 
                   checked={s.closed} 
                   onChange={(e) => onChange(i, "closed", e.target.checked)} 
                   className="w-4 h-4 accent-red-600 rounded-md border-border" 
                 />
                 <span className={`text-[11px] font-black uppercase tracking-widest ${s.closed ? "text-red-600 animate-pulse" : "text-text-muted hover:text-text"}`}>
                   {s.closed ? "Cerrado" : "Abierto"}
                 </span>
               </label>

               {!s.closed && (
                 <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-left-2 duration-300">
                   <div className="w-px h-6 bg-border mx-2 hidden md:block" />
                   <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
                      <div className="flex items-center gap-2 flex-1">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest w-12">Abre</span>
                         <input 
                           type="time" 
                           value={s.open} 
                           onChange={(e) => onChange(i, "open", e.target.value)} 
                           className={`${inpClass} w-full lg:w-32`} 
                         />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest w-12">Cierra</span>
                         <input 
                           type="time" 
                           value={s.close} 
                           onChange={(e) => onChange(i, "close", e.target.value)} 
                           className={`${inpClass} w-full lg:w-32`} 
                         />
                      </div>
                   </div>
                 </div>
               )}

               {s.closed && (
                 <div className="flex items-center gap-2 text-red-700/60 font-black text-[10px] uppercase tracking-widest italic ml-auto animate-in fade-in">
                    <ShieldAlert size={14} /> Descanso obligatorio
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </AboutSection>
  );
}
