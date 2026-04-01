"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Shield, 
  Briefcase, 
  CreditCard, 
  Calendar,
  DollarSign,
  User,
  Activity,
  Layers
} from "lucide-react";
import { RoleService } from "@/features/shared/services/dataService";
import type { StaffMember, Role } from "@/features/shared/data/restaurantData";

interface UserModalProps {
  user: StaffMember | null;
  onClose: () => void;
  onSave: (u: Partial<StaffMember>) => void;
}

const inpClass = "w-full px-4 py-3 rounded-2xl border border-border text-[13px] font-black outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-surface shadow-sm";
const lblClass = "block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1";
const selClass = "w-full px-4 py-3 rounded-2xl border border-border text-[13px] font-black outline-none focus:border-brand bg-surface shadow-sm appearance-none cursor-pointer";

export function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  
  const blank: StaffMember = {
    id: `EMP-${Date.now()}`,
    name: "",
    lastname: "",
    documentId: "",
    birthDate: "",
    hireDate: new Date().toISOString().split("T")[0],
    position: "",
    area: "salón",
    contractType: "tiempo completo",
    email: "",
    phone: "",
    status: "activo",
    salary: 0,
    roleId: "mesero"
  };

  const [form, setForm] = useState<StaffMember>(user ?? blank);

  useEffect(() => {
    setRoles(RoleService.getRoles());
  }, []);

  const areas = ["cocina", "salón", "barra", "limpieza", "administración"] as const;
  const contracts = ["tiempo completo", "medio tiempo", "eventual"] as const;
  const statuses = ["activo", "inactivo", "suspendido"] as const;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface rounded-[48px] shadow-[0_40px_100px_-20px_rgba(26,18,8,0.3)] w-full max-w-[840px] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-8 flex justify-between items-start bg-gradient-to-b from-gray-50/80 to-surface">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shadow-inner">
                <Briefcase size={24} />
              </div>
              <div>
                <h2 className="font-black text-3xl text-text m-0 tracking-tight leading-none">
                  {user ? "Perfil de Colaborador" : "Nuevo Ingreso"}
                </h2>
                <p className="text-[10px] font-black text-text-muted m-0 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                   <Activity size={12} className="text-brand" /> {form.id} · REGISTRO LABORAL
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white border border-border rounded-2xl cursor-pointer text-text-muted/40 hover:text-text hover:bg-border transition-all shadow-sm hover:rotate-90 duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-10 py-4 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-10">
          
          {/* Section: Personal Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
              <User size={16} className="text-brand" />
              <h3 className="text-xs font-black uppercase tracking-widest text-text">Información Personal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lblClass}>Nombre(s)</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inpClass} 
                    placeholder="Ej. Juan"
                  />
                </div>
                <div>
                  <label className={lblClass}>Apellidos</label>
                  <input 
                    value={form.lastname} 
                    onChange={e => setForm(f => ({ ...f, lastname: e.target.value }))}
                    className={inpClass} 
                    placeholder="Ej. Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lblClass}>Identificación (DNI/INE)</label>
                  <div className="relative">
                    <CreditCard size={14} className="absolute left-4 top-4 text-text-muted" />
                    <input 
                      value={form.documentId} 
                      onChange={e => setForm(f => ({ ...f, documentId: e.target.value }))}
                      className={`${inpClass} pl-10`} 
                      placeholder="ID-000000"
                    />
                  </div>
                </div>
                <div>
                  <label className={lblClass}>F. Nacimiento</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-4 top-4 text-text-muted" />
                    <input 
                      type="date"
                      value={form.birthDate} 
                      onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                      className={`${inpClass} pl-10`} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={lblClass}>Correo Corporativo</label>
                <input 
                  type="email"
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={inpClass} 
                  placeholder="juan@quijote.mx"
                />
              </div>
              <div>
                <label className={lblClass}>Teléfono</label>
                <input 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className={inpClass} 
                  placeholder="771..."
                />
              </div>
            </div>
          </section>

          {/* Section: Employment Details */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
              <Briefcase size={16} className="text-brand" />
              <h3 className="text-xs font-black uppercase tracking-widest text-text">Detalles Laborales</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className={lblClass}>Cargo / Puesto</label>
                  <input 
                    value={form.position} 
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    className={inpClass} 
                    placeholder="Ej. Mesero Senior"
                  />
               </div>
               <div>
                  <label className={lblClass}>Área Operativa</label>
                  <select 
                    value={form.area} 
                    onChange={e => setForm(f => ({ ...f, area: e.target.value as any }))}
                    className={selClass}
                  >
                    {areas.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                  </select>
               </div>
               <div>
                  <label className={lblClass}>Tipo de Contrato</label>
                  <select 
                    value={form.contractType} 
                    onChange={e => setForm(f => ({ ...f, contractType: e.target.value as any }))}
                    className={selClass}
                  >
                    {contracts.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
               </div>

               <div>
                  <label className={lblClass}>Salario Base ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-4 top-4 text-emerald-600" />
                    <input 
                      type="number"
                      value={form.salary} 
                      onChange={e => setForm(f => ({ ...f, salary: Number(e.target.value) }))}
                      className={`${inpClass} pl-10`} 
                    />
                  </div>
               </div>
               <div>
                  <label className={lblClass}>F. Ingreso</label>
                  <input 
                    type="date"
                    value={form.hireDate} 
                    onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))}
                    className={inpClass} 
                  />
               </div>
               <div>
                  <label className={lblClass}>Estado Actual</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                    className={`${selClass} ${
                      form.status === "activo" ? "text-emerald-600" : 
                      form.status === "inactivo" ? "text-red-500" : "text-amber-500"
                    }`}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
               </div>
            </div>
          </section>

          {/* Section: System Access */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
              <Shield size={16} className="text-brand" />
              <h3 className="text-xs font-black uppercase tracking-widest text-text">Acceso al Sistema</h3>
            </div>

            <div className="p-8 rounded-[32px] bg-gray-50 border border-border/60 flex flex-col md:flex-row items-center gap-10">
               <div className="flex-1">
                  <label className={lblClass}>Rol Administrativo Sugerido</label>
                  <p className="text-[11px] font-bold text-text-muted mb-4 uppercase tracking-wide">
                    Determina qué nivel de acceso tendrá el colaborador en el dashboard.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, roleId: r.id }))}
                        className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                          form.roleId === r.id 
                          ? "bg-brand text-white border-brand shadow-lg shadow-brand/20 scale-105" 
                          : "bg-white border-border text-text-muted hover:border-brand/40"
                        }`}
                      >
                         {r.name}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="md:w-px h-24 bg-border/60 hidden md:block" />

               <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    form.status === "activo" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  }`}>
                    <Layers size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-text mb-0.5">Estado de Cuenta</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                       form.status === "activo" ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {form.status === "activo" ? "Acceso Permitido" : "Sin Acceso"}
                    </p>
                  </div>
               </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 border-t border-border bg-gray-50/50 flex justify-end items-center gap-6">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mr-auto italic opacity-60">
             * Todos los campos son obligatorios para el expediente laboral.
          </p>
          <button 
            disabled={!form.name || !form.lastname || !form.email || !form.documentId}
            onClick={() => onSave(form)}
            className="px-12 py-4 rounded-[20px] bg-brand text-white text-xs font-black shadow-2xl shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest flex items-center gap-2"
          >
            {user ? "GUARDAR CAMBIOS" : "INSCRIBIR COLABORADOR"}
          </button>
        </div>
      </div>
    </div>
  );
}
